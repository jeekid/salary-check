export interface Shift {
  date: string;
  code: string;
}

export interface HourBreakdown {
  平日白: number;
  平日夜: number;
  假日白: number;
  假日夜: number;
  單線值班: number;
}

export interface AllocationResult {
  taxed: HourBreakdown;
  untaxed: HourBreakdown;
}

export interface SalaryResult {
  gross: HourBreakdown;
  taxed: HourBreakdown;
  untaxed: HourBreakdown;
  taxedAmount: number;
  untaxedAmount: number;
  totalAmount: number;
  incomeTax: number;
  overtimeHours: number;
}

export const HOURLY_RATE: HourBreakdown = {
  平日白: 2200,
  平日夜: 2600,
  假日白: 2300,
  假日夜: 2800,
  單線值班: 200,
};

/** 每月不扣稅(加班)時數上限:115 年 6 月以前 46 小時,7 月起 80 小時。 */
export function overtimeCapHours(yearMonth: string): number {
  return yearMonth >= '2026-07' ? 80 : 46;
}
export const INCOME_TAX_RATE = 0.05;

export function emptyBreakdown(): HourBreakdown {
  return { 平日白: 0, 平日夜: 0, 假日白: 0, 假日夜: 0, 單線值班: 0 };
}

export function addBreakdown(a: HourBreakdown, b: HourBreakdown): HourBreakdown {
  return {
    平日白: a.平日白 + b.平日白,
    平日夜: a.平日夜 + b.平日夜,
    假日白: a.假日白 + b.假日白,
    假日夜: a.假日夜 + b.假日夜,
    單線值班: a.單線值班 + b.單線值班,
  };
}

export function amountFor(b: HourBreakdown): number {
  return (
    b.平日白 * HOURLY_RATE.平日白 +
    b.平日夜 * HOURLY_RATE.平日夜 +
    b.假日白 * HOURLY_RATE.假日白 +
    b.假日夜 * HOURLY_RATE.假日夜 +
    b.單線值班 * HOURLY_RATE.單線值班
  );
}
