import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { STANDARD_CATEGORIES } from '../data/samplePresets';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  defaultCurrency?: string;
  defaultAccount?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultCurrency = '$',
  defaultAccount = 'Main Account',
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('Groceries & Food');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  const [account, setAccount] = useState<string>(defaultAccount);
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Please provide a description or payee.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() || 'General Expense' : category;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || new Date().toISOString().split('T')[0],
      description: description.trim(),
      type,
      category: finalCategory,
      amount: parsedAmount,
      currency: currency || '$',
      account: account.trim() || 'Main Account',
      status,
      sourceFile: 'Manual Entry',
      notes: notes.trim(),
    };

    onAdd(newTx);
    onClose();

    // Reset form
    setDescription('');
    setAmount('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Add Transaction to Excel</h3>
              <p className="text-[11px] text-stone-500">Insert custom financial record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Type Selector (Pills) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Transaction Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['income', 'expense', 'transfer', 'investment'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'income' && category === 'Groceries & Food') setCategory('Salary & Wages');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    type === t
                      ? t === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : t === 'expense'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : t === 'transfer'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-purple-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description / Merchant / Source</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Salary Deposit, Whole Foods, Electric Utility"
              className="w-full px-3 py-2 text-xs sm:text-sm text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-xs">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-bold text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm text-center font-bold text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ Custom Category</option>
              </select>
              {category === 'CUSTOM' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="mt-2 w-full px-3 py-1.5 text-xs text-stone-800 border border-stone-300 rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Account and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Account / Bank Name</label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="e.g. Chase Checking, Amex Card"
                className="w-full px-3 py-2 text-xs text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Notes / Context (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Reference number, tax deductible"
                className="w-full px-3 py-2 text-xs text-stone-800 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              Add to Spreadsheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
