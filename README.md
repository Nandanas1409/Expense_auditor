# Expense Auditor System

An AI-powered corporate expense auditing platform that combines LLM extraction with a deterministic policy engine for compliance decisions.

## Overview

This system provides role-based access with two distinct interfaces:

- **Login Page** (`/`): Sign in as employee or finance auditor
- **Employee Portal** (`/employee`): Submit expense claims with receipt uploads
- **Finance Auditor Dashboard** (`/auditor`): Review and manage expense claims

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Groq API with Llama vision models
- **Database**: SQLite with Prisma ORM
- **OCR**: PDF parsing and base64 image processing

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   # Create .env.local file
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access interfaces**
   - Login: [http://localhost:3000](http://localhost:3000)
   - Employee Portal: [http://localhost:3000/employee](http://localhost:3000/employee)
   - Finance Dashboard: [http://localhost:3000/auditor](http://localhost:3000/auditor)

## Default Login Credentials

- Employee: `employee` / `employee123`
- Finance Auditor: `auditor` / `auditor123`

## How It Works

### Audit Pipeline
1. **Receipt + Narrative Ingestion**: Employee submits receipt plus business purpose, claimed date, category, location, and seniority.
2. **OCR Extraction**: Vision model extracts merchant, amount, date, currency, readability, and line items.
3. **Policy Retrieval**: Policy snippet is selected from the policy PDF using category keywords.
4. **Deterministic Evaluation**: Rule engine evaluates externalized policy rules from `src/data/policy-rules.json`.
5. **Decision Rendering**: Categorizes as `APPROVED`, `FLAGGED`, or `REJECTED` with policy-rule trace.
6. **Human-in-the-Loop Override**: Auditor can override status with required comment.

### Key Features
- Multi-format receipt support (JPG, PNG, PDF)
- Deterministic, policy-first decision engine
- Risk-based claim sorting (`REJECTED` and `FLAGGED` on top)
- Detailed audit trails with extracted data
- Auditor override workflow with comments
- Professional UI with mobile responsiveness

## Project Structure

```
web/
├── src/app/
│   ├── api/audit/          # Audit + deterministic evaluation endpoint
│   ├── api/audit/override/ # Finance override endpoint
│   ├── auditor/            # Finance dashboard pages
│   ├── employee/           # Employee submission page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # App layout
│   └── page.tsx            # Login page
├── src/data/
│   └── policy-rules.json   # Externalized policy rules
├── src/lib/audit/
│   └── deterministicEngine.ts
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   ├── uploads/            # Saved receipts
│   └── dummy_policy.pdf    # Sample policy document
└── README.md
```

## Dependencies

- `@prisma/client`: Database operations
- `groq-sdk`: AI vision and text generation
- `pdf-parse`: PDF text extraction
- `lucide-react`: UI icons
- `tailwindcss`: Styling framework

## Deployment

Ready for Vercel deployment. Ensure `GROQ_API_KEY` is configured in environment variables.

## Support

For questions about the system architecture or AI implementation, refer to the codebase comments and API documentation.
