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

export const calculateStreak = (
  lastCheckIn: string,
  currentStreak: number
): number => {
  if (!lastCheckIn) return 1; // first check-in

  const today = new Date();
  const lastDate = new Date(lastCheckIn);

  // Remove time for consistency (compare only YYYY-MM-DD)
  const diffInTime = today.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0);
  const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) {
    // Already checked in today → streak remains
    return currentStreak;
  } else if (diffInDays === 1) {
    // Consecutive day → increase streak
    return currentStreak + 1;
  } else {
    // Missed a day → reset streak
    return 1;
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
