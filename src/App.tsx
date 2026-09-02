import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { StatsCards } from './components/StatsCards';
import { SpreadsheetView } from './components/SpreadsheetView';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { InsightsBanner } from './components/InsightsBanner';
import { Transaction, ExtractionResult, UploadedFileItem } from './types';
import { SAMPLE_EXTRACTION_RESULT, SAMPLE_PRESET_TRANSACTIONS } from './data/samplePresets';
import confetti from 'canvas-confetti';
import { FileSpreadsheet, Download, Plus, UploadCloud } from 'lucide-react';
import { exportTransactionsToExcel } from './utils/excelExport';
import { extractStatementWithClientSdk, getClientStoredApiKey } from './utils/geminiClient';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [statementTitle, setStatementTitle] = useState<string>('Financial Statement Ledger');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Process uploaded images and writeup through server API or client-side SDK on static hosting
  const handleProcess = async (
    files: UploadedFileItem[],
    writeup: string,
    preferredCurrency: string,
    defaultAccount: string
  ) => {
    setIsProcessing(true);
    try {
      const payloadImages = files.map((f) => ({
        name: f.name,
        mimeType: f.type || 'image/png',
        data: f.base64Data || '',
      }));

      let result: ExtractionResult | null = null;

      // Try server API first
      try {
        const res = await fetch('/api/extract-statement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: payloadImages,
            writeup,
            preferredCurrency,
            defaultAccount,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            result = json.data;
          }
        }
      } catch {
        // Ignore server network errors when running on static hosts (e.g. GitHub Pages)
      }

      // If backend endpoint is not available or failed (e.g. static GitHub Pages hosting)
      if (!result) {
        const localKey = getClientStoredApiKey();
        if (!localKey) {
          setIsApiKeyModalOpen(true);
          throw new Error('On static hosting (GitHub Pages), please configure your Gemini API Key using the API Key button in the top bar to process statements.');
        }

        result = await extractStatementWithClientSdk(
          payloadImages,
          writeup,
          preferredCurrency,
          defaultAccount,
          localKey
        );
      }

      setExtractionResult(result);
      setTransactions(result.transactions || []);

      if (result.detectedBankOrSource) {
        setStatementTitle(`${result.detectedBankOrSource} - Statement`);
      } else {
        setStatementTitle('Financial Statement Ledger');
      }

      // Success animation
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669', '#34D399', '#3B82F6'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Load realistic demo preset
  const handleLoadSample = () => {
    setExtractionResult(SAMPLE_EXTRACTION_RESULT);
    setTransactions(SAMPLE_PRESET_TRANSACTIONS);
    setStatementTitle('Chase Premier Banking - August Statement');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#059669', '#34D399', '#3B82F6'],
    });
  };

  // Update a single transaction in state
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
  };

  // Delete single transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Delete multiple selected transactions
  const handleDeleteMultiple = (ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions((prev) => prev.filter((t) => !idSet.has(t.id)));
  };

  // Duplicate a transaction row
  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      description: `${tx.description} (Copy)`,
    };
    const index = transactions.findIndex((t) => t.id === tx.id);
    if (index !== -1) {
      const next = [...transactions];
      next.splice(index + 1, 0, duplicated);
      setTransactions(next);
    } else {
      setTransactions((prev) => [duplicated, ...prev]);
    }
  };

  // Add new transaction
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Reset to upload mode
  const handleReset = () => {
    if (transactions.length > 0) {
      if (window.confirm('Reset current statement data and upload a new one?')) {
        setTransactions([]);
        setExtractionResult(null);
        setStatementTitle('Financial Statement Ledger');
      }
    } else {
      setTransactions([]);
      setExtractionResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        transactions={transactions}
        onAddNew={() => setIsAddModalOpen(true)}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        statementTitle={statementTitle}
        onTitleChange={setStatementTitle}
        isProcessing={isProcessing}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {transactions.length === 0 ? (
          /* Empty / Upload View */
          <UploadSection
            onProcess={handleProcess}
            isProcessing={isProcessing}
            onLoadSample={handleLoadSample}
          />
        ) : (
          /* Active Spreadsheet View */
          <div className="space-y-6">
            {/* Audit & Insights Banner */}
            <InsightsBanner result={extractionResult} />

            {/* Top Stat Cards (Income, Outgoings, Net Cashflow) */}
            <StatsCards transactions={transactions} />

            {/* Interactive Spreadsheet View with In-line cell editing */}
            <SpreadsheetView
              transactions={transactions}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteMultiple={handleDeleteMultiple}
              onDuplicateTransaction={handleDuplicateTransaction}
              onAddNewRow={() => setIsAddModalOpen(true)}
            />

            {/* Visual Category Breakdown & Expense Distribution */}
            <CategoryBreakdown transactions={transactions} />

            {/* Bottom Actions Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All changes are saved in real-time. Ready to export multi-tab Excel workbook with formatted sheets for All Transactions, Income, Outgoings, &amp; Summary.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>

                <button
                  onClick={() => {
                    const sanitizedName =
                      statementTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Financial_Statement';
                    exportTransactionsToExcel(transactions, `${sanitizedName}.xlsx`, statementTitle);
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.8 },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        defaultCurrency={transactions[0]?.currency || '$'}
        defaultAccount={transactions[0]?.account || 'Main Account'}
      />

      {/* API Key Modal for GitHub Pages / Static Hosting */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-stone-200/80 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>Statement to Excel Converter • AI-Powered Bank Statement &amp; Financial Ledger Parser</p>
        </div>
      </footer>
    </div>
  );
}
