"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Instant hydration from cached profile
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("habitx_cached_profile");
        if (cached) {
          setProfile(JSON.parse(cached));
        }
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Unblock UI loading immediately
        setLoading(false);

        // Fetch profile concurrently in background
        try {
          const { getUserProfile } = await import("@/lib/firebase-db");
          const p = await getUserProfile(firebaseUser.uid);
          if (p) {
            setProfile(p);
            try {
              localStorage.setItem("habitx_cached_profile", JSON.stringify(p));
            } catch {}
          }
        } catch (e) {
          console.error("Failed to fetch profile in AuthProvider", e);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
        try {
          localStorage.removeItem("habitx_cached_profile");
        } catch {}
      }
    });

    return unsubscribe;
  }, []);

  // Force Onboarding Flow only when user has logged in and explicitly has no username
  useEffect(() => {
    if (!loading && user && profile !== null) {
      if (
        !profile.username &&
        pathname !== "/onboarding" &&
        pathname !== "/" &&
        !pathname.startsWith("/auth")
      ) {
        router.push("/onboarding");
      }
    }
  }, [user, profile, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
