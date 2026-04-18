import { useState } from "react";
import { Settings, Mail, CheckCircle, Send, XCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statCards = [
  {
    label: "SMS Balance",
    value: "4,520",
    subtitle: "Total SMS Remaining Balance",
    icon: Mail,
    bg: "bg-emerald-500",
  },
  {
    label: "Todays Send",
    value: "38",
    subtitle: "Total SMS Send Today",
    icon: CheckCircle,
    bg: "bg-teal-500",
  },
  {
    label: "This Month Send",
    value: "1,247",
    subtitle: "Total SMS Send in This Month",
    icon: Send,
    bg: "bg-amber-500",
  },
  {
    label: "This Month Failed",
    value: "12",
    subtitle: "Total SMS Sending Failed in This Month",
    icon: XCircle,
    bg: "bg-red-500",
  },
];

const SmsGatewayPage = () => {
  const [provider, setProvider] = useState("smsinbd");
  const [userName, setUserName] = useState("isp_admin");
  const [sender, setSender] = useState("ISPManager");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    toast.success("SMS Gateway settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>SMS Service</span>
          <span>/</span>
          <span className="text-foreground font-medium">SMS Gateway Setup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">SMS Gateway Setup</h1>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.bg} relative overflow-hidden rounded-xl p-4 text-white transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
              <div className="absolute -right-1 -bottom-4 h-12 w-12 rounded-full bg-white/5" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white/80">{card.label}</p>
                  <p className="text-2xl font-bold leading-tight">{card.value}</p>
                  <p className="truncate text-[11px] text-white/70">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS Settings */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">SMS Settings</h2>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SMS Provider */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                SMS Provider <span className="text-destructive">*</span>
              </label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smsinbd">SMSinBD</SelectItem>
                  <SelectItem value="bulksmsbd">BulkSMSBD</SelectItem>
                  <SelectItem value="smsq">SMSQ</SelectItem>
                  <SelectItem value="greenweb">Green Web</SelectItem>
                  <SelectItem value="reve">Reve Systems</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SMS User Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                SMS User Name <span className="text-destructive">*</span>
              </label>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter SMS username" />
            </div>

            {/* SMS Sender */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                SMS Sender <span className="text-destructive">*</span>
              </label>
              <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Enter sender name" />
            </div>

            {/* SMS Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                SMS Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter SMS password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
              Update Company Information
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsGatewayPage;
