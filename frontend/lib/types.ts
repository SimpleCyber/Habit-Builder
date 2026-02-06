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
  scheduledToX?: boolean;
  likes?: string[]; // Array of UIDs
  commentsCount?: number;
  timestamp: Date;
}

export interface UserData {
  streak: number;
  lastCheckIn: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  photoURL?: string | null;
  socialLinks?: Record<string, string>;
  flejetConfig?: {
    workspaceId: string;
    apiKey: string;
    userId: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  photoURL?: string;
  createdAt: any; // Timestamp
  status?: "sending" | "sent" | "error";
}

export interface Conversation {
  id: string;
  participantUids: string[];
  lastMessage?: string;
  lastMessageAt?: any; // Timestamp
  updatedAt: any; // Timestamp
  unreadCount?: Record<string, number>;
}
