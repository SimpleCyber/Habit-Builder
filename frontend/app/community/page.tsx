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
import { Loader, UserPlus, Clock, Flame } from "lucide-react";
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
        outgoing.filter((r) => r.status === "pending").map((r) => r.toUid)
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
          item.historyId
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
        lastIndexDoc.current
      );
      lastIndexDoc.current = lastDoc;

      const newPosts: CommunityPost[] = [];

      for (const item of index) {
        const post = await getCommunityPostByReference(
          item.userId,
          item.taskId,
          item.historyId
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
      { threshold: 0.2 }
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
        updated.filter((r) => r.status === "pending").map((r) => r.toUid)
      );
      setSentRequests(newSet);
    } catch {
      toast.error("Failed to send request");
    }
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
    <main className="min-h-screen container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
      <Header />

      <div className="container mx-auto max-w-2xl p-4">
        <h1 className="text-3xl font-bold mb-2">Discover</h1>
        <p className="text-muted-foreground mb-6">
          See what others are building every day.
        </p>

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
        <div className="space-y-6">
          {displayedPosts.map((post, i) => {
            const { checkedToday, displayStreak } = getStreakInfo(
              post.task,
              post.update.date
            );

            return (
              <div
                key={`${post.uid}-${post.task.id}-${i}`}
                className="rounded-2xl bg-white dark:bg-zinc-900 border shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.photoURL || "/placeholder.svg"}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{post.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {post.email}
                      </div>
                    </div>
                  </div>

                  {/* Follow */}
                  {post.isFriend ? (
                    <span className="px-3 py-1 rounded-full bg-green-600/10 text-green-600 text-xs font-medium">
                      Friend
                    </span>
                  ) : sentRequests.has(post.uid) ? (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium">
                      Request Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFollowRequest(post.uid)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
                    >
                      <UserPlus className="w-3 h-3" /> Follow
                    </button>
                  )}
                </div>

                {/* Task + streak */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">{post.task.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {post.task.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-orange-500">
                      {displayStreak}
                    </span>
                    <Flame
                      className={`w-6 h-6 ${
                        checkedToday
                          ? "text-orange-500 fill-orange-500"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Update */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Updated on{" "}
                      {new Date(post.update.date).toLocaleDateString()}
                    </span>
                  </div>

                  {post.update.photo && (
                    <img
                      src={post.update.photo}
                      className="w-full h-52 rounded-xl object-cover mb-3"
                    />
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.update.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Infinite Loader */}
        {lastIndexDoc.current && (
          <div ref={observerTarget} className="py-12 text-center">
            <Loader className="w-6 h-6 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </main>
  );
}
