<p align="center">
  <img src="https://img.shields.io/badge/Built_for-Bharat's_Businesses-1B4332?style=for-the-badge" alt="Built for Bharat" />
  <img src="https://img.shields.io/badge/OpenAI-Hackathon_2026-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI Hackathon" />
  <img src="https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<h1 align="center">₹ HisaabKaro</h1>
<p align="center"><strong>AI Billing & GST Compliance Agent for Bharat's Small Businesses</strong></p>
<p align="center">
  <a href="https://hisaab-karo.vercel.app">Live Demo</a> · <a href="https://github.com/kumar1035/HisaabKaro">Source Code</a>
</p>

---

## Overview

HisaabKaro is a bilingual, AI-powered GST billing workspace designed for Indian kirana stores, retailers, and MSMEs. A shopkeeper describes a sale in **Hindi, English, or Hinglish** — and HisaabKaro's AI agent extracts line items, quantities, prices, HSN codes, and GST rates, runs compliance checks, and generates a shareable GST-compliant invoice — all in seconds.

> **"Sharma ji ko 10kg aata 45/kg aur 5 sabun 35 mein becha"**
> → Parsed → GST classified → Invoice ready → ₹3,402

Built for the **OpenAI Hackathon** theme: *AI Agents for Bharat's Businesses*.

## The Problem

Millions of small businesses in India still rely on paper registers, WhatsApp messages, and manual calculators for billing. Creating a correct GST invoice requires entering products, quantities, rates, HSN codes, GST slabs, customer GSTIN, payment details, and determining the correct tax mode (CGST+SGST vs. IGST). This process is slow, error-prone, and especially challenging for business owners who are more comfortable in Hindi or Hinglish than in complex accounting software.

## Our Solution

HisaabKaro reimagines invoicing as a conversation. Instead of filling forms, the shopkeeper simply **describes the sale naturally**, and AI handles the rest.

### Core Capabilities

- **Natural-Language Invoice Creation** — Describe a sale in Hindi, English, or Hinglish. The AI agent parses items, quantities, rates, HSN codes, and GST slabs automatically.
- **OpenAI-Powered Parsing + Offline Fallback** — Uses OpenAI's structured output API for intelligent extraction; falls back to a deterministic local parser for common kirana products when offline or unconfigured.
- **GST Compliance Agent** — Validates GSTIN format, HSN code length, GST slab correctness, arithmetic accuracy, invoice dates, and auto-selects CGST+SGST or IGST based on buyer/seller state.
- **Editable Extracted Data** — Every parsed field (description, HSN, quantity, unit, rate, GST%) is editable before invoice generation, keeping the shopkeeper in control.
- **B2B & B2C Support** — Manage saved GST customers for B2B sales or create walk-in/B2C invoices instantly.
- **Branded GST Invoice PDF** — Download a professional invoice with business logo, GSTIN, itemized tax breakup, and bank details.
- **UPI Payment Integration** — Auto-generates UPI QR codes and payment links on the invoice for instant collection.
- **WhatsApp Reminders** — Share invoices and send respectful payment reminders directly via WhatsApp.
- **Analytics Dashboard** — Track revenue, taxable amounts, CGST/SGST/IGST breakdowns, product-wise sales, and invoice counts at a glance.
- **GSTR-1 CSV Export** — Export invoice data in a GSTR-1-ready format for simplified tax filing.
- **Bilingual Dashboard** — Full Hindi/English toggle across the dashboard for accessibility.
- **Inventory Alerts** — Low-stock warnings with reorder prompts.
- **Secure & Private** — Google OAuth authentication with per-user data isolation. Every invoice, customer, and setting is scoped to the signed-in business owner.
- **Audit Trail** — Logged entries for invoice creation, payment-status updates, and void actions.

## Theme Fit: AI Agents for Bharat's Businesses

| Theme Expectation | HisaabKaro's Response |
|---|---|
| Retail & MSME Automation | Converts a spoken/typed sale into a complete invoice and payment workflow |
| WhatsApp Invoicing | Shares invoices and payment reminders via WhatsApp |
| GST Compliance Agent | Automated tax validation, state-based tax mode, and GSTR-1 export |
| Bilingual Support | Hindi/Hinglish natural-language input with full Hindi dashboard UI |
| MSME Back Office in a Box | Customers, billing, GST, payments, analytics, and business profile — unified |

## Architecture

```
┌──────────────────────────────────────────────┐
│        Shopkeeper Input (Hindi / Hinglish)    │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│   AI Parse Agent (OpenAI) + Offline Fallback │
│   → Items, Qty, Rate, HSN, GST%             │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│   Editable Line Items + Customer Selection   │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│   GST Compliance Review Agent                │
│   → GSTIN, HSN, Slab, Tax Mode Validation   │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│   Prisma + PostgreSQL (Per-User Records)     │
└───┬──────────┬───────────┬───────────────────┘
    ▼          ▼           ▼
  PDF +     Analytics   GSTR-1
  UPI QR +  Dashboard   CSV Export
  WhatsApp
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma ORM + PostgreSQL (Neon-compatible) |
| Authentication | NextAuth.js with Google OAuth |
| AI Engine | OpenAI Responses API (with local parser fallback) |
| Validation | Zod schema validation |
| PDF Generation | `@react-pdf/renderer` |
| Charts | Recharts |
| QR Codes | `qrcode.react` |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a Neon serverless instance)
- Google OAuth credentials
- OpenAI API key (optional — enables AI parsing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kumar1035/HisaabKaro.git
cd HisaabKaro

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up the database
npx prisma db push
npx prisma generate

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and start billing.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Yes | NextAuth session encryption key |
| `OPENAI_API_KEY` | No | Enables AI-powered sale parsing |
| `OPENAI_PARSER_MODEL` | No | Model override (default: `gpt-4.1-mini`) |

> Without an OpenAI key, common kirana sale phrases are still parsed via the built-in deterministic fallback.

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx          # Main billing dashboard
│   ├── api/
│   │   ├── invoices/               # Invoice CRUD & status management
│   │   ├── customers/              # Per-user customer management
│   │   ├── analytics/              # Revenue & GST analytics
│   │   └── gst-export/             # GSTR-1 CSV export
├── agents/
│   └── compliance-reviewer.ts      # GST compliance & tax-mode logic
├── lib/
│   └── parser.ts                   # AI + offline sale parsing
prisma/
└── schema.prisma                   # Data models (User, Invoice, Customer, LineItem, Audit)
```

## Demo Walkthrough

1. **Sign in** with Google and configure business profile (GSTIN, state, UPI ID)
2. **Add a customer** with GSTIN for B2B, or choose walk-in for B2C
3. **Describe the sale**: *"Sharma ji ko 10kg aata 45/kg aur 5 sabun 35 mein becha"*
4. **Review parsed data** — auto-filled items, quantities, HSN codes, and GST rates
5. **Run compliance check** — the agent validates GST rules and flags issues
6. **Generate invoice** — download PDF, scan UPI QR, send via WhatsApp
7. **View analytics** — revenue, tax breakdowns, product sales, and GSTR-1 export

## Live Demo

🔗 **[hisaab-karo.vercel.app](https://hisaab-karo.vercel.app)**

## Future Roadmap

- Payment gateway integration (Razorpay / Cashfree / PhonePe) with webhook reconciliation
- Browser speech recognition for hands-free voice billing
- OCR for supplier bill digitization
- Inventory and reorder AI agents
- Expanded Hindi translations across all dashboard forms and error states
- Automated test coverage (unit, API, and E2E)

## License

This project was built for the OpenAI Hackathon 2026.

---

<p align="center"><strong>HisaabKaro</strong> — अपना हिसाब, अपनी भाषा में</p>
