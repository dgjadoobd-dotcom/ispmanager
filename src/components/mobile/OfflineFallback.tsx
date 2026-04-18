import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function OfflineFallback() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center safe-area-inset animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold mb-1">You're Offline</h1>
      <p className="text-sm text-muted-foreground max-w-[260px] mb-6">
        Check your internet connection and try again.
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="gap-2 rounded-xl h-11 px-6"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  );
}
