# LedgerVision AI

A responsive financial and business management prototype for **Angkor Brew Coffee Co.**, built with Next.js, TypeScript, Tailwind CSS, shadcn-style Radix components, Recharts, and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. The app starts in the demo dashboard. Open the profile menu to explore sign-in and registration; the business selector opens onboarding.

## Checks

```sh
npm run lint
npm test
npm run build
```

Includes:

- Financial dashboard with five summary cards, interactive Recharts charts, and quick actions.
- Simulated file import, field mapping and validation, receipt capture, review queue, and confirmation for bulk suggestions.
- Editable transactions with source preservation, attachments, filtering, deletion confirmation, and audit history.
- Bank reconciliation with confidence explanations, manual matches, and configurable future automation.
- Invoice editing with line items, tax, discounts, previews, draft saving, cancellation, and confirmed Email/Telegram delivery simulation.
- Voice-to-invoice simulation that produces an editable draft without accessing the microphone.
- Sales analytics, inventory adjustments, low-stock alerts, and configurable integration simulations.
- Source-labelled AI answers, cost pattern corrections, forecasts for 1/3/6/12 months, and monthly reports.
- Business onboarding, team simulation, financial preferences, categories, notification settings, and authorized Telegram account controls.
- Mobile bottom navigation and dedicated capture and voice workflows.

Report and invoice PDF buttons use the browser print dialog; choose **Save as PDF**.

This is a frontend prototype: imported spreadsheets and OCR use labelled sample results, AI replies and forecasts are simulated, and authentication does not connect to a service. Uploaded images can be previewed locally. Changes are held in memory for the current session and reset on refresh. No financial data, invoices, audio, or credentials are sent to a backend or external API.

`components/workspace.tsx` owns shared session state and audit operations. `lib/demo.ts` defines typed sample records. Feature modules live in `components/finance.tsx`, `invoices.tsx`, `operations.tsx`, and `intelligence.tsx`. Workflow tests run in JSDOM; they do not replace visual browser testing.
