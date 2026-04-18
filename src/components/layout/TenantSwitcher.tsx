import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenantContext } from "@/contexts/TenantContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TenantSwitcher() {
  const { currentTenant, allTenants, setCurrentTenant, isSuperAdmin, isLoading } =
    useTenantContext();

  if (!isSuperAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 max-w-[200px]"
          disabled={isLoading || allTenants.length === 0}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isLoading
              ? "Loading..."
              : currentTenant?.name || (allTenants.length === 0 ? "No tenants" : "Select tenant")}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Switch Tenant/ISP</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allTenants.length === 0 ? (
          <DropdownMenuItem disabled>No tenants found</DropdownMenuItem>
        ) : (
          allTenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => setCurrentTenant(tenant)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{tenant.name}</span>
                <span className="text-xs text-muted-foreground">
                  {tenant.subdomain}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    tenant.subscription_status === "active"
                      ? "default"
                      : tenant.subscription_status === "trial"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-xs"
                >
                  {tenant.subscription_status === "active"
                    ? "Active"
                    : tenant.subscription_status === "trial"
                      ? "Trial"
                      : "Suspended"}
                </Badge>
                {currentTenant?.id === tenant.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
