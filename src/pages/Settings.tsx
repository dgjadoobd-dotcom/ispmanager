import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSidebar, settingsSections } from "@/components/settings/SettingsSidebar";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PaymentGatewaySettings } from "@/components/settings/PaymentGatewaySettings";
import { BrandingSettings } from "@/components/settings/BrandingSettings";
import { EmailSettings } from "@/components/settings/EmailSettings";
import { ApiAccessSettings } from "@/components/settings/ApiAccessSettings";
import { NetworkIntegrationSettings } from "@/components/settings/NetworkIntegrationSettings";
import { SubscriptionDashboard } from "@/components/subscription/SubscriptionDashboard";
import { useUserRole } from "@/hooks/useUserRole";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const isMobile = useIsMobile();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const isIspOwner = userRole === "isp_owner";
  const isSuperAdmin = userRole === "super_admin";
  const canViewSubscription = isIspOwner || isSuperAdmin;
  const canViewNetwork = isSuperAdmin || isIspOwner || userRole === "admin" || userRole === "manager";
  const canViewApi = isSuperAdmin || isIspOwner;

  // Build available sections based on user role
  const availableSections = [
    settingsSections.general,
    ...(canViewSubscription ? [settingsSections.subscription] : []),
    settingsSections.billing,
    settingsSections.notifications,
    settingsSections.branding,
    settingsSections.email,
    ...(canViewNetwork ? [settingsSections.network] : []),
    ...(canViewApi ? [settingsSections.api] : []),
  ];

  const currentSection = availableSections.find(s => s.id === activeSection) || availableSections[0];

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "subscription":
        return canViewSubscription ? <SubscriptionDashboard /> : null;
      case "billing":
        return <PaymentGatewaySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "branding":
        return <BrandingSettings />;
      case "email":
        return <EmailSettings />;
      case "network":
        return canViewNetwork ? <NetworkIntegrationSettings /> : null;
      case "api":
        return canViewApi ? <ApiAccessSettings /> : null;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your ISP workspace settings and preferences
        </p>
      </div>

      {/* Mobile Section Selector */}
      {isMobile && (
        <Select value={activeSection} onValueChange={setActiveSection}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <currentSection.icon className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableSections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <SettingsSidebar
                sections={availableSections}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="space-y-6">
            {/* Section Header - Desktop */}
            {!isMobile && (
              <div className="flex items-center gap-3 pb-4 border-b border-border animate-fade-in">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-primary/10"
                )}>
                  <currentSection.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{currentSection.label}</h2>
                  {currentSection.description && (
                    <p className="text-sm text-muted-foreground">{currentSection.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div key={activeSection} className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
