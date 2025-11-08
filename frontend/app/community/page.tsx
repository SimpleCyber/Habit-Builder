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
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type { Task } from "@/lib/types";

interface HistoryItem {
  text: string;
  date: string;
  photo?: string;
}

interface CommunityPost {
  uid: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  task: Task;
  update: HistoryItem;
  isFriend: boolean;
  requestStatus: "none" | "sent" | "received";
  createdAt: string;
}

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
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

  const fetchCommunityData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [friendsList, sentReqs] = await Promise.all([
        getMyFriends(user.uid),
        getOutgoingRequests(user.uid) as Promise<FriendRequest[]>,
      ]);

      const friendUids = new Set(friendsList.map((f) => f.uid));
      const sentUids = new Set(
        sentReqs
          .filter((r) => r.status === "pending")
          .map((r) => r.toUid)
          .filter((id) => id !== user.uid),
      );

      setFriends(friendUids);
      setSentRequests(sentUids);

      const allPosts: CommunityPost[] = [];
      const usersSnapshot = await getDocs(collection(db, "users"));

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        if (userId === user.uid) continue;

        const userData = userDoc.data();
        const tasks = userData.tasks || [];

        for (const task of tasks) {
          if (!task.history || task.history.length === 0) continue;
          const isFriend = friendUids.has(userId);
          const requestStatus = sentUids.has(userId)
            ? ("sent" as const)
            : ("none" as const);

          for (const h of task.history) {
            if (!h.text && !h.photo) continue;
            allPosts.push({
              uid: userId,
              name: userData.name || null,
              email: userData.email || "",
              photoURL: userData.photoURL || null,
              task,
              update: h,
              isFriend,
              requestStatus,
              createdAt: h.date || new Date().toISOString(),
            });
          }
        }
      }

      const validPosts = allPosts.filter(
        (p) => p.update && (p.update.text || p.update.photo),
      );
      const sorted = validPosts
        .map((p) => ({ ...p, _random: Math.random() * 0.3 }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() +
            b._random * 1000 -
            (new Date(a.createdAt).getTime() + a._random * 1000),
        );

      setPosts(sorted);
      currentIndex.current = 0;
      setDisplayedPosts(sorted.slice(0, POSTS_PER_LOAD));
    } catch (error) {
      console.error("Error fetching community data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMorePosts = useCallback(() => {
    const nextIndex = currentIndex.current + POSTS_PER_LOAD;
    if (nextIndex < posts.length) {
      currentIndex.current = nextIndex;
      setDisplayedPosts(posts.slice(0, nextIndex + POSTS_PER_LOAD));
    }
  }, [posts]);

  const handleFollowRequest = async (targetUid: string) => {
    if (!user) return;

    if (sentRequests.has(targetUid)) {
      toast.warning("Follow request already sent!");
      return;
    }
    if (friends.has(targetUid)) {
      toast.info("You are already following this user!");
      return;
    }

    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      toast.success("Follow request sent!");
      const updated = (await getOutgoingRequests(user.uid)) as FriendRequest[];
      const newSet = new Set(
        updated.filter((r) => r.status === "pending").map((r) => r.toUid),
      );
      setSentRequests(newSet);
    } catch (error) {
      console.error("Error sending follow request:", error);
      toast.error("Failed to send follow request.");
    }
  };

  const getStreakInfo = (task: Task) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.toDateString() === d2.toDateString();
    const checkedToday = task.history?.some((h) =>
      isSameDay(new Date(h.date), today),
    );
    const checkedYesterday = task.history?.some((h) =>
      isSameDay(new Date(h.date), yesterday),
    );
    const displayStreak = checkedToday || checkedYesterday ? task.streak : 0;

    return { checkedToday, displayStreak };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayedPosts.length < posts.length &&
          !loading
        ) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedPosts.length, posts.length, loading, loadMorePosts]);

  useEffect(() => {
    if (!authLoading && user) fetchCommunityData();
  }, [user, authLoading, fetchCommunityData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f9fafc] to-[#eef1f5] dark:from-[#0c0c0d] dark:to-[#111113] ">
      <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
        <Header />
        <div className="container mx-auto max-w-2xl p-4 sm:p-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover</h1>
          <p className="text-muted-foreground mb-8">
            See what your friends are building. Connect with others and discover
            new habits.
          </p>

          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No community posts yet — check back soon!
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {displayedPosts.map((post, idx) => {
                  const { checkedToday, displayStreak } = getStreakInfo(
                    post.task,
                  );

                  return (
                    <div
                      key={`${post.uid}-${post.task.id}-${idx}`}
                      className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.photoURL || "/placeholder.svg"}
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {post.name || "Unknown"}
                            </h3>
                          </div>
                        </div>

                        {post.isFriend ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium">
                            Friend
                          </span>
                        ) : sentRequests.has(post.uid) ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                            Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleFollowRequest(post.uid)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium shadow-sm transition-all"
                          >
                            <UserPlus className="w-3 h-3" /> Follow
                          </button>
                        )}
                      </div>

                      {/* Task Info */}
                      <div className="px-5 py-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-foreground">
                            {post.task.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {post.task.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-orange-500">
                            {displayStreak}
                          </span>
                          <Flame
                            className={`w-6 h-6 ${
                              checkedToday
                                ? "text-orange-500 fill-orange-500 animate-pulse"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Update Content */}
                      <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <h4 className="text-sm font-semibold text-foreground">
                            Updated on{" "}
                            {new Date(post.update.date).toLocaleDateString()}
                          </h4>
                        </div>

                        {post.update.photo && (
                          <img
                            src={post.update.photo}
                            alt="Progress"
                            className="w-full h-56 object-cover rounded-xl mb-3 shadow-sm"
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

              {displayedPosts.length < posts.length && (
                <div ref={observerTarget} className="py-8 text-center">
                  <Loader className="w-5 h-5 animate-spin inline-block" />
                  <p className="text-muted-foreground">Loading more posts...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
