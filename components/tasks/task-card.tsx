"use client"

import { Flame } from "lucide-react"
import type { Task } from "@/lib/types"
import { Icon } from "@/components/ui/icon"

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const today = new Date().toDateString()
  const checkedToday = task.history.some((h) => new Date(h.date).toDateString() === today)

  return (
    <div
      className="task-card glass-effect rounded-2xl p-4 cursor-pointer shadow-md hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: task.iconBg || "hsl(220 75% 88%)" }}
          >
            <Icon name={task.icon} className="w-6 h-6 text-gray-800" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base sm:text-lg">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.reason}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right flex items-center space-x-1">
            <span className="text-2xl font-bold text-orange-500 streak-flame">{task.streak}</span>
            <Flame className={`w-7 h-7 ${checkedToday ? "text-orange-500 fill-orange-500" : "text-gray-400"}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
