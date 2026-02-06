"use client";

import { useState, useRef, useEffect } from "react";
import {
  History,
  X,
  EyeOff,
  Share2,
  Settings,
  Twitter,
  Loader,
} from "lucide-react";
import type { Task, TaskHistoryEntry, UserData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/image-utils";
import { CalendarView } from "@/components/calendar/calendar-view";
import { HistoryList } from "@/components/history/history-list";
import { calculateCalendarStreak } from "@/lib/date-utils";
import { toast } from "sonner";

import {
  addHistoryEntry,
  updateHistoryEntry,
  updateTask,
  addToCommunityIndex,
  removeFromCommunityIndex,
  getUserData,
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
  onEdit?: () => void;
}

export function TaskDetailView({
  task,
  history,
  uid,
  onDelete,
  onClose,
  onRefresh,
  onEdit,
}: TaskDetailViewProps) {
  const [updateText, setUpdateText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState("");
  const [communityPosts, setCommunityPosts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Prevention
  const [isSchedulingToX, setIsSchedulingToX] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [localHistory, setLocalHistory] = useState(history);

  const today = new Date().toDateString();

  const todayEntry = localHistory.find(
    (h) => new Date(h.date).toDateString() === today,
  );

  const alreadyChecked = Boolean(todayEntry);

  useEffect(() => {
    getUserData(uid).then((data) => {
      setUserData(data);
    });
  }, [uid]);

  /* ---------------------------------------------------------
     ✅ Schedule to X via Flejet
  --------------------------------------------------------- */
  const handleScheduleToX = async () => {
    if (!todayEntry || !userData?.flejetConfig) return;

    if (todayEntry.scheduledToX) {
      toast.error("This post has already been scheduled to X!");
      return;
    }

    setIsSchedulingToX(true);
    try {
      const res = await fetch("/api/flejet/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `${task.icon} ${task.title}: Day ${task.streak + 1} Done!\n\n"${todayEntry.text}"\n\n#HabitBuilder #Flejet`,
          imageUrl: todayEntry.photo,
          flejetConfig: userData.flejetConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");

      // Update Local State & Firebase
      await updateHistoryEntry(uid, task.id, todayEntry.id, {
        scheduledToX: true,
      });

      setLocalHistory((prev) =>
        prev.map((h) =>
          h.id === todayEntry.id ? { ...h, scheduledToX: true } : h,
        ),
      );

      toast.success("Successfully scheduled to X!");
    } catch (err: any) {
      console.error("Scheduling error:", err);
      toast.error(err.message || "Failed to schedule to X");
    } finally {
      setIsSchedulingToX(false);
    }
  };

  /* ---------------------------------------------------------
     ✅ Toggle Community Visibility
  --------------------------------------------------------- */
  const toggleCommunityPost = async () => {
    if (!todayEntry) return;

    const newValue = !todayEntry.communityPosts;

    await updateHistoryEntry(uid, task.id, todayEntry.id, {
      communityPosts: newValue,
    });

    if (newValue) {
      await addToCommunityIndex(uid, task.id, todayEntry.id);
    } else {
      await removeFromCommunityIndex(uid, task.id, todayEntry.id);
    }

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
    if (isSubmitting) return;

    if (!updateText.trim()) {
      setFormError("Please add a description.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      let photoData: string | null = null;
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const compressedBase64 = await compressImage(file);
        try {
          const res = await fetch("/api/cloudinary/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: compressedBase64 }),
          });

          if (!res.ok) throw new Error("Image upload failed");
          const data = await res.json();
          photoData = data.url;
        } catch (err) {
          console.error("Upload error:", err);
          setFormError("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      const todayISO = new Date().toISOString();
      const newHistoryEntry = {
        date: todayISO,
        text: updateText,
        photo: photoData,
        communityPosts,
      };

      const newHistoryId = await addHistoryEntry(uid, task.id, newHistoryEntry);
      if (communityPosts) {
        await addToCommunityIndex(uid, task.id, newHistoryId);
      }

      const newEntryWithId: TaskHistoryEntry = {
        id: newHistoryId,
        date: todayISO,
        text: updateText,
        photo: photoData,
        communityPosts,
        timestamp: new Date(),
      };

      const updatedHistory = [...localHistory, newEntryWithId];
      updatedHistory.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setLocalHistory(updatedHistory);

      const streak = calculateCalendarStreak(updatedHistory);
      await updateTask(uid, task.id, {
        lastUpdate: todayISO,
        streak,
      });

      setUpdateText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onRefresh();
    } catch (error) {
      console.error("Failed to save update:", error);
      setFormError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="hidden lg:block max-w-2xl mx-auto w-full px-6 pt-2">
        <Header />
      </div>

      <div className="lg:hidden flex items-center gap-4 px-6 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-30">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors active:scale-90 text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold truncate flex-1">{task.title}</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-muted transition-colors active:scale-90 text-foreground"
          >
            <Settings className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 lg:py-6 pb-24 lg:pb-10 space-y-6 max-w-2xl mx-auto w-full">
        <div className="mb-5">
          <TaskCard task={task} history={localHistory} readOnly />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">
                {alreadyChecked ? "Today's Update" : "Update Today"}
              </h3>

              {formError && (
                <p className="text-sm text-destructive mb-2">{formError}</p>
              )}

              {alreadyChecked && todayEntry && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    {todayEntry.photo && (
                      <img
                        src={todayEntry.photo}
                        className="mb-2 rounded-md w-full object-cover"
                      />
                    )}
                    <p className="text-sm">{todayEntry.text}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={toggleCommunityPost}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:bg-muted"
                    >
                      {todayEntry.communityPosts ? (
                        <>
                          <Share2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold text-primary">
                            Shared to Community
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold text-muted-foreground">
                            Private (Share Now)
                          </span>
                        </>
                      )}
                    </button>

                    {userData?.flejetConfig && (
                      <Button
                        onClick={handleScheduleToX}
                        disabled={isSchedulingToX || todayEntry.scheduledToX}
                        className="rounded-full px-4 h-9 font-bold bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-0 shadow-lg shadow-[#1DA1F2]/20 disabled:opacity-50 disabled:bg-zinc-800"
                      >
                        {isSchedulingToX ? (
                          <Loader className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Twitter
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                          />
                        )}
                        {isSchedulingToX
                          ? "Scheduling..."
                          : todayEntry.scheduledToX
                            ? "Scheduled"
                            : "Schedule to X"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!alreadyChecked && (
                <>
                  <Textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="What did you accomplish today?"
                    maxLength={280}
                    className="w-full h-24"
                  />
                  <div className="text-right text-xs text-muted-foreground mt-1">
                    {updateText.length} / 280
                  </div>

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
            </div>

            <div className="glass-effect rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">This Month's Progress</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  {showHistory ? <X /> : <History />}
                </button>
              </div>
              <CalendarView history={localHistory} />
            </div>
          </div>

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

            <div className="glass-effect rounded-2xl shadow-xl p-6 space-y-3">
              {onEdit && (
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={onEdit}
                >
                  <Settings className="w-4 h-4" />
                  Edit Habit Details
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Habit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this habit?</DialogTitle>
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
