import { supabase } from "../lib/supabase";
import { formatISO } from "date-fns";

export async function getRepaymentSchedule(debtor_id: number) {
  // 1. Get loan_id for debtor
  const { data: loan } = await supabase
    .from("loans")
    .select("loan_id")
    .eq("debtor_id", debtor_id)
    .maybeSingle();

  if (!loan) return [];

  // 2. Get full schedule ordered by payment_no
  const { data: schedule } = await supabase
    .from("repayment_schedule")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_no", { ascending: true });

  // 3. Get all payments linked to this loan
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_date", { ascending: true });

  // 4. Build map schedule_id → payment
  const paymentMap = new Map();
  (payments ?? []).forEach((p) => {
    paymentMap.set(p.schedule_id, p);
  });

  // 5. Merge schedule + payment info
  const merged = (schedule ?? []).map((row) => {
    const payment = paymentMap.get(row.schedule_id);

    return {
      ...row,
      amortization: Number(row.amortization),
      balance: Number(row.balance),
      principal: Number(row.principal),
      interest: Number(row.interest),

      is_paid: !!payment,
      paid_date: payment?.payment_date ?? null,
      paid_amount: payment?.amount_paid ?? null,
      remarks: payment?.remarks ?? null,
    };
  });

  return merged;
}
