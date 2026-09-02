import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, PieChart, TrendingUp, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';

interface StatsCardsProps {
  transactions: Transaction[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ transactions }) => {
  // Calculate dynamic totals directly from active transactions list
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfer = 0;
  let totalInvestment = 0;

  let currencySymbol = '$';
  if (transactions.length > 0 && transactions[0].currency) {
    currencySymbol = transactions[0].currency;
  }

  transactions.forEach((tx) => {
    if (tx.type === 'income') totalIncome += tx.amount;
    else if (tx.type === 'expense') totalExpense += tx.amount;
    else if (tx.type === 'transfer') totalTransfer += tx.amount;
    else if (tx.type === 'investment') totalInvestment += tx.amount;
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const formatMoney = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Income */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Income (Money In)</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">{formatMoney(totalIncome)}</div>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
          <span>{transactions.filter((t) => t.type === 'income').length} deposits &amp; earnings</span>
        </p>
      </div>

      {/* 2. Total Outgoings & Expenses */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Outgoings (Money Out)</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-700 tracking-tight">{formatMoney(totalExpense)}</div>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
          <span>{transactions.filter((t) => t.type === 'expense').length} expense line items</span>
        </p>
      </div>

      {/* 3. Net Cashflow / Savings */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Net Cashflow / Balance</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-2xl font-extrabold tracking-tight ${
            netBalance >= 0 ? 'text-stone-900' : 'text-rose-700'
          }`}
        >
          {netBalance >= 0 ? `+${formatMoney(netBalance)}` : `-${formatMoney(Math.abs(netBalance))}`}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              savingsRate >= 20
                ? 'bg-emerald-100 text-emerald-800'
                : savingsRate > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {savingsRate}% Savings Rate
          </span>
        </div>
      </div>

      {/* 4. Total Ledger Operations / Transfers */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Transfers &amp; Investments</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-blue-800 tracking-tight">
          {formatMoney(totalTransfer + totalInvestment)}
        </div>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
          <span>{transactions.length} total organized rows in Excel</span>
        </p>
      </div>
    </div>
  );
};
