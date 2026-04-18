import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Check, Mail } from "lucide-react";
import ispManagerIcon from "@/assets/isp-manager-icon.png";
import { useAuth } from "@/contexts/AuthContext";

type Step = "account" | "verify_email" | "organization" | "complete";

export default function TenantOnboarding() {
  const [step, setStep] = useState<Step>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in with a confirmed email
  useEffect(() => {
    if (user?.email_confirmed_at) {
      // User is logged in and email is confirmed
      // Check if they already have a tenant
      const checkTenant = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.tenant_id) {
          // Already has a tenant, redirect to dashboard
          navigate("/dashboard");
        } else {
          // Needs to complete organization setup
          setStep("organization");
        }
      };
      checkTenant();
    }
  }, [user, navigate]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUp(email, password, fullName, phone);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Move to email verification step
      setStep("verify_email");
      setLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get the current user from local auth
      const { getSession } = await import("@/lib/localAuth");
      const currentUser = getSession();

      if (!currentUser) {
        setError("Please sign in first");
        setLoading(false);
        return;
      }

      // Create tenant locally
      const { dbInsert, genId, now, TABLES } = await import("@/lib/db");
      const tenantId = genId();
      dbInsert(TABLES.tenants as any, {
        id: tenantId,
        name: orgName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        owner_id: currentUser.id,
        is_active: true,
        plan: "trial",
        currency: "USD",
        timezone: "UTC",
        language: "en",
        logo_url: null,
        primary_color: null,
        contact_email: null,
        contact_phone: null,
        address: null,
        plan_expires_at: null,
        updated_at: now(),
      } as any);

      setStep("complete");
      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <img src={ispManagerIcon} alt="ISP Manager" className="mx-auto mb-4 h-12 w-12 rounded-lg object-contain" />
          <CardTitle className="text-2xl">Register Your ISP</CardTitle>
          <CardDescription>
            {step === "account" && "Create your admin account to get started"}
            {step === "verify_email" && "Check your email to continue"}
            {step === "organization" && "Set up your organization details"}
            {step === "complete" && "You're all set!"}
          </CardDescription>
        </CardHeader>

        {/* Progress indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-12 rounded-full ${
                step === "account" || step === "verify_email" || step === "organization" || step === "complete"
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step === "verify_email" || step === "organization" || step === "complete"
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step === "organization" || step === "complete"
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step === "complete" ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Account</span>
            <span>Verify</span>
            <span>Organization</span>
            <span>Complete</span>
          </div>
        </div>

        {step === "verify_email" && (
          <CardContent className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Check your email</h3>
            <p className="text-muted-foreground mb-4">
              We've sent a verification link to <strong>{email}</strong>.
              <br />
              Click the link in the email to verify your account and continue setup.
            </p>
            <Alert className="text-left">
              <AlertDescription>
                After verifying your email, return to this page to complete your organization setup.
                The page will automatically detect when you're verified.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {step === "account" && (
          <form onSubmit={handleAccountSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Continue
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "organization" && (
          <form onSubmit={handleOrganizationSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Alert>
                <AlertDescription>
                  Please check your email to verify your account before
                  continuing.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="My ISP Company"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setSubdomain(generateSubdomain(e.target.value));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    placeholder="my-isp"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    required
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    .ispmanager.app
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be your unique URL for accessing the platform
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Create Organization
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "complete" && (
          <CardContent className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Welcome to ISP Manager!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your organization has been created successfully. Redirecting to
              your dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
