import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, LayoutDashboard, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Accent */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Search className="w-14 h-14 animate-pulse" />
        </div>
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-primary text-primary-foreground font-black text-xs rounded-full shadow-lg">
          404
        </div>
      </div>

      {/* Headline & Description */}
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-8">
        The link you followed may be broken, or the page may have been moved or removed.
      </p>

      {/* Action Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-sm">
        <Link href="/home" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto rounded-full font-bold px-6">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/community" className="w-full sm:w-auto">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full font-bold px-6">
            <Compass className="w-4 h-4 mr-2" />
            Community
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-bold px-6">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>

      {/* Helpful Hint */}
      <p className="text-xs text-muted-foreground/60 mt-12">
        Tip: If you're looking for a user profile, make sure the username is spelled correctly.
      </p>
    </div>
  );
}
