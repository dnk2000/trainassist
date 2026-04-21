# NoDobraFit

NoDobraFit is a mobile-first workout tracker built with React, Vite, Tailwind CSS, and Supabase.
It uses your local [`training-plan.json`](training-plan.json) as the source of truth for the workout program, shows the correct workout for the current day by default, lets you switch to other workout tabs, watch exercise videos, save completed items with your current weight, and review or delete history by day.

## Features

- Mobile-first workout UI with large tap targets and sticky save action
- Daily workout selection based on [`training-plan.json`](training-plan.json)
- Manual workout tabs for `A`, `B`, `C`, `Light`, and `Rest`
- Exercise video previews from YouTube
- Saved workout sessions with:
  - completed items
  - workout code and name
  - current weight
- History page with:
  - summary stats
  - date-grouped sessions
  - per-day delete with confirmation
- Supabase Auth using email/password or magic link
- PWA-friendly icons and iOS home screen assets
- GitHub Pages deployment support

## Tech Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Routing: React Router
- Backend/Auth/DB: Supabase
- Hosting: GitHub Pages

## Project Structure

```text
src/
  components/
  hooks/
  pages/
  services/
  utils/
public/
  icons/
supabase/
docs/
training-plan.json
```

## How It Works

### Training plan

[`training-plan.json`](training-plan.json) controls:

- weekly schedule
- workout groups
- sections
- exercise instructions
- warm-up structure

The app reads that file at build time and uses it to render the correct workout for the current day.

### Exercise videos

The Supabase `exercises` table is used as an optional video library keyed by exercise title.
The plan can render even if a video is missing, but if a matching `youtube_url` exists in `exercises`, the app will show a preview and open the embed modal.

### Saved sessions

Each saved workout session stores:

- `workout_date`
- `current_weight`
- `workout_code`
- `workout_name`
- the list of completed items for that day

Saving again on the same date replaces that day’s saved selection.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Only use the Supabase anon key in the frontend.
Do not expose the service role key.

### 3. Create a Supabase project

In Supabase:

1. Create a new project
2. Open `SQL Editor`
3. Run [supabase/schema.sql](supabase/schema.sql)
4. Run [supabase/training-plan-seed.sql](supabase/training-plan-seed.sql)
5. Optionally run [supabase/training-plan-video-updates.sql](supabase/training-plan-video-updates.sql)
6. Enable email/password and/or magic link auth in `Authentication`

If you update the plan file and want to regenerate the exercise list:

```bash
npm run plan:seed
```

That rebuilds [supabase/training-plan-seed.sql](supabase/training-plan-seed.sql) from [`training-plan.json`](training-plan.json).

### 4. Start the app

```bash
npm run dev
```

### 5. Build locally

```bash
npm run build
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run plan:seed
npm run deploy
```

## Supabase Files

- [supabase/schema.sql](supabase/schema.sql)
  Database schema, RLS policies, indexes, and starter setup

- [supabase/training-plan-seed.sql](supabase/training-plan-seed.sql)
  Generated exercise seed rows based on [`training-plan.json`](training-plan.json)

- [supabase/training-plan-video-updates.sql](supabase/training-plan-video-updates.sql)
  Recommended YouTube URLs for the exercise library

## Date Format

The app uses a shared date format:

```text
Mon, April 13
```

This is used across history and confirmation UI.

## PWA / App Icons

The repo includes:

- favicon assets
- Apple touch icons
- maskable PWA icons
- [public/site.webmanifest](public/site.webmanifest)

Main icon files:

- [public/favicon.ico](public/favicon.ico)
- [public/apple-touch-icon.png](public/apple-touch-icon.png)
- [public/icons/icon-192.png](public/icons/icon-192.png)
- [public/icons/icon-512.png](public/icons/icon-512.png)

## Deploy to GitHub Pages

The app is configured to deploy a static frontend using `gh-pages`.

### 1. Check the Vite base path

[`vite.config.js`](vite.config.js) currently uses:

```js
base: '/trainassist/'
```

If your GitHub repo name is different, update that before deploying.

### 2. Deploy

```bash
npm run build
npm run deploy
```

This publishes `dist/` to the `gh-pages` branch.

### 3. Configure Pages in GitHub

In your GitHub repository:

1. Open `Settings`
2. Open `Pages`
3. Set `Source` to `Deploy from a branch`
4. Select `gh-pages`
5. Select `/ (root)`

Your app will be available at:

```text
https://YOUR_GITHUB_USERNAME.github.io/trainassist/
```

### GitHub secrets

You do not need GitHub secrets if you deploy from your own machine with `npm run deploy`.

If you later switch to GitHub Actions, you can add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

in:

`GitHub repo -> Settings -> Secrets and variables -> Actions`

## Security Notes

- Supabase anon key is expected to be public in a frontend app
- Safety depends on correct Row Level Security policies
- Never expose:
  - Supabase service role key
  - database passwords
  - admin secrets

This project already uses RLS and user-scoped access for workout history.

## User Flow

1. Sign in with email/password or magic link
2. Open the workout tab
3. The correct workout tab for today is selected automatically
4. Check completed items
5. Enter or confirm your current weight
6. Save the session
7. Review progress in History
8. Delete a saved day if needed

## Notes

- The app uses `HashRouter`, which works well on GitHub Pages
- Changing `.env` values requires rebuilding before redeploying
- Some plan items may not have videos until you add or update `youtube_url` values in Supabase
- The finisher rows can fall back to the first matching option video when multiple exercise choices are combined in the plan

## Documentation

For the step-by-step setup guide, see [docs/setup.md](docs/setup.md).
