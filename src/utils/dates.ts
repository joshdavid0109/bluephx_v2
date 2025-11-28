// src/utils/dates.ts
import { addMonths, addWeeks, format, parseISO } from 'date-fns';

export function advanceDueDate(dateStr: string, recurrence: string) {
  try {
    const d = parseISO(dateStr);
    if (recurrence === 'weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
    if (recurrence === 'monthly') return format(addMonths(d, 1), 'yyyy-MM-dd');
    // fallback: no recurrence
    return dateStr;
  } catch (e) {
    // If parse fails, return original
    return dateStr;
  }
}
