# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` with Next.js App Router in `src/app/` (route folders like `converter/json-to-csv`).
- UI: Reusable components in `src/components/`, hooks in `src/hooks/`, utilities in `src/lib/`, state in `src/store/` (Zustand).
- Assets: Static files under `public/`; global styles in `src/app/globals.css` (Tailwind CSS).
- Tests: Playwright E2E specs in `tests/*.spec.ts`; config in `playwright.config.ts`.
- Docs: High‑level specs in `spec/` and `docs/`.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server (Turbopack). Example for tests: `PORT=3001 npm run dev`.
- `npm run build`: Production build.
- `npm run start`: Start built app.
- `npm run lint`: Run ESLint checks.
- `npm run dev:clean`: Clean caches and start dev (uses `scripts/dev-fix.sh`).
- Playwright: `npx playwright test` (HTML report: `npx playwright show-report`).

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Path alias: `@/*` maps to `src/*`.
- Indentation: 2 spaces; prefer named exports for components and utilities.
- Components: PascalCase files in `src/components/...` (e.g., `JsonEditor.tsx`).
- Hooks: `useX` naming in `src/hooks/...` (e.g., `useClipboard.ts`).
- Routes: Kebab‑case folder names under `src/app/...` (e.g., `json-table-editor`).
- Linting: ESLint `next/core-web-vitals`; run `npm run lint` before PRs.

## Testing Guidelines
- Framework: Playwright E2E (`tests/*.spec.ts`). Keep tests fast and parallel‑safe.
- Server URL: Config expects `http://localhost:3001`; set `PORT=3001` when running tests.
- Naming: `*.spec.ts`. Group scenarios per feature (e.g., `table-editor.spec.ts`).
- Run locally: `npx playwright test` (headful: `npx playwright test --headed`). Attach screenshots on failures when relevant.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits. Examples: `feat(table): add sortable headers`, `fix(editor): update JSON formatting on save`, `docs(changelog): add v2.3.0`.
- PRs must include: clear description, linked issues (`Closes #123`), screenshots/GIFs for UI changes, notes on tests and edge cases.
- Checks: Ensure `npm run lint` passes and Playwright tests are green. Update docs (`spec/`, `docs/`) when behavior changes.

## Security & Configuration Tips
- Secrets: Do not commit real API keys. Use `.env.local` for local overrides; keys with `NEXT_PUBLIC_` are exposed to the client.
- External packages: Next.js config enables server externals and experimental optimizations—avoid dynamic imports that break SSR without guardrails.
