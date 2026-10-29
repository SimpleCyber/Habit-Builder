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
  Share2,
  Settings,
  Instagram,
  Youtube,
  MessageSquare,
  Ghost,
  UserCircle,
  Loader2,
  UserX,
  Compass,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const isOwner = Boolean(user && profile && user.uid === profile.uid);

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setNotFoundError(false);

    try {
      const decodedUsername = decodeURIComponent(username);
      const userProfile = await findUserByUsername(decodedUsername);

      if (!userProfile) {
        setNotFoundError(true);
        setLoading(false);
        return;
      }

      setProfile(userProfile);

      // Fetch community posts in isolated try/catch so post failures don't 404 the user
      try {
        const userPosts = await getCommunityPostsByUser(userProfile.uid);
        setPosts((userPosts as CommunityPost[]) || []);
      } catch (postErr) {
        console.warn("Could not load user community posts:", postErr);
        setPosts([]);
      }

      // Check friend requests if viewer is logged in
      if (user) {
        try {
          const outgoing = await getOutgoingRequests(user.uid);
          setSentRequests(
            new Set(
              outgoing
                .filter((r) => r.status === "pending")
                .map((r) => r.toUid),
            ),
          );
        } catch (reqErr) {
          console.warn("Could not load outgoing friend requests:", reqErr);
        }
      }
    } catch (e) {
      console.error("Profile load error:", e);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  }, [username, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");

      if (navigator.share) {
        await navigator.share({
          title: `Check out ${profile?.name || username}'s profile on HabitX`,
          url: url,
        });
      }
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Failed to share profile");
    }
  };

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
      toast.error("Failed to send follow request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading @{username}...</p>
      </div>
    );
  }

  if (notFoundError || !profile) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-20 h-20 bg-orange-500/10 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-6 text-orange-500">
          <UserX className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black dark:text-white mb-2">User Not Found</h1>
        <p className="text-muted-foreground max-w-sm mb-6">
          We could not find a user profile registered with the username <span className="font-semibold text-foreground">@{username}</span>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" className="rounded-full px-6" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link href="/community">
            <Button variant="secondary" className="rounded-full px-6">
              <Compass className="w-4 h-4 mr-2" />
              Explore Community
            </Button>
          </Link>
          <Link href="/">
            <Button className="rounded-full px-6 bg-orange-500 hover:bg-orange-600 text-white">
              Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#080808] dark:text-white transition-colors duration-500 selection:bg-orange-500/20 text-foreground pb-20">
        {/* Profile Section */}
        <div className="p-6 relative overflow-hidden group border-b border-zinc-200 dark:border-zinc-800">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left max-w-4xl mx-auto">
            <div className="relative group cursor-pointer">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <Avatar className="w-32 h-32 rounded-3xl border-4 border-white dark:border-[#111] relative z-10 shadow-xl">
                      <AvatarImage
                        src={profile.photoURL}
                        alt={profile.name || profile.username || "Profile"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl font-bold bg-neutral-100 dark:bg-neutral-900">
                        {profile.name?.[0] || profile.username?.[0] || "?"}
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
                    {profile.name || profile.username}
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
                  {!isOwner && user && (
                    <Button
                      onClick={() => handleFollowRequest(profile.uid)}
                      disabled={sentRequests.has(profile.uid)}
                      size="sm"
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      {sentRequests.has(profile.uid) ? "Requested" : "Follow"}
                    </Button>
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
        <div className="max-w-2xl mx-auto divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <CommunityPostCard
                key={`${post.uid}-${post.task.id}-${post.update?.id || i}`}
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
              <p className="text-xs text-muted-foreground mt-1">
                Updates shared to the community by @{profile.username} will appear here.
              </p>
            </div>
          )}
        </div>
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
