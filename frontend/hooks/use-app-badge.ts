"use client";

import { useEffect } from "react";
import { useTasksContext } from "./use-tasks-context";

export const useAppBadge = () => {
  const { remainingTasksCount } = useTasksContext();

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Check if App Badging API is supported
    const setBadge = async () => {
      if ("setAppBadge" in navigator) {
        try {
          if (remainingTasksCount > 0) {
            await (navigator as any).setAppBadge(remainingTasksCount);
          } else {
            await (navigator as any).clearAppBadge();
          }
        } catch (error) {
          console.error("Failed to update app badge:", error);
        }
      }
    };

    setBadge();
  }, [remainingTasksCount]);
};
