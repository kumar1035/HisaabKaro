# HisaabKaro — AI Billing Agent for Bharat's Small Businesses

HisaabKaro is a bilingual, AI-assisted GST billing workspace for Indian kirana stores, retailers, and MSMEs. A business owner describes a sale in Hindi, English, or Hinglish; HisaabKaro extracts items, quantity, price, HSN and GST rate, runs compliance checks, and creates a shareable GST invoice.

It is built for the hackathon theme **AI Agents for Bharat's Businesses**: practical automation for retail and MSME back offices, where business owners commonly rely on paper, WhatsApp, calculators, and manual GST work.

## The problem

Creating a correct GST invoice is repetitive and error-prone. The seller must enter products, quantities, rates, HSN codes, GST slabs, customer information, payment details, and tax mode. This is especially difficult for owners who are more comfortable using Hindi or Hinglish than complex accounting software.

## What we built

HisaabKaro acts as an AI billing and compliance assistant:

- Natural-language sale entry in Hindi, English, and Hinglish.
- OpenAI structured parsing when configured, with a deterministic offline fallback for common kirana products.
- Editable extracted items: description, HSN, quantity, unit, rate, and GST rate.
- GST compliance review before saving: GSTIN, HSN, GST slab, arithmetic, dates, and CGST/SGST vs IGST checks.
- B2B customer records and B2C/walk-in sale support.
- Private Google-authenticated accounts, with data scoped to the signed-in owner.
- Business settings for GSTIN, address, bank account, IFSC, logo and UPI ID.
- Branded GST PDF download, UPI payment QR on the invoice screen, and WhatsApp invoice/payment reminders.
- Invoice history, payment statuses, analytics, product sales summaries, and GSTR-1-oriented CSV export.
- Audit entries for invoice creation, payment-status updates, and void actions.

## Theme fit: AI Agents for Bharat's Businesses

| Theme expectation | HisaabKaro response |
| --- | --- |
| Retail and MSME automation | Converts a daily sale into a usable invoice and payment workflow. |
| WhatsApp invoicing | Shares invoice and payment-reminder messages through WhatsApp. |
| GST reminder agent | Compliance review, tax-mode checks, pending-payment reminders, and GSTR-1 export. |
| Bilingual support | Hindi/Hinglish sale input and an English/Hindi dashboard navigation mode. |
| MSME back office in a box | Customers, billing, GST, payments, analytics and business profile in one place. |

## Technology

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon compatible)
- NextAuth Google OAuth
- Zod request validation
- OpenAI Responses API with local parser fallback
- `@react-pdf/renderer`, `qrcode.react`, and Recharts

## Architecture

```text
Sale in Hindi / English / Hinglish
              |
              v
      Parse agent + offline fallback
              |
              v
 Editable line items and saved customer selection
              |
              v
 Compliance-review agent (GST + state tax mode)
              |
              v
 Prisma / PostgreSQL per-user invoice records
              |
              +--> PDF + UPI + WhatsApp reminder
              +--> Analytics + GSTR-1 CSV
```

## Quick start

1. Install dependencies.

   ```powershell
   npm.cmd install
   ```

2. Copy `.env.example` to `.env.local` and set the required environment variables.

3. Synchronize the database and generate Prisma Client.

   ```powershell
   npx.cmd prisma db push
   npx.cmd prisma generate
   ```

4. Start the app.

   ```powershell
   npm.cmd run dev
   ```

Open `http://localhost:3000`, sign in with Google, and open the dashboard.

## Environment variables

```env
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
OPENAI_API_KEY=                 # optional; enables AI parsing
OPENAI_PARSER_MODEL=gpt-4.1-mini # optional
```

Without `OPENAI_API_KEY`, supported kirana phrases still work through the offline parser.

## Demo script for judges

See [walkthrough/README.md](walkthrough/README.md) for the full 3-minute walkthrough. The short version:

1. Sign in and add business GSTIN/state/UPI details.
2. Add a GST customer, or create a walk-in/B2C sale.
3. Enter: `Sharma ji ko 10kg aata 45/kg aur 5 sabun 35 mein becha`.
4. Parse the sale; show auto-filled quantity, rate, HSN and GST.
5. Review compliance, correct any warning, and generate the invoice.
6. Show the PDF, UPI QR, WhatsApp reminder, analytics, and GSTR-1 export.

## Verification

```powershell
npx.cmd tsc --noEmit
```

## Important project files

| File | Purpose |
| --- | --- |
| `src/app/dashboard/page.tsx` | Billing dashboard and shopkeeper workflow |
| `src/lib/parser.ts` | AI/offline sale parsing fallback |
| `src/agents/compliance-reviewer.ts` | GST compliance and state-tax logic |
| `src/app/api/invoices` | Authenticated invoice persistence and status management |
| `src/app/api/customers` | Per-user customer management |
| `src/app/api/analytics` | GST and product analytics |
| `src/app/api/gst-export` | GSTR-1-ready CSV export |
| `prisma/schema.prisma` | User, invoice, customer, line-item and audit models |

## Production notes

HisaabKaro does not process card payments itself. It produces UPI payment links/QR codes and WhatsApp reminders. A live payment gateway such as Razorpay, Cashfree, PhonePe, or a bank UPI reconciliation webhook can be added when merchant credentials are available.

Never commit `.env` or `.env.local`.
