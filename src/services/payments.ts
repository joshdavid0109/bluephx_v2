// src/services/payments.ts
import { supabase } from "../lib/supabase";

/**
 * Record a payment amount for a loan (cascading to unpaid schedules).
 * - data: object that contains at least data.loan.loan_id (you can pass the 'data' object returned by getDebtor)
 * - amount: number (the payment amount)
 * - note: optional string
 *
 * Behavior:
 *  - Applies to earliest unpaid schedules by payment_no
 *  - Inserts one payments row per schedule applied
 *  - Marks schedule.amount_paid_flag = 'paid' when fully covered
 */
export async function recordPayment(data: any, amount: number, note?: string) {
  if (!data?.loan?.loan_id) {
    throw new Error("Missing loan information");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid amount");
  }

  const loanId = data.loan.loan_id;
  let remaining = Number(amount);

  // 1) load schedules (ordered)
  const { data: scheduleData, error: schedErr } = await supabase
    .from("repayment_schedule")
    .select("*")
    .eq("loan_id", loanId)
    .order("payment_no", { ascending: true });

  if (schedErr) throw schedErr;
  if (!scheduleData || scheduleData.length === 0) {
    throw new Error("No repayment schedule found for loan");
  }

  // 2) load existing payments (for this loan) and build a map: schedule_id -> total paid
  const { data: paymentsData, error: payErr } = await supabase
    .from("payments")
    .select("schedule_id, amount_paid")
    .eq("loan_id", loanId);

  if (payErr) throw payErr;

  const paymentMap = new Map<number, number>();
  (paymentsData ?? []).forEach((p: any) => {
    const sid = p.schedule_id;
    const amt = Number(p.amount_paid) || 0;
    paymentMap.set(sid, (paymentMap.get(sid) || 0) + amt);
  });

  // 3) build inserts for payments: apply remaining to schedules in order
  const inserts: any[] = [];
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  for (const s of scheduleData) {
    if (remaining <= 0) break;

    const sid = s.schedule_id;
    const amort = Number(s.amortization) || 0;
    const alreadyPaid = paymentMap.get(sid) || 0;
    const need = amort - alreadyPaid;

    if (need <= 0) {
      // schedule already fully paid
      continue;
    }

    const apply = Math.min(remaining, need);
    if (apply <= 0) continue;

    // prepare payment row for this schedule
    inserts.push({
      loan_id: loanId,
      schedule_id: sid,
      payment_date: now,
      amount_paid: apply,
      payment_method: "cash",
      remarks: note ?? null,
    });

    // update local map and remaining
    paymentMap.set(sid, alreadyPaid + apply);
    remaining = Number((remaining - apply).toFixed(2)); // avoid floating rounding issues
  }

  if (inserts.length === 0) {
    throw new Error("No unpaid schedules to apply payment to.");
  }

  // 4) insert payment rows (insert all at once)
  const { data: insertedRows, error: insertErr } = await supabase
    .from("payments")
    .insert(inserts);

  if (insertErr) throw insertErr;

  // 5) mark schedules as 'paid' where total paid >= amortization
  const paidScheduleIds: number[] = [];
  for (const s of scheduleData) {
    const sid = s.schedule_id;
    const amort = Number(s.amortization) || 0;
    const totalPaid = paymentMap.get(sid) || 0;
    if (totalPaid >= amort && amort > 0) {
      paidScheduleIds.push(sid);
    }
  }

  if (paidScheduleIds.length > 0) {
    const { error: updateErr } = await supabase
      .from("repayment_schedule")
      .update({ amount_paid_flag: "paid" })
      .in("schedule_id", paidScheduleIds);

    if (updateErr) throw updateErr;
  }

  // 6) Optionally: you may want to update loan balance or other aggregates here
  // (we leave that to existing processes; getDebtor reads payment sums to compute remaining)

  return {
    inserted: insertedRows,
    leftover: Number(remaining.toFixed(2)),
  };
}


export async function getPayments(debtor_id: number) {
  const { data: loan } = await supabase
    .from("loans")
    .select("loan_id")
    .eq("debtor_id", debtor_id)
    .eq("status", "active")
    .maybeSingle();

  if (!loan) return [];

  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_date", { ascending: false });

  return data ?? [];
}


export async function getRepaymentSchedule(debtor_id: number) {
  // 1. Get the loan
  const { data: loan } = await supabase
    .from("loans")
    .select("loan_id")
    .eq("debtor_id", debtor_id)
    .maybeSingle();

  if (!loan) return [];

  // 2. Get full schedule
  const { data: scheduleData, error: sErr } = await supabase
    .from("repayment_schedule")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_no", { ascending: true });

  if (sErr) throw sErr;

  // 3. Get all payments for this loan
  const { data: paymentsData, error: pErr } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loan.loan_id);

  if (pErr) throw pErr;

  // 4. Map: schedule_id → payment info
  const paymentMap = new Map<number, any>();
  paymentsData.forEach((p) => paymentMap.set(p.schedule_id, p));

  // 5. Merge: add "paid_date" and "is_paid"
  const merged = scheduleData.map((s: any) => {
    const payment = paymentMap.get(s.schedule_id);

    return {
      ...s,
      amortization: Number(s.amortization),
      principal: Number(s.principal),
      interest: Number(s.interest),
      balance: Number(s.balance),

      is_paid: !!payment,
      paid_date: payment?.payment_date ?? null,
      paid_amount: payment?.amount_paid ?? null,
    };
  });
  
  return merged;
}
