# Plan: Phishing Email Training Simulator (PhishGuard)

## Context

Demo projekat za JigJoy platformu — Gmail-like email klijent gde korisnici vežbaju detekciju phishing mejlova. AI agent generiše inbox sa mešavinom legitimnih i phishing mejlova, korisnik analizira i označava sumnjive, pa na kraju dobija debrief od AI agenta sa objašnjenjem + može da nastavi razgovor. Koristi Spektrum SDK za generisanje interaktivnih vežbi.

Dva repoa: `phishguard-backend` + `phishguard-frontend`.
Lokacija: `/Users/Miodrag.todorovic.ext/Desktop/jigjoy-services/`

## Stack

- **Backend**: NestJS + Drizzle ORM + PostgreSQL (obična baza za sesije) + OpenAI GPT + `@jigjoy-io/mosaic` + `@spektrum-ai/sdk`
- **Frontend**: React 19 + Vite + TailwindCSS 4 + shadcn/ui + Framer Motion
- **AI**: OpenAI (GPT-4.1-mini za streaming, GPT-4.1 za agente)
- **Mosaic agenti**: Za generisanje mejl sadržaja (legitimni + phishing) na osnovu templejta
- **Spektrum SDK**: Za generisanje interaktivnih vežbi posle debriefa (React app → iframe)
- **Auth**: Nema (demo)
- **RAG**: Nema — agent koristi kontekst iz same vežbe

## Tok korisnika

```
1. Korisnik otvori app → vidi prazan Gmail-like inbox
2. Klikne "Generate Campaign" → bira tip + difficulty
3. AI generiše 6-10 mejlova (mix legitimnih i phishing)
4. Mejlovi se pojavljuju u inbox-u
5. Korisnik čita mejlove, analizira headers, linkove, sadržaj
6. Za svaki mejl: "Report as Phishing" ili "Mark as Safe"
7. Kad završi sve → klikne "Submit Analysis"
8. AI debrief agent se javi:
   - Score (X/Y tačno)
   - Za svaki mejl: šta je tačno/netačno i zašto
   - Specifični indikatori koje je promašio
   - Tips za unapređenje
9. Korisnik može da nastavi razgovor — pita pitanja o phishing-u
10. Agent analizira slabosti i predloži ciljanu vežbu:
    "Primetio sam da nisi prepoznao sender spoofing. Hoćeš vežbu fokusiranu na to?"
11. Korisnik prihvati → Spektrum SDK generiše personalizovanu vežbu → iframe
12. Posle vežbe → opcija za novu kampanju sa povećanom težinom u slabim oblastima
    (adaptive learning loop: svaka runda cilja na ono što korisnik ne zna)
```

## Arhitektura

```
phishguard-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── database/
│   │   ├── schema/
│   │   │   ├── sessions.schema.ts       # Sesije (inbox stanje, score)
│   │   │   ├── emails.schema.ts         # Generisani mejlovi + ground truth
│   │   │   └── chat-messages.schema.ts  # Debrief + follow-up poruke
│   │   ├── database.module.ts
│   │   └── drizzle.provider.ts
│   ├── modules/
│   │   ├── inbox/
│   │   │   ├── inbox.module.ts
│   │   │   ├── inbox.controller.ts      # POST /inbox/generate, GET /inbox/:sessionId
│   │   │   └── inbox.service.ts         # Generiše mejlove kroz AI
│   │   ├── analysis/
│   │   │   ├── analysis.module.ts
│   │   │   ├── analysis.controller.ts   # POST /analysis/submit, GET /analysis/:sessionId
│   │   │   └── analysis.service.ts      # Prima odluke korisnika, računa score
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts       # POST /chat/stream (SSE debrief + follow-up)
│   │   │   └── chat.service.ts          # SSE streaming, debrief generisanje
│   │   ├── agent/
│   │   │   ├── agent.module.ts
│   │   │   ├── agent.service.ts         # Mosaic agent wrapper (OpenAI)
│   │   │   ├── prompts/
│   │   │   │   ├── system-prompt.ts     # PhishGuard debrief persona
│   │   │   │   ├── email-generation.ts  # Prompt za generisanje mejlova
│   │   │   │   └── phishing-variants.ts # Prompt templates za Spektrum vežbe
│   │   │   └── tools/
│   │   │       └── exercise.tool.ts     # Mosaic Tool: generiše Spektrum vežbu
│   │   └── spektrum/
│   │       ├── spektrum.module.ts
│   │       └── spektrum.service.ts      # Spektrum SDK wrapper
│   └── config/
├── docker-compose.yml                   # PostgreSQL (obična, bez pgvector)
├── drizzle.config.ts
└── package.json

phishguard-frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css                        # Tailwind v4, Gmail-inspired theme
│   ├── lib/
│   │   └── api.ts                       # API client + SSE streaming
│   ├── features/
│   │   ├── inbox/
│   │   │   ├── components/
│   │   │   │   ├── InboxLayout.tsx       # Gmail shell: sidebar + toolbar + content
│   │   │   │   ├── Sidebar.tsx           # Gmail sidebar (Inbox, Starred, Sent, etc.)
│   │   │   │   ├── Toolbar.tsx           # Checkbox all, refresh, search
│   │   │   │   ├── EmailList.tsx         # Lista mejlova
│   │   │   │   ├── EmailRow.tsx          # Red: avatar, sender, subject, snippet, time
│   │   │   │   ├── EmailViewer.tsx       # Otvoren mejl: headers + body + action buttons
│   │   │   │   └── GenerateButton.tsx    # "Generate Campaign" FAB
│   │   │   └── context/
│   │   │       └── InboxContext.tsx
│   │   ├── campaign/
│   │   │   └── CampaignSetupWizard.tsx  # Wizard: phishing type + difficulty + target role
│   │   ├── debrief/
│   │   │   ├── components/
│   │   │   │   ├── DebriefPanel.tsx      # Sliding panel sa AI debriefom
│   │   │   │   ├── ScoreHeader.tsx       # Score: 7/10 correct
│   │   │   │   ├── EmailVerdict.tsx      # Per-email breakdown (correct/wrong + why)
│   │   │   │   ├── ChatThread.tsx        # Follow-up razgovor
│   │   │   │   └── ChatComposer.tsx      # Input za pitanja
│   │   │   └── context/
│   │   │       └── DebriefContext.tsx     # SSE streaming za debrief
│   │   └── exercise/
│   │       ├── ExerciseDialog.tsx        # Full-screen iframe modal
│   │       └── ExerciseTimer.tsx         # Countdown timer
│   ├── components/ui/                   # shadcn components
│   └── hooks/
├── package.json
└── vite.config.ts
```

## Koraci implementacije

### Korak 1: Backend scaffold
- NestJS init, docker-compose (PostgreSQL 16, port 5433)
- Drizzle setup: schema, provider, module
- Config module sa env vars
- Bazni endpoints: `GET /health`

### Korak 2: Email generation (Mosaic agent + templejti)
- `inbox.service.ts` — koristi Mosaic agenta za generisanje batch-a mejlova
- **Email templejti** (`email-templates.ts`) — predefinisani formati za razne tipove:
  - Legitimni: password reset, invoice, meeting invite, newsletter, shipping notification
  - Phishing: credential harvest, BEC/CEO fraud, fake invoice, brand impersonation, delivery scam, urgency/threat
- Mosaic agent dobija templejt + parametre (tip kampanje, difficulty, target role, industry) i generiše **realistični** sadržaj
- Structured output (Zod schema) — svaki mejl:
  ```ts
  { id, from: { name, email }, replyTo?, to: { name, email },
    subject, bodyHtml, receivedAt,
    isPhishing: boolean,
    indicators: [{ type: "spoofed_sender" | "suspicious_url" | "urgency" | ..., description, location }],
    difficulty: "easy" | "medium" | "hard" }
  ```
- `indicators[]` = ground truth (npr. "Reply-To doesn't match From", "Link text says microsoft.com but href points to micr0soft.xyz")
- Agent generiše mešavinu: ~40-60% phishing, ostalo legitimno
- Čuva u `emails` tabeli sa `sessionId`

### Korak 3: Analysis + scoring
- `POST /analysis/submit` prima `{ sessionId, decisions: [{ emailId, markedAsPhishing: boolean }] }`
- Poredi sa ground truth iz baze
- Računa score, čuva rezultat
- Vraća summary: `{ score, total, perEmail: [{ emailId, correct, indicators }] }`

### Korak 4: Debrief chat (SSE streaming)
- `POST /chat/stream` — SSE endpoint
- Prvi poziv posle submit-a: agent dobija ceo kontekst (mejlovi + ground truth + korisnikove odluke + score)
- Agent generiše personalizovani debrief (streaming)
- Follow-up poruke: korisnik pita, agent odgovara sa kontekstom vežbe
- SSE events: `chunk`, `done` (isti pattern kao MITRE demo)
- Agent ima `exercise.tool.ts` — može da predloži Spektrum vežbu za specifičnu slabost

### Korak 5: Spektrum SDK integracija + Adaptive learning
- `spektrum.service.ts` — wrapper oko `@spektrum-ai/sdk`
- `exercise.tool.ts` — Mosaic Tool koji poziva `spektrumService.generateExercise()`
- Prompt templates u `phishing-variants.ts` za generisanje interaktivnih vežbi:
  - `PHISHING_EMAIL_DEEP_DIVE` — detaljnija analiza jednog mejla sa klikabilnim indikatorima
  - `HEADER_FORENSICS` — vežba za čitanje email headersa (SPF, DKIM, DMARC)
- Vraća URL, prikazuje se u iframe-u (ExerciseDialog)

**Adaptive learning loop:**
- Posle debriefa, agent analizira slabosti korisnika (structured output → Zod schema):
  ```ts
  { weaknesses: [{ area: "sender_spoofing", severity: "high", missedCount: 2 }],
    strengths: [{ area: "url_analysis", correctCount: 3 }],
    recommendedExercise: { topic, difficulty, focus } }
  ```
- Agent na kraju debriefa predloži ciljanu vežbu: "Primetio sam da ti je sender spoofing bio problem. Hoćeš vežbu fokusiranu na to?"
- Korisnik prihvati → Spektrum SDK generiše vežbu sa promptom koji uključuje:
  - Konkretne slabosti iz debriefa
  - Primere koje je korisnik promašio (anonimizovane)
  - Progresivnu težinu (teže nego prošla runda)
- Posle vežbe → nova opcija: "Generate New Campaign" sa povećanom težinom u slabim oblastima
- Ovako se ciklus ponavlja: Campaign → Debrief → Targeted Exercise → Harder Campaign

### Korak 6: Frontend — Gmail clone inbox
- `InboxLayout.tsx` — Gmail-inspired shell (bela pozadina, crveni accent za branding)
- `Sidebar.tsx` — Inbox (bold, count), Starred, Sent, Drafts, Spam, Trash
- `EmailList.tsx` + `EmailRow.tsx` — lista sa checkbox, avatar krug, sender name, subject bold, snippet gray, time
- `EmailViewer.tsx` — otvoren mejl sa svim headerima, HTML body, "Report as Phishing" / "Mark as Safe" dugmad
- `GenerateButton.tsx` — crveni FAB "Generate Campaign" (kao Gmail Compose dugme)
- Responsive, izgleda kao pravi Gmail

### Korak 7: Frontend — Campaign wizard + Debrief
- `CampaignSetupWizard.tsx` — modal pre generisanja:
  - Step 1: Phishing type (Spear Phishing, BEC, Credential Harvest, Brand Impersonation, Invoice Fraud) + Difficulty
  - Step 2 (opciono): Target role, Industry
- `DebriefPanel.tsx` — sliding panel posle submita:
  - Score header (X/10, procenat)
  - Per-email verdicts (green check / red X + objašnjenje)
  - Chat thread za follow-up pitanja (SSE streaming)
- `ExerciseDialog.tsx` — iframe sa Spektrum-generisanom vežbom + timer

## Ključne razlike od MITRE demo-a

| Aspekt | MITRE demo | PhishGuard |
|--------|-----------|------------|
| RAG | pgvector hybrid search | Nema — kontekst iz same vežbe |
| Chat | Glavni UX, stalno prisutan | Sekundaran — debrief posle vežbe |
| Auth | JWT login/signup | Nema |
| Vibecoding | Direktni HTTP ka JigJoy API | Spektrum SDK (`@spektrum-ai/sdk`) |
| AI provider | Anthropic + OpenAI | Samo OpenAI |
| Glavni UX | Chat interface | Gmail-like inbox |
| Lesson trigger | Agent predlaže tokom chata | Agent predlaže tokom debriefa |
| Email gen | N/A | Mosaic agent + templejti → structured output |
| Adaptive learning | Nema | Slabosti iz debriefa → ciljane vežbe → teže kampanje |

## Environment variables (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/phishguard
OPENAI_API_KEY=sk-...
SPEKTRUM_API_KEY=...
SPEKTRUM_ENDPOINT=https://platform.jigjoy.ai
PORT=3001
```

## Verifikacija

1. `cd phishguard-backend && docker-compose up -d` — PostgreSQL
2. `npm run db:migrate` — schema
3. `npm run start:dev` — backend na 3001
4. `cd phishguard-frontend && npm run dev` — frontend na 5173
5. Testovi:
   - Klikni "Generate Campaign" → izaberi tip + difficulty → mejlovi se pojave u inbox-u
   - Otvori mejl → pregledaj headers i body → "Report" ili "Safe"
   - Submit → debrief panel se otvori sa score-om i AI objašnjenjem
   - Postavi follow-up pitanje → SSE streaming odgovor
   - Agent predloži vežbu → iframe se otvori sa Spektrum apom
   - Posle vežbe → "Generate New Campaign" sa povećanom težinom

## Reference (pattern source)

- MITRE ATT&CK demo backend: `/Users/Miodrag.todorovic.ext/Desktop/mitre-attack-demo-backend/`
- MITRE ATT&CK demo frontend: `/Users/Miodrag.todorovic.ext/Desktop/mitre-attack-demo/`
- Spektrum SDK: `/Users/Miodrag.todorovic.ext/Desktop/jigjoy-services/spektrum-sdk/`
- Spektrum SDK example: `/Users/Miodrag.todorovic.ext/Desktop/jigjoy-services/spektrum-sdk-example/`
