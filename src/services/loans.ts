import { supabase } from "../lib/supabase";

export async function getLoanDetail(loan_id: number) {
  const { data: loan } = await supabase
    .from("loans")
    .select("*, debtor:debtors(*)")
    .eq("loan_id", loan_id)
    .maybeSingle();

  // schedule
  const { data: schedule } = await supabase
    .from("repayment_schedule")
    .select("*")
    .eq("loan_id", loan_id)
    .order("payment_no", { ascending: true });

  // payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("loan_id", loan_id);

  const scheduleList = schedule ?? [];
  const paymentsList = payments ?? [];

  const scheduleMap = scheduleList.map((s) => {
    const partials = paymentsList.filter((p) => p.schedule_id === s.schedule_id);
    const total_paid = partials.reduce(
      (sum, p) => sum + Number(p.amount_paid),
      0
    );
    const remaining = Math.max(0, Number(s.amortization) - total_paid);

    return {
      ...s,
      partials,
      total_paid,
      remaining,
      is_fully_paid: remaining <= 0.01,
    };
  });

  const next =
    scheduleMap.find((s) => !s.is_fully_paid) ??
    scheduleMap[scheduleMap.length - 1];

  return {
    debtor: loan?.debtor ?? null,
    loan,
    schedule: scheduleMap,
    next: next ?? null,
  };
}
