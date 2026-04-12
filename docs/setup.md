# TrainAssist Setup

## 1. Supabase project

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the SQL from [`supabase/schema.sql`](../supabase/schema.sql).
4. Run the SQL from [`supabase/training-plan-seed.sql`](../supabase/training-plan-seed.sql).
5. In the `exercises` table, optionally add `youtube_url` values for any items where you want a playable video.
6. In Supabase Auth settings, enable either:
   - Email/password sign-in
   - Magic link email sign-in
7. Copy:
   - Project URL
   - Anonymous public API key

## 2. Local environment

Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3. Run locally

If you changed [`training-plan.json`](../training-plan.json), regenerate the exercise seed file first:

```bash
npm run plan:seed
```

```bash
npm install
npm run dev
```

The app starts on the Vite local URL and uses hash-based routing for GitHub Pages compatibility.

## 4. First use

1. Create an account from the auth page or request a magic link.
2. Sign in.
3. Open the workout tab.
4. The app automatically picks today&apos;s workout from [`training-plan.json`](../training-plan.json).
5. Tap exercise cards to view videos when a `youtube_url` exists.
6. Check completed items.
7. Confirm or edit your weight in the sticky bottom input.
8. Tap the sticky save button.
9. Review saved sessions in the History tab.

## 5. GitHub Pages deployment

The app is configured with Vite base path `/trainassist/`, which matches this repository name.

If your repository name is different, update `base` in [`vite.config.js`](../vite.config.js) before deploying.

Deploy steps:

```bash
npm run deploy
```

Then in GitHub:

1. Push the repository to GitHub.
2. Open `Settings` -> `Pages`.
3. Set the source to `Deploy from a branch`.
4. Select the `gh-pages` branch and `/ (root)`.
5. Save.

After GitHub Pages publishes, the site will be available at:

```text
https://YOUR_GITHUB_USERNAME.github.io/trainassist/
```

## 6. Notes

- Row Level Security is enabled in the SQL schema.
- `training-plan.json` is the source of truth for the weekly schedule and section structure.
- The `exercises` table now acts as an optional video library keyed by exercise title.
- Workout sessions and session exercises are scoped to the logged-in user.
- Saving a workout for the same date replaces that day&apos;s selected items and weight.
- If you already ran the older schema, rerun [`supabase/schema.sql`](../supabase/schema.sql) so the migration steps add `workout_code`, `workout_name`, nullable `exercise_id`, and the extra session item columns.
