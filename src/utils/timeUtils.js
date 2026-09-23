// Time utility functions for formatting and target time calculations

export function format12Hour(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatSeconds(totalSecs) {
  if (totalSecs < 0 || isNaN(totalSecs)) totalSecs = 0;
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatCurrentClock(date = new Date()) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
}

export function calculateSecondsUntilTarget(timeStr, targetDay = 'auto', customNow = null) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  const now = customNow || new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    seconds,
    0
  );

  if (targetDay === 'tomorrow') {
    target.setDate(target.getDate() + 1);
  } else if (targetDay === 'today') {
    // Keep today
  } else {
    // 'auto': if target today has already passed by more than 2 minutes, assume next occurrence (tomorrow)
    if (target.getTime() < now.getTime() - 2 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
    }
  }

  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 1000));
}

export function getTargetInfo(timeStr, targetDay = 'auto') {
  if (!timeStr) {
    return {
      diffSecs: 0,
      isTomorrow: false,
      formatted12h: '',
      targetTimeStr: ''
    };
  }

  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    seconds,
    0
  );

  let isTomorrow = false;
  if (targetDay === 'tomorrow') {
    target.setDate(target.getDate() + 1);
    isTomorrow = true;
  } else if (targetDay === 'today') {
    isTomorrow = false;
  } else {
    if (target.getTime() < now.getTime() - 2 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
      isTomorrow = true;
    }
  }

  const diffMs = target.getTime() - now.getTime();
  const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

  return {
    diffSecs,
    isTomorrow,
    formatted12h: format12Hour(timeStr),
    targetTimeStr: timeStr
  };
}

export function getTimeFromNow(additionalMinutes) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + additionalMinutes);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getStoredValue(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}
