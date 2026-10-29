"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Whitelist configured via env or role
  const adminEmails = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    "satyamok03@gmail.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isAdmin =
    user &&
    (profile?.role === "admin" ||
      (user.email && adminEmails.includes(user.email.toLowerCase())));

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This area is restricted to administrators only. You do not have the required permissions to access this page.
        </p>
        <Button onClick={() => router.push("/home")}>Return to Dashboard</Button>
      </div>
    );
  }

  return <>{children}</>;
}

