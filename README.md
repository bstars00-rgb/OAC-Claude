# OAC — Ohmyhotel AI CRM

> **Search the name. OAC finds the context, summarizes the status, and prepares the next action.**
> 검색만 하세요. 분류와 정리는 OAC가 합니다.

A clickable, executive-demo-quality prototype of **OAC (Ohmyhotel AI CRM)** — a
context-based AI Sales CRM for every business relationship.

## Short description

OAC is not a traditional, input-heavy CRM. It is an **AI workspace** that already
understands your business relationships from connected data. You never classify an account
or pick an "account type" — you search a name (or ask a question), and OAC detects the
business context automatically, summarizes the status, and prepares the next best action.

It works across channel partners, hotels, corporate clients, travel agencies, DMCs,
technology / API partners, activity suppliers, and strategic partners — all in one place.

## Prototype purpose

This repository exists to **validate the concept internally before real development begins**.
It demonstrates the product vision, the "OAC Detected Context" experience, and the
AI-driven workflows (Ask OAC, Relationship 360, Meeting Recorder, Email Assistant, Report
Generator, Data Insight) using realistic mock data — so stakeholders can experience the
product end-to-end without any backend.

## ⚠️ Demo limitations (important)

**This is a no-backend prototype using mock data.**
**Real Outlook, Teams, Excel, and internal DB integrations are NOT included in this version.**
They are represented as **demo integrations** for concept validation. Specifically, there is:

- No backend, database, login, or authentication
- No Microsoft Graph API, real Outlook / Teams / Excel / SharePoint integration
- No real internal DB connection, email sending, or Teams posting
- No real audio transcription in the Meeting Recorder

Every integration action (Send via Outlook Demo, Post to Teams Demo, Export to Word Demo,
Export Excel Demo, Save to Timeline Demo, Create Task Demo, Mark as Sent Demo) is a **demo
action** that shows a toast:
*"This is a prototype demo action. Real integration will be added in the development phase."*

All data lives in local TypeScript files under `src/data/`.

## OAC Assistant — the chat-based AI CRM

**OAC Assistant** unifies "Ask OAC" and "AI Capture" into one conversational workspace. You
chat freely — ask a question, paste a work note, or **attach an image or document** — and OAC:

- **Answers** questions about any relationship, grounded in the CRM data.
- **Summarizes** uploaded images (vision) and documents (PDF / text).
- **Structures** your notes into **Account · Timeline · To Do · Risk**, auto-saved to a
  persistent **CRM Workspace** (localStorage) that aggregates accounts, open to-dos and risks.
- **Generates** one-click report and email drafts from the structured record.

It covers **every** business relationship — customer, supplier, partner, project, recruiting,
legal, operations — with the category and context auto-detected (you never classify). Bilingual
(English / 한국어), dark-mode aware.

### Demo vs. Live AI

- **Demo mode (default):** a deterministic mock engine using local data — works fully offline,
  no API key. This is the concept-validation default.
- **Live AI mode (optional):** in **Settings** you can enter your **own Anthropic API key** and
  pick a model (Opus 4.8 / Sonnet 4.6 / Haiku 4.5). OAC then calls the real Claude API directly
  from the browser — real answers, real image/PDF understanding, real structuring.
  ⚠️ The key is stored **only in your browser** and sent directly to Anthropic
  (`anthropic-dangerous-direct-browser-access`). Use a **personal** key for this prototype —
  never a shared/production key. This is a no-backend convenience for the demo, not a secure
  production pattern.

## Pages

1. **Dashboard** — "Today's AI Briefing": priority relationships, open follow-ups, recent
   meetings, draft emails, contexts needing attention, AI recommended actions.
2. **OAC Assistant** — unified chat: ask, upload images/documents, and get auto-structured
   Account / Timeline / To Do / Risk / Report. Demo or real Claude API.
3. **Relationship 360** — one relationship brain with Overview, Timeline, Communication,
   Tasks, Data, and AI Recommendation tabs.
4. **Meeting Recorder** — paste notes (or "upload" a recording); OAC produces a summary,
   key points, decisions, issues, risks, follow-up tasks, an email draft and a CEO briefing.
5. **Email Assistant** — context-aware email drafting with purpose, tone and language controls.
6. **Report Generator** — CEO briefings, status reports, issue reports and more, with audience,
   language and detail-level controls (incl. a Korean Yeogi/iTANK CEO briefing example).
7. **Data Insight** — interprets booking/operational data into AI-powered strategy.
8. **Integrations** — demo connection status and the future integration roadmap.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router v6**
- Local mock data in TypeScript (`src/data/`) — **no backend**

## How to run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## How to build

```bash
npm run build    # type-checks (tsc -b) and builds to dist/
npm run preview  # preview the production build locally
```

## How to deploy to Vercel

No backend configuration required — Vercel auto-detects Vite. `vercel.json` includes a
SPA rewrite so client-side routes (e.g. `/relationship/dida`) resolve correctly.

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Steps: push this repo to GitHub → import the project in Vercel → deploy.

## Future development roadmap

- **Phase 1 — Demo MVP (this prototype):** local mock data, manual meeting notes, simulated
  Outlook / Teams / Excel connections, AI-generated summaries and drafts.
- **Phase 2 — Internal Pilot:** Supabase database, Excel upload, manual email import, timeline
  saving, task management.
- **Phase 3 — Real Enterprise Integration:** Microsoft Graph API, Outlook email read/send,
  Teams channel posting, SharePoint / Excel sync, internal DB connection, role-based access
  control.

## Project structure

```
src/
  components/   Layout, Sidebar, Topbar, Card, Badge, Button, Timeline,
                SearchBar, EntitySelector, ContextBadge, InsightBox,
                ActionList, MetricCard, DemoChart, Toast
  pages/        Dashboard, AskOAC, Relationship360, MeetingRecorder,
                EmailAssistant, ReportGenerator, DataInsight, Integrations
  data/         entities, meetings, emails, teamsMessages, tasks,
                reports, salesData, insights
  utils/        mockAI, format, contextDetection
  App.tsx, main.tsx
```
