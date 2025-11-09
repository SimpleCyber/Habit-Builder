"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import {
  createTask,
  getTasks as getTasksFromDb,
  updateTask as updateTaskInDb,
  deleteTask as deleteTaskFromDb,
  type Task,
} from "@/lib/firebase-db";

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load tasks from subcollection
  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  // ✅ Load tasks from Firestore
  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getTasksFromDb(user.uid);
    setTasks(data || []);
    setLoading(false);
  };

  // ✅ Add Task into subcollection
  const addTask = async (
    taskData: Omit<
      Task,
      "id" | "createdAt" | "streak" | "lastUpdate" | "history"
    >,
  ) => {
    if (!user || tasks.length >= 5) return;

    const taskId = await createTask(user.uid, {
      ...taskData,
      visibility: "private", // default
    });

    // Refresh local state
    await loadTasks();
    return taskId;
  };

  // ✅ Update Task (title, reason, visibility, streak, lastUpdate, etc.)
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    await updateTaskInDb(user.uid, taskId, updates);
    await loadTasks();
  };

  // ✅ Delete Task and its subcollection
  const deleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTaskFromDb(user.uid, taskId);
    await loadTasks();
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
};
