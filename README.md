# Bank Statement to Excel Converter

An AI-powered application that parses bank statement screenshots, invoices, mobile banking transaction records, and financial writeups directly into organized, interactive spreadsheets with multi-sheet Excel (.xlsx), CSV, and TSV export.

---

## 🚀 Live on GitHub Pages

This repository includes a turnkey automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that compiles the static web app and publishes it straight to **GitHub Pages**.

### Setting Up GitHub Pages

1. Go to your repository on **GitHub**.
2. Navigate to **Settings** > **Pages** (in the left sidebar under *Code and automation*).
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Push a commit or trigger the **Deploy to GitHub Pages** action under the **Actions** tab.
5. Your live site will be accessible at: `https://<your-username>.github.io/<repo-name>/`

---

## 🔑 Using with Google Gemini API on GitHub Pages

Since GitHub Pages serves static files directly in the user's browser without a Node backend:

1. Click the **API Key** button in the top right header of the app.
2. Paste your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Your key is stored securely in your browser's `localStorage` and used directly by the client SDK.

*(Optional)* You can also add a secret `VITE_GEMINI_API_KEY` in your GitHub Repo's **Settings > Secrets and variables > Actions** to pre-bake a key into the build.

---

## 🛠 Local Development & Server Mode

To run locally with the full-stack Express server:

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key to .env
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production container
npm run build
npm start
```

---

## 📦 Features

- **Multimodal AI Extraction**: Extracts dates, payee descriptions, categories, debit/credit types, accounts, and notes from image screenshots or plain text writeups.
- **In-Table Spreadsheet Editing**: Real-time cell editing, bulk row deletion, duplication, and sorting.
- **Financial Audit & Insights**: Automatic detection of statement dates, spending trends, and breakdown charts.
- **Rich Spreadsheet Export**: Formatted multi-tab Excel workbooks (`.xlsx`), standard `.csv`, and clipboard TSV for pasting into Google Sheets.
