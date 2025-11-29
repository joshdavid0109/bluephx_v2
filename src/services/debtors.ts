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
    const { data: loans } = await supabase
      .from("loans")
      .select("*")
      .eq("debtor_id", d.debtor_id);

    if (!loans || loans.length === 0) continue;

    let loansArr: any[] = [];
    let totalBalance = 0;
    let earliestDue: string | null = null;

    for (let loan of loans) {
      // schedule
      const { data: schedule } = await supabase
        .from("repayment_schedule")
        .select("*")
        .eq("loan_id", loan.loan_id)
        .order("payment_no", { ascending: true });

      if (!schedule?.length) continue;

      // payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("loan_id", loan.loan_id);

      const scheduleMap = schedule.map((s) => {
        const paid = (payments || [])
          .filter((p) => p.schedule_id === s.schedule_id)
          .reduce((sum, p) => sum + Number(p.amount_paid), 0);

        const remaining = Math.max(0, Number(s.amortization) - paid);

        return {
          ...s,
          remaining,
          is_fully_paid: remaining <= 0.01,
        };
      });

      const next =
        scheduleMap.find((s) => !s.is_fully_paid) ??
        scheduleMap[scheduleMap.length - 1];

      loansArr.push({
        loan_id: loan.loan_id,
        remaining: next.remaining,
        next_due: next.due_date,
      });

      totalBalance += next.remaining;

      if (!earliestDue || new Date(next.due_date) < new Date(earliestDue))
        earliestDue = next.due_date;
    }

    // push final row
    results.push({
      id: d.debtor_id,
      name: d.name,
      contact_info: d.contact_info,
      earliest_due: earliestDue,
      total_balance: totalBalance,
      loans_count: loansArr.length,
      loans: loansArr,
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
