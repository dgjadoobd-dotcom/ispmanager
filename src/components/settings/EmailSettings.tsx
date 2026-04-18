import { useState } from "react";
import { Mail, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function EmailSettings() {
  const [protocol, setProtocol] = useState("smtp");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [encryption, setEncryption] = useState("tls");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!host || !username || !fromEmail) {
      toast.error("Host, Username এবং Mail From Email আবশ্যক");
      return;
    }
    setIsSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Email সেটিংস সেভ হয়েছে");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Email Setup</CardTitle>
              <p className="text-sm text-muted-foreground">Email Settings / Configuration</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* SMTP Configuration Card */}
      <Card className="overflow-hidden">
        {/* Dark header bar */}
        <div className="bg-foreground/90 px-6 py-3">
          <h3 className="text-sm font-semibold text-background">SMTP Configuration</h3>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Mail Protocol */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mail Protocol</Label>
            <RadioGroup
              value={protocol}
              onValueChange={setProtocol}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mail" id="protocol-mail" />
                <Label htmlFor="protocol-mail" className="cursor-pointer font-normal">Mail</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="smtp" id="protocol-smtp" />
                <Label htmlFor="protocol-smtp" className="cursor-pointer font-normal">SMTP</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Host */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-host">Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>

            {/* Port */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                placeholder="587"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-username">Username</Label>
              <Input
                id="smtp-username"
                placeholder="user@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-password">Password</Label>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mail From Name */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-from-name">Mail From Name</Label>
              <Input
                id="smtp-from-name"
                placeholder="ISP Billing"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>

            {/* Mail From Email */}
            <div className="space-y-1.5">
              <Label htmlFor="smtp-from-email">Mail From Email</Label>
              <Input
                id="smtp-from-email"
                type="email"
                placeholder="billing@example.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Encryption */}
          <div className="space-y-1.5 max-w-xs">
            <Label>Encryption</Label>
            <Select value={encryption} onValueChange={setEncryption}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "সেভ হচ্ছে..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invoice PDF সহ ইমেইল পাঠান
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Payment reminder ইমেইল
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Due date notification
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
