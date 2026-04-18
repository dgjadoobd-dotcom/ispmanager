import {
  Users,
  UserCheck,
  UserX,
  Ban,
  UserPlus,
  RefreshCw,
  UserMinus,
  Clock,
  FileText,
  CheckCircle,
  CircleDot,
  XCircle,
  Wifi,
  ShieldOff,
  CalendarX,
  AlertCircle,
  TrendingUp,
  Wallet,
  Receipt,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { DashboardStatCard, type StatVariant } from "./DashboardStatCard";

interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: StatVariant;
}

interface DashboardStatGridProps {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  suspendedCustomers: number;
  newCustomersThisMonth: number;
  renewedCustomers: number;
  deactivatedCustomers: number;
  expiredCustomers: number;
  billedCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  unpaidCount: number;
  onlineCount: number;
  blockedCount: number;
  billExpiredCount: number;
  dueCustomers: number;
  collectionRate: number;
  monthlyRevenue: number;
  totalDue: number;
  billsGenerated: number;
}

export function DashboardStatGrid(props: DashboardStatGridProps) {
  const stats: StatItem[][] = [
    // Row 1: Client Overview
    [
      { title: "Total Client", value: props.totalCustomers, icon: Users, variant: "primary" },
      { title: "Active / Running", value: props.activeCustomers, icon: UserCheck, variant: "success" },
      { title: "Inactive", value: props.inactiveCustomers, icon: UserX, variant: "info" },
      { title: "Suspended", value: props.suspendedCustomers, icon: Ban, variant: "danger" },
    ],
    // Row 2: Client Changes
    [
      { title: "New Client", value: props.newCustomersThisMonth, subtitle: "This month", icon: UserPlus, variant: "primary" },
      { title: "Renewed", value: props.renewedCustomers, icon: RefreshCw, variant: "success" },
      { title: "Deactivated", value: props.deactivatedCustomers, icon: UserMinus, variant: "info" },
      { title: "Expired", value: props.expiredCustomers, icon: Clock, variant: "danger" },
    ],
    // Row 3: Billing
    [
      { title: "Billed", value: props.billedCount, icon: FileText, variant: "primary" },
      { title: "Paid", value: props.paidCount, icon: CheckCircle, variant: "success" },
      { title: "Partially Paid", value: props.partiallyPaidCount, icon: CircleDot, variant: "warning" },
      { title: "Unpaid", value: props.unpaidCount, icon: XCircle, variant: "danger" },
    ],
    // Row 4: Network & Due
    [
      { title: "Online", value: props.onlineCount, icon: Wifi, variant: "success" },
      { title: "Blocked", value: props.blockedCount, icon: ShieldOff, variant: "danger" },
      { title: "Bill Expired", value: props.billExpiredCount, icon: CalendarX, variant: "warning" },
      { title: "Due Clients", value: props.dueCustomers, icon: AlertCircle, variant: "purple" },
    ],
    // Row 5: Financial Summary
    [
      { title: "Collection Rate", value: `${props.collectionRate.toFixed(0)}%`, icon: TrendingUp, variant: "success" },
      { title: "Monthly Revenue", value: `৳${props.monthlyRevenue.toLocaleString()}`, icon: Wallet, variant: "primary" },
      { title: "Outstanding Due", value: `৳${props.totalDue.toLocaleString()}`, icon: AlertCircle, variant: "danger" },
      { title: "Bills Generated", value: props.billsGenerated, icon: Receipt, variant: "info" },
    ],
  ];

  return (
    <div className="space-y-3">
      {stats.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {row.map((stat, colIdx) => (
            <DashboardStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              variant={stat.variant}
              index={rowIdx * 4 + colIdx}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
