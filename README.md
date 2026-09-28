# LedgerVision AI

A responsive, clickable bookkeeping prototype built with Next.js, TypeScript, Tailwind CSS, and shadcn-style Radix components.

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

Includes dashboard charts, editable transactions, category management, import previews, receipt confirmation, AI review decisions, source-labelled chat, insights, monthly reports, recurring costs, settings, and audit history. The report's Export PDF button opens the browser print dialog; choose Save as PDF.

This is a frontend prototype: imported spreadsheets and OCR use labelled sample results, AI replies are simulated, and authentication does not connect to a service. Uploaded images can be previewed locally. Changes are held in memory for the current session and reset on refresh. No financial data is sent to a backend.
# LedgerVision
