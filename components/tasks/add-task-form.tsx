"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddTaskFormProps {
  onAdd: (text: string) => void
  disabled?: boolean
}

export function AddTaskForm({ onAdd, disabled }: AddTaskFormProps) {
  const [taskText, setTaskText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskText.trim()) {
      onAdd(taskText.trim())
      setTaskText("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        disabled={disabled}
        className="bg-secondary"
      />
      <Button type="submit" disabled={disabled || !taskText.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
