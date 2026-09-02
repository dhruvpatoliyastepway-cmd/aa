import { ExtractionResult, Transaction } from '../types';

export const SAMPLE_PRESET_TRANSACTIONS: Transaction[] = [
  {
    id: 'sample-tx-1',
    date: '2026-08-01',
    description: 'Acme Corp Monthly Salary Deposit',
    type: 'income',
    category: 'Salary & Wages',
    amount: 3850.0,
    currency: '$',
    account: 'Chase Premier Checking *4921',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Direct deposit payroll batch #8912',
  },
  {
    id: 'sample-tx-2',
    date: '2026-08-01',
    description: 'Skyline Heights Property Rent',
    type: 'expense',
    category: 'Housing & Rent',
    amount: 1450.0,
    currency: '$',
    account: 'Chase Premier Checking *4921',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Monthly apartment lease payment',
  },
  {
    id: 'sample-tx-3',
    date: '2026-08-03',
    description: 'Whole Foods Organic Groceries',
    type: 'expense',
    category: 'Groceries & Food',
    amount: 138.45,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Weekly household grocery run',
  },
  {
    id: 'sample-tx-4',
    date: '2026-08-05',
    description: 'Freelance Web Design Milestone #2',
    type: 'income',
    category: 'Freelance & Consulting',
    amount: 920.0,
    currency: '$',
    account: 'PayPal / Checking',
    status: 'completed',
    sourceFile: 'Finance_Writeup_Aug.txt',
    notes: 'Client invoice #INV-2026-44',
  },
  {
    id: 'sample-tx-5',
    date: '2026-08-08',
    description: 'City Power & Electric Utility',
    type: 'expense',
    category: 'Utilities & Bills',
    amount: 94.2,
    currency: '$',
    account: 'Chase Premier Checking *4921',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Electricity and water utility bill',
  },
  {
    id: 'sample-tx-6',
    date: '2026-08-11',
    description: 'Trader Joe’s Market',
    type: 'expense',
    category: 'Groceries & Food',
    amount: 76.8,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Pantry restocking',
  },
  {
    id: 'sample-tx-7',
    date: '2026-08-14',
    description: 'Transfer to High Yield Savings',
    type: 'transfer',
    category: 'Savings Deposit',
    amount: 500.0,
    currency: '$',
    account: 'Ally High Yield Savings',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Automatic monthly emergency fund allocation',
  },
  {
    id: 'sample-tx-8',
    date: '2026-08-15',
    description: 'Acme Corp Bi-Weekly Salary Deposit',
    type: 'income',
    category: 'Salary & Wages',
    amount: 3850.0,
    currency: '$',
    account: 'Chase Premier Checking *4921',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Direct deposit payroll batch #8945',
  },
  {
    id: 'sample-tx-9',
    date: '2026-08-17',
    description: 'The Olive Branch Trattoria Dinner',
    type: 'expense',
    category: 'Dining & Takeout',
    amount: 88.5,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Team dinner with colleagues',
  },
  {
    id: 'sample-tx-10',
    date: '2026-08-20',
    description: 'Metro Transit Card Refill',
    type: 'expense',
    category: 'Transportation & Gas',
    amount: 45.0,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Monthly subway commuter pass',
  },
  {
    id: 'sample-tx-11',
    date: '2026-08-22',
    description: 'Vanguard Total Stock Index Fund (VTI)',
    type: 'investment',
    category: 'Stocks & ETF',
    amount: 600.0,
    currency: '$',
    account: 'Vanguard Brokerage',
    status: 'completed',
    sourceFile: 'Finance_Writeup_Aug.txt',
    notes: 'Monthly DCA index fund investment',
  },
  {
    id: 'sample-tx-12',
    date: '2026-08-25',
    description: 'Spotify Family & Netflix Subscription',
    type: 'expense',
    category: 'Subscriptions & Software',
    amount: 32.98,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Recurring digital subscriptions',
  },
  {
    id: 'sample-tx-13',
    date: '2026-08-27',
    description: 'Amazon Store Electronics & Books',
    type: 'expense',
    category: 'Shopping & Retail',
    amount: 114.3,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'USB-C hub and engineering handbook',
  },
  {
    id: 'sample-tx-14',
    date: '2026-08-29',
    description: 'Tax Refund / IRS Credit Deposit',
    type: 'income',
    category: 'Refunds & Reimbursements',
    amount: 240.0,
    currency: '$',
    account: 'Chase Premier Checking *4921',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'State tax return adjustment',
  },
  {
    id: 'sample-tx-15',
    date: '2026-08-30',
    description: 'Chevron Fuel & Car Wash',
    type: 'expense',
    category: 'Transportation & Gas',
    amount: 52.6,
    currency: '$',
    account: 'Chase Sapphire Card *1104',
    status: 'completed',
    sourceFile: 'Chase_Statement_Aug2026.png',
    notes: 'Full tank refuel',
  },
];

export const SAMPLE_EXTRACTION_RESULT: ExtractionResult = {
  detectedBankOrSource: 'Chase Premier Banking & Combined Statements',
  currency: '$',
  statementPeriod: {
    startDate: '2026-08-01',
    endDate: '2026-08-30',
  },
  transactions: SAMPLE_PRESET_TRANSACTIONS,
  insights: [
    'Strong positive net cashflow of +$6,797.17 for the month of August.',
    'Housing & Rent is the single largest expense ($1,450.00), accounting for ~70% of outgoings.',
    'Solid savings & investment discipline: $1,100.00 allocated across high-yield savings and index funds.',
    'Recurring subscription overhead is lean at $32.98/mo.',
  ],
  summary: {
    totalIncome: 8860.0,
    totalExpense: 2062.83,
    totalTransfer: 500.0,
    netSavings: 6797.17,
    savingsRate: 77,
  },
};

export const SAMPLE_WRITEUP_PRESETS = [
  {
    title: 'August Household Finances',
    text: `Rent: $1,450 paid to landlord on Aug 1st.
Salary deposit: $3,850 received from Acme Corp on Aug 1 and Aug 15.
Groceries at Whole Foods: $138.45 on Aug 3.
Electric bill: $94.20 on Aug 8.
Freelance payment received: $920 from client for web design on Aug 5.
Dinner out: $88.50 on Aug 17.
Transit pass: $45 on Aug 20.
Transferred to savings: $500 on Aug 14.
Invested in Vanguard: $600 on Aug 22.
Netflix + Spotify: $32.98 on Aug 25.
Amazon order: $114.30 on Aug 27.
Chevron gas: $52.60 on Aug 30.`,
  },
  {
    title: 'Freelance & Business Log',
    text: `Aug 2: Received $2,500 consulting retainer from Horizon Labs
Aug 4: Paid Figma Team subscription $45.00
Aug 7: Client lunch at Bistro 9 $64.20
Aug 12: Received $1,800 UI/UX delivery fee from Stellar App
Aug 15: Google Cloud hosting bill $78.40
Aug 19: Purchased ergonomic office chair $289.00
Aug 23: Received $650 website maintenance fee
Aug 28: Domain renewals (Namecheap) $34.50`,
  },
  {
    title: 'Trip / Vacation Expense Ledger',
    text: `Flight tickets booked via Delta: $420.00
Hotel reservation 3 nights: $360.00
Airbnb deposit refund received: $150.00
Luggage fee: $35.00
Airport taxi: $48.50
Museum admissions: $32.00
Seafood dinner: $112.40
Souvenirs & gifts: $65.00`,
  },
];

export const STANDARD_CATEGORIES = [
  'Salary & Wages',
  'Freelance & Consulting',
  'Business Income',
  'Investment Return',
  'Refunds & Reimbursements',
  'Gifts & Grants',
  'Housing & Rent',
  'Groceries & Food',
  'Dining & Takeout',
  'Utilities & Bills',
  'Subscriptions & Software',
  'Transportation & Gas',
  'Healthcare & Medical',
  'Shopping & Retail',
  'Entertainment & Leisure',
  'Travel & Vacation',
  'Insurance',
  'Education',
  'Bank Fees & Interest',
  'Savings Deposit',
  'Internal Account Transfer',
  'Credit Card Payment',
  'Stocks & ETF',
  'Crypto',
  'General Expense',
  'Other Income',
];
