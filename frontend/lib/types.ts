// types.ts

export interface Task {
  id: string;
  title: string;
  reason: string;
  icon: string;
  iconBg?: string;
  streak: number;
  lastUpdate: string | null;
  createdAt: string;
  visibility?: "public" | "private";
}

export interface TaskHistoryEntry {
  id: string;
  date: string; // ISO string
  text: string;
  photo: string | null; // BASE64 ✅
  communityPosts?: boolean;
  likes?: string[]; // Array of UIDs
  commentsCount?: number;
  timestamp: Date;
}

export interface UserData {
  streak: number;
  lastCheckIn: string;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  socialLinks?: Record<string, string>;
}
