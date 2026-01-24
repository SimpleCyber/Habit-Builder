"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function HelpDeckWidget() {
  const { user, profile } = useAuth();

  useEffect(() => {
    // Only proceed if user is logged in
    if (!user) return;

    // Set configuration variables
    (window as any).CRISP_WEBSITE_ID = "ws_1769213119029_e27drdthz";
    (window as any).CRISP_OWNER_ID = "c77uN9hZnAd7NUCxmcspVJxPapm1";

    // Dynamically pass user details
    (window as any).HELPDECK_USER = {
      name: user.displayName || profile?.username || "HabitX User",
      email: user.email,
      userId: user.uid,
    };

    // Load the widget script
    const s = document.createElement("script");
    s.src = "https://help-deck-gamma.vercel.app/widget-loader.js";
    s.async = true;
    document.head.appendChild(s);

    // Cleanup script on unmount
    return () => {
      if (document.head.contains(s)) {
        document.head.removeChild(s);
      }
    };
  }, [user, profile]);

  return null;
}
