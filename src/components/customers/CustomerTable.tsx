import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Eye, Edit, Receipt, CreditCard, Pause, Play, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { ConnectionStatus } from "@/types";

export interface CustomerTableData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  package: string;
  packageId: string;
  speed?: string;
  status: ConnectionStatus;
  dueAmount: number;
  advanceAmount: number;
  joinDate: string;
  lastPayment: string;
  networkUsername?: string;
  monthlyPrice?: number;
}

interface CustomerTableProps {
  customers: CustomerTableData[];
  onEdit: (customer: CustomerTableData) => void;
  onViewDetails: (customer: CustomerTableData) => void;
  onSuspend: (customer: CustomerTableData) => void;
  onActivate: (customer: CustomerTableData) => void;
  onRecordPayment: (customer: CustomerTableData) => void;
  onGenerateBill: (customer: CustomerTableData) => void;
}

const billingStatusStyles: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/25",
  due: "bg-destructive/15 text-destructive border-destructive/25",
  clear: "bg-muted text-muted-foreground border-border",
};

export function CustomerTable({
  customers,
  onEdit,
  onViewDetails,
  onSuspend,
  onActivate,
  onRecordPayment,
  onGenerateBill,
}: CustomerTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const allSelected = customers.length > 0 && selectedIds.size === customers.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const togglePassword = (id: string) => {
    const next = new Set(visiblePasswords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisiblePasswords(next);
  };

  const getBillingStatus = (customer: CustomerTableData) => {
    if (customer.dueAmount > 0) return "due";
    if (customer.advanceAmount > 0) return "paid";
    return "clear";
  };

  const getBillingLabel = (customer: CustomerTableData) => {
    if (customer.dueAmount > 0) return "Due";
    if (customer.advanceAmount > 0) return "Paid";
    return "Clear";
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    className="border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                  />
                </TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[80px]">C.Code</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[90px]">ID/IP</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[90px]">Password</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[130px]">Cus. Name</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[100px]">Mobile</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground">Zone</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground">Conn. Type</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground">Cus. Type</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[130px]">Package/Speed</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground text-right">M.Bill</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground min-w-[110px]">MAC Addrs</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground">Server</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground text-center">B.Status</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground text-center">M.Status</TableHead>
                <TableHead className="font-semibold text-xs text-primary-foreground text-center w-14">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="h-32 text-center">
                    <p className="text-muted-foreground">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => {
                  const bStatus = getBillingStatus(customer);
                  const bLabel = getBillingLabel(customer);
                  const isPasswordVisible = visiblePasswords.has(customer.id);
                  return (
                    <TableRow
                      key={customer.id}
                      className={cn(
                        "animate-fade-in",
                        selectedIds.has(customer.id) && "bg-primary/5"
                      )}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(customer.id)}
                          onCheckedChange={() => toggleOne(customer.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {customer.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-primary">
                        {customer.networkUsername || "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-mono">
                            {isPasswordVisible ? "pass123" : "••••••"}
                          </span>
                          <button
                            onClick={() => togglePassword(customer.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold">
                              {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <p className="text-xs font-medium truncate max-w-[120px]">{customer.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{customer.phone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {customer.address?.split(",")[0] || "—"}
                      </TableCell>
                      <TableCell className="text-xs">Fiber</TableCell>
                      <TableCell className="text-xs">Home</TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium">{customer.package}</span>
                        {customer.speed && (
                          <span className="text-muted-foreground">/{customer.speed}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        ৳{(customer.monthlyPrice || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">—</TableCell>
                      <TableCell className="text-xs text-muted-foreground">—</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] border", billingStatusStyles[bStatus])}
                        >
                          {bLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Switch
                            checked={customer.status === "active"}
                            onCheckedChange={() => {
                              if (customer.status === "active") onSuspend(customer);
                              else onActivate(customer);
                            }}
                            className="scale-75"
                          />
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              customer.status === "active"
                                ? "text-success"
                                : "text-destructive"
                            )}
                          >
                            {customer.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onViewDetails(customer)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRecordPayment(customer)}>
                              <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onGenerateBill(customer)}>
                              <Receipt className="mr-2 h-4 w-4" /> Generate Bill
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {customer.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => onSuspend(customer)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Pause className="mr-2 h-4 w-4" /> Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => onActivate(customer)}
                                className="text-primary focus:text-primary"
                              >
                                <Play className="mr-2 h-4 w-4" /> Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
