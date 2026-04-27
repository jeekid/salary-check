import { allocate } from './allocate';
import { categorizeAll } from './categorize';
import {
  amountFor,
  INCOME_TAX_RATE,
  type SalaryResult,
  type Shift,
} from './types';

export function calcSalary(shifts: Shift[]): SalaryResult {
  const gross = categorizeAll(shifts);
  const { taxed, untaxed } = allocate(shifts);

  const taxedAmount = amountFor(taxed);
  const untaxedAmount = amountFor(untaxed);
  const totalAmount = taxedAmount + untaxedAmount;
  const incomeTax = Math.round(taxedAmount * INCOME_TAX_RATE);
  const overtimeHours =
    untaxed.平日白 + untaxed.平日夜 + untaxed.假日白 + untaxed.假日夜;

  return {
    gross,
    taxed,
    untaxed,
    taxedAmount,
    untaxedAmount,
    totalAmount,
    incomeTax,
    overtimeHours,
  };
}
