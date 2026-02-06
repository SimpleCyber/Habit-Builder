"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./use-auth";
import { getUserData } from "@/lib/firebase-db";
import { UserData } from "@/lib/types";

interface FlejetContextType {
  flejetInfo: any | null;
  isFlejetLoading: boolean;
  refreshFlejet: () => Promise<void>;
  disconnectFlejet: () => Promise<void>;
  userData: UserData | null;
}

const FlejetContext = createContext<FlejetContextType | undefined>(undefined);

export function FlejetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [flejetInfo, setFlejetInfo] = useState<any>(null);
  const [isFlejetLoading, setIsFlejetLoading] = useState(false);

  const fetchFlejetInfo = useCallback(async (config: any) => {
    if (!config) return;
    setIsFlejetLoading(true);
    try {
      const { workspaceId, apiKey, userId } = config;
      const params = new URLSearchParams({ workspaceId, apiKey, userId });
      const res = await fetch(
        `https://flejet.vercel.app/api/external/info?${params.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        setFlejetInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch Flejet info:", error);
    } finally {
      setIsFlejetLoading(false);
    }
  }, []);

  const refreshFlejet = useCallback(async () => {
    if (userData?.flejetConfig) {
      await fetchFlejetInfo(userData.flejetConfig);
    }
  }, [userData?.flejetConfig, fetchFlejetInfo]);

  const disconnectFlejet = useCallback(async () => {
    if (!user) return;
    try {
      const { disconnectFromFlejet } = await import("@/lib/firebase-db");
      await disconnectFromFlejet(user.uid);
      setUserData((prev) => (prev ? { ...prev, flejetConfig: null } : null));
      setFlejetInfo(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUserData(user.uid).then((data) => {
        setUserData(data);
      });
    } else {
      setUserData(null);
      setFlejetInfo(null);
    }
  }, [user]);

  useEffect(() => {
    if (userData?.flejetConfig && !flejetInfo) {
      fetchFlejetInfo(userData.flejetConfig);
    }
  }, [userData?.flejetConfig, flejetInfo, fetchFlejetInfo]);

  return (
    <FlejetContext.Provider
      value={{
        flejetInfo,
        isFlejetLoading,
        refreshFlejet,
        disconnectFlejet,
        userData,
      }}
    >
      {children}
    </FlejetContext.Provider>
  );
}

export function useFlejet() {
  const context = useContext(FlejetContext);
  if (context === undefined) {
    throw new Error("useFlejet must be used within a FlejetProvider");
  }
  return context;
}
