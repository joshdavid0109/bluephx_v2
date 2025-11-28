import { supabase } from "../lib/supabase";

/**
 * Get all debtors with correct NEXT DUE (with partial payment support)
 */
/**
 * Get all debtors with correct NEXT DUE (supports partial payments)
 */
export async function getAllDebtors() {
  const { data: debtors, error } = await supabase
    .from("debtors")
    .select("debtor_id, name, contact_info");

  if (error) throw error;

  const results: any[] = [];

  for (let d of debtors) {
    // 1. Get active loan
    const { data: loan } = await supabase
      .from("loans")
      .select("*")
      .eq("debtor_id", d.debtor_id)
      .maybeSingle();

    if (!loan) continue;

    // 2. Get full repayment schedule
    const { data: schedule } = await supabase
      .from("repayment_schedule")
      .select("*")
      .eq("loan_id", loan.loan_id)
      .order("payment_no", { ascending: true });

    if (!schedule?.length) continue;

    // 3. Get all payments for the loan
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("loan_id", loan.loan_id)
      .order("payment_date", { ascending: true });

    // 4. Build computed schedule (same logic as getDebtor)
    const scheduleMap = schedule.map((s) => {
      const partials = (payments || []).filter((p) => p.schedule_id === s.schedule_id);
      const total_paid = partials.reduce(
        (sum, p) => sum + Number(p.amount_paid),
        0
      );
      const remaining = Math.max(0, Number(s.amortization) - total_paid);

      return {
        ...s,
        total_paid,
        remaining,
        is_fully_paid: remaining <= 0.01,
      };
    });

    // 5. Determine next unpaid — EXACT same logic as DebtorDetail
    const next =
      scheduleMap.find((s) => !s.is_fully_paid) ??
      scheduleMap[scheduleMap.length - 1];

    // 6. Push final row result
    results.push({
      id: d.debtor_id,
      name: d.name,
      contact_info: d.contact_info,
      next_due: next.due_date,
      balance: next.remaining,
    });
  }

  return results;
}




/**
 * Get single debtor details with FULL repayment schedule + installments
 */
export async function getDebtor(debtor_id: number) {
  const { data: debtor } = await supabase
    .from("debtors")
    .select("*")
    .eq("debtor_id", debtor_id)
    .single();

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("debtor_id", debtor_id)
    .single();

  if (!loan) throw new Error("No active loan");

  // 1. Load schedule
  const { data: schedule } = await supabase
    .from("repayment_schedule")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_no", { ascending: true });

  // 2. Load all payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loan.loan_id)
    .order("payment_date", { ascending: true });

  // 3. Group payments under each schedule
  const scheduleMap: Record<number, any> = {};
  schedule?.forEach((s) => {
    scheduleMap[s.schedule_id] = {
      ...s,
      partials: [],
      total_paid: 0,
      remaining: Number(s.amortization),
      is_fully_paid: false,
    };
  });

  payments?.forEach((p) => {
    let row = scheduleMap[p.schedule_id];
    if (row) {
      row.partials.push(p);
      row.total_paid += Number(p.amount_paid);
      row.remaining = Math.max(0, Number(row.amortization) - row.total_paid);
      row.is_fully_paid = row.remaining <= 0.01;
    }
  });

  const merged = Object.values(scheduleMap);

  // 4. Determine next unpaid properly
  const next = merged.find((x) => !x.is_fully_paid) ?? merged[merged.length - 1];

  return {
    debtor,
    loan,
    schedule: merged,
    next,
  };
}
