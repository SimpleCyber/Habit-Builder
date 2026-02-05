"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  MessageSquare,
  Globe,
  MapPin,
  User,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { getUserData, saveUserData, getUserProfile } from "@/lib/firebase-db";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SOCIAL_PLATFORMS = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "discord", label: "Discord", icon: MessageSquare },
  { id: "website", label: "Website", icon: Globe },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setName(profile.name || "");
          setBio(profile.bio || "");
          setLocation(profile.location || "");
          setSocialLinks(profile.socialLinks || {});
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/"); // Redirect if not logged in
      } else {
        load();
      }
    }
  }, [user, authLoading, router]);

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await saveUserData(user.uid, {
        name,
        bio,
        location,
        socialLinks,
      });
      toast.success("Profile updated!");
      router.back(); // Go back to profile
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5" /> Basic Info
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about your habits..."
                  className="h-32 resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length} characters
                </p>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" /> Social Links
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.id} className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <platform.icon className="w-3.5 h-3.5" /> {platform.label}
                  </label>
                  <Input
                    value={socialLinks[platform.id] || ""}
                    onChange={(e) =>
                      handleSocialChange(platform.id, e.target.value)
                    }
                    placeholder="Username or URL"
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-4 pt-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
