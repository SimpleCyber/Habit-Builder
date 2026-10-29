"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getCommunityPostById,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import { Loader2, ArrowLeft, FileQuestion } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  CommunityPostCard,
  type CommunityPost,
} from "@/components/community/community-post-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

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
      setLoading(true);
      try {
        const data = await getCommunityPostById(postId);
        if (data) {
          setPost(data as CommunityPost);
        } else {
          setPost(null);
        }

        if (user) {
          try {
            const outgoing = await getOutgoingRequests(user.uid);
            setSentRequests(
              new Set(
                outgoing.filter((r) => r.status === "pending").map((r) => r.toUid),
              ),
            );
          } catch (e) {
            console.warn("Could not load outgoing requests:", e);
          }
        }
      } catch (err) {
        console.error("Error loading single post:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && postId) {
      load();
    }
  }, [user, authLoading, postId]);

  const handleFollowRequest = async (targetUid: string) => {
    if (!user) {
      toast.error("Please log in to follow users");
      router.push("/auth");
      return;
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          This post may have been deleted, made private, or does not exist.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => router.back()}>
            Go Back
          </Button>
          <Link href="/community">
            <Button className="rounded-full">Back to Feed</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen container mx-auto max-w-md md:max-w-xl lg:max-w-2xl border-x border-zinc-200 dark:border-zinc-800 pb-20">
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
        <CommunityPostCard
          post={post}
          user={user}
          sentRequests={sentRequests}
          onFollowRequest={handleFollowRequest}
          singleView={true}
        />
      </div>
    </main>
  );
}
