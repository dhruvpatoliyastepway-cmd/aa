import * as XLSX from 'xlsx';
import { Transaction } from '../types';

export function exportTransactionsToExcel(
  transactions: Transaction[],
  fileName: string = 'Financial_Statement_Summary.xlsx',
  customTitle: string = 'Financial Statement'
) {
  const wb = XLSX.utils.book_new();

  // 1. All Transactions Sheet
  const allRows = transactions.map((t) => ({
    'Transaction ID': t.id,
    Date: t.date,
    Description: t.description,
    Type: t.type.toUpperCase(),
    Category: t.category,
    Amount: t.amount,
    Currency: t.currency,
    Account: t.account,
    Status: t.status.toUpperCase(),
    'Source Document': t.sourceFile || '',
    Notes: t.notes || '',
  }));

  const wsAll = XLSX.utils.json_to_sheet(allRows);
  setColumnWidths(wsAll, allRows);
  XLSX.utils.book_append_sheet(wb, wsAll, 'All Transactions');

  // 2. Income Sheet
  const incomeItems = transactions.filter((t) => t.type === 'income');
  const incomeRows = incomeItems.map((t) => ({
    Date: t.date,
    Source: t.description,
    Category: t.category,
    Amount: t.amount,
    Currency: t.currency,
    Account: t.account,
    Status: t.status,
    Notes: t.notes || '',
  }));
  const wsIncome = XLSX.utils.json_to_sheet(incomeRows);
  setColumnWidths(wsIncome, incomeRows);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

  // 3. Outgoings & Expenses Sheet
  const expenseItems = transactions.filter((t) => t.type === 'expense');
  const expenseRows = expenseItems.map((t) => ({
    Date: t.date,
    Payee: t.description,
    Category: t.category,
    Amount: t.amount,
    Currency: t.currency,
    Account: t.account,
    Status: t.status,
    Notes: t.notes || '',
  }));
  const wsExpense = XLSX.utils.json_to_sheet(expenseRows);
  setColumnWidths(wsExpense, expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExpense, 'Outgoings & Expenses');

  // 4. Category Summary Sheet
  const categoryMap = new Map<string, { type: string; total: number; count: number }>();
  let totalExpenseSum = 0;
  let totalIncomeSum = 0;

  for (const t of transactions) {
    if (t.type === 'income') totalIncomeSum += t.amount;
    if (t.type === 'expense') totalExpenseSum += t.amount;

    const key = `${t.category}__${t.type}`;
    const existing = categoryMap.get(key) || { type: t.type, total: 0, count: 0 };
    existing.total += t.amount;
    existing.count += 1;
    categoryMap.set(key, existing);
  }

  const categoryRows: any[] = [];
  categoryMap.forEach((val, key) => {
    const [catName] = key.split('__');
    const baseTotal = val.type === 'income' ? totalIncomeSum : totalExpenseSum;
    const share = baseTotal > 0 ? ((val.total / baseTotal) * 100).toFixed(1) + '%' : '0%';

    categoryRows.push({
      Category: catName,
      Type: val.type.toUpperCase(),
      'Transaction Count': val.count,
      'Total Amount': Number(val.total.toFixed(2)),
      'Share of Type': share,
    });
  });

  categoryRows.sort((a, b) => b['Total Amount'] - a['Total Amount']);

  const wsSummary = XLSX.utils.json_to_sheet(categoryRows);
  setColumnWidths(wsSummary, categoryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Category Summary');

  // 5. Executive Overview Sheet
  const netCashflow = totalIncomeSum - totalExpenseSum;
  const overviewRows = [
    { Metric: 'Statement Title', Value: customTitle },
    { Metric: 'Total Recorded Transactions', Value: transactions.length },
    { Metric: 'Total Income (Money In)', Value: Number(totalIncomeSum.toFixed(2)) },
    { Metric: 'Total Outgoings (Money Out)', Value: Number(totalExpenseSum.toFixed(2)) },
    { Metric: 'Net Balance / Cashflow', Value: Number(netCashflow.toFixed(2)) },
    {
      Metric: 'Savings Rate',
      Value: totalIncomeSum > 0 ? ((netCashflow / totalIncomeSum) * 100).toFixed(1) + '%' : 'N/A',
    },
    { Metric: 'Export Timestamp', Value: new Date().toLocaleString() },
  ];
  const wsOverview = XLSX.utils.json_to_sheet(overviewRows);
  setColumnWidths(wsOverview, overviewRows);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Executive Overview');

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
}

export function exportTransactionsToCSV(transactions: Transaction[], fileName: string = 'Financial_Transactions.csv') {
  const rows = transactions.map((t) => ({
    ID: t.id,
    Date: t.date,
    Description: t.description,
    Type: t.type,
    Category: t.category,
    Amount: t.amount,
    Currency: t.currency,
    Account: t.account,
    Status: t.status,
    Notes: t.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyTransactionsToClipboard(transactions: Transaction[]): Promise<boolean> {
  const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Currency', 'Account', 'Status', 'Notes'];
  const lines = transactions.map((t) =>
    [t.date, t.description, t.type, t.category, t.amount, t.currency, t.account, t.status, t.notes || ''].join('\t')
  );
  const tsvText = [headers.join('\t'), ...lines].join('\n');

  return navigator.clipboard
    .writeText(tsvText)
    .then(() => true)
    .catch(() => false);
}

function setColumnWidths(ws: XLSX.WorkSheet, data: any[]) {
  if (!data || data.length === 0) return;
  const colWidths: { [key: string]: number } = {};

  // Check keys
  Object.keys(data[0]).forEach((k) => {
    colWidths[k] = k.length + 3;
  });

  // Check row values
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      const valStr = String(row[k] ?? '');
      if (valStr.length + 3 > colWidths[k]) {
        colWidths[k] = Math.min(valStr.length + 3, 50); // cap max width at 50
      }
    });
  });

  ws['!cols'] = Object.values(colWidths).map((wch) => ({ wch }));
}
