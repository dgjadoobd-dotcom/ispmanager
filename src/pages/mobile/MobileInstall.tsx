import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  Download,
  Share,
  CheckCircle,
  Smartphone,
  ArrowRight,
  Zap,
  BellRing,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useISPBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function MobileInstall() {
  const navigate = useNavigate();
  const { branding } = useISPBranding();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-success/5 to-background p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-1">App Installed!</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-[240px]">
          Launch {branding.brandName} from your home screen
        </p>
        <Button
          onClick={() => navigate("/app")}
          className="gap-2 h-12 px-8 rounded-xl"
        >
          Open App
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: "Instant Access",
      desc: "Opens instantly, no download needed",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: BellRing,
      title: "Push Notifications",
      desc: "Get bill reminders & payment alerts",
      color: "bg-warning/10 text-warning",
    },
    {
      icon: Smartphone,
      title: "Works Offline",
      desc: "View bills anytime, even without internet",
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background safe-area-inset">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-14 pb-6 px-6">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.brandName}
            className="w-20 h-20 rounded-2xl object-contain mb-5 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-5 shadow-lg">
            <Wifi className="w-10 h-10 text-primary-foreground" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-center">{branding.brandName}</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Install for the best experience
        </p>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pb-8">
        <div className="space-y-3 mb-8">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border"
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  color
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Install CTA */}
        {isIOS ? (
          <div className="bg-card rounded-2xl border p-5 space-y-4">
            <p className="font-semibold text-sm">Install on iPhone / iPad</p>
            <ol className="space-y-3">
              {[
                <>Tap the <strong>Share</strong> button in Safari</>,
                <>Scroll and tap <strong>"Add to Home Screen"</strong></>,
                <>Tap <strong>"Add"</strong></>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : deferredPrompt ? (
          <Button
            onClick={handleInstall}
            className="w-full h-14 text-base font-semibold gap-2 rounded-xl active:scale-[0.98] touch-manipulation shadow-lg"
          >
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : (
          <div className="bg-card rounded-2xl border p-5 space-y-4">
            <p className="font-semibold text-sm">How to Install</p>
            <ol className="space-y-3">
              {[
                <>Tap the <strong>menu</strong> (⋮) in your browser</>,
                <>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></>,
                <>Confirm to install</>,
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/app/login")}
            className="text-sm text-muted-foreground active:scale-95 touch-manipulation"
          >
            Continue in browser →
          </button>
        </div>
      </div>
    </div>
  );
}
