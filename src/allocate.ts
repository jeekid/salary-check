import { categorizeShift } from './categorize';
import {
  emptyBreakdown,
  OVERTIME_CAP_HOURS,
  type AllocationResult,
  type HourBreakdown,
  type Shift,
} from './types';

interface ShiftWithBreakdown {
  shift: Shift;
  original: HourBreakdown;
  remaining: HourBreakdown;
}

export function allocate(shifts: Shift[]): AllocationResult {
  const items: ShiftWithBreakdown[] = shifts.map((s) => {
    const b = categorizeShift(s);
    return { shift: s, original: b, remaining: { ...b } };
  });

  // Latest first for allocation
  items.sort((a, b) => b.shift.date.localeCompare(a.shift.date));

  const untaxed = emptyBreakdown();
  let budget = OVERTIME_CAP_HOURS;

  // Pass 1: 假日夜 from every shift (highest rate)
  for (const it of items) {
    if (budget <= 0) break;
    const take = Math.min(it.remaining.假日夜, budget);
    untaxed.假日夜 += take;
    it.remaining.假日夜 -= take;
    budget -= take;
  }

  // Pass 2: 假日白 from shifts that ALSO had 假日夜 (mixed shifts: E/C on holiday/Fri)
  for (const it of items) {
    if (budget <= 0) break;
    if (it.original.假日夜 === 0) continue;
    const take = Math.min(it.remaining.假日白, budget);
    untaxed.假日白 += take;
    it.remaining.假日白 -= take;
    budget -= take;
  }

  // Pass 3: 假日白 from pure-day shifts (no 假日夜 portion)
  for (const it of items) {
    if (budget <= 0) break;
    if (it.original.假日夜 > 0) continue;
    const take = Math.min(it.remaining.假日白, budget);
    untaxed.假日白 += take;
    it.remaining.假日白 -= take;
    budget -= take;
  }

  const taxed = emptyBreakdown();
  for (const it of items) {
    taxed.平日白 += it.remaining.平日白;
    taxed.平日夜 += it.remaining.平日夜;
    taxed.假日白 += it.remaining.假日白;
    taxed.假日夜 += it.remaining.假日夜;
    taxed.單線值班 += it.remaining.單線值班;
  }

  return { taxed, untaxed };
}
