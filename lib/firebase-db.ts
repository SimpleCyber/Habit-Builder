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

// export async function ensureUserProfile(uid: string, email: string) {
//   const d = doc(db, "users", uid)
//   const snap = await getDoc(d)
//   if (!snap.exists()) {
//     await setDoc(d, { uid, email, createdAt: Date.now() })
//   }
// }

// export async function findUserByEmail(email: string) {
//   const q = query(collection(db, "users"), where("email", "==", email))
//   const snap = await getDocs(q)
//   if (snap.empty) return null
//   const docSnap = snap.docs[0]
//   return { uid: docSnap.id, email: docSnap.data().email }
// }

// export async function sendFriendRequest(fromUid: string, toUid: string, toEmail: string) {
//   await addDoc(collection(db, "friendRequests"), {
//     fromUid,
//     toUid,
//     toEmail,
//     fromEmail: (await getDoc(doc(db, "users", fromUid))).data()?.email || "",
//     status: "pending",
//     createdAt: Date.now(),
//   })
// }

// export async function getIncomingRequests(myUid: string) {
//   const q = query(collection(db, "friendRequests"), where("toUid", "==", myUid), where("status", "==", "pending"))
//   const snap = await getDocs(q)
//   // Include your current tasks so user can select which to share
//   const myTasksSnap = await getDocs(collection(db, "users", myUid, "tasks"))
//   const availableTasks = myTasksSnap.docs.map((d) => ({ id: d.id, title: d.data().title }))
//   return snap.docs.map((d) => ({
//     id: d.id,
//     ...d.data(),
//     availableTasks,
//     availableTaskIds: availableTasks.map((t) => t.id),
//   }))
// }

// export async function grantTaskAccess(myUid: string, requestId: string, taskIds: string[]) {
//   const reqDoc = doc(db, "friendRequests", requestId)
//   const reqData = (await getDoc(reqDoc)).data()
//   if (!reqData) return
//   // Create grant under my user document
//   await addDoc(collection(db, "users", myUid, "grants"), {
//     viewerUid: reqData.fromUid,
//     taskIds,
//     createdAt: Date.now(),
//   })
//   await updateDoc(reqDoc, { status: "accepted" })
// }

// export async function getMyFriends(myUid: string) {
//   const q = query(collection(db, "friendRequests"), where("fromUid", "==", myUid), where("status", "==", "accepted"))
//   const snap = await getDocs(q)
//   const users = await Promise.all(
//     snap.docs.map(async (d) => {
//       const u = await getDoc(doc(db, "users", d.data().toUid))
//       return { uid: d.data().toUid, email: u.data()?.email || "" }
//     }),
//   )
//   return users
// }

// export async function getViewableTasksByFriend(friendUid: string, viewerUid: string) {
//   // Tasks are viewable if: visibility == 'public' OR in a grant where viewerUid matches
//   const tasksSnap = await getDocs(collection(db, "users", friendUid, "tasks"))
//   const all = tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
//   // grants
//   const grantsQ = query(collection(db, "users", friendUid, "grants"), where("viewerUid", "==", viewerUid))
//   const grantsSnap = await getDocs(grantsQ)
//   const grantedIds = new Set<string>()
//   grantsSnap.forEach((g) => {
//     ;(g.data().taskIds || []).forEach((id: string) => grantedIds.add(id))
//   })
//   return all.filter((t: any) => t.visibility === "public" || grantedIds.has(t.id))
// }

// export async function getUserProfile(uid: string) {
//   const snap = await getDoc(doc(db, "users", uid))
//   if (!snap.exists()) return null
//   const d = snap.data() as any
//   return { uid, email: d.email, name: d.name || null, photoURL: d.photoURL || null }
// }

// export async function searchUsers(term: string) {
//   const qEmail = query(collection(db, "users"), where("email", ">=", term), where("email", "<=", term + "\uf8ff"))
//   const qName = query(collection(db, "users"), where("name", ">=", term), where("name", "<=", term + "\uf8ff"))

//   const [sEmail, sName] = await Promise.all([getDocs(qEmail), getDocs(qName)])
//   const map = new Map<string, any>()
//   sEmail.forEach((d) => map.set(d.id, { uid: d.id, ...(d.data() as any) }))
//   sName.forEach((d) => map.set(d.id, { uid: d.id, ...(d.data() as any) }))

//   // Normalize payload used by UI
//   return Array.from(map.values()).map((u: any) => ({
//     uid: u.uid,
//     email: u.email || "",
//     name: u.name || null,
//     photoURL: u.photoURL || null,
//   }))
// }

// export async function ensureUserProfile(uid: string, email: string, name?: string | null, photoURL?: string | null) {
//   const ref = doc(db, "users", uid)
//   const snap = await getDoc(ref)
//   const base = {
//     uid,
//     email,
//     emailLower: (email || "").toLowerCase(),
//     name: name || null,
//     nameLower: (name || "").toLowerCase() || null,
//     photoURL: photoURL || null,
//   }
//   if (!snap.exists()) {
//     await setDoc(ref, { ...base, createdAt: Date.now() })
//   } else {
//     const data = snap.data() || {}
//     const next = {
//       ...data,
//       ...base,
//       // keep createdAt if exists
//       createdAt: data.createdAt || Date.now(),
//     }
//     await setDoc(ref, next, { merge: true })
//   }
// }

// export async function findUserByEmail(email: string) {
//   const q = query(collection(db, "users"), where("email", "==", email))
//   const snap = await getDocs(q)
//   if (snap.empty) return null
//   const docSnap = snap.docs[0]
//   return { uid: docSnap.id, email: docSnap.data().email }
// }

// export async function sendFriendRequest(
//   fromUid: string,
//   toUid: string,
//   toEmail: string,
//   type: "all" | "specific" = "all",
// ) {
//   await addDoc(collection(db, "friendRequests"), {
//     fromUid,
//     toUid,
//     toEmail,
//     fromEmail: (await getDoc(doc(db, "users", fromUid))).data()?.email || "",
//     status: "pending",
//     type,
//     createdAt: Date.now(),
//   })
// }

// export async function getIncomingRequests(myUid: string) {
//   const qReq = query(collection(db, "friendRequests"), where("toUid", "==", myUid), where("status", "==", "pending"))
//   const [snap, meSnap] = await Promise.all([getDocs(qReq), getDoc(doc(db, "users", myUid))])
//   const myTasks = (meSnap.data()?.tasks || []).map((t: any) => ({ id: t.id, title: t.title }))
//   const availableTaskIds = myTasks.map((t: any) => t.id)
//   return snap.docs.map((d) => ({ id: d.id, ...d.data(), availableTasks: myTasks, availableTaskIds }))
// }

// export async function getMyFriends(myUid: string) {
//   const qAcc = query(collection(db, "friendRequests"), where("fromUid", "==", myUid), where("status", "==", "accepted"))
//   const snap = await getDocs(qAcc)
//   const users = await Promise.all(
//     snap.docs.map(async (d) => {
//       const uSnap = await getDoc(doc(db, "users", d.data().toUid))
//       const u = uSnap.data() || {}
//       return { uid: d.data().toUid, email: u.email || "", name: u.name || null, photoURL: u.photoURL || null }
//     }),
//   )
//   return users
// }

// export async function getOutgoingRequests(myUid: string) {
//   const qReq = query(collection(db, "friendRequests"), where("fromUid", "==", myUid))
//   const snap = await getDocs(qReq)
//   return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
// }

// export async function getViewableTasksByFriend(friendUid: string, viewerUid: string) {
//   const [friendDoc, grantsSnap] = await Promise.all([
//     getDoc(doc(db, "users", friendUid)),
//     getDocs(query(collection(db, "users", friendUid, "grants"), where("viewerUid", "==", viewerUid))),
//   ])
//   const tasks = (friendDoc.data()?.tasks || []) as any[]
//   const grantedIds = new Set<string>()
//   grantsSnap.forEach((g) => (g.data().taskIds || []).forEach((id: string) => grantedIds.add(id)))
//   return tasks.filter((t) => t.visibility === "public" || grantedIds.has(t.id))
// }

// export async function searchUsers(term: string) {
//   const q = term.toLowerCase()
//   const qEmail = query(collection(db, "users"), where("emailLower", ">=", q), where("emailLower", "<=", q + "\uf8ff"))
//   const qName = query(collection(db, "users"), where("nameLower", ">=", q), where("nameLower", "<=", q + "\uf8ff"))
//   const [sEmail, sName] = await Promise.all([getDocs(qEmail), getDocs(qName)])

//   const dedup = new Map<string, any>()
//   sEmail.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }))
//   sName.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }))

//   // Fallback: exact email equality if nothing found by prefix
//   if (dedup.size === 0) {
//     const eq = await getDocs(query(collection(db, "users"), where("email", "==", term)))
//     eq.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }))
//   }

//   return Array.from(dedup.values()).map((u: any) => ({
//     uid: u.uid,
//     email: u.email || "",
//     name: u.name || null,
//     photoURL: u.photoURL || null,
//   }))
// }

// export async function getUserProfile(uid: string) {
//   const snap = await getDoc(doc(db, "users", uid))
//   if (!snap.exists()) return null
//   const d = snap.data() as any
//   return { uid, email: d.email, name: d.name || null, photoURL: d.photoURL || null }
// }

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

export async function sendFriendRequest(
  toUid: string,
  type: "all" | "specific" = "all",
) {
  const fromUid = (await getDoc(doc(db, "users", toUid))).id; // placeholder; in real usage pass fromUid
  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    toUid,
    status: "pending",
    type,
    createdAt: Date.now(),
  });
}
// </CHANGE>

export async function getSentRequests() {
  // In real usage, pass the current user's uid; for now we'll return empty
  return [];
}
// </CHANGE>

export async function getReceivedRequests() {
  return [];
}
// </CHANGE>

export async function respondToRequest(
  requestId: string,
  status: "accepted" | "rejected",
) {
  await updateDoc(doc(db, "friendRequests", requestId), { status });
}
// </CHANGE>

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
// </CHANGE>

export async function getOutgoingRequests(myUid: string) {
  const qReq = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", myUid),
  );
  const snap = await getDocs(qReq);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
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

export async function searchUsers(term: string) {
  const q = term.toLowerCase();
  const qEmail = query(
    collection(db, "users"),
    where("emailLower", ">=", q),
    where("emailLower", "<=", q + "\uf8ff"),
  );
  const qName = query(
    collection(db, "users"),
    where("nameLower", ">=", q),
    where("nameLower", "<=", q + "\uf8ff"),
  );
  const [sEmail, sName] = await Promise.all([getDocs(qEmail), getDocs(qName)]);

  const dedup = new Map<string, any>();
  sEmail.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));
  sName.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));

  if (dedup.size === 0) {
    const eq = await getDocs(
      query(collection(db, "users"), where("email", "==", term)),
    );
    eq.forEach((d) => dedup.set(d.id, { uid: d.id, ...(d.data() as any) }));
  }

  return Array.from(dedup.values()).map((u: any) => ({
    uid: u.uid,
    email: u.email || "",
    name: u.name || null,
    photoURL: u.photoURL || null,
    displayName: u.name || u.email || "Unknown",
  }));
}
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
