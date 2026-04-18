import { useState, useMemo } from "react";
import { Search, UserPlus, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignableCustomers, useAssignCustomers } from "@/hooks/useResellerAssignment";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resellerId: string;
  tenantId: string;
}

export function AssignCustomerDialog({ open, onOpenChange, resellerId, tenantId }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data: customers, isLoading } = useAssignableCustomers(tenantId, open);
  const assignMutation = useAssignCustomers();

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    assignMutation.mutate(
      { customerIds: selected, resellerId },
      {
        onSuccess: () => {
          setSelected([]);
          setSearch("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Assign Customers
          </DialogTitle>
          <DialogDescription>
            Add customers to this reseller. Select customers who are currently unassigned or assigned to another reseller.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[320px] border rounded-lg">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No customers found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selected.includes(c.id)}
                    onCheckedChange={() => toggle(c.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.packages?.name && (
                      <Badge variant="outline" className="text-[10px]">
                        {c.packages.name}
                      </Badge>
                    )}
                    {c.current_reseller ? (
                      <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        {c.current_reseller}
                      </Badge>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {selected.length > 0 ? `${selected.length} selected` : "Select customers"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={selected.length === 0 || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}