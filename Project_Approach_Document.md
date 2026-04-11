# Project Approach Document: Expense Auditor

## 1. Solution Design
The Expense Auditor is designed as a role-based web application for expense claim compliance. It follows a modular audit pipeline:

- **Authentication and Role Routing**
  Users sign in securely using database-backed profiles.
  Employees are routed to a strictly isolated submission and history dashboard; auditors gain access to the overarching review dashboard.

- **Submission Layer**
  Employees upload a receipt (JPG/PNG/PDF) and enter their claim context (claimed date, category, location, seniority, business justification).

- **Extraction Layer**
  A Vision model extracts key receipt fields (merchant, total amount, currency, receipt date, line items, readability signal).

- **Policy Evaluation Layer (Deterministic)**
  The final compliance decision is orchestrated by a deterministic rule engine using externalized policy data (JSON), rather than relying purely on LLM judgment.
  Rules produce explicit, predictable outcomes: APPROVED, FLAGGED, or REJECTED.
  Each decision stores rule-level traceability for downstream audit logic.

- **Employee Portal & Data Privacy**
  Strict data isolation guarantees employees can seamlessly track the history of *only* their submissions.
  Dashboards include visual feedback, explaining exactly why an auditor intervened on an automated decision.

- **Finance Review Layer**
  The auditor dashboard prioritizes higher-risk claims at the top of the queue.
  The detail view provides the raw receipt, extracted data fields, verdict reasoning, and a clear rule evaluation trace.
  Human-in-the-loop overrides are fully supported, securely badging modified submissions and appending a mandatory auditor justification.

## 2. Tech Stack Choices

- **Frontend + Backend:** Next.js (App Router, API routes), React, TypeScript
  *Reason:* Single cohesive codebase for UI and backend APIs, incredibly fast iteration, and robust type safety.

- **Styling:** Tailwind CSS
  *Reason:* Rapid, consistent, and highly polished UI development.

- **Database:** Prisma ORM + SQLite
  *Reason:* Fast local setup, structured schema evolution, and simple associative querying between users and expenses.

- **AI Extraction:** Groq Vision model
  *Reason:* Highly accurate receipt OCR and structured JSON extraction from raw images/PDFs.

- **Policy Engine:** JSON policy rules + TypeScript evaluator
  *Reason:* Data-driven policy updates create deterministic and easily explainable outcomes.

## 3. Why These Choices Were Made

- **Deterministic auditing over LLM-only decisions:** Compliance decisions must be absolutely consistent and reproducible.
- **Policy-as-data:** Rule updates happen in pure config/data rather than requiring deep logic refactoring.
- **Full traceability:** Explicit rule-level outcomes empower finance teams to explain decisions effortlessly.
- **Rapid delivery:** Using a unified Next.js + Prisma stack stripped away microservice complexity and empowered an end-to-end implementation to be built incredibly fast.

## 4. Improvements With More Time

- **Policy management UI:** Create, edit, and version policies directly from the auditor dashboard instead of interacting with JSON arrays.
- **Advanced policy ingestion:** Automatically parse massive HR policy PDFs into structured rule candidates via an LLM approval workflow.
- **Date intelligence:** Advanced handling and anomaly detection for multi-date receipts (e.g., issue date vs. service/travel date discrepancies).
- **Security hardening:** Transition to a tighter auth model (hashed passwords via bcrypt, JWT rotation, advanced RBAC models).
- **Automated testing:** Implement Cypress front-end tests and Jest back-end regression suites for the deterministic rule engine.
