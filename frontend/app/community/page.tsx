"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import {
  getCommunityIndexPage,
  getCommunityPostByReference,
  getMyFriends,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import { Loader, Flame } from "lucide-react";
import { toast } from "sonner";
import type { TaskHistoryEntry, Task } from "@/lib/types";

// ---------------------------------------------------------
// FINAL COMMUNITY PAGE USING communityIndex
// ---------------------------------------------------------

interface CommunityPost {
  uid: string;
  name: string | null;
  email: string;
  photoURL: string | null;

  task: Task;
  update: TaskHistoryEntry;

  isFriend: boolean;
  requestStatus: "none" | "sent";
  createdAt: string;
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const observerTarget = useRef<HTMLDivElement>(null);
  const POSTS_PER_LOAD = 5;

  const lastIndexDoc = useRef<any>(null);

  // -----------------------------
  // ✅ Fetch initial community posts
  // -----------------------------
  const fetchCommunityData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // ✅ Load friends + outgoing requests
      const [friendsList, outgoing] = await Promise.all([
        getMyFriends(user.uid),
        getOutgoingRequests(user.uid),
      ]);

      const friendUids = new Set(friendsList.map((f) => f.uid));
      const sentUids = new Set(
        outgoing.filter((r) => r.status === "pending").map((r) => r.toUid),
      );

      setFriends(friendUids);
      setSentRequests(sentUids);

      // ✅ Load first page from communityIndex
      const { index, lastDoc } = await getCommunityIndexPage(POSTS_PER_LOAD);
      lastIndexDoc.current = lastDoc;

      const fullPosts: CommunityPost[] = [];

      for (const item of index) {
        const post = await getCommunityPostByReference(
          item.userId,
          item.taskId,
          item.historyId,
        );

        if (!post) continue;

        fullPosts.push({
          uid: post.uid,
          name: post.name,
          email: post.email,
          photoURL: post.photoURL,

          task: post.task as Task,
          update: post.update as TaskHistoryEntry,

          isFriend: friendUids.has(post.uid),
          requestStatus: sentUids.has(post.uid) ? "sent" : "none",

          createdAt: post.createdAt,
        });
      }

      setPosts(fullPosts); // ✅ only first page, not everything
      setDisplayedPosts(fullPosts);
    } catch (err) {
      console.error("Error loading community feed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // -----------------------------
  // ✅ Load next page from firestore (real pagination)
  // -----------------------------
  const loadMore = useCallback(async () => {
    if (!lastIndexDoc.current || loading) return;

    try {
      setLoading(true);

      const { index, lastDoc } = await getCommunityIndexPage(
        POSTS_PER_LOAD,
        lastIndexDoc.current,
      );
      lastIndexDoc.current = lastDoc;

      const newPosts: CommunityPost[] = [];

      for (const item of index) {
        const post = await getCommunityPostByReference(
          item.userId,
          item.taskId,
          item.historyId,
        );

        if (!post) continue;

        newPosts.push({
          uid: post.uid,
          name: post.name,
          email: post.email,
          photoURL: post.photoURL,

          task: post.task as Task,
          update: post.update as TaskHistoryEntry,

          isFriend: friends.has(post.uid),
          requestStatus: sentRequests.has(post.uid) ? "sent" : "none",

          createdAt: post.createdAt,
        });
      }

      // ✅ Append the new posts
      setPosts((prev) => [...prev, ...newPosts]);
      setDisplayedPosts((prev) => [...prev, ...newPosts]);
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoading(false);
    }
  }, [friends, sentRequests, loading]);

  // ✅ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.2 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [loadMore, loading]);

  // ✅ initial fetch
  useEffect(() => {
    if (!authLoading && user) fetchCommunityData();
  }, [authLoading, user, fetchCommunityData]);

  // ---------------------------------------------------------
  // ✅ Follow Request Handler
  // ---------------------------------------------------------
  const handleFollowRequest = async (targetUid: string) => {
    if (!user) return;

    if (sentRequests.has(targetUid)) {
      toast.warning("Request already sent");
      return;
    }

    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      toast.success("Follow request sent!");

      const updated = await getOutgoingRequests(user.uid);
      const newSet = new Set(
        updated.filter((r) => r.status === "pending").map((r) => r.toUid),
      );
      setSentRequests(newSet);
    } catch {
      toast.error("Failed to send request");
    }
  };

  // ---------------------------------------------------------
  // ✅ Helper: Relative Time
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // ✅ Streak logic
  // ---------------------------------------------------------
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
  // ✅ Render
  // ---------------------------------------------------------

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen container mx-auto max-w-md md:max-w-xl lg:max-w-2xl border-x border-zinc-200 dark:border-zinc-800 min-h-[100dvh]">
      <Header />

      <div className="">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
          <h1 className="text-xl font-bold">Community</h1>
        </div>

        {/* Loading */}
        {loading && posts.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No community posts yet.
          </div>
        )}

        {/* Feed */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {displayedPosts.map((post, i) => {
            const { checkedToday, displayStreak } = getStreakInfo(
              post.task,
              post.update.date,
            );

            return (
              <div
                key={`${post.uid}-${post.task.id}-${i}`}
                className="flex gap-4 p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
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
                        {post.email}
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
                            handleFollowRequest(post.uid);
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

                  {/* Footer / Context (Task & Streak) */}
                  <div className="mt-3 flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-600 transition-colors">
                      <Flame
                        className={`w-3.5 h-3.5 ${checkedToday ? "text-orange-500" : ""}`}
                      />
                      <span>{post.task.title}</span>
                      <span>•</span>
                      <span
                        className={
                          checkedToday ? "font-bold text-orange-600" : ""
                        }
                      >
                        {displayStreak} day streak
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Infinite Loader */}
        {lastIndexDoc.current && (
          <div
            ref={observerTarget}
            className="py-8 text-center flex justify-center"
          >
            {loading && (
              <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
