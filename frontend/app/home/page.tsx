"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { MainView } from "@/components/views/main-view";
import { TaskDetailView } from "@/components/views/task-detail-view";
import { AddTaskModal } from "@/components/modals/add-task-modal";
import type { Task } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    tasks,
    loading: tasksLoading,
    addTask,
    deleteTask,
    updateTask,
  } = useTasks();
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark");
  };

  const handleOpenTask = (taskId: string) => {
    setCurrentTaskId(taskId);
  };

  const handleCloseTask = () => {
    setCurrentTaskId(null);
  };

  const handleAddTask = async (task: Omit<Task, "id" | "createdAt">) => {
    await addTask(task);
    setShowAddModal(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setCurrentTaskId(null);
  };

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentTask = tasks.find((t) => t.id === currentTaskId);

  return (
    <>
      {!currentTaskId ? (
        <MainView
          tasks={tasks}
          onOpenTask={handleOpenTask}
          onOpenAddModal={() => setShowAddModal(true)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      ) : currentTask ? (
        <TaskDetailView
          task={currentTask}
          onClose={handleCloseTask}
          onDelete={() => handleDeleteTask(currentTask.id)}
          onUpdate={updateTask}
          onHome={() => router.push("/home")}
        />
      ) : null}

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
