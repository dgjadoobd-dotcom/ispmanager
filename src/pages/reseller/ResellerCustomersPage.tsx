import { useState } from "react";
import { Users, User, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useResellerSelf, useResellerSelfCustomers } from "@/hooks/useResellerDashboard";

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
};

export default function ResellerCustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: reseller } = useResellerSelf();
  const { data: customers, isLoading } = useResellerSelfCustomers(reseller?.id);

  const filtered = (customers || []).filter((c: any) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === "all" || c.connection_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">My Customers</h1>
          <p className="text-sm text-muted-foreground">All customers under your management</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No customers found</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="text-right">Monthly Price</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: any) => {
                    const st = statusConfig[c.connection_status] || statusConfig.pending;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{c.name}</p>
                              {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.phone}</TableCell>
                        <TableCell className="text-sm">{c.packages?.name || "—"}</TableCell>
                        <TableCell className="text-right text-sm">৳{Number(c.packages?.monthly_price || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm font-medium">৳{Number(c.due_balance || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}