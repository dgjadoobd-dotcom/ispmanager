import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const typeLabels: Record<string, string> = {
  percentage: "Percentage",
  flat: "Flat",
  per_payment: "Per Payment",
};

interface Props {
  commissions: any[];
  isLoading: boolean;
}

export function ResellerCommissionsTab({ commissions, isLoading }: Props) {
  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  const totalCommission = commissions.reduce((s, c) => s + Number(c.commission_amount), 0);

  return (
    <Card className="border-border/50 mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Commission History ({commissions.length})</CardTitle>
          <Badge variant="outline" className="text-sm">Total: ৳{totalCommission.toLocaleString()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No commission records</p>
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead>Commission Type</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(c.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.customers?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      ৳{Number(c.payment_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {c.commission_value}{c.commission_type === "percentage" ? "%" : "৳"} ({typeLabels[c.commission_type]})
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm text-success">
                      ৳{Number(c.commission_amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}