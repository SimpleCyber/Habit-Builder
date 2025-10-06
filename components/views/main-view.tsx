"use client"

import { Moon, Sun, Plus, Inbox } from "lucide-react"
import type { Task } from "@/lib/types"
import { TaskCard } from "@/components/tasks/task-card"

interface MainViewProps {
  tasks: Task[]
  onOpenTask: (taskId: string) => void
  onOpenAddModal: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function MainView({ tasks, onOpenTask, onOpenAddModal, darkMode, onToggleDarkMode }: MainViewProps) {
  const handleAddClick = () => {
    if (tasks.length >= 5) {
      alert("Maximum 5 tasks allowed!")
      return
    }
    onOpenAddModal()
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
            HabitX
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {tasks.length === 0 ? (
          <div className="glass-effect rounded-2xl p-8 text-center">
            <Inbox className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">No tasks yet!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click the + button to add your first task</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task.id)} />)
        )}
      </div>
    </div>
  )
}
