# CLAUDE OPERATING CONTRACT — PhishGuard
Version: 1.0
Project Type: Turborepo Monorepo — NestJS Backend + React Frontend + Shared Types

You are an AI software engineer operating inside a production-grade monorepo.
This file is a binding operating contract. You MUST follow it exactly.

---

## 0. PRIMARY GOAL

Implement the user request safely, correctly, and incrementally.

Priority order:
1. **Correctness** (behavior matches spec)
2. **Stability** (no crashes, proper error handling)
3. **Consistency** (follow existing patterns)
4. **Completeness** (all features work end-to-end)

Creativity, refactoring, and optimization are explicitly discouraged unless explicitly requested.

---

## 1. ABSOLUTE RULES (NON-NEGOTIABLE)

### You MUST:

1. **Break down large requests into small, manageable chunks**
   - If the user provides a large request, DO NOT implement it all at once
   - Create a step-by-step implementation plan
   - Implement ONE small chunk at a time
   - Run all checks after EACH chunk

2. **Modify ONLY files required to fulfill the current chunk**

3. **Preserve the existing folder structure exactly**

4. **Follow existing code patterns exactly**

5. **Use TypeScript only** (no JavaScript)

6. **Run ALL checks after EVERY change:**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   pnpm test
   ```

7. **Write tests for EVERY new feature**

### If ANY check fails:
- Fix the issue immediately
- Re-run ALL checks
- Repeat until all checks pass
- DO NOT proceed to the next task until all checks pass

### You MUST NEVER:
- Skip running lint/typecheck/build/test after changes
- Use `any` type in TypeScript
- Silence errors using `@ts-ignore`, `eslint-disable`, or similar
- Bypass rules "temporarily"
- Commit code with failing checks
- Install packages without user approval
- Store secrets in code (use environment variables)

---

## 2. PROJECT STRUCTURE (MONOREPO)

```
phishguard/
├── apps/
│   ├── backend/          # NestJS API (port 3001)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/           # NestConfigModule (isGlobal)
│   │   │   ├── database/         # Drizzle ORM + @Global() DatabaseModule
│   │   │   │   ├── schema/       # Drizzle table schemas
│   │   │   │   ├── database.module.ts
│   │   │   │   └── drizzle.provider.ts
│   │   │   └── modules/          # Feature modules
│   │   │       ├── inbox/
│   │   │       ├── analysis/
│   │   │       ├── chat/
│   │   │       ├── agent/
│   │   │       └── spektrum/
│   │   ├── docker-compose.yml
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── frontend/         # React + Vite (port 5173)
│       ├── src/
│       │   ├── features/         # Feature-based modules
│       │   ├── components/ui/    # shadcn/ui components
│       │   ├── lib/              # API client, utils
│       │   └── hooks/
│       ├── components.json
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   └── shared/           # Shared types + Zod schemas
│       ├── src/
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md
```

### Strict Enforcement

**Backend (NestJS):**
- Controllers: HTTP only (request parsing, response formatting)
- Services: All business logic + database access
- Database: Drizzle ORM, type-safe queries, migrations via `drizzle-kit`
- Config: Access via `ConfigService` only (never `process.env` directly)
- Schema: All table definitions in `database/schema/`

**Frontend (React):**
- `features/`: All business logic (self-contained modules)
- `components/ui/`: Presentational only (shadcn/ui)
- `lib/`: Shared infrastructure (API client, utils)
- No direct API calls outside `lib/api.ts`
- Tailwind CSS v4 (zero-config mode, theme via CSS variables in `index.css`)

**Shared (`packages/shared`):**
- Shared TypeScript types and Zod schemas
- No runtime dependencies (types + validation only)
- Both apps import from `@phishguard/shared`

---

## 3. VERIFICATION COMMANDS

### After EVERY change, run:
```bash
# From root:
pnpm lint          # ESLint across all packages
pnpm typecheck     # TypeScript check across all packages
pnpm build         # Build all packages (respects Turbo dependency graph)
pnpm test          # Run all tests
```

### Package-specific commands:
```bash
pnpm --filter backend dev          # Start backend in dev mode
pnpm --filter frontend dev         # Start frontend in dev mode
pnpm --filter backend db:generate  # Generate Drizzle migrations
pnpm --filter backend db:push      # Push schema to database
```

---

## 4. DATABASE RULES

- PostgreSQL 16 on port 5433 (via docker-compose in apps/backend/)
- Drizzle ORM for all queries (no raw SQL)
- Schema changes require `drizzle-kit generate` + `drizzle-kit push`
- Type-safe queries with full TypeScript inference
- Use `@Inject(DRIZZLE)` in NestJS services

---

## 5. TYPESCRIPT RULES

- Strict mode enabled in all packages
- No `any` — use `unknown` if truly dynamic
- No unsafe type assertions
- All exported functions must have explicit return types
- Shared types live in `packages/shared`
- Database types inferred from Drizzle schemas

---

## 6. PRE-COMMIT CHECKLIST

Before committing, ALL of these must pass:
```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

If ANY fails, DO NOT commit. Fix and re-run.

---

## 7. COMMIT MESSAGE FORMAT

```
feat|fix|refactor|chore: short description

- Detail 1
- Detail 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
