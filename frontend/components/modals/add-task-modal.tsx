"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (
    task: Omit<Task, "id" | "createdAt" | "history" | "iconBg">,
  ) => Promise<void>;
  maxTasks: boolean;
}

const commonIcons = [
  "target",
  "book",
  "dumbbell",
  "code",
  "heart",
  "music",
  "palette",
  "camera",
  "briefcase",
  "coffee",
];

export function AddTaskModal({ onClose, onAdd, maxTasks }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("target");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (maxTasks) {
      setError("Maximum 5 tasks allowed.");
      return;
    }

    setError("");

    await onAdd({
      title,
      reason,
      icon: selectedIcon,
      streak: 0,
      lastUpdate: null,
      visibility: "private", // ✅ NEW default
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Add New Task</h2>

        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          maxLength={30}
          className="w-full mb-3"
        />

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you want to do this task?"
          maxLength={100}
          className="w-full h-24 mb-3 resize-none"
        />

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Choose an icon:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {commonIcons.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`icon-btn p-3 rounded-lg border-2 ${
                  icon === selectedIcon
                    ? "border-purple-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <Icon name={icon} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        <div className="flex space-x-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Add Task
          </Button>

          <Button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
