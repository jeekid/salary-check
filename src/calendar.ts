import { ALL_HOLIDAY_DATES, HOLIDAYS } from './domain-generated';

// 國定假日表來自 shared/domain.json(與排班器共用同一份),
// 經 `bun run codegen` 產生 domain-generated.ts。要增補年度假日請改那個 JSON。
export { HOLIDAYS };

export function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

export function isMarkedHoliday(dateStr: string): boolean {
  return ALL_HOLIDAY_DATES.has(dateStr);
}

/** 白班的平/假日判定:週六、週日、國定假日。 */
export function isHoliday(dateStr: string): boolean {
  if (isMarkedHoliday(dateStr)) return true;
  const dow = dayOfWeek(dateStr);
  return dow === 0 || dow === 6;
}

/** 夜班的平/假日判定:再加上週五(週五晚視為假日夜)。 */
export function isFriOrWeekendOrHoliday(dateStr: string): boolean {
  if (isMarkedHoliday(dateStr)) return true;
  const dow = dayOfWeek(dateStr);
  return dow === 5 || dow === 6 || dow === 0;
}
