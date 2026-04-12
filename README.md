# TrainAssist

Mobile-first workout tracking app built with React, Vite, Tailwind CSS, and Supabase.
The home screen now reads your daily workout from [`training-plan.json`](training-plan.json), shows the sections for the current weekday, and saves the completed plan items with your weight.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Generate the optional exercise video seed file from your current plan:

```bash
npm run plan:seed
```

6. Run [`supabase/schema.sql`](supabase/schema.sql) in Supabase, then run [`supabase/training-plan-seed.sql`](supabase/training-plan-seed.sql) to create the exercise video library rows used for optional YouTube links.

See [`docs/setup.md`](docs/setup.md) for full setup and GitHub Pages deployment instructions.
