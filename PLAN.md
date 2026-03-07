# Plan: Phishing Email Training Simulator (PhishGuard)

## Context

Demo projekat za JigJoy platformu — Gmail-like email klijent gde korisnici vezbaju detekciju phishing mejlova. AI agent generise inbox sa mesavinom legitimnih i phishing mejlova, korisnik analizira i oznacava sumnjive, pa na kraju dobija debrief od AI agenta sa objasnjenjem + moze da nastavi razgovor. Koristi Spektrum SDK za generisanje interaktivnih vezbi.

**Monorepo** setup sa Turborepo + pnpm workspaces.
Lokacija: `/Users/Miodrag.todorovic.ext/Desktop/phishguard/`

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: NestJS + Drizzle ORM + PostgreSQL (obicna baza za sesije) + OpenAI GPT + `@jigjoy-io/mosaic` + `@spektrum-ai/sdk`
- **Frontend**: React 19 + Vite + TailwindCSS 4 + shadcn/ui (new-york style) + Framer Motion
- **AI**: OpenAI (GPT-4.1-mini za streaming, GPT-4.1 za agente)
- **Mosaic agenti**: Za generisanje mejl sadrzaja (legitimni + phishing) na osnovu templejta
- **Spektrum SDK**: Za generisanje interaktivnih vezbi posle debriefa (React app -> iframe)
- **Auth**: Nema (demo)
- **RAG**: Nema — agent koristi kontekst iz same vezbe
- **Shared**: `packages/shared` — zajednicki tipovi i Zod scheme (email, session, analysis)

## Monorepo struktura

```
phishguard/
├── apps/
│   ├── backend/                             # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── database/
│   │   │   │   ├── schema/
│   │   │   │   │   ├── sessions.schema.ts       # Sesije (inbox stanje, score)
│   │   │   │   │   ├── emails.schema.ts         # Generisani mejlovi + ground truth
│   │   │   │   │   ├── chat-messages.schema.ts  # Debrief + follow-up poruke
│   │   │   │   │   └── index.ts                 # Re-export svih schema
│   │   │   │   ├── database.module.ts           # @Global() modul
│   │   │   │   └── drizzle.provider.ts          # DRIZZLE Symbol provider
│   │   │   ├── modules/
│   │   │   │   ├── inbox/
│   │   │   │   │   ├── inbox.module.ts
│   │   │   │   │   ├── inbox.controller.ts      # POST /inbox/generate, GET /inbox/:sessionId
│   │   │   │   │   └── inbox.service.ts         # Generise mejlove kroz AI
│   │   │   │   ├── analysis/
│   │   │   │   │   ├── analysis.module.ts
│   │   │   │   │   ├── analysis.controller.ts   # POST /analysis/submit, GET /analysis/:sessionId
│   │   │   │   │   └── analysis.service.ts      # Prima odluke korisnika, racuna score
│   │   │   │   ├── chat/
│   │   │   │   │   ├── chat.module.ts
│   │   │   │   │   ├── chat.controller.ts       # POST /chat/stream (SSE debrief + follow-up)
│   │   │   │   │   └── chat.service.ts          # SSE streaming, debrief generisanje
│   │   │   │   ├── agent/
│   │   │   │   │   ├── agent.module.ts
│   │   │   │   │   ├── agent.service.ts         # Mosaic agent wrapper (OpenAI)
│   │   │   │   │   ├── prompts/
│   │   │   │   │   │   ├── system-prompt.ts     # PhishGuard debrief persona
│   │   │   │   │   │   ├── email-generation.ts  # Prompt za generisanje mejlova
│   │   │   │   │   │   └── phishing-variants.ts # Prompt templates za Spektrum vezbe
│   │   │   │   │   └── tools/
│   │   │   │   │       └── exercise.tool.ts     # Mosaic Tool: generise Spektrum vezbu
│   │   │   │   └── spektrum/
│   │   │   │       ├── spektrum.module.ts
│   │   │   │       └── spektrum.service.ts      # Spektrum SDK wrapper
│   │   │   └── config/
│   │   │       ├── config.module.ts             # NestConfigModule.forRoot({ isGlobal: true })
│   │   │       └── configuration.ts             # Typed config factory
│   │   ├── docker-compose.yml                   # PostgreSQL 16 (port 5433)
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── frontend/                            # React + Vite
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── index.css                        # Tailwind v4, Gmail-inspired theme
│       │   ├── lib/
│       │   │   ├── api.ts                       # API client + SSE streaming
│       │   │   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
│       │   ├── features/
│       │   │   ├── inbox/
│       │   │   │   ├── components/
│       │   │   │   │   ├── InboxLayout.tsx       # Gmail shell: sidebar + toolbar + content
│       │   │   │   │   ├── Sidebar.tsx           # Gmail sidebar (Inbox, Starred, Sent, etc.)
│       │   │   │   │   ├── Toolbar.tsx           # Checkbox all, refresh, search
│       │   │   │   │   ├── EmailList.tsx         # Lista mejlova
│       │   │   │   │   ├── EmailRow.tsx          # Red: avatar, sender, subject, snippet, time
│       │   │   │   │   ├── EmailViewer.tsx       # Otvoren mejl: headers + body + action buttons
│       │   │   │   │   └── GenerateButton.tsx    # "Generate Campaign" FAB
│       │   │   │   └── context/
│       │   │   │       └── InboxContext.tsx
│       │   │   ├── campaign/
│       │   │   │   └── CampaignSetupWizard.tsx  # Wizard: phishing type + difficulty + target role
│       │   │   ├── debrief/
│       │   │   │   ├── components/
│       │   │   │   │   ├── DebriefPanel.tsx      # Sliding panel sa AI debriefom
│       │   │   │   │   ├── ScoreHeader.tsx       # Score: 7/10 correct
│       │   │   │   │   ├── EmailVerdict.tsx      # Per-email breakdown (correct/wrong + why)
│       │   │   │   │   ├── ChatThread.tsx        # Follow-up razgovor
│       │   │   │   │   └── ChatComposer.tsx      # Input za pitanja
│       │   │   │   └── context/
│       │   │   │       └── DebriefContext.tsx     # SSE streaming za debrief
│       │   │   └── exercise/
│       │   │       ├── ExerciseDialog.tsx        # Full-screen iframe modal
│       │   │       └── ExerciseTimer.tsx         # Countdown timer
│       │   ├── components/ui/                   # shadcn components (new-york style)
│       │   └── hooks/
│       ├── components.json                      # shadcn config
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       └── package.json
│
├── packages/
│   └── shared/                              # Zajednicki tipovi
│       ├── src/
│       │   ├── index.ts
│       │   ├── email.types.ts               # Email, EmailIndicator, GeneratedEmail
│       │   ├── session.types.ts             # Session, CampaignConfig
│       │   ├── analysis.types.ts            # AnalysisSubmission, AnalysisResult
│       │   └── chat.types.ts                # ChatMessage, SSE event types
│       ├── tsconfig.json
│       └── package.json
│
├── turbo.json                               # Turborepo pipeline config
├── pnpm-workspace.yaml                      # Workspace definition
├── package.json                             # Root package.json (scripts, devDeps)
├── .gitignore
├── .env.example
└── plan.md
```

## Tok korisnika

```
1. Korisnik otvori app -> vidi prazan Gmail-like inbox
2. Klikne "Generate Campaign" -> bira tip + difficulty
3. AI generise 6-10 mejlova (mix legitimnih i phishing)
4. Mejlovi se pojavljuju u inbox-u
5. Korisnik cita mejlove, analizira headers, linkove, sadrzaj
6. Za svaki mejl: "Report as Phishing" ili "Mark as Safe"
7. Kad zavrsi sve -> klikne "Submit Analysis"
8. AI debrief agent se javi:
   - Score (X/Y tacno)
   - Za svaki mejl: sta je tacno/netacno i zasto
   - Specificni indikatori koje je promasio
   - Tips za unapredjenje
9. Korisnik moze da nastavi razgovor — pita pitanja o phishing-u
10. Agent analizira slabosti i predlozi ciljanu vezbu:
    "Primetio sam da nisi prepoznao sender spoofing. Hoces vezbu fokusiranu na to?"
11. Korisnik prihvati -> Spektrum SDK generise personalizovanu vezbu -> iframe
12. Posle vezbe -> opcija za novu kampanju sa povecanom tezinom u slabim oblastima
    (adaptive learning loop: svaka runda cilja na ono sto korisnik ne zna)
```

## Koraci implementacije

### Korak 1: Monorepo scaffold + Backend osnova
- Turborepo init sa pnpm workspaces
- Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`
- `packages/shared` — bazni tipovi (Email, Session, Analysis, Chat)
- `apps/backend` — NestJS init:
  - `docker-compose.yml` (PostgreSQL 16, port 5433, obican postgres:16 image — bez pgvector)
  - Drizzle setup: schema (`sessions`, `emails`, `chat-messages`), provider (`DRIZZLE` Symbol), `@Global()` DatabaseModule
  - Config module: `NestConfigModule.forRoot({ isGlobal: true })` + typed `configuration.ts`
  - `GET /health` endpoint
  - Pattern iz MITRE: `drizzle.provider.ts` sa `postgres` driver, `ConfigService` injection

### Korak 2: Frontend scaffold
- `apps/frontend` — Vite + React 19 + TypeScript
  - TailwindCSS 4 (`@tailwindcss/postcss`)
  - shadcn/ui (new-york style, neutralna baza, CSS variables)
  - `@` alias u vite.config.ts
  - Proxy: `/api` -> `http://localhost:3001`
  - Zavisi od `@phishguard/shared` (workspace dependency)
- Turbo pipeline: `dev`, `build`, `lint`, `typecheck`

### Korak 3: Email generation (Mosaic agent + templejti)
- `inbox.service.ts` — koristi Mosaic agenta za generisanje batch-a mejlova
- **Email templejti** (`email-templates.ts`) — predefinisani formati za razne tipove:
  - Legitimni: password reset, invoice, meeting invite, newsletter, shipping notification
  - Phishing: credential harvest, BEC/CEO fraud, fake invoice, brand impersonation, delivery scam, urgency/threat
- Mosaic agent dobija templejt + parametre (tip kampanje, difficulty, target role, industry) i generise **realistican** sadrzaj
- Structured output (Zod schema) — svaki mejl:
  ```ts
  { id, from: { name, email }, replyTo?, to: { name, email },
    subject, bodyHtml, receivedAt,
    isPhishing: boolean,
    indicators: [{ type: "spoofed_sender" | "suspicious_url" | "urgency" | ..., description, location }],
    difficulty: "easy" | "medium" | "hard" }
  ```
- `indicators[]` = ground truth (npr. "Reply-To doesn't match From", "Link text says microsoft.com but href points to micr0soft.xyz")
- Agent generise mesavinu: ~40-60% phishing, ostalo legitimno
- Cuva u `emails` tabeli sa `sessionId`

### Korak 4: Analysis + scoring
- `POST /analysis/submit` prima `{ sessionId, decisions: [{ emailId, markedAsPhishing: boolean }] }`
- Poredi sa ground truth iz baze
- Racuna score, cuva rezultat
- Vraca summary: `{ score, total, perEmail: [{ emailId, correct, indicators }] }`

### Korak 5: Debrief chat (SSE streaming)
- `POST /chat/stream` — SSE endpoint
- Prvi poziv posle submit-a: agent dobija ceo kontekst (mejlovi + ground truth + korisnikove odluke + score)
- Agent generise personalizovani debrief (streaming)
- Follow-up poruke: korisnik pita, agent odgovara sa kontekstom vezbe
- SSE events: `chunk`, `done` (isti pattern kao MITRE demo)
- Agent ima `exercise.tool.ts` — moze da predlozi Spektrum vezbu za specificnu slabost

### Korak 6: Spektrum SDK integracija + Adaptive learning
- `spektrum.service.ts` — wrapper oko `@spektrum-ai/sdk`
- Spektrum SDK flow: `createProject()` -> `createTask(projectId, title, description)` -> `codeAndDeploy(task)` -> `getAppUrl(projectId)`
- `exercise.tool.ts` — Mosaic Tool koji poziva `spektrumService.generateExercise()`
- Prompt templates u `phishing-variants.ts` za generisanje interaktivnih vezbi:
  - `PHISHING_EMAIL_DEEP_DIVE` — detaljnija analiza jednog mejla sa klikabilnim indikatorima
  - `HEADER_FORENSICS` — vezba za citanje email headersa (SPF, DKIM, DMARC)
- Vraca URL, prikazuje se u iframe-u (ExerciseDialog)

**Adaptive learning loop:**
- Posle debriefa, agent analizira slabosti korisnika (structured output -> Zod schema):
  ```ts
  { weaknesses: [{ area: "sender_spoofing", severity: "high", missedCount: 2 }],
    strengths: [{ area: "url_analysis", correctCount: 3 }],
    recommendedExercise: { topic, difficulty, focus } }
  ```
- Agent na kraju debriefa predlozi ciljanu vezbu: "Primetio sam da ti je sender spoofing bio problem. Hoces vezbu fokusiranu na to?"
- Korisnik prihvati -> Spektrum SDK generise vezbu sa promptom koji ukljucuje:
  - Konkretne slabosti iz debriefa
  - Primere koje je korisnik promasio (anonimizovane)
  - Progresivnu tezinu (teze nego prosla runda)
- Posle vezbe -> nova opcija: "Generate New Campaign" sa povecanom tezinom u slabim oblastima
- Ovako se ciklus ponavlja: Campaign -> Debrief -> Targeted Exercise -> Harder Campaign

### Korak 7: Frontend — Gmail clone inbox
- `InboxLayout.tsx` — Gmail-inspired shell (bela pozadina, crveni accent za branding)
- `Sidebar.tsx` — Inbox (bold, count), Starred, Sent, Drafts, Spam, Trash
- `EmailList.tsx` + `EmailRow.tsx` — lista sa checkbox, avatar krug, sender name, subject bold, snippet gray, time
- `EmailViewer.tsx` — otvoren mejl sa svim headerima, HTML body, "Report as Phishing" / "Mark as Safe" dugmad
- `GenerateButton.tsx` — crveni FAB "Generate Campaign" (kao Gmail Compose dugme)
- Responsive, izgleda kao pravi Gmail

### Korak 8: Frontend — Campaign wizard + Debrief
- `CampaignSetupWizard.tsx` — modal pre generisanja:
  - Step 1: Phishing type (Spear Phishing, BEC, Credential Harvest, Brand Impersonation, Invoice Fraud) + Difficulty
  - Step 2 (opciono): Target role, Industry
- `DebriefPanel.tsx` — sliding panel posle submita:
  - Score header (X/10, procenat)
  - Per-email verdicts (green check / red X + objasnjenje)
  - Chat thread za follow-up pitanja (SSE streaming)
- `ExerciseDialog.tsx` — iframe sa Spektrum-generisanom vezbom + timer

## Turborepo konfiguracija

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:generate": "pnpm --filter backend db:generate",
    "db:push": "pnpm --filter backend db:push",
    "db:studio": "pnpm --filter backend db:studio",
    "docker:up": "pnpm --filter backend docker:up",
    "docker:down": "pnpm --filter backend docker:down"
  }
}
```

## Kljucne razlike od MITRE demo-a

| Aspekt | MITRE demo | PhishGuard |
|--------|-----------|------------|
| Repo setup | Dva odvojena repoa | Turborepo monorepo |
| RAG | pgvector hybrid search | Nema — kontekst iz same vezbe |
| Chat | Glavni UX, stalno prisutan | Sekundaran — debrief posle vezbe |
| Auth | JWT login/signup | Nema |
| Vibecoding | Direktni HTTP ka JigJoy API | Spektrum SDK (`@spektrum-ai/sdk`) |
| AI provider | Anthropic + OpenAI | Samo OpenAI |
| Glavni UX | Chat interface | Gmail-like inbox |
| Lesson trigger | Agent predlaze tokom chata | Agent predlaze tokom debriefa |
| Email gen | N/A | Mosaic agent + templejti -> structured output |
| Adaptive learning | Nema | Slabosti iz debriefa -> ciljane vezbe -> teze kampanje |
| Shared types | Nema | `packages/shared` — zajednicki tipovi |
| DB image | pgvector/pgvector:pg16 | postgres:16 (obicna) |

## Environment variables (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/phishguard
OPENAI_API_KEY=sk-...
SPEKTRUM_API_KEY=...
SPEKTRUM_ENDPOINT=https://platform.jigjoy.ai
PORT=3001
```

## Verifikacija

1. `pnpm install` — instalira sve workspace zavisnosti
2. `pnpm docker:up` — PostgreSQL na portu 5433
3. `pnpm db:push` — schema push
4. `pnpm dev` — Turbo pokrece backend (3001) + frontend (5173) paralelno
5. Testovi:
   - Klikni "Generate Campaign" -> izaberi tip + difficulty -> mejlovi se pojave u inbox-u
   - Otvori mejl -> pregledaj headers i body -> "Report" ili "Safe"
   - Submit -> debrief panel se otvori sa score-om i AI objasnjenjem
   - Postavi follow-up pitanje -> SSE streaming odgovor
   - Agent predlozi vezbu -> iframe se otvori sa Spektrum apom
   - Posle vezbe -> "Generate New Campaign" sa povecanom tezinom

## Reference (pattern source)

- MITRE ATT&CK demo backend: `/Users/Miodrag.todorovic.ext/Desktop/mitre-attack-demo-backend/`
- MITRE ATT&CK demo frontend: `/Users/Miodrag.todorovic.ext/Desktop/mitre-attack-demo/`
- Spektrum SDK: `/Users/Miodrag.todorovic.ext/Desktop/jigjoy-services/spektrum-sdk/` (GitHub: https://github.com/jigjoy-ai/spektrum-sdk)
- Spektrum SDK example: `/Users/Miodrag.todorovic.ext/Desktop/jigjoy-services/spektrum-sdk-example/`
