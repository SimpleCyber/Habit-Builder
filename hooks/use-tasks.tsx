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

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "iconBg">) => {
    if (!user || tasks.length >= 5) return

    const randomPastel = () => {
      const hues = [10, 25, 45, 90, 150, 190, 220, 260, 290, 330] // warm to cool spread
      const h = hues[Math.floor(Math.random() * hues.length)]
      const s = 70 + Math.floor(Math.random() * 10) // 70-80%
      const l = 85 + Math.floor(Math.random() * 5) // 85-90%
      return `hsl(${h} ${s}% ${l}%)`
    }

    const newTask: Task = {
      ...taskData,
      iconBg: randomPastel(),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      visibility: "private", // default to private; owner can toggle to public
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    await saveUserData(user.uid, { tasks: updatedTasks })
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return

    const ensureIconBg = (t: Task): Task =>
      t.iconBg ? t : { ...t, iconBg: `hsl(${Math.floor(Math.random() * 360)} 75% 88%)` }

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? ensureIconBg({ ...task, ...updates }) : ensureIconBg(task),
    )
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
