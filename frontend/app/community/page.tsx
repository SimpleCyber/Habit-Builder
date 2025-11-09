"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import {
  getMyFriends,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import { Loader, UserPlus, Clock, Flame } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type { TaskHistoryEntry, Task } from "@/lib/types";

// ---------------------------------------------------------
// FINAL COMMUNITY PAGE WITH NEW FIRESTORE STRUCTURE
// ---------------------------------------------------------

interface CommunityPost {
  uid: string;
  name: string | null;
  email: string;
  photoURL: string | null;

  task: Task; // no history inside
  update: TaskHistoryEntry; // single history doc

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
  const currentIndex = useRef(0);
  const POSTS_PER_LOAD = 3;

  // --------------------------
  // ✅ Fetch all community posts
  // --------------------------
  const fetchCommunityData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1️⃣ Fetch friends + outgoing requests
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

      // 2️⃣ Fetch all users
      const usersSnap = await getDocs(collection(db, "users"));
      const finalPosts: CommunityPost[] = [];

      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        if (userId === user.uid) continue; // skip myself

        const userData = userDoc.data();
        const tasksSnap = await getDocs(
          collection(db, "users", userId, "tasks"),
        );

        // 3️⃣ For each task, load only community-posted history entries
        for (const taskDoc of tasksSnap.docs) {
          const task = taskDoc.data() as Task;

          const historySnap = await getDocs(
            query(
              collection(db, "users", userId, "tasks", task.id, "history"),
              orderBy("timestamp", "desc"),
            ),
          );

          for (const h of historySnap.docs) {
            const hist = h.data() as TaskHistoryEntry;

            // Ignore empty posts
            if (!hist.text && !hist.photo) continue;
            if (!hist.communityPosts) continue;

            finalPosts.push({
              uid: userId,
              name: userData.name || null,
              email: userData.email || "",
              photoURL: userData.photoURL || null,

              task,
              update: hist,

              isFriend: friendUids.has(userId),
              requestStatus: sentUids.has(userId) ? "sent" : "none",

              createdAt: hist.date,
            });
          }
        }
      }

      // Randomized + date-based sorting
      const sorted = finalPosts
        .map((p) => ({ ...p, _r: Math.random() * 0.2 }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() +
            b._r -
            (new Date(a.createdAt).getTime() + a._r),
        );

      setPosts(sorted);
      currentIndex.current = 0;
      setDisplayedPosts(sorted.slice(0, POSTS_PER_LOAD));
    } catch (err) {
      console.error("Error loading community feed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ---------------------------------------------------------
  // ✅ Load more posts on scroll
  // ---------------------------------------------------------
  const loadMore = useCallback(() => {
    const nextIndex = currentIndex.current + POSTS_PER_LOAD;

    if (nextIndex < posts.length) {
      currentIndex.current = nextIndex;
      setDisplayedPosts(posts.slice(0, nextIndex + POSTS_PER_LOAD));
    }
  }, [posts]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayedPosts.length < posts.length &&
          !loading
        ) {
          loadMore();
        }
      },
      { threshold: 0.2 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedPosts.length, posts.length, loadMore, loading]);

  // Initial load
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
  // ✅ Streak calculation (minimal history mode)
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
  // ✅ RENDER
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
              post.update.date,
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
        {displayedPosts.length < posts.length && (
          <div ref={observerTarget} className="py-12 text-center">
            <Loader className="w-6 h-6 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </main>
  );
}
