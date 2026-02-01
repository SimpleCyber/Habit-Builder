"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "vaul";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim() || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (maxTasks) {
      setError("Maximum 5 tasks allowed.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onAdd({
        title,
        reason,
        icon: selectedIcon,
        streak: 0,
        lastUpdate: null,
        visibility: "private",
      });
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to add task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" />
        <Drawer.Content className="bg-background/95 backdrop-blur-xl border border-border flex flex-col rounded-t-[32px] sm:rounded-[40px] h-[90%] sm:h-auto sm:max-h-[85vh] sm:max-w-md mt-24 sm:mt-0 fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 left-0 right-0 z-50 outline-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-primary to-blue-500 opacity-80" />
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-2 sm:hidden" />

          <div className="flex-1 overflow-y-auto px-6 py-4 sm:py-10 touch-auto">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <Drawer.Title className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-1">
                  New Habit
                </Drawer.Title>
                <Drawer.Description className="text-muted-foreground font-medium">
                  Start a fresh journey today.
                </Drawer.Description>
              </div>

              <div className="space-y-8 pb-24 sm:pb-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest px-1 text-primary">
                    Task Title
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Meditation"
                    maxLength={30}
                    className="h-16 rounded-[20px] bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background text-lg px-5 transition-all outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest px-1 text-primary">
                    Your Motivation
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why stop? To feel better..."
                    maxLength={100}
                    className="h-32 rounded-[24px] bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background text-lg p-5 resize-none transition-all outline-none"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest px-1 text-primary">
                    Identity Icon
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {commonIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        disabled={isSubmitting}
                        className={`aspect-square rounded-[20px] flex items-center justify-center transition-all duration-300 ${
                          icon === selectedIcon
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110 active:scale-95 z-10"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon name={icon} className="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive font-bold px-1 animate-pulse">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-border bg-background/50 backdrop-blur-md pb-12 sm:pb-8 mt-auto">
            <div className="max-w-md mx-auto flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] h-16 rounded-[24px] text-xl font-black bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSubmitting ? "Creating..." : "Start Journey"}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-16 rounded-[24px] text-lg font-bold hover:bg-muted transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
