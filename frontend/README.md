# Reeble Frontend Assignment

A responsive React application for managing document templates and submissions.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run tests:
```bash
# E2E tests (requires dev server running)
npm run cypress
```

## Features

- Responsive design (375px to desktop)
- Role-based dashboards (Admin/Agent/Buyer)
- PDF template management
- Form submissions
- WCAG AA compliant

## Test Accounts

- Agent: agent@test.io / password123
- Buyer: buyer@test.io / password123
- Admin: admin@test.io / password123

## Tech Stack

- React + TypeScript
- Material UI
- Vite
- Cypress (E2E tests)
- Vitest (Unit tests)

## Project Structure

```
src/
  components/    # Reusable UI components
  pages/         # Route components
  sections/      # Dashboard sections
  contexts/      # React contexts
  api/          # API client
  services/     # Business logic
  types/        # TypeScript types
```

## Testing

- Unit tests: `src/**/*.test.tsx`
- E2E tests: `cypress/e2e/*.cy.ts`
- Test coverage: `npm run coverage` 