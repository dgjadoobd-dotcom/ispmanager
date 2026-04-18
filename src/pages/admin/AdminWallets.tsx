import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, Search, Building2, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const mockWallets = [
  { id: "1", ispName: "SpeedLink ISP", balance: 45200, pendingPayout: 12000, totalEarned: 180000, lastActivity: "2 hours ago" },
  { id: "2", ispName: "FastNet BD", balance: 32800, pendingPayout: 0, totalEarned: 145000, lastActivity: "1 day ago" },
  { id: "3", ispName: "NetZone", balance: 18500, pendingPayout: 18500, totalEarned: 92000, lastActivity: "3 hours ago" },
  { id: "4", ispName: "DataStream BD", balance: 8200, pendingPayout: 0, totalEarned: 67000, lastActivity: "5 hours ago" },
  { id: "5", ispName: "ConnectPlus", balance: 22100, pendingPayout: 10000, totalEarned: 110000, lastActivity: "30 min ago" },
];

export default function AdminWallets() {
  const [search, setSearch] = useState("");

  const filtered = mockWallets.filter((w) =>
    w.ispName.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = mockWallets.reduce((s, w) => s + w.balance, 0);
  const totalPending = mockWallets.reduce((s, w) => s + w.pendingPayout, 0);
  const totalEarned = mockWallets.reduce((s, w) => s + w.totalEarned, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ISP Wallets</h1>
        <p className="text-muted-foreground">Monitor ISP wallet balances and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-xl font-bold">৳{totalBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-xl font-bold">৳{totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-xl font-bold">৳{totalEarned.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            All ISP Wallets
          </CardTitle>
          <div className="relative mt-3 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ISP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ISP</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Pending Payout</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No wallets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{wallet.ispName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ৳{wallet.balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {wallet.pendingPayout > 0 ? (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            ৳{wallet.pendingPayout.toLocaleString()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        ৳{wallet.totalEarned.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {wallet.lastActivity}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
