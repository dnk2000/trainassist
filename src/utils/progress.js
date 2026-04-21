import { getScheduledWorkoutCode } from './trainingPlan';

function parseLocalDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isRestDate(date) {
  return getScheduledWorkoutCode(date) === 'rest';
}

function areWorkoutDatesConsecutive(previousDateString, currentDateString) {
  const previousDate = parseLocalDate(previousDateString);
  const currentDate = parseLocalDate(currentDateString);
  const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return true;
  }

  if (diffDays < 1) {
    return false;
  }

  for (let dayOffset = 1; dayOffset < diffDays; dayOffset += 1) {
    if (!isRestDate(addDays(previousDate, dayOffset))) {
      return false;
    }
  }

  return true;
}

export function getWorkoutProgressSummary(history) {
  const totalDays = history.length;
  const totalCompleted = history.reduce(
    (sum, session) => sum + (session.exercises?.length ?? 0),
    0,
  );
  const latestSession = history[0] ?? null;
  const latestWeight =
    history.find((session) => session.current_weight !== null && session.current_weight !== undefined)
      ?.current_weight ?? null;
  const uniqueWorkoutDates = [...new Set(history.map((session) => session.workout_date))].sort(
    (left, right) => left.localeCompare(right),
  );

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  for (const workoutDate of uniqueWorkoutDates) {
    if (!previousDate) {
      runningStreak = 1;
    } else {
      runningStreak = areWorkoutDatesConsecutive(previousDate, workoutDate)
        ? runningStreak + 1
        : 1;
    }

    bestStreak = Math.max(bestStreak, runningStreak);
    previousDate = workoutDate;
  }

  let currentStreak = 0;

  for (let index = uniqueWorkoutDates.length - 1; index >= 0; index -= 1) {
    const workoutDate = uniqueWorkoutDates[index];

    if (index === uniqueWorkoutDates.length - 1) {
      currentStreak = 1;
      continue;
    }

    if (areWorkoutDatesConsecutive(workoutDate, uniqueWorkoutDates[index + 1])) {
      currentStreak += 1;
      continue;
    }

    break;
  }

  return {
    totalDays,
    totalCompleted,
    latestSessionDate: latestSession?.workout_date ?? null,
    latestWeight,
    currentStreak,
    bestStreak,
  };
}
