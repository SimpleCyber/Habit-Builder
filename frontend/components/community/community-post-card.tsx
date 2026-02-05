"use client";

import { useEffect, useState } from "react";
import { Loader, Flame, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  toggleCommunityPostLike,
  addCommunityPostComment,
  getCommunityPostComments,
} from "@/lib/firebase-db";
import type { TaskHistoryEntry, Task } from "@/lib/types";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------
// ✅ Shared Types & Helpers
// ---------------------------------------------------------

export interface CommunityPost {
  id?: string; // Community Index ID
  uid: string;
  name: string | null;
  username?: string | null;
  email: string;
  photoURL: string | null;

  task: Task;
  update: TaskHistoryEntry;

  isFriend: boolean;
  requestStatus: "none" | "sent";
  createdAt: string;
}

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "now";
};

const getStreakInfo = (task: Task, updateDate: string) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const update = new Date(updateDate);

  const checkedToday = update.toDateString() === today.toDateString();
  const checkedYesterday = update.toDateString() === yesterday.toDateString();

  const displayStreak = checkedToday || checkedYesterday ? task.streak : 0;

  return { checkedToday, displayStreak };
};

// ---------------------------------------------------------
// ✅ Post Card Component
// ---------------------------------------------------------

interface CommunityPostCardProps {
  post: CommunityPost;
  user: any;
  sentRequests: Set<string>;
  onFollowRequest: (uid: string) => void;
  singleView?: boolean; // If true, shows comments expanded by default & different layout
}

export function CommunityPostCard({
  post,
  user,
  sentRequests,
  onFollowRequest,
  singleView = false,
}: CommunityPostCardProps) {
  const router = useRouter();
  const { checkedToday, displayStreak } = getStreakInfo(
    post.task,
    post.update.date,
  );

  const [likes, setLikes] = useState<string[]>(post.update.likes || []);
  const [commentsCount, setCommentsCount] = useState(
    post.update.commentsCount || 0,
  );
  const [showComments, setShowComments] = useState(singleView);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLiked = user ? likes.includes(user.uid) : false;

  // Initial Load for Single View
  useEffect(() => {
    if (singleView) {
      loadComments();
    }
  }, [singleView]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    // Optimistic update
    const newLikes = isLiked
      ? likes.filter((uid) => uid !== user.uid)
      : [...likes, user.uid];
    setLikes(newLikes);

    try {
      await toggleCommunityPostLike(
        post.uid,
        post.task.id,
        post.update.id,
        user.uid,
        isLiked,
      );
    } catch (err) {
      // Revert if failed
      setLikes(likes);
      toast.error("Failed to update like");
    }
  };

  const loadComments = async () => {
    if (loadingComments || (comments.length > 0 && !singleView)) return;
    setLoadingComments(true);
    try {
      const data = await getCommunityPostComments(
        post.uid,
        post.task.id,
        post.update.id,
      );
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (singleView) return; // Always open in single view
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      await addCommunityPostComment(post.uid, post.task.id, post.update.id, {
        uid: user.uid,
        text: newComment,
        username: user.displayName || "User",
        photoURL: user.photoURL || null,
      });
      setCommentsCount((prev) => prev + 1);
      setComments((prev) => [
        ...prev,
        {
          id: "temp-" + Date.now(),
          uid: user.uid,
          text: newComment,
          username: user.displayName || "User",
          photoURL: user.photoURL || null,
          createdAt: new Date(),
        },
      ]);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = () => {
    if (!singleView && post.id) {
      router.push(`/community/${post.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex gap-4 p-4 transition-colors ${
        !singleView
          ? "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 cursor-pointer"
          : ""
      }`}
    >
      {/* Left: Avatar */}
      <div className="flex-shrink-0">
        <img
          src={post.photoURL || "/placeholder.svg"}
          className="w-10 h-10 rounded-full object-cover"
          alt={post.name || "User"}
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-bold text-base truncate text-zinc-900 dark:text-zinc-100">
              {post.name}
            </span>
            <span className="text-muted-foreground text-sm truncate">
              {post.username ? `@${post.username}` : post.email}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm hover:underline">
              {timeAgo(post.update.date)}
            </span>
          </div>

          {/* Follow Button */}
          {!post.isFriend &&
            !sentRequests.has(post.uid) &&
            user?.uid !== post.uid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFollowRequest(post.uid);
                }}
                className="flex-shrink-0 ml-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold px-3 py-1 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Follow
              </button>
            )}
          {sentRequests.has(post.uid) && (
            <span className="text-xs text-muted-foreground font-medium px-2">
              Requested
            </span>
          )}
        </div>

        {/* Post Content */}
        <div className="mt-1 text-base text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-normal">
          {post.update.text}
        </div>

        {/* Image Attachment */}
        {post.update.photo && (
          <div className="mt-3">
            <img
              src={post.update.photo}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-700 max-h-[400px] w-auto object-cover"
              alt="Update attachment"
            />
          </div>
        )}

        {/* Footer / Context & Actions */}
        <div className="mt-3 flex items-center justify-between">
          {/* Context (Task & Streak) */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-600 transition-colors">
            <Flame
              className={`w-3.5 h-3.5 ${checkedToday ? "text-orange-500" : ""}`}
            />
            <span>{post.task.title}</span>
            <span>•</span>
            <span className={checkedToday ? "font-bold text-orange-600" : ""}>
              {displayStreak} day streak
            </span>
          </div>

          {/* Actions (Right Aligned) */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isLiked
                  ? "text-red-500 font-medium"
                  : "text-zinc-500 hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likes.length}</span>
            </button>

            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div
            className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingComments && comments.length === 0 && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                Loading comments...
              </div>
            )}

            <div className="space-y-4 mb-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <img
                    src={c.photoURL || "/placeholder.svg"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {c.name || c.username}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        @{c.username}
                      </span>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-normal">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* LinkedIn Style Input */}
            <div className="flex items-start gap-3 mt-4">
              <img
                src={user?.photoURL || "/placeholder.svg"}
                className="w-8 h-8 rounded-full object-cover mt-1"
              />
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 resize-none min-h-[50px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <button
                  disabled={submitting || !newComment.trim()}
                  onClick={handleSendComment}
                  className="absolute right-3 bottom-3 text-blue-500 disabled:opacity-50 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
