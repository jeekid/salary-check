import {
  CELL_SEPARATORS,
  MARKER_CODES,
  NIGHT_CODES,
  SHIFT_DEFS,
  type TimeRange,
} from './domain-generated';

// 班碼表與 marker 表來自 shared/domain.json(與排班器共用同一份),
// 經 `bun run codegen` 產生 domain-generated.ts。要改班碼請改那個 JSON。
export { CELL_SEPARATORS, MARKER_CODES, NIGHT_CODES, SHIFT_DEFS, type TimeRange };

const SPLIT_RE = new RegExp(`[${CELL_SEPARATORS.map((s) => `\\${s}`).join('')}]`);

export function parseShiftCode(code: string): TimeRange {
  const trimmed = code.trim();
  if (trimmed in SHIFT_DEFS) return SHIFT_DEFS[trimmed]!;
  const addHours = trimmed.match(/^\+?(\d+(?:\.\d+)?)$/);
  if (addHours) {
    const hours = parseFloat(addHours[1]!);
    if (hours > 0) return { start: 8, end: 8 + hours };
  }
  const m = trimmed.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (m) {
    let start = parseFloat(m[1]!);
    let end = parseFloat(m[2]!);
    if (end <= start) end += 24;
    return { start, end };
  }
  throw new Error(`Unknown shift code: ${trimmed}`);
}

/** 一格可能含多個班碼(歷史異常如 "M,20-24"),以 CELL_SEPARATORS 拆開。 */
export function splitCellCodes(cell: string): string[] {
  return cell
    .split(SPLIT_RE)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function isMarker(code: string): boolean {
  return MARKER_CODES.has(code.trim());
}
