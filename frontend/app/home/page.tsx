"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Auth + Tasks hooks
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";

// Views & Modals
import { MainView } from "@/components/views/main-view";
import { TaskDetailView } from "@/components/views/task-detail-view";
import { AddTaskModal } from "@/components/modals/add-task-modal";

// Types
import type { Task, TaskHistoryEntry } from "@/lib/types";

// Firestore helpers (to fetch history per task)
import { getTaskHistory } from "@/lib/firebase-db";

export default function HomePage() {
  const router = useRouter();

  // ✅ Auth
  const { user, loading: authLoading } = useAuth();

  // ✅ Tasks
  const {
    tasks,
    loading: tasksLoading,
    addTask,
    deleteTask,
    updateTask,
  } = useTasks();

  // ✅ UI state
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Histories map: taskId -> TaskHistoryEntry[]
  const [histories, setHistories] = useState<
    Record<string, TaskHistoryEntry[]>
  >({});
  const [histLoading, setHistLoading] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  // Load dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark");
  };

  const handleOpenTask = (taskId: string) => setCurrentTaskId(taskId);
  const handleCloseTask = () => setCurrentTaskId(null);

  // ✅ New task payload matches Option A (no history, no id/createdAt/streak/lastUpdate)
  const handleAddTask = async (
    task: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
  ) => {
    await addTask(task);
    setShowAddModal(false);
    // histories for new task will be empty initially; no need to reload all
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setCurrentTaskId(null);
    // remove history cache for deleted task
    setHistories((prev) => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  // ✅ Load histories for all tasks (or refresh specific task)
  const refreshHistories = useCallback(
    async (taskIds?: string[]) => {
      if (!user) return;
      const ids = taskIds ?? tasks.map((t) => t.id);
      if (ids.length === 0) return;

      setHistLoading(true);
      try {
        const pairs = await Promise.all(
          ids.map(async (id) => {
            const h = await getTaskHistory(user.uid, id);
            return [id, h] as const;
          }),
        );
        setHistories((prev) => {
          const next = { ...prev };
          for (const [id, h] of pairs) next[id] = h;
          return next;
        });
      } finally {
        setHistLoading(false);
      }
    },
    [user, tasks],
  );

  // Initial history load (whenever tasks list changes)
  useEffect(() => {
    if (!user) return;
    if (tasks.length === 0) {
      setHistories({});
      return;
    }
    // Load/refresh only for tasks missing in cache
    const missing = tasks
      .map((t) => t.id)
      .filter((id) => histories[id] === undefined);
    if (missing.length > 0) refreshHistories(missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tasks]);

  // Helper to refresh the currently open task’s history (after check-in)
  const handleRefresh = async () => {
    if (!user || !currentTaskId) return;
    await refreshHistories([currentTaskId]);
  };

  const currentTask = useMemo(
    () => (tasks ? tasks.find((t) => t.id === currentTaskId) : null),
    [tasks, currentTaskId],
  );

  // Loading state
  if (authLoading || tasksLoading || (currentTaskId && histLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MAIN LIST VIEW */}
      {!currentTaskId ? (
        <MainView
          tasks={tasks}
          histories={histories} // ✅ pass map of histories
          onOpenTask={handleOpenTask}
          onOpenAddModal={() => setShowAddModal(true)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      ) : currentTask ? (
        // ✅ DETAIL VIEW (needs uid + specific task history)
        <TaskDetailView
          task={currentTask}
          history={histories[currentTask.id] || []} // ✅ pass the current task’s history
          uid={user!.uid}
          onDelete={() => handleDeleteTask(currentTask.id)}
          onClose={handleCloseTask}
          onUpdate={updateTask}
          onHome={() => router.push("/home")}
          onRefresh={handleRefresh} // ✅ Refresh history after check-in
        />
      ) : null}

      {/* ✅ ADD TASK MODAL */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
          maxTasks={tasks.length >= 5}
        />
      )}
    </>
  );
}
