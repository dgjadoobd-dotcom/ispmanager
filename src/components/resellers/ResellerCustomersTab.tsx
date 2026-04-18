import { useState } from "react";
import { Users, User, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnassignCustomer } from "@/hooks/useResellerAssignment";
import { AssignCustomerDialog } from "./AssignCustomerDialog";

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
};

interface Props {
  customers: any[];
  isLoading: boolean;
  resellerId: string;
  tenantId: string;
}

export function ResellerCustomersTab({ customers, isLoading, resellerId, tenantId }: Props) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{ id: string; name: string } | null>(null);
  const unassignMutation = useUnassignCustomer();

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  return (
    <>
      <Card className="border-border/50 mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Customer List ({customers.length})</CardTitle>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Add Customer
          </Button>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">This reseller has no customers</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setAssignOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1.5" /> Assign Customer
              </Button>
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c: any) => {
                    const st = statusConfig[c.connection_status] || statusConfig.pending;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.phone}</TableCell>
                        <TableCell className="text-sm">{c.packages?.name || "—"}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          ৳{Number(c.due_balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Remove from reseller"
                            onClick={() => setUnassignTarget({ id: c.id, name: c.name })}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
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

      <AssignCustomerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        resellerId={resellerId}
        tenantId={tenantId}
      />

      <AlertDialog open={!!unassignTarget} onOpenChange={() => setUnassignTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{unassignTarget?.name}</strong> from this reseller? The customer will be moved directly under the ISP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (unassignTarget) {
                  unassignMutation.mutate(unassignTarget.id);
                  setUnassignTarget(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}