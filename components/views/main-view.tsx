"use client"

import { Plus, Inbox } from "lucide-react"
import type { Task } from "@/lib/types"
import { TaskCard } from "@/components/tasks/task-card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { UserMenu } from "@/components/layout/user-menu"

import Link from "next/link"
import { Users } from "lucide-react"

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
      setShowMaxTasks(true)
      return
    }
    onOpenAddModal()
  }

  const [showMaxTasks, setShowMaxTasks] = useState(false)

  return (
    <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
      <div className="glass-effect rounded-2xl shadow-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">HabitX</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
            href="/friends"
            aria-label="Friends"
            title="Friends"
            className="p-2 rounded-md hover:bg-muted transition"
          >
            <Users className="w-5 h-5" />
          </Link>
          
            <UserMenu />

            
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

      <button
        onClick={handleAddClick}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Add task"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={showMaxTasks} onOpenChange={setShowMaxTasks}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task limit reached</DialogTitle>
            <DialogDescription>You can create up to 5 tasks. Delete a task to add a new one.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
