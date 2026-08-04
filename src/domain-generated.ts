/**
 * 產生檔案 — 不要手改。
 * 來源: shared/domain.json,執行 `bun run codegen` 重新產生。
 */

export interface TimeRange {
  start: number;
  end: number;
}

export const SHIFT_DEFS: Record<string, TimeRange> = {
  M: { start: 8, end: 12 },
  D: { start: 8, end: 16 },
  A: { start: 8, end: 20 },
  C: { start: 12, end: 24 },
  E: { start: 16, end: 24 },
  B: { start: 20, end: 32 },
  Q: { start: 24, end: 32 },
};

/** 非班碼的格值(休假/會議/上課):計時與計薪都跳過。 */
export const MARKER_CODES: ReadonlySet<string> = new Set(['X', '*', 'ACLS']);

export const NIGHT_CODES: ReadonlySet<string> = new Set(['B', 'Q']);

/** 一格多碼時的分隔符,如 "M,20-24"。 */
export const CELL_SEPARATORS: readonly string[] = [',', '、'];

/** 民國年 -> { 國曆日期: 名稱 }。 */
export const HOLIDAYS: Record<number, Record<string, string>> = {
  115: {
    '2026-01-01': '元旦',
    '2026-02-16': '除夕',
    '2026-02-17': '初一',
    '2026-02-18': '初二',
    '2026-02-19': '初三',
    '2026-02-20': '初四',
    '2026-02-21': '初五',
    '2026-02-27': '和平',
    '2026-04-03': '兒童',
    '2026-04-06': '清明',
    '2026-05-01': '勞動',
    '2026-06-19': '端午',
    '2026-09-25': '中秋',
    '2026-09-28': '教師',
    '2026-10-09': '國慶',
    '2026-10-26': '光復',
    '2026-12-25': '行憲',
  },
};

/** 所有已知國定假日的國曆日期(跨年度攤平)。 */
export const ALL_HOLIDAY_DATES: ReadonlySet<string> = new Set(
  Object.values(HOLIDAYS).flatMap((days) => Object.keys(days)),
);
