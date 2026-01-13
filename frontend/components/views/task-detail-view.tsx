"use client";

import { useState, useRef } from "react";
import { History, X, EyeOff, Share2 } from "lucide-react";
import type { Task, TaskHistoryEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/image-utils";
import { CalendarView } from "@/components/calendar/calendar-view";
import { HistoryList } from "@/components/history/history-list";
import { calculateCalendarStreak } from "@/lib/date-utils";

import {
  addHistoryEntry,
  updateHistoryEntry,
  updateTask,
  addToCommunityIndex,
  removeFromCommunityIndex,
} from "@/lib/firebase-db";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Header } from "@/components/layout/header";
import { TaskCard } from "@/components/tasks/task-card";

interface TaskDetailViewProps {
  task: Task;
  history: TaskHistoryEntry[];
  uid: string;
  onDelete: () => void | Promise<void>;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onHome?: () => void;
  onRefresh: () => void; // parent reload function
}

export function TaskDetailView({
  task,
  history,
  uid,
  onDelete,
  onRefresh,
}: TaskDetailViewProps) {
  const [updateText, setUpdateText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState("");
  const [communityPosts, setCommunityPosts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Prevention

  const [localHistory, setLocalHistory] = useState(history);

  const today = new Date().toDateString();

  const todayEntry = localHistory.find(
    (h) => new Date(h.date).toDateString() === today,
  );

  const alreadyChecked = Boolean(todayEntry);

  /* ---------------------------------------------------------
     ✅ Toggle Community Visibility
  --------------------------------------------------------- */
  const toggleCommunityPost = async () => {
    if (!todayEntry) return;

    const newValue = !todayEntry.communityPosts;

    // ✅ Update Firestore entry
    await updateHistoryEntry(uid, task.id, todayEntry.id, {
      communityPosts: newValue,
    });

    // ✅ Handle communityIndex insert/remove
    if (newValue) {
      await addToCommunityIndex(uid, task.id, todayEntry.id);
    } else {
      await removeFromCommunityIndex(uid, task.id, todayEntry.id);
    }

    // ✅ Update local state instantly
    setLocalHistory((prev) =>
      prev.map((h) =>
        h.id === todayEntry.id ? { ...h, communityPosts: newValue } : h,
      ),
    );
  };

  /* ---------------------------------------------------------
     ✅ Handle Today's Update Save
  --------------------------------------------------------- */
  const handleSaveUpdate = async () => {
    if (isSubmitting) return; // Prevention

    if (!updateText.trim()) {
      setFormError("Please add a description.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      let photoData: string | null = null;
      const file = fileInputRef.current?.files?.[0];
      if (file) photoData = await compressImage(file);

      const todayISO = new Date().toISOString();

      const newHistoryEntry = {
        date: todayISO,
        text: updateText,
        photo: photoData,
        communityPosts,
      };

      // ✅ Add history entry & get docId
      const newHistoryId = await addHistoryEntry(uid, task.id, newHistoryEntry);

      // ✅ If shared, add to communityIndex
      if (communityPosts) {
        await addToCommunityIndex(uid, task.id, newHistoryId);
      }

      // ✅ Update localHistory
      const newEntryWithId: TaskHistoryEntry = {
        id: newHistoryId,
        date: todayISO,
        text: updateText,
        photo: photoData,
        communityPosts,
        timestamp: new Date(), // ✅ required for TS
      };

      const updatedHistory = [...localHistory, newEntryWithId];
      updatedHistory.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setLocalHistory(updatedHistory);

      // ✅ Recalculate streak
      const streak = calculateCalendarStreak(updatedHistory);

      // ✅ Update Firestore task metadata
      await updateTask(uid, task.id, {
        lastUpdate: todayISO,
        streak,
      });

      // ✅ Reset form
      setUpdateText("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh parent
      onRefresh();
    } catch (error) {
      console.error("Failed to save update:", error);
      setFormError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
      <Header />

      {/* ✅ Task Card */}
      <div className="mb-5">
        <TaskCard task={task} history={localHistory} readOnly />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">
              {alreadyChecked ? "Today's Update" : "Update Today"}
            </h3>

            {formError && (
              <p className="text-sm text-destructive mb-2">{formError}</p>
            )}

            {alreadyChecked && todayEntry && (
              <div className="mb-4 rounded-lg border p-3">
                {todayEntry.photo && (
                  <img
                    src={todayEntry.photo}
                    className="mb-2 rounded-md w-full object-cover"
                  />
                )}
                <p className="text-sm">{todayEntry.text}</p>
              </div>
            )}

            {!alreadyChecked && (
              <>
                <Textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="What did you accomplish today?"
                  maxLength={100}
                  className="w-full h-24"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full p-2 border rounded-lg mt-3"
                />

                <label className="flex items-center space-x-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={communityPosts}
                    onChange={(e) => setCommunityPosts(e.target.checked)}
                  />
                  <span>Share this update to community</span>
                </label>

                <Button 
                  onClick={handleSaveUpdate} 
                  className="w-full mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Mark as Done"}
                </Button>
              </>
            )}

            {alreadyChecked && todayEntry && (
              <button
                onClick={toggleCommunityPost}
                className="flex items-center gap-2 px-3 py-1 mt-3 rounded-full bg-gray-100 dark:bg-gray-700"
              >
                {todayEntry.communityPosts ? (
                  <>
                    <Share2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Shared</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Private</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="glass-effect rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">This Month's Progress</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {showHistory ? <X /> : <History />}
              </button>
            </div>
            <CalendarView history={localHistory} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {showHistory && (
            <div className="glass-effect rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">History</h3>
                <button onClick={() => setShowHistory(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <HistoryList history={localHistory} />
            </div>
          )}

          <div className="glass-effect rounded-2xl shadow-xl p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
