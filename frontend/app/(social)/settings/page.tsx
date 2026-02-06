"use client";

import { useState, useEffect, useRef } from "react";
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
  Moon,
  Sun,
  Monitor,
  Palette,
  Camera,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { compressImage } from "@/lib/image-utils";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setPhotoURL(profile.photoURL || "");
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const compressedBase64 = await compressImage(file);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedBase64 }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhotoURL(data.url);
      toast.success("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await saveUserData(user.uid, {
        name,
        bio,
        location,
        photoURL,
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

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 rounded-2xl border-2 border-border">
                  <AvatarImage src={photoURL} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-muted">
                    {name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8"
              >
                Change Photo
              </Button>
            </div>

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

          {/* Appearance Section */}
          <section className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" /> Appearance
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                    theme === t.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/30 bg-transparent text-muted-foreground"
                  }`}
                >
                  <t.icon className="w-6 h-6" />
                  <span className="text-sm font-bold">{t.label}</span>
                </button>
              ))}
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
