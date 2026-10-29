/**
 * Date & Streak Utilities
 * Designed to match industry standards (Duolingo / Strava) with local timezone resilience,
 * morning grace periods, and correct streak rollover logic.
 */

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone
 */
export const getTodayString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Returns yesterday's date formatted as YYYY-MM-DD in the user's local timezone
 */
export const getYesterdayString = (date = new Date()): string => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayString(yesterday);
};

/**
 * Extracts a normalized YYYY-MM-DD string from any Date instance or ISO string
 */
export const normalizeToLocalDateString = (rawDate: string | Date): string => {
  const d = typeof rawDate === "string" ? new Date(rawDate) : rawDate;
  if (isNaN(d.getTime())) return "";
  return getTodayString(d);
};

/**
 * Calculates current active streak from check-in history.
 * 
 * Rules:
 * 1. If checked in TODAY: Streak is active and includes today.
 * 2. If checked in YESTERDAY (but not yet today): Streak is STILL ACTIVE (pending today's check-in).
 * 3. If last check-in was BEFORE yesterday: Streak is broken (returns 0).
 */
export const calculateCalendarStreak = (
  history: { date: string }[],
): number => {
  if (!history || !history.length) return 0;

  // Extract and normalize unique check-in days
  const uniqueDaysSet = new Set<string>();
  for (const h of history) {
    const normalized = normalizeToLocalDateString(h.date);
    if (normalized) uniqueDaysSet.add(normalized);
  }

  const sortedDays = Array.from(uniqueDaysSet).sort();
  if (sortedDays.length === 0) return 0;

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();
  const lastCheckIn = sortedDays[sortedDays.length - 1];

  // If last check-in was neither today nor yesterday, streak has broken
  if (lastCheckIn !== todayStr && lastCheckIn !== yesterdayStr) {
    return 0;
  }

  // Count backwards to calculate consecutive consecutive active days
  let streak = 0;
  let expectedDate = new Date(lastCheckIn + "T00:00:00");

  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const dayDate = new Date(sortedDays[i] + "T00:00:00");
    const diffDays = Math.round(
      (expectedDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      streak++;
      // Set expected previous day
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break; // Gap detected
    }
  }

  return streak;
};

/**
 * Increments or updates streak on new check-in
 */
export const calculateStreak = (
  lastCheckIn: string | null,
  currentStreak: number,
): number => {
  if (!lastCheckIn) return 1;

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();
  const lastCheckInStr = normalizeToLocalDateString(lastCheckIn);

  if (lastCheckInStr === todayStr) {
    // Already checked in today: preserve existing streak
    return Math.max(1, currentStreak);
  }

  if (lastCheckInStr === yesterdayStr) {
    // Consecutive check-in from yesterday: advance streak
    return Math.max(0, currentStreak) + 1;
  }

  // Missed days: start fresh streak today
  return 1;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add empty days for alignment
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0));
  }

  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};
