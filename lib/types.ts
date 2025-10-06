export interface Task {
  id: string
  title: string
  reason: string
  icon: string
  streak: number
  lastUpdate: string | null
  history: HistoryEntry[]
  createdAt: string
}

export interface HistoryEntry {
  date: string
  text: string
  photo: string | null
}
