import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TrendingUp, DollarSign, CreditCard, Building2, ArrowUpRight, Calendar, Receipt } from "lucide-react";
import { useState } from "react";

const revenueData = [
  { month: "Jan", revenue: 98000, growth: 12 },
  { month: "Feb", revenue: 105000, growth: 7 },
  { month: "Mar", revenue: 112000, growth: 6.7 },
  { month: "Apr", revenue: 118000, growth: 5.4 },
  { month: "May", revenue: 125000, growth: 5.9 },
];

const topISPs = [
  { name: "SpeedLink ISP", revenue: 15200, customers: 450, plan: "Enterprise" },
  { name: "FastNet BD", revenue: 12800, customers: 380, plan: "Business" },
  { name: "NetZone", revenue: 9500, customers: 220, plan: "Business" },
  { name: "DataStream BD", revenue: 7200, customers: 180, plan: "Starter" },
  { name: "ConnectPlus", revenue: 6800, customers: 150, plan: "Starter" },
];

export default function AdminRevenue() {
  const [period, setPeriod] = useState("monthly");
  const totalRevenue = revenueData.reduce((s, r) => s + r.revenue, 0);
  const currentMonth = revenueData[revenueData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Revenue</h1>
          <p className="text-muted-foreground">Revenue analytics and breakdown</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-xl font-bold">৳{currentMonth.revenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-success mt-0.5">
                <ArrowUpRight className="h-3 w-3" />
                {currentMonth.growth}% growth
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">YTD Revenue</p>
              <p className="text-xl font-bold">৳{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10">
              <CreditCard className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Revenue/ISP</p>
              <p className="text-xl font-bold">৳2,450</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Receipt className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-xl font-bold">৳18,500</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Platform revenue over the past months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueData.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="text-sm font-medium w-10">{item.month}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-primary/20 rounded-lg flex items-center px-3"
                    style={{ width: `${(item.revenue / 130000) * 100}%` }}
                  >
                    <span className="text-xs font-semibold">৳{item.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-success">+{item.growth}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top ISPs by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top ISPs by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ISP</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Customers</TableHead>
                  <TableHead className="text-right">Monthly Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topISPs.map((isp, i) => (
                  <TableRow key={isp.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          #{i + 1}
                        </div>
                        <span className="font-medium">{isp.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{isp.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{isp.customers}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ৳{isp.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
