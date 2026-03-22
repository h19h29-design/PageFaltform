# YSplan GitHub Handoff

## Repo

- Remote repo: `https://github.com/h19h29-design/homepage`
- Working branch: `main`
- Local root: `C:\gpt\01project\YSplan`

## What I handled

- Connected the local repository to the GitHub remote.
- Prepared the repository for first push.
- Ignored local-only runtime files:
  - `.turbo/`
  - `output/`
  - `.codex-dev.*`
  - `.env*` local overrides
  - `apps/web/data/local-platform-auth.json`
- Kept testable demo content and family data in the repo so another computer can continue from the same product state.
- Left the project in a state where local testing can continue from the current family platform build.

## Current local test baseline

- Main: `http://127.0.0.1:3001/`
- Sign up: `http://127.0.0.1:3001/sign-up`
- Sign in: `http://127.0.0.1:3001/sign-in`
- Console sign-in: `http://127.0.0.1:3001/console/sign-in`
- Family entry: `http://127.0.0.1:3001/f/yoon`
- Family password: `yoon1234`
- Console account: `owner@yoon.local / demo-owner`

## Boards ready to test in `yoon`

- Announcements: `/app/yoon/announcements`
- Calendar: `/app/yoon/calendar`
- Todo: `/app/yoon/todo`
- School Timetable: `/app/yoon/school-timetable`
- Progress: `/app/yoon/progress`
- Also available: posts, gallery, diary, day-planner, habits

## Continue on another computer

```powershell
git clone https://github.com/h19h29-design/homepage.git
cd homepage
npm install
npm run build
```

Development mode:

```powershell
npm run dev:lan
```

Built app mode:

```powershell
node node_modules\next\dist\bin\next start --hostname 0.0.0.0 --port 3001
```

Open:

- `http://127.0.0.1:3001`
- or your LAN IP with port `3001`

## Recommended next workflow

1. Pull latest from `main`.
2. Run `npm install`.
3. Start the web app.
4. Test the `yoon` family flow first.
5. Continue feature work from `apps/web`, `packages/modules/*`, and `packages/database`.

## Obsidian command-line friendly note flow

This PC does not have a standard `obsidian` executable on PATH, so the safest Windows flow is:

1. Copy this file into your Obsidian vault.
2. Open it through Obsidian URI.

Example PowerShell:

```powershell
$vaultPath = "C:\Users\YOUR_USER\Documents\ObsidianVault\YSplan"
New-Item -ItemType Directory -Force -Path $vaultPath | Out-Null
Copy-Item ".\docs\GITHUB-HANDOFF-2026-03-22.md" "$vaultPath\GITHUB-HANDOFF-2026-03-22.md" -Force
Start-Process "obsidian://open?vault=ObsidianVault&file=YSplan%2FGITHUB-HANDOFF-2026-03-22"
```

If your vault name or folder is different, replace:

- `ObsidianVault`
- `C:\Users\YOUR_USER\Documents\ObsidianVault`

## Useful commands

```powershell
git pull origin main
npm install
npm run lint
npm run typecheck
npm run build
```

## Notes

- If you add a real `DATABASE_URL`, DB-backed flows can be turned on without changing the GitHub handoff structure.
- Local sign-up accounts are intentionally not committed.
- Demo/test content and family workspace data are committed so the app stays easy to test after cloning.
