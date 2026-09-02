export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';
export type TransactionStatus = 'completed' | 'pending' | 'flagged';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  account: string;
  status: TransactionStatus;
  sourceFile?: string;
  notes?: string;
}

export interface CategorySummary {
  category: string;
  type: TransactionType;
  amount: number;
  count: number;
  percentage: number;
}

export interface AccountSummary {
  account: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface ExtractionResult {
  detectedBankOrSource: string;
  currency: string;
  statementPeriod?: {
    startDate?: string;
    endDate?: string;
  };
  transactions: Transaction[];
  insights: string[];
  summary?: {
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    netSavings: number;
    savingsRate: number;
  };
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  base64Data?: string;
}
