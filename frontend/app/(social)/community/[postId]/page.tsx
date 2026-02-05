"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import {
  getCommunityPostById,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import { Loader, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  CommunityPostCard,
  type CommunityPost,
} from "@/components/community/community-post-card";
import { toast } from "sonner";

export default function SinglePostPage() {
  const params = useParams();
  const postId = params?.postId as string;
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getCommunityPostById(postId);
        if (data) {
          // @ts-ignore
          setPost(data);
        } else {
          toast.error("Post not found");
          router.push("/community");
        }

        const outgoing = await getOutgoingRequests(user.uid);
        setSentRequests(
          new Set(
            outgoing.filter((r) => r.status === "pending").map((r) => r.toUid),
          ),
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user && postId) load();
  }, [user, authLoading, postId]);

  const handleFollowRequest = async (targetUid: string) => {
    if (!user) return;
    if (sentRequests.has(targetUid)) return;
    try {
      await sendFriendRequest(user.uid, targetUid, "all");
      toast.success("Follow request sent!");
      setSentRequests((prev) => new Set(prev).add(targetUid));
    } catch {
      toast.error("Failed to send request");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen container mx-auto max-w-md md:max-w-xl lg:max-w-2xl border-x border-zinc-200 dark:border-zinc-800 min-h-[100dvh]">
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </div>

      <div className="p-4">
        {post ? (
          <CommunityPostCard
            post={post}
            user={user}
            sentRequests={sentRequests}
            onFollowRequest={handleFollowRequest}
            singleView={true}
          />
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Post not found
          </div>
        )}
      </div>
    </main>
  );
}
