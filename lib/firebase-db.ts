import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Task {
  id: string
  title: string
  reason: string
  icon: string
  streak: number
  lastUpdate: string | null
  history: TaskHistoryEntry[]
  createdAt: string
}

export interface TaskHistoryEntry {
  date: string
  text: string
  photo: string | null
}

export interface HistoryEntry {
  id: string
  date: string
  tasks: Task[]
  photo?: string
  timestamp: Date
}

export interface UserData {
  streak: number
  lastCheckIn: string
  tasks: Task[]
}

// Get user data
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        streak: data.streak || 0,
        lastCheckIn: data.lastCheckIn || "",
        tasks: data.tasks || [],
      }
    }
    return null
  } catch (error) {
    console.error("[v0] Error getting user data:", error)
    return null
  }
}

// Save user data
export const saveUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const docRef = doc(db, "users", userId)
    await setDoc(docRef, data, { merge: true })
    return { error: null }
  } catch (error: any) {
    console.error("[v0] Error saving user data:", error)
    return { error: error.message }
  }
}

// Get paginated history
export const getPaginatedHistory = async (userId: string, pageSize = 10, lastDoc?: DocumentSnapshot) => {
  try {
    const historyRef = collection(db, "users", userId, "history")
    let q = query(historyRef, orderBy("timestamp", "desc"), limit(pageSize))

    if (lastDoc) {
      q = query(historyRef, orderBy("timestamp", "desc"), startAfter(lastDoc), limit(pageSize))
    }

    const snapshot = await getDocs(q)
    const history: HistoryEntry[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      history.push({
        id: doc.id,
        date: data.date,
        tasks: data.tasks || [],
        photo: data.photo,
        timestamp: data.timestamp?.toDate() || new Date(),
      })
    })

    return {
      history,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
      error: null,
    }
  } catch (error: any) {
    console.error("[v0] Error getting history:", error)
    return { history: [], lastDoc: null, hasMore: false, error: error.message }
  }
}

// Add history entry
export const addHistoryEntry = async (userId: string, entry: Omit<HistoryEntry, "id" | "timestamp">) => {
  try {
    const historyRef = collection(db, "users", userId, "history")
    const docRef = doc(historyRef)
    await setDoc(docRef, {
      ...entry,
      timestamp: Timestamp.now(),
    })
    return { error: null }
  } catch (error: any) {
    console.error("[v0] Error adding history:", error)
    return { error: error.message }
  }
}

// Delete task
export const deleteTask = async (userId: string, taskId: string) => {
  try {
    const userData = await getUserData(userId)
    if (userData) {
      const updatedTasks = userData.tasks.filter((t) => t.id !== taskId)
      await saveUserData(userId, { tasks: updatedTasks })
    }
    return { error: null }
  } catch (error: any) {
    console.error("[v0] Error deleting task:", error)
    return { error: error.message }
  }
}
