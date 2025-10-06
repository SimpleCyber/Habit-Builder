"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { getUserData, saveUserData, deleteTask as deleteTaskFromDb, type Task } from "@/lib/firebase-db"

export const useTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [user])

  const loadTasks = async () => {
    if (!user) return

    setLoading(true)
    const userData = await getUserData(user.uid)
    if (userData) {
      setTasks(userData.tasks)
    }
    setLoading(false)
  }

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!user || tasks.length >= 5) return

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    await saveUserData(user.uid, { tasks: updatedTasks })
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return

    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    setTasks(updatedTasks)
    await saveUserData(user.uid, { tasks: updatedTasks })
  }

  const deleteTask = async (taskId: string) => {
    if (!user) return

    const updatedTasks = tasks.filter((t) => t.id !== taskId)
    setTasks(updatedTasks)
    await deleteTaskFromDb(user.uid, taskId)
  }

  return { tasks, loading, addTask, updateTask, deleteTask }
}
