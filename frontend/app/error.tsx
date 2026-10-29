"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors for diagnostics
    console.error("Runtime application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-black tracking-tight mb-2">
        Something Went Wrong
      </h1>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        An unexpected error occurred while loading this page. Our team has been notified.
      </p>

      {error?.message && (
        <div className="p-3 mb-6 bg-muted rounded-xl text-xs font-mono max-w-md text-muted-foreground overflow-x-auto border border-border">
          {error.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="lg"
          className="rounded-full font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Link href="/home">
          <Button size="lg" variant="outline" className="rounded-full font-bold px-6">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
