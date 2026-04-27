import { parseShiftCode } from './shifts';
import { isHoliday, isFriOrWeekendOrHoliday } from './calendar';
import { addBreakdown, emptyBreakdown, type HourBreakdown, type Shift } from './types';

export function categorizeShift(shift: Shift): HourBreakdown {
  const range = parseShiftCode(shift.code);
  const dayIsHoliday = isHoliday(shift.date);
  const nightIsHoliday = isFriOrWeekendOrHoliday(shift.date);

  const out = emptyBreakdown();
  const breakpoints = [8, 20, 24, 32];
  let cursor = range.start;

  while (cursor < range.end) {
    let next = range.end;
    for (const bp of breakpoints) {
      if (bp > cursor && bp < next) {
        next = bp;
        break;
      }
    }
    const hours = next - cursor;

    if (cursor < 20) {
      out[dayIsHoliday ? '假日白' : '平日白'] += hours;
    } else {
      out[nightIsHoliday ? '假日夜' : '平日夜'] += hours;
      if (cursor >= 24) out.單線值班 += hours;
    }
    cursor = next;
  }
  return out;
}

export function categorizeAll(shifts: Shift[]): HourBreakdown {
  return shifts.reduce((acc, s) => addBreakdown(acc, categorizeShift(s)), emptyBreakdown());
}
