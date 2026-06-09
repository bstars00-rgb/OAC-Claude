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

## Chat-based AI CRM (AI Capture)

OAC works like a **chat box that organizes itself into a CRM**. On the **AI Capture** page you
type your work notes freely — about a customer, supplier, partner, project, recruiting, legal,
or operational issue — and OAC automatically structures them into:

- **Account** — detected (or matched to an existing relationship), with an auto-detected
  business context and category (you never classify it)
- **Timeline** — the note becomes a dated timeline event
- **To Do** — action items extracted with priority and due dates (checkable)
- **Risk** — risks/blockers surfaced automatically
- **Report & Email** — one-click AI-generated report and email drafts

Every capture is saved to a persistent **CRM Workspace** (localStorage) that aggregates accounts,
open to-dos and risks. Bilingual (English / 한국어).

## Pages

1. **Dashboard** — "Today's AI Briefing": priority relationships, open follow-ups, recent
   meetings, draft emails, contexts needing attention, AI recommended actions.
2. **AI Capture** — chat-style free-form input → auto-structured Account / Timeline / To Do /
   Risk / Report, saved to a live CRM workspace.
3. **Ask OAC** — conversational CRM. Search a name or ask a question; OAC returns a full
   briefing with a source/context panel. Try *"What should I do next with Klook?"*
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
