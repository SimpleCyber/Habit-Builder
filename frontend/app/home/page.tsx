"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Auth + Tasks hooks
import { useAuth } from "@/hooks/use-auth";
import { useTasksContext } from "@/hooks/use-tasks-context";

// Views & Modals
import { MainView } from "@/components/views/main-view";
import { TaskDetailView } from "@/components/views/task-detail-view";
import { AddTaskModal } from "@/components/modals/add-task-modal";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
import type { Task, TaskHistoryEntry } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();

  // ✅ Auth
  const { user, loading: authLoading } = useAuth();

  // ✅ Tasks & Histories from Global Context
  const {
    tasks,
    histories,
    loading: tasksLoading,
    histLoading,
    addTask,
    deleteTask,
    updateTask,
    refreshHistories,
  } = useTasksContext();

  // ✅ UI state
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaxTasks, setShowMaxTasks] = useState(false);
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);

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

  const handleOpenAddModal = useCallback(() => {
    if (tasks.length >= 5) {
      setShowMaxTasks(true);
    } else {
      setShowAddModal(true);
    }
  }, [tasks.length]);

  // ✅ Listen for global Add trigger from MobileNav (in layout.tsx)
  useEffect(() => {
    const handleTrigger = () => handleOpenAddModal();
    window.addEventListener("open-add-task", handleTrigger);
    return () => window.removeEventListener("open-add-task", handleTrigger);
  }, [handleOpenAddModal]);

  // ✅ Check for URL param trigger
  useEffect(() => {
    if (searchParams.get("action") === "add-task") {
      handleOpenAddModal();
      // Remove the param without full reload
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, handleOpenAddModal]);

  // ✅ New task payload
  const handleAddTask = async (
    task: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
  ) => {
    await addTask(task);
    setShowAddModal(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setCurrentTaskId(null);
  };

  // Helper to refresh the currently open task’s history (after check-in)
  const handleRefresh = async () => {
    if (!user || !currentTaskId) return;
    await refreshHistories([currentTaskId]);
  };

  const currentTask = useMemo(
    () => (tasks ? tasks.find((t: Task) => t.id === currentTaskId) : null),
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
        <>
          <MainView
            tasks={tasks}
            histories={histories} // ✅ pass map of histories
            onOpenTask={handleOpenTask}
            onOpenAddModal={handleOpenAddModal}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </>
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

      {/* ✅ Limit Dialog (Restyled for Premium Feel) */}
      <Dialog open={showMaxTasks} onOpenChange={setShowMaxTasks}>
        <DialogContent className="max-w-[85vw] sm:max-w-md rounded-[32px] border-border bg-background/95 backdrop-blur-2xl p-8 shadow-2xl outline-none">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-80" />
          <DialogHeader className="pt-4">
            <DialogTitle className="text-3xl font-black tracking-tighter mb-2">
              Limit Reached
            </DialogTitle>
            <DialogDescription className="text-lg font-medium text-muted-foreground leading-relaxed">
              You've hit the{" "}
              <span className="text-foreground font-bold">5-task limit</span>.
              <br />
              <br />
              Time to refine! Please complete or delete an existing habit to
              start a new journey.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8">
            <Button
              onClick={() => setShowMaxTasks(false)}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-xl active:scale-95 transition-all"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
