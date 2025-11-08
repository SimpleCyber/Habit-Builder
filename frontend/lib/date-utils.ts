export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const calculateCalendarStreak = (
  history: { date: string }[],
): number => {
  if (!history.length) return 0;

  // Convert to IST and normalize to YYYY-MM-DD format
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const days = history.map((h) => {
    const d = new Date(h.date);
    return new Date(d.getTime() + istOffsetMs).toISOString().split("T")[0];
  });

  // Deduplicate in case multiple entries exist for same day
  const uniqueDays = Array.from(new Set(days)).sort();

  // Calculate streak based on consecutive days
  let streak = 1;
  for (let i = uniqueDays.length - 1; i > 0; i--) {
    const current = new Date(uniqueDays[i]);
    const prev = new Date(uniqueDays[i - 1]);
    const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break; // Streak broken
    }
  }

  // If today's date isn’t in history, streak should remain until last update
  const now = new Date();
  const nowIST = new Date(now.getTime() + istOffsetMs)
    .toISOString()
    .split("T")[0];

  if (uniqueDays[uniqueDays.length - 1] !== nowIST) {
    // If user missed today, reset streak to 0
    return 0;
  }

  return streak;
};

export const calculateStreak = (
  lastCheckIn: string | null,
  currentStreak: number,
): number => {
  const now = new Date();

  // Convert current UTC time to IST
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffsetMs);

  // Normalize to YYYY-MM-DD string for IST day tracking
  const todayISTString = nowIST.toISOString().split("T")[0];

  // If no previous check-in, start streak
  if (!lastCheckIn) return 1;

  const lastCheckInDate = new Date(lastCheckIn);
  const lastIST = new Date(lastCheckInDate.getTime() + istOffsetMs);

  const lastISTString = lastIST.toISOString().split("T")[0];

  // Calculate difference in IST days
  const diffInTime = nowIST.setHours(0, 0, 0, 0) - lastIST.setHours(0, 0, 0, 0);
  const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) {
    // Already updated today → streak stays same
    return currentStreak;
  } else if (diffInDays === 1) {
    // Updated yesterday → increase streak
    return currentStreak + 1;
  } else {
    // Missed one or more days → reset streak
    return 0;
  }
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add empty days for alignment
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0));
  }

  // Add actual days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};
