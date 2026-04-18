import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, FileSpreadsheet, RefreshCw, X, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface AccountEntry {
  name: string;
  amount: number;
}

interface SubCategory {
  name: string;
  accounts: AccountEntry[];
}

interface BalanceSection {
  title: string;
  subCategories: SubCategory[];
}

const balanceData: BalanceSection[] = [
  {
    title: "Asset",
    subCategories: [
      {
        name: "Cash & Bank",
        accounts: [
          { name: "Cash", amount: 125000 },
          { name: "Bank - City Bank", amount: 450000 },
          { name: "Bank - Dutch Bangla", amount: 320000 },
          { name: "Mobile Banking - bKash", amount: 85000 },
          { name: "Mobile Banking - Nagad", amount: 42000 },
        ],
      },
      {
        name: "Depreciation & Amortization",
        accounts: [
          { name: "Accumulated Depreciation", amount: -35000 },
        ],
      },
      {
        name: "Expected Payments from Customers",
        accounts: [
          { name: "Accounts Receivable", amount: 198000 },
          { name: "Advance to Suppliers", amount: 25000 },
        ],
      },
      {
        name: "Inventory",
        accounts: [
          { name: "Network Equipment Inventory", amount: 175000 },
          { name: "Cable & Accessories", amount: 65000 },
        ],
      },
      {
        name: "Fixed Assets",
        accounts: [
          { name: "Office Equipment", amount: 120000 },
          { name: "Network Infrastructure", amount: 850000 },
          { name: "Vehicles", amount: 350000 },
          { name: "Furniture & Fixtures", amount: 75000 },
        ],
      },
    ],
  },
  {
    title: "Liabilities",
    subCategories: [
      {
        name: "Customer Prepayments",
        accounts: [
          { name: "Advance from Customers", amount: 95000 },
          { name: "Unearned Revenue", amount: 45000 },
        ],
      },
      {
        name: "Due For Payroll",
        accounts: [
          { name: "Salaries Payable", amount: 180000 },
          { name: "Tax Payable", amount: 32000 },
        ],
      },
      {
        name: "Expected Payments to Vendors",
        accounts: [
          { name: "Accounts Payable", amount: 215000 },
          { name: "Utility Bills Payable", amount: 18000 },
        ],
      },
    ],
  },
  {
    title: "Owner's Equity",
    subCategories: [
      {
        name: "Business Owner Contribution & Drawing",
        accounts: [
          { name: "Owner's Capital", amount: 1500000 },
          { name: "Owner's Drawing", amount: -120000 },
        ],
      },
      {
        name: "Retained Earnings",
        accounts: [
          { name: "Retained Earnings - Current Year", amount: 680000 },
          { name: "Retained Earnings - Previous Years", amount: 150000 },
        ],
      },
    ],
  },
];

export default function BalanceSheetPage() {
  const [tillDate, setTillDate] = useState<Date>(new Date());

  const sectionTotals = useMemo(() => {
    return balanceData.map((section) => {
      const subTotals = section.subCategories.map((sub) =>
        sub.accounts.reduce((s, a) => s + a.amount, 0)
      );
      return {
        title: section.title,
        subTotals,
        total: subTotals.reduce((s, v) => s + v, 0),
      };
    });
  }, []);

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return amount < 0 ? `(${formatted})` : formatted;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Link to="/dashboard/accounting" className="hover:text-foreground transition-colors">Accounting Report</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Balance Sheet</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Balance Sheet</h1>
            <p className="text-sm text-muted-foreground">Accounting Report</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Generating PDF...")}>
              <FileText className="h-4 w-4 mr-1" /> Generate PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Generating CSV...")}>
              <FileSpreadsheet className="h-4 w-4 mr-1" /> Generate CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Till Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !tillDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {tillDate ? format(tillDate, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={tillDate} onSelect={(d) => d && setTillDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <Button size="sm" onClick={() => toast.success("Report updated")}>
              <RefreshCw className="h-4 w-4 mr-1" /> Update Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTillDate(new Date())}>
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet Content */}
      <Card>
        <CardContent className="p-0">
          {balanceData.map((section, si) => {
            const totals = sectionTotals[si];
            return (
              <div key={section.title}>
                {/* Section Header - Dark Banner */}
                <div className="bg-foreground text-background px-4 py-2.5 font-bold text-sm tracking-wide uppercase">
                  {section.title}
                </div>

                {section.subCategories.map((sub, subi) => (
                  <div key={sub.name}>
                    {/* Sub-category Header */}
                    <div className="bg-muted px-4 py-2 font-semibold text-sm border-b border-border">
                      {sub.name}
                    </div>

                    {/* Account Rows */}
                    {sub.accounts.map((acc, ai) => (
                      <div key={ai} className="flex items-center justify-between px-4 py-2 text-sm border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <span className="pl-4 text-foreground">{acc.name}</span>
                        <span className={cn("font-mono tabular-nums", acc.amount < 0 ? "text-destructive" : "text-foreground")}>
                          {formatAmount(acc.amount)}
                        </span>
                      </div>
                    ))}

                    {/* Sub-total */}
                    <div className="flex items-center justify-between px-4 py-2 text-sm font-semibold border-b border-border bg-muted/50">
                      <span className="pl-4">Total {sub.name}</span>
                      <span className="font-mono tabular-nums">{formatAmount(totals.subTotals[subi])}</span>
                    </div>
                  </div>
                ))}

                {/* Section Total */}
                <div className="flex items-center justify-between px-4 py-3 font-bold text-sm border-b-2 border-border bg-accent/30">
                  <span>Total {section.title}</span>
                  <span className="font-mono tabular-nums text-base">{formatAmount(totals.total)}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="flex items-start gap-2 p-4 rounded-lg bg-accent/20 border border-border text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          Income and expenses are not shown on the balance sheet. Go to{" "}
          <Link to="/dashboard/accounting/profit-loss" className="text-primary font-medium hover:underline">
            Profit &amp; Loss
          </Link>{" "}
          to view.
        </span>
      </div>
    </div>
  );
}
