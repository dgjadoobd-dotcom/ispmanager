import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import ispManagerIcon from "@/assets/isp-manager-icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useISPBranding } from "@/hooks/useBranding";

export default function MobileLogin() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const { branding } = useISPBranding();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/app", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/app", { replace: true });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background safe-area-inset">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-16 pb-6 px-6">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.brandName}
            className="w-20 h-20 rounded-2xl object-contain mb-5 shadow-lg"
          />
        ) : (
          <img src={ispManagerIcon} alt="ISP Manager" className="w-20 h-20 rounded-2xl object-contain mb-5 shadow-lg" />
        )}
        <h1 className="text-2xl font-bold text-center">{branding.brandName}</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Customer Portal
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 pb-8">
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Sign in to manage your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base rounded-xl"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base rounded-xl"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 active:scale-95 touch-manipulation"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-13 text-base font-semibold gap-2 rounded-xl active:scale-[0.98] touch-manipulation"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => navigate("/portal/login")}
                className="text-sm text-muted-foreground active:scale-95 touch-manipulation"
              >
                Go to web portal →
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Add to home screen for the best experience
        </p>
      </div>
    </div>
  );
}
