"use client";

import { useState } from "react";
import type { TaskHistoryEntry } from "@/lib/firebase-db";
import { Button } from "@/components/ui/button";

interface HistoryListProps {
  history: TaskHistoryEntry[];
}

export function HistoryList({ history }: HistoryListProps) {
  const [displayCount, setDisplayCount] = useState(10);

  if (history.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
        No history yet. Start checking in!
      </p>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const displayedHistory = sortedHistory.slice(0, displayCount);
  const hasMore = displayCount < sortedHistory.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayedHistory.map((entry, index) => {
          const date = new Date(entry.date);
          const dateStr = date.toLocaleDateString();
          const timeStr = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.text}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right ml-2">
                  <div>{dateStr}</div>
                  <div>
                    {dayStr} {timeStr}
                  </div>
                </div>
              </div>
              {entry.photo && (
                <img
                  src={entry.photo || "/placeholder.svg"}
                  alt="Progress"
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          onClick={handleLoadMore}
          variant="outline"
          className="w-full bg-transparent"
        >
          Load More
        </Button>
      )}
    </div>
  );
}
