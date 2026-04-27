import * as XLSX from 'xlsx';
import type { Shift } from './types';

export interface ParsedSchedule {
  year: number;
  month: number;
  person: string;
  shifts: Shift[];
}

const TITLE_RE = /(\d{2,3})年(\d{1,2})月/;
const OFF_CODES = new Set(['X', '*']);

function pickDataSheet(wb: XLSX.WorkBook): { name: string; ws: XLSX.WorkSheet; year: number; month: number } {
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const a1 = ws['A1']?.v;
    if (typeof a1 !== 'string') continue;
    const m = a1.match(TITLE_RE);
    if (!m) continue;
    const rocYear = Number(m[1]);
    const month = Number(m[2]);
    return { name, ws, year: rocYear + 1911, month };
  }
  throw new Error('No sheet with 民國年月 title found');
}

function findPersonCol(rows: unknown[][], person: string): number {
  const header = rows[1];
  if (!header) throw new Error('Header row (row 2) missing');
  for (let c = 2; c < header.length; c++) {
    if (String(header[c] ?? '').trim() === person) return c;
  }
  throw new Error(`Person "${person}" not found in header`);
}

function parseDateCell(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1 || n > 31) return null;
  return n;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function parseScheduleWorkbook(wb: XLSX.WorkBook, person: string): ParsedSchedule {
  const { ws, year, month } = pickDataSheet(wb);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null }) as unknown[][];
  const col = findPersonCol(rows, person);

  const shifts: Shift[] = [];
  let seenDayOne = false;

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const day = parseDateCell(row[0]);
    if (day === null) {
      if (seenDayOne) break;
      continue;
    }
    if (!seenDayOne && day === 1) seenDayOne = true;
    if (!seenDayOne) continue;

    const raw = row[col];
    const code = raw === null || raw === undefined ? '' : String(raw).trim();
    if (code === '' || OFF_CODES.has(code)) continue;

    shifts.push({ date: `${year}-${pad2(month)}-${pad2(day)}`, code });
  }

  return { year, month, person, shifts };
}

export function parseSchedule(filepath: string, person: string): ParsedSchedule {
  const wb = XLSX.readFile(filepath);
  return parseScheduleWorkbook(wb, person);
}
