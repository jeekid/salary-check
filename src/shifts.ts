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

export function parseShiftCode(code: string): TimeRange {
  if (code in SHIFT_DEFS) return SHIFT_DEFS[code]!;
  const addHours = code.match(/^\+?(\d+(?:\.\d+)?)$/);
  if (addHours) {
    const hours = parseFloat(addHours[1]!);
    if (hours > 0) return { start: 8, end: 8 + hours };
  }
  const m = code.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (m) {
    let start = parseFloat(m[1]!);
    let end = parseFloat(m[2]!);
    if (end <= start) end += 24;
    return { start, end };
  }
  throw new Error(`Unknown shift code: ${code}`);
}
