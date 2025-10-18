import {
  collection,
  doc,
  where,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Task {
  id: string;
  title: string;
  reason: string;
  icon: string;
  streak: number;
  lastUpdate: string | null;
  history: TaskHistoryEntry[];
  createdAt: string;
  iconBg?: string;
  visibility?: "public" | "private";
}

export interface TaskHistoryEntry {
  date: string;
  text: string;
  photo: string | null;
}

export interface HistoryEntry {
  id: string;
  date: string;
  tasks: Task[];
  photo?: string;
  timestamp: Date;
}

export interface UserData {
  streak: number;
  lastCheckIn: string;
  tasks: Task[];
}

// Get user data
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        streak: data.streak || 0,
        lastCheckIn: data.lastCheckIn || "",
        tasks: data.tasks || [],
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Save user data
export const saveUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, data, { merge: true });
    return { error: null };
  } catch (error: any) {
    console.error("Error saving user data:", error);
    return { error: error.message };
  }
};

// Get paginated history
export const getPaginatedHistory = async (
  userId: string,
  pageSize = 10,
  lastDoc?: DocumentSnapshot,
) => {
  try {
    const historyRef = collection(db, "users", userId, "history");
    let q = query(historyRef, orderBy("timestamp", "desc"), limit(pageSize));

    if (lastDoc) {
      q = query(
        historyRef,
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(pageSize),
      );
    }

    const snapshot = await getDocs(q);
    const history: HistoryEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        date: data.date,
        tasks: data.tasks || [],
        photo: data.photo,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });

    return {
      history,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
      error: null,
    };
  } catch (error: any) {
    console.error("Error getting history:", error);
    return { history: [], lastDoc: null, hasMore: false, error: error.message };
  }
};

// Add history entry
export const addHistoryEntry = async (
  userId: string,
  entry: Omit<HistoryEntry, "id" | "timestamp">,
) => {
  try {
    const historyRef = collection(db, "users", userId, "history");
    const docRef = doc(historyRef);
    await setDoc(docRef, {
      ...entry,
      timestamp: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    console.error("Error adding history:", error);
    return { error: error.message };
  }
};

// Delete task
export const deleteTask = async (userId: string, taskId: string) => {
  try {
    const userData = await getUserData(userId);
    if (userData) {
      const updatedTasks = userData.tasks.filter((t) => t.id !== taskId);
      await saveUserData(userId, { tasks: updatedTasks });
    }
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return { error: error.message };
  }
};


export async function ensureUserProfile(
  uid: string,
  email: string,
  name?: string | null,
  photoURL?: string | null,
) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const base = {
    uid,
    email,
    emailLower: (email || "").toLowerCase(),
    name: name || null,
    nameLower: (name || "").toLowerCase() || null,
    photoURL: photoURL || null,
  };
  if (!snap.exists()) {
    await setDoc(ref, { ...base, createdAt: Date.now() });
  } else {
    const data = snap.data() || {};
    const next = {
      ...data,
      ...base,
      createdAt: data.createdAt || Date.now(),
    };
    await setDoc(ref, next, { merge: true });
  }
}
// </CHANGE>

export async function findUserByEmail(email: string) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, email: docSnap.data().email };
}



export async function getSentRequests() {
  // In real usage, pass the current user's uid; for now we'll return empty
  return [];
}


export async function getIncomingRequests(myUid: string) {
  const qReq = query(
    collection(db, "friendRequests"),
    where("toUid", "==", myUid),
    where("status", "==", "pending"),
  );
  const [snap, meSnap] = await Promise.all([
    getDocs(qReq),
    getDoc(doc(db, "users", myUid)),
  ]);
  const myTasks = (meSnap.data()?.tasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
  }));
  const availableTaskIds = myTasks.map((t: any) => t.id);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    availableTasks: myTasks,
    availableTaskIds,
  }));
}

export async function getMyFriends(myUid: string) {
  const qSent = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", myUid),
    where("status", "==", "accepted"),
  );
  const qReceived = query(
    collection(db, "friendRequests"),
    where("toUid", "==", myUid),
    where("status", "==", "accepted"),
  );
  const [sSent, sReceived] = await Promise.all([
    getDocs(qSent),
    getDocs(qReceived),
  ]);
  const friendUids = new Set<string>();
  sSent.forEach((d) => friendUids.add(d.data().toUid));
  sReceived.forEach((d) => friendUids.add(d.data().fromUid));
  const users = await Promise.all(
    Array.from(friendUids).map(async (uid) => {
      const uSnap = await getDoc(doc(db, "users", uid));
      const u = uSnap.data() || {};
      return {
        uid,
        email: u.email || "",
        name: u.name || null,
        photoURL: u.photoURL || null,
      };
    }),
  );
  return users;
}


export async function getViewableTasksByFriend(
  friendUid: string,
  viewerUid: string,
) {
  const [friendDoc, grantsSnap] = await Promise.all([
    getDoc(doc(db, "users", friendUid)),
    getDocs(
      query(
        collection(db, "users", friendUid, "grants"),
        where("viewerUid", "==", viewerUid),
      ),
    ),
  ]);
  const tasks = (friendDoc.data()?.tasks || []) as any[];
  const grantedIds = new Set<string>();
  grantsSnap.forEach((g) =>
    (g.data().taskIds || []).forEach((id: string) => grantedIds.add(id)),
  );
  return tasks.filter((t) => t.visibility === "public" || grantedIds.has(t.id));
}

// export async function searchUsers(term: string) {
//   const q = term.toLowerCase();
//   const qEmail = query(
//     collection(db, "users"),
//     where("emailLower", ">=", q),
//     where("emailLower", "<=", q + "\uf8ff"),
//   );
//   const qName = query(
//     collection(db, "users"),
//     where("nameLower", ">=", q),
//     where("nameLower", "<=", q + "\uf8ff"),
//   );
//   const [sEmail, sName] = await Promise.all([getDocs(qEmail), getDocs(qName)]);

//   const dedup = new Map<string, any>();
//   sEmail.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));
//   sName.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));

//   if (dedup.size === 0) {
//     const eq = await getDocs(
//       query(collection(db, "users"), where("email", "==", term)),
//     );
//     eq.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));
//   }

//   return Array.from(dedup.values()).map((u: any) => ({
//     uid: u.uid,
//     email: u.email || "",
//     name: u.name || null,
//     photoURL: u.photoURL || null,
//     displayName: u.name || u.email || "Unknown",
//   }));
// }
// </CHANGE>

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data() as any;
  return {
    uid,
    email: d.email,
    name: d.name || null,
    photoURL: d.photoURL || null,
    displayName: d.name || d.email,
  };
}

export async function grantTaskAccess(
  ownerUid: string,
  requestId: string,
  taskIds: string[],
) {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "accepted",
    grantedTaskIds: taskIds,
  });
}
// </CHANGE>

// Add these corrected functions to your firebase-db.ts file
export async function sendFriendRequest(
  fromUid: string,
  toUid: string,
  type: "all" | "specific" = "all",
) {
  // Get sender's info
  const fromUserDoc = await getDoc(doc(db, "users", fromUid));
  const fromUserData = fromUserDoc.data();

  // Get recipient's info
  const toUserDoc = await getDoc(doc(db, "users", toUid));
  const toUserData = toUserDoc.data();

  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    toUid,
    fromEmail: fromUserData?.email || "",
    fromName: fromUserData?.name || "",
    toEmail: toUserData?.email || "",
    toName: toUserData?.name || "",
    status: "pending",
    type,
    createdAt: Timestamp.now(),
  });
}

export async function getReceivedRequests(myUid: string) {
  const q = query(
    collection(db, "friendRequests"),
    where("toUid", "==", myUid),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getOutgoingRequests(myUid: string) {
  const q = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", myUid),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamp to Date if needed
    createdAt:
      doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
  }));
}

export async function respondToRequest(
  requestId: string,
  status: "accepted" | "rejected",
) {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status,
    respondedAt: Timestamp.now(),
  });
}

export async function searchUsers(term: string) {
  if (!term.trim()) return [];

  const termLower = term.toLowerCase();
  const qEmail = query(
    collection(db, "users"),
    where("emailLower", ">=", termLower),
    where("emailLower", "<=", termLower + "\uf8ff"),
  );

  const qName = query(
    collection(db, "users"),
    where("nameLower", ">=", termLower),
    where("nameLower", "<=", termLower + "\uf8ff"),
  );

  const [emailSnapshot, nameSnapshot] = await Promise.all([
    getDocs(qEmail),
    getDocs(qName),
  ]);

  const usersMap = new Map();

  // Process email results
  emailSnapshot.forEach((doc) => {
    const data = doc.data();
    usersMap.set(doc.id, {
      uid: doc.id,
      email: data.email,
      displayName: data.name || data.email,
      name: data.name,
      photoURL: data.photoURL,
    });
  });

  // Process name results
  nameSnapshot.forEach((doc) => {
    const data = doc.data();
    usersMap.set(doc.id, {
      uid: doc.id,
      email: data.email,
      displayName: data.name || data.email,
      name: data.name,
      photoURL: data.photoURL,
    });
  });

  return Array.from(usersMap.values());
}
