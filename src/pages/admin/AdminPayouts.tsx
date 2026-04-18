import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, CheckCircle, Clock, XCircle, Building2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const mockPayouts = [
  { id: "P001", ispName: "SpeedLink ISP", amount: 12000, method: "Bank Transfer", requestedAt: "2 hours ago", status: "pending" },
  { id: "P002", ispName: "NetZone", amount: 18500, method: "bKash", requestedAt: "5 hours ago", status: "pending" },
  { id: "P003", ispName: "ConnectPlus", amount: 10000, method: "Bank Transfer", requestedAt: "1 day ago", status: "pending" },
  { id: "P004", ispName: "FastNet BD", amount: 25000, method: "Bank Transfer", requestedAt: "3 days ago", status: "approved" },
  { id: "P005", ispName: "DataStream BD", amount: 8000, method: "Nagad", requestedAt: "5 days ago", status: "approved" },
  { id: "P006", ispName: "SpeedLink ISP", amount: 15000, method: "Bank Transfer", requestedAt: "1 week ago", status: "completed" },
  { id: "P007", ispName: "NetZone", amount: 9500, method: "bKash", requestedAt: "2 weeks ago", status: "rejected" },
];

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock, color: "text-warning" },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle, color: "text-primary" },
  completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle, color: "text-success" },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
};

export default function AdminPayouts() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockPayouts.filter((p) =>
    statusFilter === "all" || p.status === statusFilter
  );

  const pendingCount = mockPayouts.filter(p => p.status === "pending").length;
  const pendingAmount = mockPayouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const completedAmount = mockPayouts.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payout Requests</h1>
        <p className="text-muted-foreground">Review and process ISP payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-xl font-bold">৳{pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid Out</p>
              <p className="text-xl font-bold">৳{completedAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>All Payout Requests</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ID</TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((payout) => {
                    const config = statusConfig[payout.status as keyof typeof statusConfig];
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{payout.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{payout.ispName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ৳{payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{payout.method}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{payout.requestedAt}</TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payout.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="default" className="h-7 text-xs">Approve</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive">Reject</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                          )}
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
    </div>
  );
}
