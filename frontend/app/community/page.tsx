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
import { Loader } from "lucide-react";
import { toast } from "sonner";
import type { TaskHistoryEntry, Task } from "@/lib/types";
import {
  CommunityPostCard,
  type CommunityPost,
} from "@/components/community/community-post-card";

// ---------------------------------------------------------
// ✅ FINAL COMMUNITY PAGE USING communityIndex
// ---------------------------------------------------------

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
          id: item.id, // ✅ Pass the community index ID
          uid: post.uid,
          name: post.name,
          username: post.username,
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
          id: item.id,
          uid: post.uid,
          name: post.name,
          username: post.username,
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
          {displayedPosts.map((post, i) => (
            <CommunityPostCard
              key={`${post.uid}-${post.task.id}-${i}`}
              post={post}
              user={user}
              sentRequests={sentRequests}
              onFollowRequest={handleFollowRequest}
            />
          ))}
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
