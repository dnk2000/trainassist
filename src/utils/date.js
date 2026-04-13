export function getTodayDateString() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function formatWorkoutDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatWarsawTime(dateTimeString) {
  if (!dateTimeString) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Warsaw',
  }).format(new Date(dateTimeString));
}

export function humanizeDayName(dayName) {
  if (!dayName) {
    return 'Today';
  }

  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}
