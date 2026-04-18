import { cn } from "@/lib/utils";
import {
  Building2,
  CreditCard,
  Bell,
  Palette,
  Mail,
  Key,
  Network,
  Package,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  recommended?: boolean;
}

interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const settingsSections: Record<string, SettingsSection> = {
  general: { id: "general", label: "General", icon: Building2, description: "Business identity & regional preferences" },
  subscription: { id: "subscription", label: "Subscription", icon: Package, description: "Your plan, usage & billing estimate" },
  billing: { id: "billing", label: "Billing & Automation", icon: CreditCard, description: "Payment gateway, auto-suspend & invoicing rules", recommended: true },
  notifications: { id: "notifications", label: "Notifications", icon: Bell, description: "Control what alerts reach your customers" },
  branding: { id: "branding", label: "Branding", icon: Palette, description: "Logo & colors for invoices and portals" },
  email: { id: "email", label: "Email", icon: Mail, description: "Transactional email sender configuration" },
  network: { id: "network", label: "Network Automation", icon: Network, description: "Automatically control customer speed & access", recommended: true },
  api: { id: "api", label: "API Access", icon: Key, description: "Manage API keys for external integrations" },
};

export function SettingsSidebar({ sections, activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
              "hover:bg-muted/50 active:scale-[0.98]",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <div className={cn(
              "mt-0.5 p-1.5 rounded-md transition-colors",
              isActive ? "bg-primary/10" : "bg-muted"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-medium text-sm",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {section.label}
                </p>
                {section.recommended && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary font-medium">
                    <Star className="h-2.5 w-2.5 mr-0.5 fill-primary" />
                    Recommended
                  </Badge>
                )}
              </div>
              {section.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {section.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
