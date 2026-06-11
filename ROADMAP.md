# OAC — Ohmyhotel AI CRM · Roadmap & Spec

> Context-based AI sales & relationship CRM. **"이름만 검색하세요. 분류와 정리는 OAC가 합니다."**
> Live: https://bstars00-rgb.github.io/OAC-Claude/

## 1. Architecture (no-backend, bring-your-own-credentials)

- **Stack**: React 18 + TypeScript + Vite 5 + Tailwind v4. Deployed to GitHub Pages via GitHub Actions (test → build → deploy).
- **No server**: all state in the browser (`localStorage`), all external calls go **direct from the browser** with the user's own keys.
- **Cloud sync (optional)**: the user's own Supabase project (auth + one JSONB row per user, RLS-protected).
- **State / storage keys**: `oac-captures-v1` (relationships & notes), `oac-datasets-v1` (RawData snapshots), `oac-chat-v1` (assistant log), `oac-insights-v1`, `oac-ai-settings-v1` (mode/model/keys/signature — **keys never leave the browser, excluded from backup/cloud**), `oac-recent-rel-v1`, theme/lang, `oac-fs` (IndexedDB folder handle).

## 2. Features built

| Area | Status |
|---|---|
| **OAC Assistant** | Real Claude **and** ChatGPT (model picker routes by provider). OAC ↔ ChatGPT persona toggle. Full conversation auto-logged & persisted. Image/PDF/text upload. Inline email/report/data-chart cards. |
| **Relationship 360** | Search-first hub + recent searches. All tabs run on **real data** (captures, synced mail, imported metrics). |
| **Data Insight** | **AI Insight board** (ask → interpreted insight + chart). Trends (WoW/MoM), dimension breakdown (hotel/seller/vendor/country), entity+period queries ("아고다 4월 매출" → number + chart). |
| **RawData import** (Settings) | Local file pick · **Local folder connect** (File System Access, no MS permission) · OneDrive/SharePoint browse & auto-import · Ohmyhotel preset auto-mapping · Check-Out split into monthly snapshots · multi-dimension aggregation. |
| **Microsoft 365** | Outlook **read (inbox + Sent)** + Teams sync (7-day, grouped by company), drafted-email **send (Mail.Send)**, OneDrive Files — all BYO Azure SPA app, incremental scopes. |
| **Cloud sync** | Supabase email magic-link; pull-on-empty-login, debounced auto-push with **conflict guard** (don't clobber newer cloud). |
| **Backup / Restore** | Export/import a single JSON (secrets stripped); same data powers cloud sync. |
| **i18n + dark mode** | Korean / English, class-based dark mode. |
| **Quality** | 64 unit tests, typecheck + CI gate, security/correctness/UX audit done. |

## 3. Integration status

- ✅ **Real, working** (with the user's creds): Claude/ChatGPT, Outlook/Teams read+send, OneDrive/local-folder import, Supabase cloud.
- ⏳ **Needs the user's setup**: Azure app + admin consent (`User.Read, Mail.Read, Chat.Read, Mail.Send, Files.Read.All`), OpenAI/Anthropic billing credits, Supabase project + SQL + redirect URL.
- 🔭 **Demo only**: Excel/SharePoint write-back, internal DB (file import works; real-time pending).

## 4. Known limitations

- **localStorage ~5MB ceiling** — many monthly snapshots with multi-dimension data approach it (now: prune-oldest on quota + usage warning). A real DB removes this.
- **Cloud sync is single-user, last-writer with conflict guard** — not full multi-user merge.
- **OAuth/live-AI/Graph paths** can't be auto-tested without live credentials (covered by structure + unit tests).
- **ChatGPT-grade quality requires a paid API key** (ChatGPT Plus ≠ API credit).

## 5. Roadmap (next)

1. **Team sharing & roles (RBAC)** — shared Supabase workspace, member roles (owner/editor/viewer). *(largest next step)*
2. **Ohmyhotel MCP / live DB** — replace file import with a real-time data source behind the same mapping layer.
3. **Outbound completeness** — Teams channel posting, Excel/Word export (client-side), per-company AI mail summary on sync (live).
4. **Insight automation** — auto "this week's key summary" on the dashboard; MoM comparison insights.
5. **Storage scale** — move datasets to Supabase tables (off localStorage) for large multi-year data.

## 6. Dev

- `npm run dev` · `npm test` · `npm run build` (runs `tsc -b` then Vite). CI runs tests before build.
- Deploy: push to `main` → GitHub Actions builds with `GITHUB_PAGES=true` (base `/OAC-Claude/`) and publishes.
