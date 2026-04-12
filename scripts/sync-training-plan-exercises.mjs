import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const inputPath = path.join(rootDir, 'training-plan.json');
const outputPath = path.join(rootDir, 'supabase', 'training-plan-seed.sql');

function collectExercises(plan) {
  const names = new Set();

  for (const exercise of plan.shared_warmup?.exercises ?? []) {
    names.add(exercise.exercise);
  }

  for (const workout of Object.values(plan.workouts ?? {})) {
    for (const section of workout.sections ?? []) {
      for (const exercise of section.exercises ?? []) {
        names.add(exercise.exercise);
      }

      if (Array.isArray(section.exercise_options)) {
        for (const option of section.exercise_options) {
          names.add(option);
        }
      }

      if (section.target_steps_min || section.target_steps_max) {
        names.add('Walking');
      }
    }
  }

  for (const routineItem of plan.program_rules?.workday_break_rule?.routine ?? []) {
    names.add(routineItem.exercise);
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}

function escapeSql(value) {
  return value.replaceAll("'", "''");
}

async function main() {
  const rawPlan = await fs.readFile(inputPath, 'utf8');
  const plan = JSON.parse(rawPlan);
  const exercises = collectExercises(plan);

  const sql = `-- Generated from training-plan.json
-- Run this in Supabase after the main schema to seed the exercise video library.

${exercises
  .map(
    (exercise, index) => `insert into public.exercises (title, youtube_url, sort_order, is_active)
select '${escapeSql(exercise)}', null, ${index + 1}, true
where not exists (
  select 1
  from public.exercises
  where lower(title) = lower('${escapeSql(exercise)}')
);
`,
  )
  .join('\n')}`;

  await fs.writeFile(outputPath, sql, 'utf8');
  console.log(`Wrote ${exercises.length} exercise seeds to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
