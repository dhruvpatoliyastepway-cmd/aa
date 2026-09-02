import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();

  // Support up to 50MB for batch bank statement screenshot uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Gemini Bank Statement & Finance Extraction Endpoint
  app.post('/api/extract-statement', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please add it to your environment variables or Secrets panel.',
        });
      }

      const { images = [], writeup = '', preferredCurrency = '$', defaultAccount = '' } = req.body;

      if ((!images || images.length === 0) && (!writeup || !writeup.trim())) {
        return res.status(400).json({
          error: 'Please provide at least one bank statement screenshot or finance writeup.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Prepare contents array for multimodal Gemini call
      const contentParts: any[] = [];

      // Add all image parts
      for (const img of images) {
        if (img.data && img.mimeType) {
          // Remove potential data URI prefix if passed
          const cleanBase64 = img.data.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
          contentParts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: cleanBase64,
            },
          });
        }
      }

      // Add textual guidance and writeup
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

3. **High Fidelity**:
   - If numbers have commas, parse correctly (e.g. "1,250.00" -> 1250.00).
   - If both pending and cleared items exist, include all with appropriate status.
   - Include brief executive insights summarizing key findings (e.g., highest expense category, recurring subscriptions found, total savings).
`;

      contentParts.push({ text: textInstruction });

      // Call Gemini 3.7 Flash with structured JSON schema
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: contentParts,
        config: {
          systemInstruction:
            'You are a high-precision financial document parser and bookkeeping specialist. You extract structured financial ledger records from images and text.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedBankOrSource: {
                type: Type.STRING,
                description: 'Name of the primary bank, institution, or statement source detected.',
              },
              currency: {
                type: Type.STRING,
                description: 'The primary currency symbol or code (e.g. $, €, £, ₹).',
              },
              statementPeriod: {
                type: Type.OBJECT,
                properties: {
                  startDate: { type: Type.STRING, description: 'Earliest transaction date YYYY-MM-DD' },
                  endDate: { type: Type.STRING, description: 'Latest transaction date YYYY-MM-DD' },
                },
              },
              transactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Unique identifier for the transaction' },
                    date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
                    description: { type: Type.STRING, description: 'Clean merchant, payee, or description' },
                    type: {
                      type: Type.STRING,
                      description: "Must be 'income', 'expense', 'transfer', or 'investment'",
                    },
                    category: { type: Type.STRING, description: 'Standardized spending/income category' },
                    amount: { type: Type.NUMBER, description: 'Positive transaction amount' },
                    currency: { type: Type.STRING, description: 'Currency symbol e.g. $' },
                    account: { type: Type.STRING, description: 'Bank or account name' },
                    status: {
                      type: Type.STRING,
                      description: "Must be 'completed', 'pending', or 'flagged'",
                    },
                    sourceFile: { type: Type.STRING, description: 'Name of the source screenshot or writeup' },
                    notes: { type: Type.STRING, description: 'Optional transaction notes or details' },
                  },
                  required: ['id', 'date', 'description', 'type', 'category', 'amount', 'currency'],
                },
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 5 financial insights or observations (e.g., top spending categories, net cashflow).',
              },
            },
            required: ['detectedBankOrSource', 'currency', 'transactions', 'insights'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      // Ensure every transaction has a unique ID and fallback values
      if (Array.isArray(parsedData.transactions)) {
        parsedData.transactions = parsedData.transactions.map((tx: any, index: number) => ({
          id: tx.id || `tx-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
          date: tx.date || new Date().toISOString().split('T')[0],
          description: tx.description || 'Unlabeled Transaction',
          type: ['income', 'expense', 'transfer', 'investment'].includes(tx.type?.toLowerCase())
            ? tx.type.toLowerCase()
            : 'expense',
          category: tx.category || 'General Expense',
          amount: typeof tx.amount === 'number' && !isNaN(tx.amount) ? Math.abs(tx.amount) : 0,
          currency: tx.currency || parsedData.currency || preferredCurrency || '$',
          account: tx.account || defaultAccount || parsedData.detectedBankOrSource || 'Main Account',
          status: ['completed', 'pending', 'flagged'].includes(tx.status?.toLowerCase())
            ? tx.status.toLowerCase()
            : 'completed',
          sourceFile: tx.sourceFile || (images[0]?.name ? images[0].name : 'Uploaded Source'),
          notes: tx.notes || '',
        }));
      } else {
        parsedData.transactions = [];
      }

      // Calculate executive summary stats
      let totalIncome = 0;
      let totalExpense = 0;
      let totalTransfer = 0;

      for (const tx of parsedData.transactions) {
        if (tx.type === 'income') totalIncome += tx.amount;
        else if (tx.type === 'expense') totalExpense += tx.amount;
        else if (tx.type === 'transfer') totalTransfer += tx.amount;
      }

      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

      parsedData.summary = {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        totalTransfer: Number(totalTransfer.toFixed(2)),
        netSavings: Number(netSavings.toFixed(2)),
        savingsRate,
      };

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Extraction Error:', err);
      res.status(500).json({
        error: err.message || 'Failed to process financial documents. Please verify your input and try again.',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
