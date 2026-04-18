import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsRow({ label, description, children, className }: SettingsRowProps) {
  return (
    <div className={cn("flex items-center justify-between py-3", className)}>
      <div className="space-y-0.5 flex-1 mr-4">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
