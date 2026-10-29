import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
