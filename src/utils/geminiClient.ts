import { GoogleGenAI } from '@google/genai';

const CLIENT_STORAGE_KEY = 'statement_converter_gemini_api_key';

export function getClientStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CLIENT_STORAGE_KEY) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function setClientStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(CLIENT_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
  }
}

export async function extractStatementWithClientSdk(
  images: { name: string; mimeType: string; data: string }[],
  writeup: string,
  preferredCurrency: string = '$',
  defaultAccount: string = '',
  customApiKey?: string
) {
  const apiKey = customApiKey || getClientStoredApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_REQUIRED');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  // Prepare multimodal content parts
  const contentParts: any[] = [];

  for (const img of images) {
    if (img.data && img.mimeType) {
      const cleanBase64 = img.data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      contentParts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: cleanBase64,
        },
      });
    }
  }

  const textInstruction = `
You are an expert financial auditor and data extraction AI.
Your task is to analyze the provided bank statement screenshots, receipt images, account ledgers, and/or handwritten/typed financial writeups and extract every single transaction with 100% precision.

USER WRITEUP / NOTES (if any):
"""
${writeup || 'None provided'}
"""

USER PREFERENCES:
- Default Currency: ${preferredCurrency || 'Detect from images or default to $'}
- Default Account Name: ${defaultAccount || 'Detect bank name or use Main Account'}

EXTRACTION GUIDELINES:
1. **Transaction Identification**:
   - Extract every line item / transaction. Look for Date, Description/Payee, Reference/Code, Amount, Transaction Type (Credit/Debit/Deposit/Withdrawal).
   - Carefully discern between Money In (Income/Deposits/Refunds/Credits) and Money Out (Expenses/Withdrawals/Debits/Purchases/Fees).
   - If a transfer is between accounts or paying off a credit card, classify as 'transfer'.
   - If stock/crypto/investment contribution, classify as 'investment'.

2. **Standardization**:
   - **Date**: Format strictly as YYYY-MM-DD. If year is missing in the document, use 2026 or the current statement year.
   - **Type**: Must be exactly one of: 'income', 'expense', 'transfer', 'investment'.
   - **Category**: Classify into sensible, standard financial categories:
     - For Income: "Salary & Wages", "Freelance & Consulting", "Business Income", "Investment Return", "Refunds & Reimbursements", "Gifts & Grants", "Other Income".
     - For Expenses: "Housing & Rent", "Groceries & Food", "Dining & Takeout", "Utilities & Bills", "Subscriptions & Software", "Transportation & Gas", "Healthcare & Medical", "Shopping & Retail", "Entertainment & Leisure", "Travel & Vacation", "Insurance", "Education", "Bank Fees & Interest", "General Expense".
     - For Transfer: "Credit Card Payment", "Internal Account Transfer", "Savings Deposit", "P2P Payment".
   - **Amount**: Must be a positive numeric value (e.g. 45.99, not -45.99).
   - **Currency**: Single symbol or 3-letter code (e.g. "$", "€", "£", "₹", "USD", etc.).
   - **Account**: Name of the bank or account (e.g., "Chase Checking", "Revolut", "Amex Card", "Cash / Writeup").
   - **Status**: 'completed' or 'pending' or 'flagged'.
   - **Notes**: Extra context, reference ID, merchant location, or memo.
   - **SourceFile**: Name of the image or "Writeup" where this transaction was found.

3. **High-Level Observations & Insights**:
   - Detect statement bank/organization if visible.
   - Detect statement period (start and end date).
   - Compute total income, total expense, and net total.
   - Provide 2 to 4 concise auditor bullet observations (e.g. "Highest spending category was Dining", "Recurring subscription detected: Netflix", etc.).

Return strictly valid JSON matching this schema:
{
  "detectedBankOrSource": "string or null",
  "statementPeriod": { "startDate": "YYYY-MM-DD or null", "endDate": "YYYY-MM-DD or null" },
  "summary": { "totalIncome": number, "totalExpense": number, "netCashflow": number, "currency": "string" },
  "insights": ["string"],
  "transactions": [
    {
      "id": "tx-1",
      "date": "YYYY-MM-DD",
      "description": "string",
      "type": "income" | "expense" | "transfer" | "investment",
      "category": "string",
      "amount": number,
      "currency": "string",
      "account": "string",
      "status": "completed" | "pending" | "flagged",
      "sourceFile": "string",
      "notes": "string"
    }
  ]
}
`;

  contentParts.push({ text: textInstruction });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contentParts,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error('No extraction response received from Gemini.');
  }

  const cleanJson = rawText.replace(/```json\s*|\s*```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  // Normalize IDs if missing
  if (Array.isArray(parsed.transactions)) {
    parsed.transactions = parsed.transactions.map((t: any, idx: number) => ({
      ...t,
      id: t.id || `tx-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      amount: Math.abs(typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0),
      currency: t.currency || preferredCurrency || '$',
      account: t.account || defaultAccount || 'Main Account',
      type: ['income', 'expense', 'transfer', 'investment'].includes(t.type) ? t.type : 'expense',
      status: ['completed', 'pending', 'flagged'].includes(t.status) ? t.status : 'completed',
    }));
  }

  return parsed;
}
