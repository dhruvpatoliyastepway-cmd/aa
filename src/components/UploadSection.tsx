import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { UploadedFileItem } from '../types';
import { SAMPLE_WRITEUP_PRESETS } from '../data/samplePresets';

interface UploadSectionProps {
  onProcess: (files: UploadedFileItem[], writeup: string, currency: string, account: string) => Promise<void>;
  isProcessing: boolean;
  onLoadSample: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onProcess, isProcessing, onLoadSample }) => {
  const [activeTab, setActiveTab] = useState<'both' | 'images' | 'writeup'>('both');
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [writeupText, setWriteupText] = useState<string>('');
  const [currency, setCurrency] = useState<string>('$');
  const [accountName, setAccountName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files).filter((file) => file.type.startsWith('image/'));
        if (pastedFiles.length > 0) {
          handleFileObjects(pastedFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [files]);

  // Simulate progress steps when processing
  useEffect(() => {
    if (!isProcessing) {
      setProcessingStep('');
      return;
    }

    const steps = [
      'Scanning bank statement screenshots & text...',
      'Recognizing merchant descriptions, dates, and amounts...',
      'Categorizing income streams vs. outgoings...',
      'Structuring spreadsheet rows & summary balances...',
    ];

    let currentIndex = 0;
    setProcessingStep(steps[0]);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < steps.length) {
        setProcessingStep(steps[currentIndex]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileObjects = (fileList: File[]) => {
    setErrorMsg('');
    const newItems: UploadedFileItem[] = [];

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload standard image formats (PNG, JPG, WEBP) of statements or receipts.');
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds 15MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const item: UploadedFileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: base64Data,
          base64Data,
        };
        setFiles((prev) => [...prev, item]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileObjects(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (files.length === 0 && !writeupText.trim()) {
      setErrorMsg('Please upload at least one bank screenshot or enter a finance writeup to convert.');
      return;
    }

    try {
      await onProcess(files, writeupText, currency, accountName);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract transactions. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4">
      {/* Hero Welcome banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Bank Ledger Extraction</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Turn Statement Screenshots &amp; Writeups into Clean Excel Sheets
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6">
            Upload images of bank statements, mobile banking apps, or receipts — or just paste quick spending notes.
            We’ll organize everything into categorized Income &amp; Outgoings with direct Excel (.xlsx) download and
            in-table live editing.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('uploader-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              <span>Upload Statements Below</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Try with Demo Dataset</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle background accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none hidden md:block"></div>
      </div>

      {/* Main Upload / Input Card */}
      <div id="uploader-card" className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Card Header with Mode Tabs */}
        <div className="border-b border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/60">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Input Sources</span>
            </h3>
            <p className="text-xs text-stone-500">Provide statement screenshots, text notes, or combine both</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'both' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All-In-One (Images + Notes)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'images' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Screenshots Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('writeup')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'writeup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Finance Writeup Only
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction Notice</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left/Main Column: Image Upload Drag and Drop */}
            {(activeTab === 'both' || activeTab === 'images') && (
              <div className={activeTab === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Statement Screenshots ({files.length})</span>
                  </label>
                  <span className="text-[11px] text-stone-500">Supports PNG, JPG, WEBP or Paste (Ctrl+V)</span>
                </div>

                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                      : 'border-stone-300 hover:border-emerald-500 hover:bg-stone-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => e.target.files && handleFileObjects(Array.from(e.target.files))}
                    className="hidden"
                  />
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800 mb-1">
                    Drag and drop statement screenshots here
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mb-3">
                    Upload phone screenshots from Chase, Bank of America, Monzo, Revolut, PayPal, Apple Wallet, or paper
                    statement photos.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Browse Files
                  </span>
                </div>

                {/* Uploaded File Previews */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-stone-600">Selected Screenshots:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-lg group hover:border-stone-300 transition-colors"
                        >
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-9 h-9 object-cover rounded shrink-0 border border-stone-200"
                            />
                          ) : (
                            <FileImage className="w-6 h-6 text-stone-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-stone-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-stone-500">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.id);
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 rounded transition-colors"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Column: Finance Writeup Textarea */}
            {(activeTab === 'both' || activeTab === 'writeup') && (
              <div className={activeTab === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Finance Writeup / Notes</span>
                  </label>
                  <span className="text-[11px] text-stone-500">Unstructured text or ledger</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={activeTab === 'both' ? 7 : 8}
                    value={writeupText}
                    onChange={(e) => setWriteupText(e.target.value)}
                    placeholder="e.g. Paid $1450 for rent on Aug 1. Received salary $3850 on Aug 15. Grocery at Whole Foods $138.45. Electric bill $94.20..."
                    className="w-full text-xs sm:text-sm font-mono text-stone-800 bg-stone-50/50 border border-stone-300 rounded-xl p-3 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                  />
                  {writeupText && (
                    <button
                      type="button"
                      onClick={() => setWriteupText('')}
                      className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-md text-xs"
                      title="Clear text"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Preset Buttons */}
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Insert Sample Writeup:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_WRITEUP_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWriteupText(preset.text)}
                        className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200 transition-colors"
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Row (Currency & Default Account Tag) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Currency Symbol</label>
              <div className="flex items-center gap-1.5">
                {['$', '€', '£', '₹', '¥', 'C$'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrency(sym)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      currency === sym
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Custom"
                  maxLength={5}
                  className="w-16 px-2 py-1 text-xs text-stone-800 bg-white border border-stone-200 rounded-lg text-center font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Default Account Label</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Chase Checking, Cash Ledger"
                className="w-full px-3 py-1.5 text-xs text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end justify-end">
              <button
                id="convert-excel-submit-btn"
                type="submit"
                disabled={isProcessing || (files.length === 0 && !writeupText.trim())}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Organizing into Excel...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generate Excel Sheet</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Indicator / Steps */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Processing Your Financial Documents</p>
                  <p className="text-xs text-emerald-700">{processingStep || 'Analyzing statement data...'}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Feature Guide Info Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs text-stone-600">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Automatic Categorization</span>
            <span>Intelligently sorts income, outgoings, rents, bills, groceries, and transfers.</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
          <DollarSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Live Cell Editing</span>
            <span>Change amounts, categories, or dates directly inside the table before exporting.</span>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Multi-Tab Excel (.xlsx)</span>
            <span>Export formatted sheets for All Transactions, Income, Outgoings, &amp; Summaries.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
