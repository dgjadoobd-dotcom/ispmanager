import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Info } from "lucide-react";
import { toast } from "sonner";

interface Account {
  code: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

interface Category {
  name: string;
  accounts: Account[];
}

interface TabData {
  label: string;
  categories: Category[];
}

const chartData: Record<string, TabData> = {
  asset: {
    label: "Asset",
    categories: [
      {
        name: "Cash & Bank",
        accounts: [
          { code: "1001", name: "Cash on Hand", description: "Physical cash available", status: "active" },
          { code: "1002", name: "bKash Account", description: "bKash mobile banking", status: "active" },
          { code: "1003", name: "Nagad Account", description: "Nagad mobile banking", status: "active" },
          { code: "1004", name: "Bank Account (Primary)", description: "Primary bank account", status: "active" },
          { code: "1005", name: "SSL Commerz", description: "SSL Commerz payment gateway", status: "active" },
        ],
      },
      {
        name: "Inventory",
        accounts: [
          { code: "1100", name: "Router Stock", description: "Routers available for distribution", status: "active" },
          { code: "1101", name: "ONU/ONT Stock", description: "ONU devices in stock", status: "active" },
          { code: "1102", name: "Cable & Accessories", description: "Fiber cables and connectors", status: "active" },
        ],
      },
      {
        name: "Expected Payments from Customers",
        accounts: [
          { code: "1200", name: "Accounts Receivable", description: "Pending customer payments", status: "active" },
          { code: "1201", name: "Advance Deposits", description: "Customer advance payments", status: "active" },
        ],
      },
      {
        name: "Fixed Assets",
        accounts: [
          { code: "1300", name: "Network Equipment", description: "OLT, switches, servers", status: "active" },
          { code: "1301", name: "Office Equipment", description: "Computers, furniture", status: "active" },
          { code: "1302", name: "Vehicles", description: "Company vehicles", status: "active" },
        ],
      },
    ],
  },
  expense: {
    label: "Expense",
    categories: [
      {
        name: "Operational Expense",
        accounts: [
          { code: "5001", name: "Bandwidth Cost", description: "Internet bandwidth purchase", status: "active" },
          { code: "5002", name: "Electricity Bill", description: "Office & POP electricity", status: "active" },
          { code: "5003", name: "Office Rent", description: "Monthly office rent", status: "active" },
          { code: "5004", name: "Staff Salary", description: "Employee salaries", status: "active" },
        ],
      },
      {
        name: "Depreciation",
        accounts: [
          { code: "5100", name: "Equipment Depreciation", description: "Network equipment depreciation", status: "active" },
          { code: "5101", name: "Vehicle Depreciation", description: "Vehicle depreciation", status: "active" },
        ],
      },
      {
        name: "Maintenance & Repair",
        accounts: [
          { code: "5200", name: "Network Maintenance", description: "Cable, splitter repair", status: "active" },
          { code: "5201", name: "Equipment Repair", description: "Router/OLT repair cost", status: "active" },
        ],
      },
      {
        name: "Marketing & Sales",
        accounts: [],
      },
    ],
  },
  income: {
    label: "Income",
    categories: [
      {
        name: "Service Revenue",
        accounts: [
          { code: "4001", name: "Monthly Subscription", description: "Monthly internet subscription fees", status: "active" },
          { code: "4002", name: "Installation Fee", description: "New connection installation charge", status: "active" },
          { code: "4003", name: "Reconnection Fee", description: "Reconnection after suspension", status: "active" },
        ],
      },
      {
        name: "Equipment Sales",
        accounts: [
          { code: "4100", name: "Router Sales", description: "Router sold to customers", status: "active" },
          { code: "4101", name: "ONU Sales", description: "ONU device sales", status: "active" },
        ],
      },
      {
        name: "Other Income",
        accounts: [
          { code: "4200", name: "Late Fee", description: "Late payment penalty", status: "active" },
          { code: "4201", name: "Reseller Commission Income", description: "Income from reseller operations", status: "active" },
        ],
      },
    ],
  },
  liabilities: {
    label: "Liabilities",
    categories: [
      {
        name: "Expected Payments to Vendors",
        accounts: [
          { code: "2001", name: "Accounts Payable", description: "Pending vendor payments", status: "active" },
          { code: "2002", name: "Bandwidth Payable", description: "Due bandwidth payments", status: "active" },
        ],
      },
      {
        name: "Loans & Borrowings",
        accounts: [
          { code: "2100", name: "Bank Loan", description: "Outstanding bank loans", status: "active" },
        ],
      },
      {
        name: "Tax Liabilities",
        accounts: [
          { code: "2200", name: "VAT Payable", description: "VAT collected from customers", status: "active" },
          { code: "2201", name: "Income Tax Payable", description: "Corporate income tax", status: "active" },
        ],
      },
    ],
  },
  equity: {
    label: "Owner's Equity",
    categories: [
      {
        name: "Capital",
        accounts: [
          { code: "3001", name: "Owner's Capital", description: "Owner's invested capital", status: "active" },
          { code: "3002", name: "Retained Earnings", description: "Accumulated profits", status: "active" },
        ],
      },
      {
        name: "Drawings",
        accounts: [
          { code: "3100", name: "Owner's Drawings", description: "Owner's withdrawals", status: "active" },
        ],
      },
    ],
  },
};

const getTabCount = (tab: TabData, statusFilter: string) => {
  return tab.categories.reduce((sum, cat) => {
    const filtered = statusFilter === "all" ? cat.accounts : cat.accounts.filter(a => a.status === statusFilter);
    return sum + filtered.length;
  }, 0);
};

const ChartOfAccountsPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("asset");

  const handleCreate = () => toast.info("Create New Account — coming soon");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Accounts &gt; <span className="text-foreground font-medium">Chart of Accounts</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">List of Accounts</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-fit">
          <Plus className="h-4 w-4" /> Create New Account
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1.5 rounded-lg">
          {Object.entries(chartData).map(([key, tab]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
            >
              {tab.label}{" "}
              <span className="ml-1.5 rounded-full bg-background/20 px-2 py-0.5 text-xs font-semibold">
                {getTabCount(tab, statusFilter)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(chartData).map(([key, tab]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-4">
            {tab.categories.map((category) => {
              const accounts = statusFilter === "all"
                ? category.accounts
                : category.accounts.filter(a => a.status === statusFilter);

              return (
                <div key={category.name} className="rounded-lg border border-border overflow-hidden">
                  {/* Category Header */}
                  <div className="flex items-center justify-between bg-foreground/90 dark:bg-foreground/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-background dark:text-foreground">{category.name}</span>
                      <Info className="h-3.5 w-3.5 text-background/60 dark:text-muted-foreground" />
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-primary hover:text-primary/80 hover:bg-foreground/10 gap-1 text-xs"
                      onClick={handleCreate}
                    >
                      <Plus className="h-3 w-3" /> Create New Account
                    </Button>
                  </div>

                  {/* Accounts Table */}
                  {accounts.length > 0 ? (
                    <div className="divide-y divide-border">
                      {/* Table Header */}
                      <div className="grid grid-cols-[100px_1fr_1fr_48px] gap-4 px-4 py-2.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Code</span>
                        <span>Name</span>
                        <span>Description</span>
                        <span></span>
                      </div>
                      {accounts.map((account) => (
                        <div
                          key={account.code}
                          className="grid grid-cols-[100px_1fr_1fr_48px] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                        >
                          <span className="text-sm font-mono font-medium text-foreground">{account.code}</span>
                          <span className="text-sm text-foreground">{account.name}</span>
                          <span className="text-sm text-muted-foreground">{account.description}</span>
                          <button
                            onClick={() => toast.info(`Edit ${account.name} — coming soon`)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No Data Found
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChartOfAccountsPage;
