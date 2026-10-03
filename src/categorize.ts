import { parseShiftCode } from './shifts';
import { dayOfWeek, isHoliday, isFriOrWeekendOrHoliday } from './calendar';
import { addBreakdown, emptyBreakdown, type HourBreakdown, type Shift } from './types';

export type PayCategory = '平日白' | '平日夜' | '假日白' | '假日夜';

export interface Segment {
  category: PayCategory;
  hours: number;
  /** 00:00–08:00 單線值班(另加 200/hr) */
  singleLine: boolean;
  /** 平日(週一至週五)單次上班超過 8 小時的部分:依規定以加班計,可列不扣稅 */
  beyondEightOnWeekday: boolean;
}

/** 把一個班切成費率一致的時段。 */
export function shiftSegments(shift: Shift): Segment[] {
  const range = parseShiftCode(shift.code);
  const dayIsHoliday = isHoliday(shift.date);
  const nightIsHoliday = isFriOrWeekendOrHoliday(shift.date);
  const dow = dayOfWeek(shift.date);
  const weekday = dow >= 1 && dow <= 5;
  const eighthHour = range.start + 8;

  const out: Segment[] = [];
  const breakpoints = [8, 20, 24, 32, eighthHour].sort((a, b) => a - b);
  let cursor = range.start;

  while (cursor < range.end) {
    let next = range.end;
    for (const bp of breakpoints) {
      if (bp > cursor && bp < next) {
        next = bp;
        break;
      }
    }
    const category: PayCategory =
      cursor < 20
        ? dayIsHoliday ? '假日白' : '平日白'
        : nightIsHoliday ? '假日夜' : '平日夜';
    out.push({
      category,
      hours: next - cursor,
      singleLine: cursor >= 24,
      beyondEightOnWeekday: weekday && cursor >= eighthHour,
    });
    cursor = next;
  }
  return out;
}

export function categorizeShift(shift: Shift): HourBreakdown {
  const out = emptyBreakdown();
  for (const seg of shiftSegments(shift)) {
    out[seg.category] += seg.hours;
    if (seg.singleLine) out.單線值班 += seg.hours;
  }
  return out;
}

export function categorizeAll(shifts: Shift[]): HourBreakdown {
  return shifts.reduce((acc, s) => addBreakdown(acc, categorizeShift(s)), emptyBreakdown());
}
