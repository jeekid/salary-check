import { categorizeAll, shiftSegments, type PayCategory } from './categorize';
import {
  emptyBreakdown,
  overtimeCapHours,
  type AllocationResult,
  type Shift,
} from './types';

// 不扣稅(加班)時數的分配:
//
// 1. 可列不扣稅的時數:所有假日時數,加上「週一至週五單次上班超過 8 小時」
//    的部分(該班第 8 小時之後的時段)。單線值班加給一律扣稅。
// 2. 每月上限見 overtimeCapHours(46 → 80)。
// 3. 超過上限時「以低價班時數計稅」:先保留高價類別,低價的退回扣稅。
//    115 年 6 月以前先保留假日時數、平日超時排最後;7 月起嚴格依時薪高低。
// 同一類別內挑哪一天不影響金額,所以只算各類別的時數。
const PRIORITY_BEFORE_2026_07: PayCategory[] = ['假日夜', '假日白', '平日夜', '平日白'];
const PRIORITY_FROM_2026_07: PayCategory[] = ['假日夜', '平日夜', '假日白', '平日白'];

export function allocate(shifts: Shift[]): AllocationResult {
  const gross = categorizeAll(shifts);
  const untaxed = emptyBreakdown();
  if (shifts.length === 0) return { taxed: gross, untaxed };

  const yearMonth = shifts[0]!.date.slice(0, 7);
  const candidates = emptyBreakdown();
  for (const shift of shifts) {
    for (const seg of shiftSegments(shift)) {
      const isHolidayHours = seg.category === '假日白' || seg.category === '假日夜';
      if (isHolidayHours || seg.beyondEightOnWeekday) candidates[seg.category] += seg.hours;
    }
  }

  const priority = yearMonth >= '2026-07' ? PRIORITY_FROM_2026_07 : PRIORITY_BEFORE_2026_07;
  let budget = overtimeCapHours(yearMonth);
  for (const category of priority) {
    const take = Math.min(candidates[category], budget);
    untaxed[category] = take;
    budget -= take;
  }

  const taxed = { ...gross };
  for (const category of priority) taxed[category] -= untaxed[category];
  return { taxed, untaxed };
}
