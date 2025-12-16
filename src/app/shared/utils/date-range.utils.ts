import {
  startOfDay,
  addDays,
  differenceInCalendarDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from 'date-fns';

import type { QuickFilter } from '@components/date-filter-popup/date-filter-popup';

/* ================= TODAY ================= */

export function todayRange(): [Date, Date] {
  const today = startOfDay(new Date());
  return [today, today];
}

/* ================= RANGE HELPERS ================= */

export function rangeLength(range: Date[]): number {
  return differenceInCalendarDays(range[1], range[0]) + 1;
}

export function shiftRangeByDays(range: Date[], days: number): [Date, Date] {
  return [addDays(range[0], days), addDays(range[1], days)];
}

/* ================= QUICK FILTER DERIVATION ================= */

export function deriveQuickFilter(range: Date[]): QuickFilter {
  const [s, e] = range.map((d) => startOfDay(d));

  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);

  if (isSameDay(s, today) && isSameDay(e, today)) return 'today';
  if (isSameDay(s, yesterday) && isSameDay(e, yesterday)) return 'yesterday';

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  if (isSameDay(s, weekStart) && isSameDay(e, weekEnd)) return 'week';

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  if (isSameDay(s, monthStart) && isSameDay(e, monthEnd)) return 'month';

  return 'custom';
}
