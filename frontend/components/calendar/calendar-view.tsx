"use client";

import type { TaskHistoryEntry } from "@/lib/firebase-db";

interface CalendarViewProps {
  history: TaskHistoryEntry[];
}

export function CalendarView({ history }: CalendarViewProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const hasEntry = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toDateString();
    return history.some((h) => new Date(h.date).toDateString() === dateStr);
  };

  const isToday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {days.map((day, i) => (
        <div
          key={`${day}-${i}`}
          className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
        >
          {day}
        </div>
      ))}

      {/* Empty cells for days before month starts */}
      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`}></div>
      ))}

      {/* Days of the month */}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const hasEntryForDay = hasEntry(day);
        const isTodayDay = isToday(day);
        const bgColor = hasEntryForDay
          ? "bg-green-500 dark:bg-green-600"
          : "bg-gray-200 dark:bg-gray-700";
        const todayRing = isTodayDay ? "ring-2 ring-purple-500" : "";

        return (
          <div
            key={day}
            className={`calendar-day ${bgColor} ${todayRing} rounded text-center text-xs flex items-center justify-center font-semibold ${
              hasEntryForDay ? "text-white" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}
