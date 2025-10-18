"use client";

import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
      <div className="flex items-center justify-center gap-3">
        <Flame className="h-8 w-8" />
        <div className="text-center">
          <div className="text-4xl font-bold">{streak}</div>
          <div className="text-sm opacity-90">Day Streak</div>
        </div>
      </div>
    </div>
  );
}
