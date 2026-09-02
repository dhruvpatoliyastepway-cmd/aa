import React from 'react';
import { FileSpreadsheet, Download, Plus, RotateCcw, Sparkles, FileText, CheckCircle2, Key } from 'lucide-react';
import { Transaction } from '../types';
import { exportTransactionsToExcel, exportTransactionsToCSV, copyTransactionsToClipboard } from '../utils/excelExport';
import confetti from 'canvas-confetti';

interface HeaderProps {
  transactions: Transaction[];
  onAddNew: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  statementTitle: string;
  onTitleChange: (newTitle: string) => void;
  isProcessing: boolean;
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  transactions,
  onAddNew,
  onReset,
  onLoadSample,
  statementTitle,
  onTitleChange,
  isProcessing,
  onOpenApiKeyModal,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(statementTitle);

  React.useEffect(() => {
    setTitleInput(statementTitle);
  }, [statementTitle]);

  const handleDownloadExcel = () => {
    if (transactions.length === 0) return;
    const sanitizedName = statementTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Bank_Statement_Summary';
    exportTransactionsToExcel(transactions, `${sanitizedName}.xlsx`, statementTitle);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10B981', '#059669', '#34D399', '#3B82F6'],
    });
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) return;
    const sanitizedName = statementTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Bank_Statement_Summary';
    exportTransactionsToCSV(transactions, `${sanitizedName}.csv`);
  };

  const handleCopyClipboard = async () => {
    if (transactions.length === 0) return;
    const success = await copyTransactionsToClipboard(transactions);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo and Statement Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                      autoFocus
                      className="px-2 py-0.5 text-base font-bold text-stone-900 border border-emerald-500 rounded-md focus:outline-hidden"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-xs font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-bold text-stone-900 hover:text-emerald-700 cursor-pointer flex items-center gap-1.5 transition-colors"
                    title="Click to rename spreadsheet"
                  >
                    {statementTitle}
                    <span className="text-xs text-stone-400 font-normal border border-stone-200 rounded px-1.5 py-0.5">
                      Rename
                    </span>
                  </h1>
                )}
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <span>AI Statement &amp; Writeup to Excel Converter</span>
                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                <span>{transactions.length} rows loaded</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenApiKeyModal && (
              <button
                id="api-key-btn"
                onClick={onOpenApiKeyModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                title="Configure Gemini API Key for Static / GitHub Pages"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">API Key</span>
              </button>
            )}

            {transactions.length === 0 ? (
              <button
                id="load-sample-btn"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Demo Statement</span>
              </button>
            ) : (
              <>
                <button
                  id="add-row-header-btn"
                  onClick={onAddNew}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-600" />
                  <span>Add Transaction</span>
                </button>

                <button
                  id="copy-clipboard-btn"
                  onClick={handleCopyClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
                  title="Copy formatted table to paste into Excel or Google Sheets"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied TSV!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-stone-600" />
                      <span>Copy for Sheets</span>
                    </>
                  )}
                </button>

                <button
                  id="download-csv-btn"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
                >
                  <span>CSV</span>
                </button>

                <button
                  id="download-excel-btn"
                  onClick={handleDownloadExcel}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  id="reset-statement-btn"
                  onClick={onReset}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Upload new statement / Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
