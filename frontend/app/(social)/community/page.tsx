"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  getCommunityIndexPage,
  getCommunityPostByReference,
  getMyFriends,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import { Loader2 } from "lucide-react";
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
  const router = useRouter();

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
    try {
      setLoading(true);

      let friendUids = new Set<string>();
      let sentUids = new Set<string>();

      // Load friends + outgoing requests only if logged in
      if (user) {
        try {
          const [friendsList, outgoing] = await Promise.all([
            getMyFriends(user.uid),
            getOutgoingRequests(user.uid),
          ]);

          friendUids = new Set(friendsList.map((f) => f.uid));
          sentUids = new Set(
            outgoing.filter((r) => r.status === "pending").map((r) => r.toUid),
          );
        } catch (friendErr) {
          console.warn("Could not load friend status:", friendErr);
        }
      }

      setFriends(friendUids);
      setSentRequests(sentUids);

      // Load first page from communityIndex
      const { index, lastDoc } = await getCommunityIndexPage(POSTS_PER_LOAD);
      lastIndexDoc.current = lastDoc;

      const fullPosts = (
        await Promise.all(
          index.map(async (item) => {
            try {
              const post = await getCommunityPostByReference(
                item.userId,
                item.taskId,
                item.historyId,
              );

              if (!post) return null;

              return {
                id: item.id,
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
              } as CommunityPost;
            } catch {
              return null;
            }
          }),
        )
      ).filter((p): p is CommunityPost => p !== null);

      setPosts(fullPosts);
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

      const newPosts = (
        await Promise.all(
          index.map(async (item) => {
            try {
              const post = await getCommunityPostByReference(
                item.userId,
                item.taskId,
                item.historyId,
              );

              if (!post) return null;

              return {
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
              } as CommunityPost;
            } catch {
              return null;
            }
          }),
        )
      ).filter((p): p is CommunityPost => p !== null);

      // Append the new posts
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
    if (!authLoading) fetchCommunityData();
  }, [authLoading, fetchCommunityData]);

  // ---------------------------------------------------------
  // ✅ Follow Request Handler
  // ---------------------------------------------------------
  const handleFollowRequest = async (targetUid: string) => {
    if (!user) {
      toast.error("Please log in to follow users");
      router.push("/auth");
      return;
    }

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen pb-20">
      <div className="p-5 border-b border-r-1 border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-bold">Community</h1>
      </div>

      {/* Loading */}
      {loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading community feed...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="text-center text-muted-foreground py-16 p-6">
          <p className="text-base font-semibold mb-1">No community posts yet.</p>
          <p className="text-xs">Check in on your habits and share them to the community to be the first!</p>
        </div>
      )}

      {/* Feed */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {displayedPosts.map((post, i) => (
          <CommunityPostCard
            key={`${post.uid}-${post.task?.id || i}-${post.id}`}
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
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}
