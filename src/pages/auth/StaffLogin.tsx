import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import ispManagerIcon from "@/assets/isp-manager-icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffUser, getSession, clearSession } from "@/lib/localAuth";

export default function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { enableDemo } = useDemoMode();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(username, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const session = getSession();
    if (!isStaffUser(session)) {
      clearSession();
      setError("This portal is for ISP staff only.");
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={ispManagerIcon} alt="ISP Manager" className="mx-auto mb-4 h-12 w-12 rounded-lg object-contain" />
          <CardTitle className="text-2xl">ISP Management</CardTitle>
          <CardDescription>Sign in to your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs text-muted-foreground"
              onClick={() => {
                enableDemo();
                navigate("/dashboard");
              }}
            >
              Skip Login (View with Demo Data)
            </Button>
          </CardFooter>
        </form>
        <div className="text-sm text-muted-foreground text-center pb-6 space-y-1">
          <p>
            Customer?{" "}
            <Link to="/portal/login" className="text-primary hover:underline">
              Go to customer portal
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
