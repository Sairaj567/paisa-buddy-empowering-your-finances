# Paisa Buddy – AI Contributor Guide

## Project Snapshot
- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Radix UI
- **State**: React hooks + context; React Query provider exists but is not yet the main data layer
- **Routing**: React Router with public and protected pages
- **Persistence**: Hybrid runtime
  - **Supabase mode** when env vars are configured
  - **localStorage fallback** when they are not
- **Brand**: "पैसा Buddy" — preserve the bilingual branding

## App Entry and Provider Order
- Entry point: [src/main.tsx](src/main.tsx)
- Root app: [src/App.tsx](src/App.tsx)
- Provider order in `App`:
  1. `ThemeProvider`
  2. `AuthProvider`
  3. `QueryClientProvider`
  4. `TooltipProvider`
  5. `Toaster` + `Sonner`
  6. `BrowserRouter`

Keep this order unless a dependency explicitly requires otherwise.

## Path and Import Conventions
- Use the `@/` alias for imports from `src/`
- Prefer shared primitives from `src/components/ui/`
- Prefer type imports where useful

## Routes and Navigation
- Routes are defined in [src/App.tsx](src/App.tsx)
- Current routes:
  - `/` → Landing
  - `/dashboard` → Protected
  - `/transactions` → Protected
  - `/budget` → Protected
  - `/goals` → Protected
  - `/insights` → Protected
  - `/settings` → Protected
  - `/learn` → Public
  - `/chat` → Public
  - `/login` → Public
  - `/signup` → Public
- Add new routes **above** the catch-all `*` route
- Use `ProtectedRoute` from [src/components/layout/ProtectedRoute.tsx](src/components/layout/ProtectedRoute.tsx) for authenticated pages
- Update [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) when adding a user-facing page

## Auth and Persistence Model
- Auth context lives in [src/context/AuthContext.tsx](src/context/AuthContext.tsx)
- Two runtime modes must continue to work:

### Supabase mode
- Enabled only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Uses Supabase Auth for email/password and Google sign-in
- Supabase client lives in [src/lib/supabase.ts](src/lib/supabase.ts)
- Supabase auth storage key: `pb-supabase-auth`

### Local fallback mode
- Used when Supabase is not configured
- Local auth storage key: `pb-user`
- Must remain functional for demo/local-only usage

## User-Scoped Storage Keys
When persisting local data, keep the existing patterns:
- `pb-transactions-{email}`
- `pb-goals-{email}`
- `pb-budgets-{email}`
- `pb-settings-{email}`

Guest fallbacks:
- `pb-transactions-guest`
- `pb-goals-guest`
- `pb-budgets-guest`
- `pb-settings-guest`

Do not invent a new key format unless the feature truly requires it.

## Core Domain Types
Types are centralized in [src/types/index.ts](src/types/index.ts).

Important types:
- `Transaction`
- `Goal`
- `Budget`
- `User`
- `ChatMessage`
- `UserSettings`

Important constants/types:
- `TransactionType`
- `GoalType`
- `TRANSACTION_CATEGORIES`
- `GOAL_TYPES`

### Data rules
- `Transaction.amount < 0` means expense
- `Transaction.amount > 0` means income
- Transaction `type` uses `Essentials`, `Needs`, `Wants`, `Income`
- Budget `spent` is derived from transactions

## Main Hooks and Responsibilities

### `useTransactions()`
File: [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts)
- Primary transaction CRUD hook
- Supports Supabase and local fallback
- Can show demo transactions for guests via `showDemoForGuests`
- Exposes computed transaction summaries used by analytics views

### `useGoals()`
File: [src/hooks/useGoals.ts](src/hooks/useGoals.ts)
- Goal CRUD and contribution updates
- Supports import and clear flows
- Use `getColorForType()` instead of hardcoding goal colors

### `useBudgets()`
File: [src/hooks/useBudgets.ts](src/hooks/useBudgets.ts)
- Budget CRUD
- Seeds defaults for new/local users
- Recomputes `spent` from current transaction data

### `useBudgetAlerts()`
File: [src/hooks/useBudgetAlerts.ts](src/hooks/useBudgetAlerts.ts)
- Sends toast-based alerts for threshold crossings
- Default thresholds:
  - warning: `80%`
  - critical: `90%`
  - exceeded: `100%+`
- Preserve duplicate-alert protection behavior

### `useRecurringTransactions()`
File: [src/hooks/useRecurringTransactions.ts](src/hooks/useRecurringTransactions.ts)
- Detects recurring expense patterns from transaction history
- Feeds recurring-expense UI on the dashboard

## Feature Notes

### Dashboard
- Reuse derived summaries and recurring data instead of duplicating analytics logic
- Recurring expense UI is in [src/components/dashboard/RecurringTransactions.tsx](src/components/dashboard/RecurringTransactions.tsx)

### Transactions
File: [src/pages/Transactions.tsx](src/pages/Transactions.tsx)
- Supports add/import/export/clear flows
- CSV import already supports multiple bank export formats
- Includes transaction name-based category/type detection
- Preserve import compatibility when changing parsing logic

### Budget
File: [src/pages/Budget.tsx](src/pages/Budget.tsx)
- `spent` should remain derived from current-month expense transactions
- Duplicate category budgets are intentionally blocked

### Insights
File: [src/pages/Insights.tsx](src/pages/Insights.tsx)
- Builds a `FinancialSnapshot` from transactions, goals, and budgets
- Supports both local insights and AI-generated insights
- Must degrade gracefully when AI config is missing

### Settings
File: [src/pages/Settings.tsx](src/pages/Settings.tsx)
- Stores preferences in localStorage
- Supports profile edits, data export, and destructive reset flows
- Keep saved settings payloads backward-compatible when possible

### Chat
- Keep message shape consistent with `ChatMessage`
- Expected structure: `{ id, role, content, timestamp }`

## AI and External Services

### Supabase
- Client setup: [src/lib/supabase.ts](src/lib/supabase.ts)
- Generated types: [src/lib/database.types.ts](src/lib/database.types.ts)
- Schema reference: [supabase/schema.sql](supabase/schema.sql)
- Prefer using existing hooks instead of calling Supabase directly from page components

### AI service
- AI logic lives in [src/lib/ai-service.ts](src/lib/ai-service.ts)
- Uses OpenRouter with fallback model and key rotation logic
- Relevant env vars may include:
  - `VITE_OPENROUTER_API_KEY`
  - `VITE_OPENROUTER_API_KEY_2`
  - `VITE_OPENROUTER_API_KEY_3`
- Preserve graceful fallback behavior if AI access is unavailable

## UI System and Styling Rules
- Use shadcn components from [src/components/ui/](src/components/ui/)
- Use semantic tokens from [src/index.css](src/index.css)
- Avoid hardcoded colors when a semantic token/class already exists

Useful custom classes in [src/index.css](src/index.css):
- `.glass-card`
- `.gradient-primary`
- `.gradient-accent`
- `.gradient-hero`
- `.shadow-glow`
- `.shadow-accent-glow`
- `.text-gradient-primary`
- animation helpers like `.animate-float`, `.animate-fade-in`, `.animate-slide-up`

### Buttons
Prefer existing variants in [src/components/ui/button.tsx](src/components/ui/button.tsx):
- `default`
- `hero`
- `glass`
- `accent`
- `success`
- `outline`

### Icons
- Use `lucide-react` only
- Follow existing icon mapping patterns for transaction categories and goal types

### Theme
- Theme provider: [src/components/theme-provider.tsx](src/components/theme-provider.tsx)
- Theme storage key: `paisa-buddy-theme`

## Notifications and Validation
- Use `toast()` from `@/components/ui/sonner`
- Prefer:
  - `toast.success()`
  - `toast.error()`
  - `toast.warning()` where supported
- Keep form validation simple and inline unless a feature clearly needs more structure

## Formatting and Utility Conventions
- Use `cn()` from [src/lib/utils.ts](src/lib/utils.ts) for class merging
- Use `Intl.NumberFormat('en-IN')` or `toLocaleString('en-IN')` for ₹ formatting consistency
- Prefer explicit typing in new code even though tsconfig is permissive

## Common Change Patterns

### Add a page
1. Create it in `src/pages/`
2. Register the route in [src/App.tsx](src/App.tsx)
3. Wrap it with `ProtectedRoute` if required
4. Update [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) if it should be navigable

### Add a persisted resource
1. Define or extend the type in [src/types/index.ts](src/types/index.ts)
2. Prefer a dedicated hook in `src/hooks/`
3. Support both Supabase and local fallback modes for user-owned data
4. Keep storage user-scoped

### Add charts or analytics
1. Derive data with `useMemo`
2. Reuse current Recharts patterns
3. Keep chart styling theme-aware

### Extend settings
1. Update `UserSettings` in [src/types/index.ts](src/types/index.ts)
2. Extend `DEFAULT_SETTINGS` in [src/pages/Settings.tsx](src/pages/Settings.tsx)
3. Preserve compatibility with existing saved payloads

### Modify auth
- Keep both Supabase and local fallback paths working unless the task explicitly removes one
- Do not break `login()` / `logout()` compatibility relied on by existing pages

## Guardrails
- Do not bypass existing hooks with direct localStorage code inside pages
- Do not hardcode Supabase credentials or API keys
- Do not remove guest/demo behavior unless explicitly requested
- Do not break bank CSV import compatibility
- Do not introduce a second component system
- Do not change the "पैसा Buddy" brand treatment

## Preferred Workflow
- Make focused, minimal changes
- Reuse existing patterns before introducing abstractions
- Keep behavior backward-compatible unless the task is a product change
- Prefer resilient fallbacks over brittle integrations

## Useful Commands
```bash
npm run dev
npm run build
npm run lint
npm run preview
```
