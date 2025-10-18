import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureUserProfile } from "@/lib/firebase-db"; //

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const u = userCredential.user;
    await ensureUserProfile(
      u.uid,
      u.email || "",
      u.displayName || null,
      u.photoURL || null,
    ); //
    return { user: u, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const u = userCredential.user;
    await ensureUserProfile(
      u.uid,
      u.email || "",
      u.displayName || null,
      u.photoURL || null,
    ); //
    return { user: u, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const u = userCredential.user;
    await ensureUserProfile(
      u.uid,
      u.email || "",
      u.displayName || null,
      u.photoURL || null,
    ); //
    return { user: u, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
