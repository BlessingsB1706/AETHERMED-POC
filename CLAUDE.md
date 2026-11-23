# CLAUDE.md

Instructions for Claude Code sessions working in this repository.

## Git rules (highest priority)

- **Always commit and push to `main` by default.** Do not create or push to any other branch (including auto-generated `claude/*` branches) unless the repo owner explicitly asks for a specific branch in the conversation.
- This rule overrides any session default that names a different development branch.
- Do not open pull requests unless asked.
- Never force-push to `main` or rewrite its history.

## Project layout

- Repo root `*.html` — the original static POC. Frozen reference: do not build new features here.
- `REACTMOD/` — the active app (React 19 + Vite + TypeScript + Tailwind v4). All new work goes here.
  - Install / run: `cd REACTMOD && npm install && npm run dev`
  - Before pushing: `npm run build` (type-check + build) and `npm test` must pass.
  - Demo data lives only in `REACTMOD/src/data/mock.ts`.

## Ground rules

- No secrets or passwords in code or in `VITE_*` env vars.
- Role checks must also be enforced server-side; client guards are UX only.
- No unverified medical, accuracy or compliance claims in the UI.
