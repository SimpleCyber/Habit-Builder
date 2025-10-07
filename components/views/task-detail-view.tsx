"use client"

import { useState, useRef } from "react"
import { ArrowLeft, History, X } from "lucide-react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { compressImage } from "@/lib/image-utils"
import { CalendarView } from "@/components/calendar/calendar-view"
import { HistoryList } from "@/components/history/history-list"
import { useRouter } from "next/navigation"
import { UserMenu } from "@/components/layout/user-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaskDetailViewProps {
  task: Task
  onClose: () => void
  onDelete: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  onHome?: () => void
}

export function TaskDetailView({ task, onClose, onDelete, onUpdate }: TaskDetailViewProps) {
  const [updateText, setUpdateText] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [formError, setFormError] = useState("")

  const today = new Date().toDateString()
  const alreadyChecked = task.history.some((h) => new Date(h.date).toDateString() === today)
  const todayEntry = task.history.find((h) => new Date(h.date).toDateString() === today)

  const handleSaveUpdate = async () => {
    if (!updateText.trim()) {
      setFormError("Please add a description.")
      return
    }
    setFormError("")
    const file = fileInputRef.current?.files?.[0]
    let photoData: string | null = null

    if (file) {
      photoData = await compressImage(file)
    }

    const todayDate = new Date()
    const historyEntry = {
      date: todayDate.toISOString(),
      text: updateText,
      photo: photoData,
    }

    // Calculate streak
    let newStreak = task.streak
    if (task.lastUpdate) {
      const lastDate = new Date(task.lastUpdate)
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        newStreak++
      } else if (diffDays > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await onUpdate(task.id, {
      history: [...task.history, historyEntry],
      lastUpdate: todayDate.toISOString(),
      streak: newStreak,
    })

    setUpdateText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
      <div className="glass-effect rounded-2xl shadow-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => router.push("/home")}
            className="text-xl font-bold hover:opacity-90"
            aria-label="Go to home"
            title="Home"
          >
            HabitX
          </button>
          <UserMenu />
        </div>
      </div>

      {/* Check-in Section */}
      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">{alreadyChecked ? "Today's Update" : "Update Today"}</h3>

        {formError && <p className="text-sm text-destructive mb-2">{formError}</p>}

        {todayEntry && (
          <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            {todayEntry.photo && (
              <img
                src={todayEntry.photo || "/placeholder.svg"}
                alt="Today's update photo"
                className="mb-2 rounded-md w-full object-cover"
              />
            )}
            <p className="text-sm">{todayEntry.text}</p>
          </div>
        )}

        {!alreadyChecked && (
          <>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Description:</label>
              <Textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="What did you accomplish today?"
                maxLength={100}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-24 resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Upload Pic / Take Pic:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
              />
            </div>

            <Button
              onClick={handleSaveUpdate}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Mark as Done
            </Button>
          </>
        )}

        {alreadyChecked && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-3 rounded-lg font-semibold text-center">
            ✓ Already Checked In Today
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">This Month's Progress</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {showHistory ? <X className="w-6 h-6" /> : <History className="w-6 h-6" />}
          </button>
        </div>
        <CalendarView history={task.history} />
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <HistoryList history={task.history} />
        </div>
      )}

      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>
          Delete Task
        </Button>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete()
                setConfirmDelete(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
