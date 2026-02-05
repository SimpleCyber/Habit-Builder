// firebase-db.ts

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
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

/* =========================================================
   ✅ INTERFACES
========================================================= */

export interface Task {
  id: string;
  title: string;
  reason: string;
  icon: string;
  iconBg?: string;
  visibility?: "public" | "private";
  streak: number;
  lastUpdate: string | null;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  date: string;
  text: string;
  photo: string | null; // ✅ BASE64
  communityPosts?: boolean;
  timestamp: Date;
}

export interface UserData {
  streak: number;
  lastCheckIn: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  socialLinks?: Record<string, string>;
}

/* =========================================================
   ✅ USER PROFILE HELPERS
========================================================= */

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
    emailLower: email.toLowerCase(),
    name: name || null,
    nameLower: (name || "").toLowerCase(),
    photoURL: photoURL || null,
    // We don't overwrite username or socialLinks here
  };

  if (!snap.exists()) {
    await setDoc(ref, { ...base, createdAt: Date.now() });
  } else {
    const data = snap.data() || {};
    await setDoc(
      ref,
      { ...data, ...base, createdAt: data.createdAt || Date.now() },
      { merge: true },
    );
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    streak: data.streak || 0,
    lastCheckIn: data.lastCheckIn || "",
    username: data.username || null,
  };
}

export async function saveUserData(uid: string, data: Partial<UserData>) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getSuggestedUsers(limitCount = 3) {
  // 1. Get top active users (by streak) - fetch a larger pool to shuffle
  const activeQ = query(
    collection(db, "users"),
    orderBy("streak", "desc"),
    limit(10),
  );

  // 2. Also get some other users (e.g., recently created) to mix in
  const recentQ = query(
    collection(db, "users"),
    orderBy("createdAt", "desc"),
    limit(10),
  );

  const [activeSnap, recentSnap] = await Promise.all([
    getDocs(activeQ),
    getDocs(recentQ),
  ]);

  const userMap = new Map();

  activeSnap.forEach((d) => userMap.set(d.id, { uid: d.id, ...d.data() }));
  recentSnap.forEach((d) => userMap.set(d.id, { uid: d.id, ...d.data() }));

  const combined = Array.from(userMap.values());

  // Filter out incomplete profiles (missing name, username, or photoURL)
  const completeProfiles = combined.filter(
    (u: any) => u.name && u.username && u.photoURL,
  );

  // Shuffle implementation to provide "random" feel within the active/recent pool
  const shuffled = completeProfiles.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, limitCount);
}

/* =========================================================
   ✅ TASK CRUD
========================================================= */

export async function createTask(
  uid: string,
  data: Omit<Task, "id" | "createdAt" | "streak" | "lastUpdate">,
) {
  const ref = doc(collection(db, "users", uid, "tasks"));
  const id = ref.id;

  await setDoc(ref, {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    streak: 0,
    lastUpdate: null,
  });

  return id;
}

export async function getTasks(uid: string): Promise<Task[]> {
  const ref = collection(db, "users", uid, "tasks");
  const q = query(ref, orderBy("createdAt", "asc")); // ✅ oldest → newest
  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data() as Task);
}

export async function updateTask(
  uid: string,
  taskId: string,
  updates: Partial<Task>,
) {
  await updateDoc(doc(db, "users", uid, "tasks", taskId), updates);
}

/* =========================================================
   ✅ HISTORY CRUD
========================================================= */

export async function addHistoryEntry(
  uid: string,
  taskId: string,
  entry: Omit<TaskHistoryEntry, "id" | "timestamp">,
) {
  const ref = collection(db, "users", uid, "tasks", taskId, "history");
  const newDoc = await addDoc(ref, {
    ...entry,
    timestamp: Timestamp.now(),
  });
  return newDoc.id; // ✅ return ID for index usage
}

export async function getTaskHistory(
  uid: string,
  taskId: string,
): Promise<TaskHistoryEntry[]> {
  const ref = collection(db, "users", uid, "tasks", taskId, "history");
  const snap = await getDocs(ref);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      date: data.date,
      text: data.text,
      photo: data.photo || null,
      communityPosts: data.communityPosts || false,
      timestamp: data.timestamp.toDate(),
    } as TaskHistoryEntry;
  });
}

/* =========================================================
   ✅ DELETE TASK (with all history)
========================================================= */

export const deleteTask = async (userId: string, taskId: string) => {
  try {
    // Delete history docs
    const historyRef = collection(
      db,
      "users",
      userId,
      "tasks",
      taskId,
      "history",
    );
    const historySnap = await getDocs(historyRef);

    await Promise.all(
      historySnap.docs.map((d) =>
        deleteDoc(doc(db, "users", userId, "tasks", taskId, "history", d.id)),
      ),
    );

    // Delete main task
    await deleteDoc(doc(db, "users", userId, "tasks", taskId));

    return { error: null };
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return { error: error.message };
  }
};

/* =========================================================
   ✅ PAGINATED HISTORY (Global)
========================================================= */

export const getPaginatedHistory = async (
  userId: string,
  pageSize = 10,
  lastDoc?: DocumentSnapshot,
) => {
  try {
    const ref = collection(db, "users", userId, "history");
    let q = query(ref, orderBy("timestamp", "desc"), limit(pageSize));

    if (lastDoc) {
      q = query(
        ref,
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(pageSize),
      );
    }

    const snap = await getDocs(q);

    const history = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        date: data.date,
        tasks: data.tasks || [],
        photo: data.photo,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });

    return {
      history,
      lastDoc: snap.docs[snap.docs.length - 1],
      hasMore: snap.docs.length === pageSize,
      error: null,
    };
  } catch (error: any) {
    console.error("Error getting paginated history:", error);
    return { history: [], lastDoc: null, hasMore: false, error: error.message };
  }
};

/* =========================================================
   ✅ FRIEND REQUESTS + SHARING
========================================================= */

export async function sendFriendRequest(
  fromUid: string,
  toUid: string,
  type: "all" | "specific" = "all",
) {
  const from = (await getDoc(doc(db, "users", fromUid))).data();
  const to = (await getDoc(doc(db, "users", toUid))).data();

  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    toUid,
    fromEmail: from?.email || "",
    fromName: from?.name || "",
    fromUsername: from?.username || "",
    fromPhotoURL: from?.photoURL || "",
    toEmail: to?.email || "",
    toName: to?.name || "",
    toUsername: to?.username || "",
    toPhotoURL: to?.photoURL || "",
    type,
    status: "pending",
    createdAt: Timestamp.now(),
  });
}

export async function getReceivedRequests(myUid: string) {
  const snap = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("toUid", "==", myUid),
      where("status", "==", "pending"),
    ),
  );

  const requests = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.id ? { id: d.id, ...d.data() } : { ...d.data() };
      const req = data as any;

      // Backfill missing info for legacy requests
      if (!req.fromUsername || !req.fromPhotoURL) {
        const fromSnap = await getDoc(doc(db, "users", req.fromUid));
        if (fromSnap.exists()) {
          const fromData = fromSnap.data();
          req.fromName = req.fromName || fromData.name || "";
          req.fromUsername = req.fromUsername || fromData.username || "";
          req.fromPhotoURL = req.fromPhotoURL || fromData.photoURL || "";
        }
      }
      return req;
    }),
  );

  return requests;
}

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export async function getOutgoingRequests(myUid: string): Promise<any[]> {
  const q = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", myUid),
  );

  const snapshot = await getDocs(q);

  const requests = await Promise.all(
    snapshot.docs.map(async (d) => {
      const data = d.id ? { id: d.id, ...d.data() } : { ...d.data() };
      const req = data as any;

      // Backfill missing info for legacy requests
      if (!req.toUsername || !req.toPhotoURL) {
        const toSnap = await getDoc(doc(db, "users", req.toUid));
        if (toSnap.exists()) {
          const toData = toSnap.data();
          req.toName = req.toName || toData.name || "";
          req.toUsername = req.toUsername || toData.username || "";
          req.toPhotoURL = req.toPhotoURL || toData.photoURL || "";
        }
      }

      return {
        ...req,
        createdAt: req.createdAt?.toDate?.() || new Date(req.createdAt),
      };
    }),
  );

  return requests;
}

export async function respondToRequest(
  id: string,
  status: "accepted" | "rejected",
) {
  await updateDoc(doc(db, "friendRequests", id), {
    status,
    respondedAt: Timestamp.now(),
  });
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

export async function searchUsers(term: string) {
  if (!term.trim()) return [];

  const termLower = term.toLowerCase();

  const emailQ = query(
    collection(db, "users"),
    where("emailLower", ">=", termLower),
    where("emailLower", "<=", termLower + "\uf8ff"),
  );

  const nameQ = query(
    collection(db, "users"),
    where("nameLower", ">=", termLower),
    where("nameLower", "<=", termLower + "\uf8ff"),
  );

  const [emailSnap, nameSnap] = await Promise.all([
    getDocs(emailQ),
    getDocs(nameQ),
  ]);

  const users = new Map();

  emailSnap.forEach((d) =>
    users.set(d.id, {
      uid: d.id,
      email: d.data().email,
      displayName: d.data().name || d.data().email,
      name: d.data().name,
      photoURL: d.data().photoURL,
      username: d.data().username,
    }),
  );

  nameSnap.forEach((d) =>
    users.set(d.id, {
      uid: d.id,
      email: d.data().email,
      displayName: d.data().name || d.data().email,
      name: d.data().name,
      photoURL: d.data().photoURL,
      username: d.data().username,
    }),
  );

  return [...users.values()];
}

// friends

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
        username: u.username || null,
      };
    }),
  );
  return users;
}

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
    username: d.username || null,
    bio: d.bio || null,
    location: d.location || null,
    socialLinks: d.socialLinks || {},
  };
}

export async function getViewableTasksByFriend(
  friendUid: string,
  viewerUid: string,
) {
  const friendDoc = await getDoc(doc(db, "users", friendUid));

  if (!friendDoc.exists()) return [];

  const grantsSnap = await getDocs(
    query(
      collection(db, "users", friendUid, "grants"),
      where("viewerUid", "==", viewerUid),
    ),
  );

  const grantedIds = new Set<string>();
  grantsSnap.forEach((g) =>
    (g.data().taskIds || []).forEach((id: string) => grantedIds.add(id)),
  );

  const tasksSnap = await getDocs(collection(db, "users", friendUid, "tasks"));

  const tasks = await Promise.all(
    tasksSnap.docs
      .filter((d) => {
        const t = d.data();
        return t.visibility === "public" || grantedIds.has(t.id);
      })
      .map(async (d) => {
        const task = d.data() as any;

        // 🔥 Get last 1 history entry
        const lastHistorySnap = await getDocs(
          query(
            collection(db, "users", friendUid, "tasks", task.id, "history"),
            orderBy("timestamp", "desc"),
            limit(1),
          ),
        );

        let lastUpdateDate: string | null = null;

        if (!lastHistorySnap.empty) {
          const h = lastHistorySnap.docs[0].data();
          lastUpdateDate = h.date;
        }

        return {
          ...task,
          history: lastUpdateDate
            ? [{ date: lastUpdateDate }] // ✅ minimal history for streak checks
            : [],
        };
      }),
  );

  return tasks;
}

export async function updateHistoryEntry(
  uid: string,
  taskId: string,
  historyId: string,
  updates: Partial<TaskHistoryEntry>,
) {
  const ref = doc(db, "users", uid, "tasks", taskId, "history", historyId);
  await updateDoc(ref, updates);
}

// =========================================================
// ✅ COMMUNITY INDEX HELPERS (IDs only)
// =========================================================

/**
 * Document shape in communityIndex:
 * {
 *   userId: string,
 *   taskId: string,
 *   historyId: string,
 *   createdAt: Timestamp
 * }
 */

export async function addToCommunityIndex(
  userId: string,
  taskId: string,
  historyId: string,
) {
  await addDoc(collection(db, "communityIndex"), {
    userId,
    taskId,
    historyId,
    createdAt: Timestamp.now(),
  });
}

export async function removeFromCommunityIndex(
  userId: string,
  taskId: string,
  historyId: string,
) {
  const qRef = query(
    collection(db, "communityIndex"),
    where("userId", "==", userId),
    where("taskId", "==", taskId),
    where("historyId", "==", historyId),
  );

  const snap = await getDocs(qRef);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function findUserByUsername(username: string) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
}

export async function getCommunityPostsByUser(uid: string) {
  const q = query(
    collection(db, "communityIndex"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);

  const posts = await Promise.all(
    snap.docs.map(async (d) => {
      const { userId, taskId, historyId } = d.data();
      const post = await getCommunityPostByReference(userId, taskId, historyId);
      if (!post) return null;
      return { ...post, id: d.id };
    }),
  );

  return posts.filter(Boolean);
}

export async function getCommunityPostById(communityIndexId: string) {
  const indexDoc = await getDoc(doc(db, "communityIndex", communityIndexId));
  if (!indexDoc.exists()) return null;

  const { userId, taskId, historyId } = indexDoc.data();
  const post = await getCommunityPostByReference(userId, taskId, historyId);
  if (!post) return null;

  return { ...post, id: communityIndexId };
}

/**
 * Paginated index fetch (IDs only)
 */
export async function getCommunityIndexPage(
  pageSize = 10,
  lastDoc?: QueryDocumentSnapshot,
) {
  let qRef = query(
    collection(db, "communityIndex"),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );

  if (lastDoc) {
    qRef = query(
      collection(db, "communityIndex"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize),
    );
  }

  const snap = await getDocs(qRef);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

  return {
    index: docs, // [{id, userId, taskId, historyId, createdAt}]
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize,
  };
}

/**
 * Given refs (userId, taskId, historyId), fetch full data.
 * Returns null if anything is missing.
 */
export async function getCommunityPostByReference(
  userId: string,
  taskId: string,
  historyId: string,
) {
  const [userSnap, taskSnap, histSnap] = await Promise.all([
    getDoc(doc(db, "users", userId)),
    getDoc(doc(db, "users", userId, "tasks", taskId)),
    getDoc(doc(db, "users", userId, "tasks", taskId, "history", historyId)),
  ]);

  if (!userSnap.exists() || !taskSnap.exists() || !histSnap.exists()) {
    return null;
  }

  const user = userSnap.data();
  const task = taskSnap.data();
  const update = histSnap.data();

  return {
    uid: userId,
    name: user?.name || null,
    username: user?.username || null, // ✅ Updated
    email: user?.email || "",
    photoURL: user?.photoURL || null,
    task,
    update: {
      id: histSnap.id, // ✅ Added ID from snapshot
      ...update,
      likes: update?.likes || [],
      commentsCount: update?.commentsCount || 0,
    },
    createdAt: update?.date || "", // ISO string from your history entry
  };
}

/* =========================================================
   ✅ COMMUNITY INTERACTIONS (Likes & Comments)
   ========================================================= */

export async function toggleCommunityPostLike(
  postOwnerUid: string,
  taskId: string,
  historyId: string,
  myUid: string,
  isLiked: boolean,
) {
  const ref = doc(
    db,
    "users",
    postOwnerUid,
    "tasks",
    taskId,
    "history",
    historyId,
  );
  if (isLiked) {
    // If currently liked, we want to UNLIKE -> remove from array
    await updateDoc(ref, {
      likes: arrayRemove(myUid),
    });
  } else {
    // If not liked, we want to LIKE -> add to array
    await updateDoc(ref, {
      likes: arrayUnion(myUid),
    });
  }
}

export async function addCommunityPostComment(
  postOwnerUid: string,
  taskId: string,
  historyId: string,
  commentData: {
    uid: string;
    text: string;
    username?: string;
    photoURL?: string;
  },
) {
  // 1. Add comment to subcollection
  const commentsRef = collection(
    db,
    "users",
    postOwnerUid,
    "tasks",
    taskId,
    "history",
    historyId,
    "comments",
  );

  await addDoc(commentsRef, {
    ...commentData,
    createdAt: Timestamp.now(),
  });

  // 2. Increment comment count on parent doc
  const parentRef = doc(
    db,
    "users",
    postOwnerUid,
    "tasks",
    taskId,
    "history",
    historyId,
  );

  await updateDoc(parentRef, {
    commentsCount: increment(1),
  });
}

export async function getCommunityPostComments(
  postOwnerUid: string,
  taskId: string,
  historyId: string,
) {
  if (!postOwnerUid || !taskId || !historyId) return []; // ✅ Safety check

  const commentsRef = collection(
    db,
    "users",
    postOwnerUid,
    "tasks",
    taskId,
    "history",
    historyId,
    "comments",
  );

  const q = query(commentsRef, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp).toDate(),
  }));
}

/* =========================================================
   ✅ USERNAME SYSTEM
   ========================================================= */

export async function checkUsernameAvailable(
  username: string,
): Promise<boolean> {
  const cleanUsername = username.toLowerCase().trim();
  if (cleanUsername.length < 3) return false;

  const ref = doc(db, "usernames", cleanUsername);
  const snap = await getDoc(ref);
  return !snap.exists();
}

export async function claimUsername(uid: string, username: string) {
  const cleanUsername = username.toLowerCase().trim();

  // 1. Check availability again (safety)
  const usernameRef = doc(db, "usernames", cleanUsername);
  const userRef = doc(db, "users", uid);

  // We should ideally use a transaction here, but for simplicity in this MVP:
  const snap = await getDoc(usernameRef);
  if (snap.exists()) {
    throw new Error("Username already taken");
  }

  // 2. Reserve username
  await setDoc(usernameRef, { uid });

  // 3. Update user profile
  await updateDoc(userRef, {
    username: username, // Display version
    usernameLower: cleanUsername, // Search/Index version
  });
}

export async function getUserByUsername(username: string) {
  const cleanUsername = username.toLowerCase().trim();
  const usernameRef = doc(db, "usernames", cleanUsername);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) return null;

  const { uid } = usernameSnap.data() as { uid: string };
  return getUserProfile(uid);
}
