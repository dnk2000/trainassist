import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WeightChart from '../components/WeightChart';
import { useAuth } from '../hooks/useAuth';
import { getWorkoutProgressSessions } from '../services/api';
import { getTodayDateString } from '../utils/date';
import { getWorkoutProgressSummary } from '../utils/progress';
import { getScheduledWorkoutCode, getWorkoutByCode } from '../utils/trainingPlan';

function getLocalDateString(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function getWeekDays(today) {
  const startOfWeek = new Date(today);
  const dayIndex = startOfWeek.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
  startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);

    return {
      date,
      dateString: getLocalDateString(date),
      dayNumber: date.getDate(),
      dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
    };
  });
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function DashboardPage() {
  const { user } = useAuth();
  const [progressSessions, setProgressSessions] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState('');
  const todayDate = getTodayDateString();
  const today = new Date(`${todayDate}T00:00:00`);
  const weekDays = useMemo(() => getWeekDays(new Date(`${todayDate}T00:00:00`)), [todayDate]);
  const workoutCode = getScheduledWorkoutCode(today);
  const workout = getWorkoutByCode(workoutCode, today);
  const firstName = user?.user_metadata?.first_name;
  const greetingName = firstName || 'there';
  const todayTitle = formatFullDate(today);
  const todaySummary = workout?.isRestDay
    ? 'You have a recovery day.'
    : `Your today's workout is ${workout?.workoutName ?? 'not scheduled'}.`;
  const progressSummary = useMemo(
    () => getWorkoutProgressSummary(progressSessions),
    [progressSessions],
  );
  const weightPoints = useMemo(
    () =>
      [...progressSessions]
        .filter(
          (session) =>
            session.current_weight !== null && session.current_weight !== undefined,
        )
        .sort((left, right) => left.workout_date.localeCompare(right.workout_date))
        .map((session) => ({
          date: session.workout_date,
          weight: Number(session.current_weight),
        })),
    [progressSessions],
  );
  const completedWorkoutDates = useMemo(
    () => new Set(progressSessions.map((session) => session.workout_date)),
    [progressSessions],
  );
  const completedToday = progressSessions.some((session) => session.workout_date === todayDate);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const sessions = await getWorkoutProgressSessions(user.id);

        if (active) {
          setProgressSessions(sessions);
          setProgressError('');
        }
      } catch (loadError) {
        if (active) {
          setProgressError(loadError.message);
        }
      } finally {
        if (active) {
          setProgressLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">Hi, {greetingName}</h2>
        <p className="mt-1 text-sm text-slate-500">Let&apos;s check your activity</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((weekDay) => {
          const isToday = weekDay.dateString === todayDate;
          const hasWorkout = completedWorkoutDates.has(weekDay.dateString);

          return (
            <div
              key={weekDay.dateString}
              className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl px-1 pb-2 pt-3 ${
                isToday ? 'bg-slate-950 text-white' : 'bg-slate-200/90 text-slate-700'
              }`}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className="text-xl font-normal leading-none">{weekDay.dayNumber}</span>
              <span
                className={`mt-1 text-xs font-normal ${
                  isToday ? 'text-white/65' : 'text-slate-400'
                }`}
              >
                {weekDay.dayName}
              </span>
              <span
                className={`mt-2 h-1.5 w-1.5 rounded-full ${
                  hasWorkout ? (isToday ? 'bg-white' : 'bg-slate-950') : 'bg-transparent'
                }`}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Today
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {completedToday ? 'Done for today' : todaySummary}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {completedToday
                ? 'You nailed it. Nice work showing up today.'
                : todayTitle}
            </p>
          </div>
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              completedToday ? 'bg-emerald-400 text-emerald-950' : 'bg-slate-950 text-white'
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              {completedToday ? (
                <path d="m5 12 5 5L20 7" />
              ) : (
                <>
                  <path d="M6 12h12" />
                  <path d="M6 8v8" />
                  <path d="M18 8v8" />
                  <path d="M3 10v4" />
                  <path d="M21 10v4" />
                </>
              )}
            </svg>
          </div>
        </div>

        {completedToday ? (
          <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Rest, recover, and keep the streak alive.
          </p>
        ) : (
          <Link
            to="/workout"
            className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800"
          >
            Start workout
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current streak</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {progressLoading ? '...' : `${progressSummary.currentStreak} days`}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest weight</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {progressLoading
              ? '...'
              : progressSummary.latestWeight !== null
                ? `${progressSummary.latestWeight} kg`
                : 'No data'}
          </p>
        </div>
      </div>

      {progressError ? (
        <p className="text-sm text-rose-700">Could not load progress: {progressError}</p>
      ) : null}

      {!progressLoading && !progressError && weightPoints.length ? (
        <WeightChart points={weightPoints} />
      ) : null}
    </section>
  );
}

export default DashboardPage;
