export interface Task {
  id: string;
  title: string;
  reason: string;
  icon: string;
  iconBg?: string;
  streak: number;
  lastUpdate: string | null;
  history: HistoryEntry[];
  createdAt: string;
  visibility?: "public" | "private";
}

export interface HistoryEntry {
  date: string;
  text: string;
  photo: string | null;
}
