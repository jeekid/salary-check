import * as XLSX from 'xlsx';
import { calcSalary } from '../src/calc';
import { parseScheduleWorkbook } from '../src/parse-schedule';
import type { HourBreakdown } from '../src/types';

const form = requiredElement<HTMLFormElement>('#checker-form');
const resultEl = requiredElement<HTMLElement>('#result');
const messageEl = requiredElement<HTMLElement>('#message');

interface ExpectedInput {
  taxedAmount?: number;
  untaxedAmount?: number;
  incomeTax?: number;
}

const labels = {
  taxedAmount: '薪俸',
  untaxedAmount: '其他加款',
  incomeTax: '所得稅',
} as const;

const hourLabels = ['平日白', '平日夜', '假日白', '假日夜', '單線值班'] as const;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');
  resultEl.hidden = true;

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = '驗算中';
  }

  try {
    const formData = new FormData(form);
    const payload = await calculate(formData);
    render(payload);
  } catch (error) {
    setMessage(error instanceof Error ? error.message : String(error));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = '開始驗算';
    }
  }
});

async function calculate(formData: FormData) {
  const file = formData.get('schedule');
  if (!(file instanceof File)) {
    throw new Error('請上傳排班 xlsx 檔。');
  }

  const person = String(formData.get('person') || '').trim();
  if (person === '') throw new Error('請輸入人員姓名。');
  const expected: ExpectedInput = {
    taxedAmount: parseAmount(formData.get('taxedAmount')),
    untaxedAmount: parseAmount(formData.get('untaxedAmount')),
    incomeTax: parseAmount(formData.get('incomeTax')),
  };

  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const parsed = parseScheduleWorkbook(wb, person);
  const result = calcSalary(parsed.shifts);

  return {
    parsed,
    result,
    totals: {
      grossHours: totalHours(result.gross),
      taxedHours: totalHours(result.taxed),
      untaxedHours: totalHours(result.untaxed),
    },
    comparison: {
      taxedAmount: diff(result.taxedAmount, expected.taxedAmount),
      untaxedAmount: diff(result.untaxedAmount, expected.untaxedAmount),
      incomeTax: diff(result.incomeTax, expected.incomeTax),
    },
  };
}

function parseAmount(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return undefined;
  const n = Number(normalized);
  if (!Number.isFinite(n)) throw new Error(`金額格式錯誤：${value}`);
  return n;
}

function diff(got: number, expected?: number) {
  if (expected === undefined) return null;
  return { expected, diff: got - expected, ok: got === expected };
}

function totalHours(b: HourBreakdown): number {
  return b.平日白 + b.平日夜 + b.假日白 + b.假日夜;
}

function setMessage(message: string) {
  messageEl.textContent = message;
  messageEl.hidden = message === '';
}

function render(payload: Awaited<ReturnType<typeof calculate>>) {
  const { parsed, result, comparison } = payload;
  const yearMonth = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;

  resultEl.innerHTML = `
    <div class="summary">
      ${metric('月份', yearMonth)}
      ${metric('人員', escapeHtml(parsed.person))}
      ${metric('班數', `${parsed.shifts.length} 班`)}
      ${metric('總額', money(result.totalAmount))}
    </div>

    <div class="tables">
      <section>
        <h2>薪資比對</h2>
        ${comparisonTable(result, comparison)}
      </section>
      <section>
        <h2>時數拆分</h2>
        ${breakdownTable(result)}
      </section>
    </div>

    <div class="shifts">
      <strong>解析班表</strong><br />
      ${parsed.shifts.map((shift) => `${shift.date} ${escapeHtml(shift.code)}`).join(' · ')}
    </div>
  `;
  resultEl.hidden = false;
}

function metric(label: string, value: string) {
  return `<div class="metric"><small>${label}</small><strong>${value}</strong></div>`;
}

function comparisonTable(
  result: Awaited<ReturnType<typeof calculate>>['result'],
  comparison: Awaited<ReturnType<typeof calculate>>['comparison'],
) {
  const rows = (Object.keys(labels) as Array<keyof typeof labels>).map((key) => {
    const item = comparison[key];
    const expected = item ? money(item.expected) : '未輸入';
    const delta = item ? signedMoney(item.diff) : '-';
    const status = item ? (item.ok ? '<span class="ok">OK</span>' : '<span class="bad">差異</span>') : '-';
    return `
      <tr>
        <td>${labels[key]}</td>
        <td>${money(result[key])}</td>
        <td>${expected}</td>
        <td>${delta}</td>
        <td>${status}</td>
      </tr>
    `;
  });

  return `
    <table>
      <thead>
        <tr><th>項目</th><th>程式算出</th><th>薪資單</th><th>差額</th><th>狀態</th></tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
}

function breakdownTable(result: Awaited<ReturnType<typeof calculate>>['result']) {
  const rows = hourLabels.map((label) => `
    <tr>
      <td>${label}</td>
      <td>${formatHours(result.gross[label])}</td>
      <td>${formatHours(result.taxed[label])}</td>
      <td>${formatHours(result.untaxed[label])}</td>
    </tr>
  `);

  return `
    <table>
      <thead>
        <tr><th>類別</th><th>總時數</th><th>扣稅</th><th>不扣稅</th></tr>
      </thead>
      <tbody>
        ${rows.join('')}
        <tr><td>不含單線小計</td><td>${formatHours(totalHours(result.gross))}</td><td>${formatHours(totalHours(result.taxed))}</td><td>${formatHours(totalHours(result.untaxed))}</td></tr>
      </tbody>
    </table>
  `;
}

function money(value: number) {
  return Number(value).toLocaleString('zh-TW');
}

function signedMoney(value: number) {
  if (value === 0) return '0';
  return `${value > 0 ? '+' : ''}${money(value)}`;
}

function formatHours(value: number) {
  return `${Number(value).toLocaleString('zh-TW')} hr`;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`頁面初始化失敗，找不到 ${selector}。`);
  return element;
}
