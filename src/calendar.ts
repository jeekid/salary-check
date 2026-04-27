export const HOLIDAYS_115: Record<string, string> = {
  '2026-01-01': '元旦',
  '2026-02-16': '除夕',
  '2026-02-17': '春節初一',
  '2026-02-18': '春節初二',
  '2026-02-19': '春節初三',
  '2026-02-20': '春節初四',
  '2026-02-21': '春節初五',
  '2026-02-27': '和平紀念日',
  '2026-04-03': '兒童節',
  '2026-04-06': '清明節',
};

export function dayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

export function isMarkedHoliday(dateStr: string): boolean {
  return dateStr in HOLIDAYS_115;
}

export function isHoliday(dateStr: string): boolean {
  if (isMarkedHoliday(dateStr)) return true;
  const dow = dayOfWeek(dateStr);
  return dow === 0 || dow === 6;
}

export function isFriOrWeekendOrHoliday(dateStr: string): boolean {
  if (isMarkedHoliday(dateStr)) return true;
  const dow = dayOfWeek(dateStr);
  return dow === 5 || dow === 6 || dow === 0;
}
