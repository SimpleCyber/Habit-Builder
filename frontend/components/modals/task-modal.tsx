"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TaskModalProps {
  onClose: () => void;
  onSave: (
    task: Omit<Task, "id" | "createdAt" | "history" | "iconBg">,
  ) => Promise<void>;
  maxTasks?: boolean;
  task?: Task;
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

export function TaskModal({ onClose, onSave, maxTasks, task }: TaskModalProps) {
  const isEditing = !!task;
  const [title, setTitle] = useState(task?.title || "");
  const [reason, setReason] = useState(task?.reason || "");
  const [selectedIcon, setSelectedIcon] = useState(task?.icon || "target");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim() || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isEditing && maxTasks) {
      setError("Maximum 5 tasks allowed.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSave({
        title,
        reason,
        icon: selectedIcon,
        streak: task?.streak || 0,
        lastUpdate: task?.lastUpdate || null,
        visibility: task?.visibility || "private",
      });
      onClose();
    } catch (e) {
      console.error(e);
      setError(`Failed to ${isEditing ? "update" : "add"} task.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "New Habit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your habit details below."
              : "Start a new journey today."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Meditation"
              maxLength={30}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Motivation</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this habit?"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  disabled={isSubmitting}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-colors ${
                    icon === selectedIcon
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Icon name={icon} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
