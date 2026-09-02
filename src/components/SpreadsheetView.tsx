import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Download,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Tag,
  CreditCard,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { STANDARD_CATEGORIES } from '../data/samplePresets';

interface SpreadsheetViewProps {
  transactions: Transaction[];
  onUpdateTransaction: (updated: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
  onAddNewRow: () => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onDeleteMultiple,
  onDuplicateTransaction,
  onAddNewRow,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Editing state: which row is currently in full edit mode
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);

  // Extract unique accounts and categories from active transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category).filter(Boolean));
    STANDARD_CATEGORIES.forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [transactions]);

  const uniqueAccounts = useMemo(() => {
    const set = new Set(transactions.map((t) => t.account).filter(Boolean));
    return Array.from(set).sort();
  }, [transactions]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: transactions.length,
      income: transactions.filter((t) => t.type === 'income').length,
      expense: transactions.filter((t) => t.type === 'expense').length,
      transfer: transactions.filter((t) => t.type === 'transfer' || t.type === 'investment').length,
    };
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Tab filtering
        if (activeTab === 'income' && t.type !== 'income') return false;
        if (activeTab === 'expense' && t.type !== 'expense') return false;
        if (activeTab === 'transfer' && t.type !== 'transfer' && t.type !== 'investment') return false;

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        // Account filter
        if (selectedAccount !== 'all' && t.account !== selectedAccount) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchAcc = t.account.toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          const matchAmt = t.amount.toString().includes(q);
          const matchDate = t.date.includes(q);
          if (!matchDesc && !matchCat && !matchAcc && !matchNotes && !matchAmt && !matchDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
        }
        if (sortField === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortField === 'description') {
          return sortOrder === 'asc'
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        }
        if (sortField === 'category') {
          return sortOrder === 'asc'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
  }, [transactions, activeTab, selectedCategory, selectedAccount, searchQuery, sortField, sortOrder]);

  // Handle Sort Toggle
  const handleSortToggle = (field: 'date' | 'amount' | 'description' | 'category') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Row selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(filteredTransactions.map((t) => t.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRowIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedRowIds.size} selected transaction(s)?`)) {
      onDeleteMultiple(Array.from(selectedRowIds));
      setSelectedRowIds(new Set());
    }
  };

  // Start Editing Row
  const handleStartEdit = (tx: Transaction) => {
    setEditingRowId(tx.id);
    setEditForm({ ...tx });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateTransaction(editForm);
      setEditingRowId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditForm(null);
  };

  const handleQuickInlineChange = (id: string, field: keyof Transaction, val: any) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    onUpdateTransaction({
      ...target,
      [field]: val,
    });
  };

  const formatAmount = (amount: number, type: TransactionType, currency: string) => {
    const formattedNum = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (type === 'income') {
      return <span className="font-bold text-emerald-700">+{currency}{formattedNum}</span>;
    }
    if (type === 'expense') {
      return <span className="font-bold text-rose-700">-{currency}{formattedNum}</span>;
    }
    if (type === 'investment') {
      return <span className="font-bold text-purple-700">{currency}{formattedNum}</span>;
    }
    return <span className="font-semibold text-blue-700">{currency}{formattedNum}</span>;
  };

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            Income
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ArrowUpRight className="w-3 h-3 text-rose-600" />
            Outgoing
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowUpDown className="w-3 h-3 text-blue-600" />
            Transfer
          </span>
        );
      case 'investment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <TrendingUp className="w-3 h-3 text-purple-600" />
            Investment
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* 1. Worksheet Tab Bar */}
      <div className="border-b border-stone-200 px-4 pt-3 flex flex-wrap items-center justify-between gap-3 bg-stone-50">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-stone-600 border-transparent hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>All Transactions</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-700">
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-stone-600 border-transparent hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Income Sheet</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {tabCounts.income}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white text-rose-700 border-rose-600 shadow-xs'
                : 'text-stone-600 border-transparent hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Outgoings &amp; Expenses</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800">
              {tabCounts.expense}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-stone-600 border-transparent hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Transfers &amp; Investments</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {tabCounts.transfer}
            </span>
          </button>
        </div>

        {/* Quick Add Row Button */}
        <div className="pb-2">
          <button
            onClick={onAddNewRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row to Sheet</span>
          </button>
        </div>
      </div>

      {/* 2. Spreadsheet Toolbar (Search, Filter, Actions) */}
      <div className="p-3.5 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, category, amount..."
              className="w-full pl-8 pr-3 py-1.5 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          {uniqueAccounts.length > 1 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-2.5 py-1.5 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Rows Action */}
        {selectedRowIds.size > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-xs">
            <span className="font-semibold text-rose-800">{selectedRowIds.size} selected</span>
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-bold ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. The Excel Table Grid */}
      <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-stone-100/90 text-stone-700 font-bold sticky top-0 z-20 border-b border-stone-200 backdrop-blur-xs select-none">
            <tr>
              <th className="p-3 w-10 text-center border-r border-stone-200">
                <input
                  type="checkbox"
                  checked={
                    filteredTransactions.length > 0 &&
                    filteredTransactions.every((t) => selectedRowIds.has(t.id))
                  }
                  onChange={handleSelectAll}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="p-3 w-12 text-center text-stone-400 font-mono text-[11px] border-r border-stone-200">
                #
              </th>
              <th
                onClick={() => handleSortToggle('date')}
                className="p-3 w-28 cursor-pointer hover:bg-stone-200/70 border-r border-stone-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th
                onClick={() => handleSortToggle('description')}
                className="p-3 min-w-[220px] cursor-pointer hover:bg-stone-200/70 border-r border-stone-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Description / Payee</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="p-3 w-28 border-r border-stone-200">
                <span>Type</span>
              </th>
              <th
                onClick={() => handleSortToggle('category')}
                className="p-3 min-w-[170px] cursor-pointer hover:bg-stone-200/70 border-r border-stone-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th
                onClick={() => handleSortToggle('amount')}
                className="p-3 w-32 text-right cursor-pointer hover:bg-stone-200/70 border-r border-stone-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="p-3 min-w-[150px] border-r border-stone-200">
                <span>Account / Bank</span>
              </th>
              <th className="p-3 min-w-[150px] border-r border-stone-200">
                <span>Notes / Context</span>
              </th>
              <th className="p-3 w-24 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200 text-stone-800">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-stone-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="font-semibold text-sm text-stone-600">No transactions match the current filter</p>
                  <p className="text-xs text-stone-400 mt-1">Try changing your search query or tab selection</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, index) => {
                const isEditing = editingRowId === tx.id;
                const isSelected = selectedRowIds.has(tx.id);

                if (isEditing && editForm) {
                  // Full Edit Mode Row
                  return (
                    <tr key={tx.id} className="bg-emerald-50/70 border-2 border-emerald-500">
                      <td className="p-2 text-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                      </td>
                      <td className="p-2 text-center text-stone-400 font-mono text-[10px]">{index + 1}</td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransactionType })}
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs"
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                          <option value="transfer">Transfer</option>
                          <option value="investment">Investment</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs"
                        >
                          {uniqueCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs text-right font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.account}
                          onChange={(e) => setEditForm({ ...editForm, account: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="Notes"
                          className="w-full px-2 py-1 bg-white border border-emerald-500 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-stone-300 text-stone-700 rounded hover:bg-stone-400"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Normal Spreadsheet Row (with Quick Double Click / Edit)
                return (
                  <tr
                    key={tx.id}
                    onDoubleClick={() => handleStartEdit(tx)}
                    className={`hover:bg-stone-50/90 transition-colors group ${
                      isSelected ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center border-r border-stone-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(tx.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Row Index */}
                    <td className="p-3 text-center text-stone-400 font-mono text-[11px] border-r border-stone-200">
                      {index + 1}
                    </td>

                    {/* Date */}
                    <td className="p-3 font-mono text-stone-600 whitespace-nowrap border-r border-stone-200">
                      {tx.date}
                    </td>

                    {/* Description */}
                    <td className="p-3 font-medium text-stone-900 border-r border-stone-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[280px]" title={tx.description}>
                          {tx.description}
                        </span>
                        {tx.sourceFile && (
                          <span className="text-[10px] text-stone-400 font-normal shrink-0 hidden sm:inline">
                            {tx.sourceFile}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3 border-r border-stone-200 whitespace-nowrap">
                      {getTypeBadge(tx.type)}
                    </td>

                    {/* Category (Quick select inline) */}
                    <td className="p-3 border-r border-stone-200">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate max-w-[140px]" title={tx.category}>
                          {tx.category}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-3 text-right font-mono text-xs border-r border-stone-200 whitespace-nowrap">
                      {formatAmount(tx.amount, tx.type, tx.currency)}
                    </td>

                    {/* Account */}
                    <td className="p-3 border-r border-stone-200 text-stone-600 truncate max-w-[140px]" title={tx.account}>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{tx.account || 'Main'}</span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="p-3 border-r border-stone-200 text-stone-500 italic truncate max-w-[160px]" title={tx.notes}>
                      {tx.notes || '—'}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleStartEdit(tx)}
                          className="p-1 text-stone-400 hover:text-emerald-700 hover:bg-stone-100 rounded"
                          title="Edit row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateTransaction(tx)}
                          className="p-1 text-stone-400 hover:text-blue-700 hover:bg-stone-100 rounded"
                          title="Duplicate row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-stone-400 hover:text-rose-700 hover:bg-stone-100 rounded"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Summary Row */}
          {filteredTransactions.length > 0 && (
            <tfoot className="bg-stone-100/95 font-bold border-t-2 border-stone-300 text-stone-900 sticky bottom-0 z-20">
              <tr>
                <td colSpan={3} className="p-3 text-center text-xs text-stone-500 font-semibold border-r border-stone-200">
                  Total ({filteredTransactions.length} items)
                </td>
                <td colSpan={3} className="p-3 text-xs text-stone-600 border-r border-stone-200">
                  {activeTab === 'income'
                    ? 'Total Income in View'
                    : activeTab === 'expense'
                    ? 'Total Outgoings in View'
                    : 'Filtered Sum'}
                </td>
                <td className="p-3 text-right font-mono text-xs border-r border-stone-200">
                  {(() => {
                    const sum = filteredTransactions.reduce((acc, t) => {
                      if (t.type === 'income') return acc + t.amount;
                      if (t.type === 'expense') return acc - t.amount;
                      return acc;
                    }, 0);
                    const cur = filteredTransactions[0]?.currency || '$';
                    return (
                      <span className={sum >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                        {sum >= 0 ? `+${cur}` : `-${cur}`}
                        {Math.abs(sum).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    );
                  })()}
                </td>
                <td colSpan={3} className="p-3 text-xs text-stone-500 italic">
                  *Double-click any row to edit fields
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
