import { Loader2 } from "lucide-react";

export default function FriendsLoading() {
  return (
    <div className="container mx-auto max-w-md md:max-w-xl lg:max-w-2xl p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold animate-pulse">
        Loading friends & requests...
      </p>
    </div>
  );
}
