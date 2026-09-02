import React from 'react';
import { PieChart, ArrowUpRight, ArrowDownLeft, Tag, Layers } from 'lucide-react';
import { Transaction } from '../types';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions }) => {
  const currencySymbol = transactions[0]?.currency || '$';

  // Calculate expense breakdown
  const expenseMap = new Map<string, { amount: number; count: number }>();
  let totalExpense = 0;

  // Calculate income breakdown
  const incomeMap = new Map<string, { amount: number; count: number }>();
  let totalIncome = 0;

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      totalExpense += t.amount;
      const cur = expenseMap.get(t.category) || { amount: 0, count: 0 };
      cur.amount += t.amount;
      cur.count += 1;
      expenseMap.set(t.category, cur);
    } else if (t.type === 'income') {
      totalIncome += t.amount;
      const cur = incomeMap.get(t.category) || { amount: 0, count: 0 };
      cur.amount += t.amount;
      cur.count += 1;
      incomeMap.set(t.category, cur);
    }
  });

  const sortedExpenses = Array.from(expenseMap.entries())
    .map(([category, val]) => ({
      category,
      amount: val.amount,
      count: val.count,
      percentage: totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const sortedIncome = Array.from(incomeMap.entries())
    .map(([category, val]) => ({
      category,
      amount: val.amount,
      count: val.count,
      percentage: totalIncome > 0 ? (val.amount / totalIncome) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const formatMoney = (val: number) => {
    return `${currencySymbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* 1. Outgoings / Expenses by Category */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Outgoings by Category</h3>
              <p className="text-[11px] text-stone-500">{sortedExpenses.length} expense categories</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-rose-700">{formatMoney(totalExpense)}</span>
        </div>

        {sortedExpenses.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No expense records found</p>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="truncate max-w-[200px]">{cat.category}</span>
                    <span className="text-[10px] text-stone-400">({cat.count})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-stone-900">{formatMoney(cat.amount)}</span>
                    <span className="text-[11px] text-stone-500 w-12 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Income Streams by Category */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Income Streams</h3>
              <p className="text-[11px] text-stone-500">{sortedIncome.length} income sources</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-700">{formatMoney(totalIncome)}</span>
        </div>

        {sortedIncome.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No income records found</p>
        ) : (
          <div className="space-y-3">
            {sortedIncome.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="truncate max-w-[200px]">{cat.category}</span>
                    <span className="text-[10px] text-stone-400">({cat.count})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-stone-900">{formatMoney(cat.amount)}</span>
                    <span className="text-[11px] text-stone-500 w-12 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
