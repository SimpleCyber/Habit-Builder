"use client";

import { Plus, Inbox, NewspaperIcon } from "lucide-react";
import type { Task, TaskHistoryEntry } from "@/lib/types";
import { TaskCard } from "@/components/tasks/task-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Header } from "@/components/layout/header";

interface MainViewProps {
  tasks: Task[];
  histories: Record<string, TaskHistoryEntry[]>;
  onOpenTask: (taskId: string) => void;
  onOpenAddModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MainView({
  tasks,
  histories,
  onOpenTask,
  onOpenAddModal,
}: MainViewProps) {
  const handleAddClick = () => {
    onOpenAddModal();
  };

  return (
    <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6 lg:p-8">
      <Header />

      {/* Task List */}
      <div className="space-y-4 pb-20 lg:pb-8">
        {tasks.length === 0 ? (
          <div className="glass-effect rounded-2xl p-8 text-center">
            <Inbox className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              No tasks yet!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the + button to add your first task
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              history={histories[task.id] || []} // ✅ pass history per card
              onClick={() => onOpenTask(task.id)}
            />
          ))
        )}
      </div>

      {/* Desktop Add Button (Restored) */}
      <button
        onClick={handleAddClick}
        className="hidden lg:flex fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-14 h-14 items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
