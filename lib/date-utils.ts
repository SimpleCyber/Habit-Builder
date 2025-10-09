export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0]
}

export const calculateStreak = (lastCheckIn: string): number => {
  if (!lastCheckIn) return 0
  const today = getTodayString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayString = yesterday.toISOString().split("T")[0]

  if (lastCheckIn === today) {
    return 1
  } else if (lastCheckIn === yesterdayString) {
    return 1
  } else {
    return 0
  }
}

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []

  // Add empty days for alignment
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(0))
  }

  // Add actual days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return days
}
