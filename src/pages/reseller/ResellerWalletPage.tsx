import { Wallet, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useResellerSelf, useResellerSelfWallet, useResellerSelfCommissions } from "@/hooks/useResellerDashboard";

const typeLabels: Record<string, string> = {
  commission: "Commission",
  adjustment: "Adjustment",
  withdrawal: "Withdrawal",
};

export default function ResellerWalletPage() {
  const { data: reseller } = useResellerSelf();
  const { data: wallet, isLoading: walletLoading } = useResellerSelfWallet(reseller?.id);
  const { data: commissions, isLoading: commissionsLoading } = useResellerSelfCommissions(reseller?.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Wallet & Commission</h1>
          <p className="text-sm text-muted-foreground">Your earnings and transaction details</p>
        </div>
      </div>

      {/* Balance card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            {walletLoading ? (
              <Skeleton className="h-9 w-32 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">৳{(wallet?.balance || 0).toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
          <TabsTrigger value="transactions" className="gap-1.5">
            <Wallet className="h-4 w-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5">
            <Receipt className="h-4 w-4" /> Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-border/50 mt-4">
            <CardHeader>
              <CardTitle className="text-base">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !wallet?.transactions.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet</div>
              ) : (
                <div className="overflow-auto rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallet.transactions.map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">{format(new Date(tx.created_at), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={tx.amount >= 0 ? "default" : "destructive"} className="text-[10px] gap-1">
                              {tx.amount >= 0 ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                              {typeLabels[tx.type] || tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{tx.description}</TableCell>
                          <TableCell className={`text-right font-semibold text-sm ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
                            {tx.amount >= 0 ? "+" : ""}৳{Number(tx.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-sm">৳{Number(tx.balance_after).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card className="border-border/50 mt-4">
            <CardHeader>
              <CardTitle className="text-base">Commission Records</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !commissions?.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No commission records yet</div>
              ) : (
                <div className="overflow-auto rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm">{format(new Date(c.created_at), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{c.customers?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{c.customers?.phone}</p>
                          </TableCell>
                          <TableCell className="text-right text-sm">৳{Number(c.payment_amount).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold text-sm text-success">+৳{Number(c.commission_amount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}