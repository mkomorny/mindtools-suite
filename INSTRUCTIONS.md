# MindTools Suite - Setup & Usage Guide

## Prerequisites
- **Node.js**: Version 20.0.0 or higher
- **API Keys**: At least one model provider key (Google Gemini, Anthropic Claude, or OpenAI)

---

## 1. Installation

```bash
npm install
```

---

## 2. API Key Configuration

Create your `.env` configuration file:
```bash
cp .env.example .env
```

Open `.env` and supply keys for the providers you want to use:
```env
GEMINI_API_KEY="your-gemini-key"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENAI_API_KEY="your-openai-key"
PORT=3000
```
*(You can also configure API keys directly inside the application UI settings.)*

---

## 3. Running the Suite

### Web Application Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Native Desktop Mode
```bash
npm run dev
# in a separate terminal:
npx electron .
```

---

## 4. Packaging the Desktop App
```bash
npm run package
```
