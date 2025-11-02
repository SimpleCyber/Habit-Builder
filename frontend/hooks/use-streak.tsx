"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { getUserData, saveUserData, addHistoryEntry } from "@/lib/firebase-db";
import { calculateStreak } from "@/lib/date-utils";
import type { Task } from "@/lib/firebase-db";

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStreak();
    } else {
      setStreak(0);
      setLastCheckIn(null);
      setLoading(false);
    }
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;
    setLoading(true);

    const userData = await getUserData(user.uid);
    if (userData) {
      setStreak(userData.streak || 0);
      setLastCheckIn(userData.lastCheckIn || null);
    }

    setLoading(false);
  };

  const checkIn = async (tasks: Task[], photo?: string) => {
    if (!user) return;

    const userData = await getUserData(user.uid);
    const currentStreak = userData?.streak || 0;
    const lastCheck = userData?.lastCheckIn || null;

    // Calculate new streak based on IST 12–12 logic
    const newStreak = calculateStreak(lastCheck, currentStreak);

    // Record this check-in (use current UTC timestamp)
    const nowUTC = new Date().toISOString();

    await addHistoryEntry(user.uid, {
      date: nowUTC,
      tasks: tasks.map((t) => ({ ...t })),
      photo,
    });

    // Save updated streak and last check-in
    await saveUserData(user.uid, {
      streak: newStreak,
      lastCheckIn: nowUTC,
    });

    setStreak(newStreak);
    setLastCheckIn(nowUTC);
  };

  return { streak, lastCheckIn, loading, checkIn };
};
