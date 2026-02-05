"use client";

import { Flame } from "lucide-react";
import type { Task, TaskHistoryEntry } from "@/lib/types";
import { Icon } from "@/components/ui/icon";

interface TaskCardProps {
  task: Task;
  history: TaskHistoryEntry[];
  onClick?: () => void;
  readOnly?: boolean;
}

export function TaskCard({ task, history, onClick, readOnly }: TaskCardProps) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const checkedToday = history.some((h) => isSameDay(new Date(h.date), today));
  const checkedYesterday = history.some((h) =>
    isSameDay(new Date(h.date), yesterday),
  );

  const displayStreak = checkedToday || checkedYesterday ? task.streak : 0;

  return (
    <div
      className={`task-card glass-effect rounded-2xl p-4 shadow-md hover:shadow-lg transition-all ${
        !readOnly ? "cursor-pointer" : ""
      }`}
      onClick={readOnly ? undefined : onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: task.iconBg || "hsl(220 75% 88%)" }}
          >
            <Icon name={task.icon} className="w-6 h-6 text-gray-800" />
          </div>

          <div>
            <h3 className="font-bold text-foreground text-base sm:text-lg">
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground">{task.reason}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-orange-500">
            {displayStreak}
          </span>
          <Flame
            className={`w-7 h-7 ${
              checkedToday ? "text-orange-500 fill-orange-500" : "text-gray-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
