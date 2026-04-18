import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Tables } from "@/integrations/supabase/types";

export interface CustomerFilters {
  search: string;
  status: string;
  packageId: string;
  balanceType: string;
  server: string;
  protocolType: string;
  profile: string;
  zone: string;
  subZone: string;
  box: string;
  clientType: string;
  connectionType: string;
  billingStatus: string;
  mikrotikStatus: string;
  assignedFor: string;
  customStatus: string;
  fromDate: string;
  toDate: string;
}

export const defaultFilters: CustomerFilters = {
  search: "",
  status: "all",
  packageId: "all",
  balanceType: "all",
  server: "all",
  protocolType: "all",
  profile: "all",
  zone: "all",
  subZone: "all",
  box: "all",
  clientType: "all",
  connectionType: "all",
  billingStatus: "all",
  mikrotikStatus: "all",
  assignedFor: "all",
  customStatus: "all",
  fromDate: "",
  toDate: "",
};

interface CustomerFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  packages: Tables<"packages">[];
  totalCount: number;
  filteredCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function CustomerFiltersBar({
  filters,
  onFiltersChange,
  packages,
  totalCount,
  filteredCount,
  pageSize,
  onPageSizeChange,
}: CustomerFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);

  const updateFilter = <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* Collapsible Filter Panel */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Card className="border">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-primary text-primary-foreground rounded-t-lg hover:bg-primary/90 transition-colors">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-semibold">Search Filter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-80">
                  {filtersOpen ? "Hide" : "Show"}
                </span>
                {filtersOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <FilterSelect
                  label="Server"
                  value={filters.server}
                  onChange={(v) => updateFilter("server", v)}
                  options={[{ value: "all", label: "All Server" }]}
                />
                <FilterSelect
                  label="Protocol Type"
                  value={filters.protocolType}
                  onChange={(v) => updateFilter("protocolType", v)}
                  options={[
                    { value: "all", label: "All Protocol" },
                    { value: "pppoe", label: "PPPoE" },
                    { value: "static", label: "Static" },
                    { value: "dhcp", label: "DHCP" },
                  ]}
                />
                <FilterSelect
                  label="Profile"
                  value={filters.profile}
                  onChange={(v) => updateFilter("profile", v)}
                  options={[{ value: "all", label: "All Profile" }]}
                />
                <FilterSelect
                  label="Zone"
                  value={filters.zone}
                  onChange={(v) => updateFilter("zone", v)}
                  options={[{ value: "all", label: "All Zone" }]}
                />
                <FilterSelect
                  label="Sub Zone"
                  value={filters.subZone}
                  onChange={(v) => updateFilter("subZone", v)}
                  options={[{ value: "all", label: "All Sub Zone" }]}
                />
                <FilterSelect
                  label="Box"
                  value={filters.box}
                  onChange={(v) => updateFilter("box", v)}
                  options={[{ value: "all", label: "All Box" }]}
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <FilterSelect
                  label="Package"
                  value={filters.packageId}
                  onChange={(v) => updateFilter("packageId", v)}
                  options={[
                    { value: "all", label: "All Package" },
                    { value: "none", label: "No Package" },
                    ...packages.map((pkg) => ({
                      value: pkg.id,
                      label: `${pkg.name} - ${pkg.speed_label}`,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Client Type"
                  value={filters.clientType}
                  onChange={(v) => updateFilter("clientType", v)}
                  options={[
                    { value: "all", label: "All Type" },
                    { value: "home", label: "Home" },
                    { value: "corporate", label: "Corporate" },
                    { value: "sme", label: "SME" },
                  ]}
                />
                <FilterSelect
                  label="Connection Type"
                  value={filters.connectionType}
                  onChange={(v) => updateFilter("connectionType", v)}
                  options={[
                    { value: "all", label: "All Connection" },
                    { value: "fiber", label: "Fiber" },
                    { value: "wireless", label: "Wireless" },
                    { value: "cable", label: "Cable" },
                  ]}
                />
                <FilterSelect
                  label="B.Status"
                  value={filters.billingStatus}
                  onChange={(v) => updateFilter("billingStatus", v)}
                  options={[
                    { value: "all", label: "All B.Status" },
                    { value: "paid", label: "Paid" },
                    { value: "due", label: "Due" },
                    { value: "clear", label: "Clear" },
                  ]}
                />
                <FilterSelect
                  label="M.Status"
                  value={filters.mikrotikStatus}
                  onChange={(v) => updateFilter("mikrotikStatus", v)}
                  options={[
                    { value: "all", label: "All M.Status" },
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Inactive" },
                    { value: "pending", label: "Pending" },
                  ]}
                />
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <FilterSelect
                  label="Asgn.Cus.For"
                  value={filters.assignedFor}
                  onChange={(v) => updateFilter("assignedFor", v)}
                  options={[{ value: "all", label: "All Assigned" }]}
                />
                <FilterSelect
                  label="Custom Status"
                  value={filters.customStatus}
                  onChange={(v) => updateFilter("customStatus", v)}
                  options={[{ value: "all", label: "All Status" }]}
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From Date</label>
                  <Input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => updateFilter("fromDate", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To Date</label>
                  <Input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => updateFilter("toDate", e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Bottom Bar: Show Entries + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">SHOW</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap">ENTRIES</span>
          <span className="text-xs text-muted-foreground ml-2">
            (Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>)
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// Reusable filter select component
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
