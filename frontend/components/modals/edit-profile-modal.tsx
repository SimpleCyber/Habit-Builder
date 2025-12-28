"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Info,
} from "lucide-react";
import { saveUserData } from "@/lib/firebase-db";
import { toast } from "sonner";

interface EditProfileModalProps {
  onClose: () => void;
  uid: string;
  initialData: {
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    socialLinks?: Record<string, string>;
  };
  onUpdate: () => void;
}

const SOCIAL_PLATFORMS = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "discord", label: "Discord", icon: MessageSquare },
  { id: "website", label: "Website", icon: Globe },
];

export function EditProfileModal({
  onClose,
  uid,
  initialData,
  onUpdate,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialData.name || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    initialData.socialLinks || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await saveUserData(uid, {
        name,
        bio,
        location,
        socialLinks,
      });
      toast.success("Profile updated!");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" /> Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4" /> Bio
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about your habits..."
                className="h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Social Links
            </h3>
            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.id} className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <platform.icon className="w-3.5 h-3.5" /> {platform.label}
                  </label>
                  <Input
                    value={socialLinks[platform.id] || ""}
                    onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                    placeholder={`${platform.label} URL or username`}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
