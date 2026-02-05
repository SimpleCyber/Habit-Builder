"use client";

import {
  findUserByUsername,
  getCommunityPostsByUser,
  getOutgoingRequests,
  sendFriendRequest,
} from "@/lib/firebase-db";
import {
  CommunityPostCard,
  type CommunityPost,
} from "@/components/community/community-post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  MapPin,
  Coffee,
  Share2,
  Settings,
  Instagram,
  Youtube,
  MessageSquare,
  Ghost,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SocialLayout } from "@/components/layout/social-layout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PublicProfilePage() {
  const params = useParams();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const isOwner = user && profile && user.uid === profile.uid;

  const load = async () => {
    if (!username) return;
    try {
      const userProfile = await findUserByUsername(
        decodeURIComponent(username),
      );
      if (!userProfile) {
        setNotFoundError(true);
        return;
      }
      setProfile(userProfile);

      // Fetch community posts
      // @ts-ignore
      const userPosts = await getCommunityPostsByUser(userProfile.uid);
      // @ts-ignore
      setPosts(userPosts);

      // Check friend requests if logged in
      if (user) {
        const outgoing = await getOutgoingRequests(user.uid);
        setSentRequests(
          new Set(
            outgoing.filter((r) => r.status === "pending").map((r) => r.toUid),
          ),
        );
      }
    } catch (e) {
      console.error(e);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [username, user]); // Added user to dependency array to reload request status

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");

      if (navigator.share) {
        await navigator.share({
          title: `Check out ${profile.name}'s posts on HabitX`,
          url: url,
        });
      }
    } catch (err) {
      console.error("Share/Copy failed", err);
      toast.error("Failed to share profile");
    }
  };

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

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center transition-colors duration-300">
        <div className="animate-pulse flex flex-col items-center">
          <Coffee className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4 animate-bounce" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );

  if (notFoundError)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center transition-colors duration-300">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Coffee className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold dark:text-white mb-4">404</h1>
        <p className="text-gray-500 mb-8">User @{username} not found.</p>
        <Link href="/">
          <Button variant="outline" className="rounded-full px-8">
            Go Home
          </Button>
        </Link>
      </div>
    );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#080808] dark:text-white transition-colors duration-500 selection:bg-orange-500/20 text-foreground">
        <SocialLayout>
          {/* Profile Section */}
          <div className="p-6 relative overflow-hidden group border-b border-zinc-200 dark:border-zinc-800">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="relative group cursor-pointer">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                      <Avatar className="w-32 h-32 rounded-3xl border-4 border-white dark:border-[#111] relative z-10 shadow-xl">
                        <AvatarImage
                          src={profile.photoURL}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-4xl font-bold bg-neutral-100 dark:bg-neutral-900">
                          {profile.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-48 p-2 glass-effect border-border shadow-2xl rounded-xl"
                  >
                    <DropdownMenuItem className="flex items-center gap-2 font-bold cursor-pointer hover:bg-orange-500/10 focus:bg-orange-500/10 rounded-lg">
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight leading-tight">
                      {profile.name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <p className="text-orange-600 dark:text-orange-400 font-bold text-base">
                        @{profile.username}
                      </p>
                      {profile.location && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-10 w-10 glass-effect hover:bg-orange-500/5 transition-colors"
                      onClick={handleShare}
                      title="Share Profile"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {isOwner && (
                      <Link href="/settings">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl h-10 w-10 glass-effect hover:bg-orange-500/5 transition-colors"
                          title="Edit Profile"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground text-base leading-relaxed font-medium max-w-md">
                    {profile.bio}
                  </p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                  {profile.socialLinks &&
                    Object.entries(profile.socialLinks).map(
                      ([platform, url]) =>
                        url && (
                          <SocialLink
                            key={platform}
                            platform={platform}
                            href={url as string}
                          />
                        ),
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.length > 0 ? (
              posts.map((post, i) => (
                <CommunityPostCard
                  key={`${post.uid}-${post.task.id}-${i}`}
                  post={post}
                  user={user}
                  sentRequests={sentRequests}
                  onFollowRequest={handleFollowRequest}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <Ghost className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground font-bold text-lg uppercase tracking-tight">
                  No Posts Yet
                </p>
              </div>
            )}
          </div>
        </SocialLayout>
      </div>
    </TooltipProvider>
  );
}

const PLATFORM_ICONS: Record<string, any> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  discord: MessageSquare,
  website: Globe,
};

function SocialLink({ platform, href }: { platform: string; href: string }) {
  const IconComponent = PLATFORM_ICONS[platform] || Globe;
  const safeHref = href.startsWith("http") ? href : `https://${href}`;

  // Extract a readable username or label from the URL
  let label = href;
  try {
    if (href.startsWith("http")) {
      const url = new URL(href);
      label = url.pathname.replace(/^\/+/, "") || url.hostname;
    }
  } catch (e) {}

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-background text-muted-foreground hover:bg-muted hover:text-orange-500 transition-all border border-border shadow-sm hover:scale-110 active:scale-90"
        >
          <IconComponent className="w-5 h-5" />
        </a>
      </TooltipTrigger>
      <TooltipContent className="bg-orange-500 text-white border-none font-bold shadow-lg">
        <p>{label || platform}</p>
      </TooltipContent>
    </Tooltip>
  );
}
