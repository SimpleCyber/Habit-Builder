"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { getUserData, saveUserData, addHistoryEntry } from "@/lib/firebase-db"
import { getTodayString, calculateStreak } from "@/lib/date-utils"
import type { Task } from "@/lib/firebase-db"

export const useStreak = () => {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [lastCheckIn, setLastCheckIn] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStreak()
    } else {
      setStreak(0)
      setLastCheckIn("")
      setLoading(false)
    }
  }, [user])

  const loadStreak = async () => {
    if (!user) return

    setLoading(true)
    const userData = await getUserData(user.uid)
    if (userData) {
      setStreak(userData.streak)
      setLastCheckIn(userData.lastCheckIn)
    }
    setLoading(false)
  }

  const checkIn = async (tasks: Task[], photo?: string) => {
    if (!user) return

    const today = getTodayString()
    const userData = await getUserData(user.uid)

    if (userData && userData.lastCheckIn === today) {
      return // Already checked in today
    }

    const streakIncrement = calculateStreak(lastCheckIn)
    const newStreak = streak + streakIncrement

    // Add to history
    await addHistoryEntry(user.uid, {
      date: today,
      tasks: tasks.map((t) => ({ ...t })),
      photo,
    })

    // Update streak
    await saveUserData(user.uid, {
      streak: newStreak,
      lastCheckIn: today,
    })

    setStreak(newStreak)
    setLastCheckIn(today)
  }

  return { streak, lastCheckIn, loading, checkIn }
}
