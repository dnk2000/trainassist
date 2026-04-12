export function getTodayDateString() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function formatWorkoutDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

export function humanizeDayName(dayName) {
  if (!dayName) {
    return 'Today';
  }

  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}
