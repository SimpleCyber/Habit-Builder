"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Trash2, Flame, History, X } from "lucide-react"
import type { Task } from "@/lib/types"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { compressImage } from "@/lib/image-utils"
import { CalendarView } from "@/components/calendar/calendar-view"
import { HistoryList } from "@/components/history/history-list"

interface TaskDetailViewProps {
  task: Task
  onClose: () => void
  onDelete: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export function TaskDetailView({ task, onClose, onDelete, onUpdate }: TaskDetailViewProps) {
  const [updateText, setUpdateText] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const today = new Date().toDateString()
  const alreadyChecked = task.history.some((h) => new Date(h.date).toDateString() === today)

  const handleSaveUpdate = async () => {
    if (!updateText.trim()) {
      alert("Please add a description!")
      return
    }

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
    <div className="container mx-auto max-w-md p-4">
      {/* Header */}
      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
              <Icon name={task.icon} className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{task.title}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <span className="text-3xl font-bold text-orange-500 streak-flame">{task.streak}</span>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Reason:</p>
          <p className="text-gray-800 dark:text-white">{task.reason}</p>
        </div>
      </div>

      {/* Check-in Section */}
      <div className="glass-effect rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">{alreadyChecked ? "Today's Update" : "Update Today"}</h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Description:</label>
          <Textarea
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="What did you accomplish today?"
            maxLength={100}
            disabled={alreadyChecked}
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
            disabled={alreadyChecked}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          />
        </div>

        {!alreadyChecked ? (
          <Button
            onClick={handleSaveUpdate}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Mark as Done
          </Button>
        ) : (
          <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 rounded-lg font-semibold text-center">
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
    </div>
  )
}
