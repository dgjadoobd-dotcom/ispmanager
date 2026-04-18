/** 
 * Realistic mock data for Sales Demo Mode.
 * All data is static and never touches the database.
 */

const today = new Date();
const thisMonth = today.getMonth();
const thisYear = today.getFullYear();

function daysAgo(n: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthStart(): string {
  return new Date(thisYear, thisMonth, 1).toISOString();
}

// ─── Customers ────────────────────────────────────────────
export const demoCustomers = [
  { id: "demo-c1", name: "Rahim Ahmed", phone: "01712345678", email: "rahim@example.com", package: "20 Mbps", connection_status: "active", due_balance: 0, advance_balance: 500, join_date: daysAgo(120), last_payment_date: daysAgo(3), package_id: "demo-p2" },
  { id: "demo-c2", name: "Fatima Begum", phone: "01812345679", email: "fatima@example.com", package: "50 Mbps", connection_status: "active", due_balance: 1200, advance_balance: 0, join_date: daysAgo(90), last_payment_date: daysAgo(35), package_id: "demo-p3" },
  { id: "demo-c3", name: "Kamal Hossain", phone: "01912345680", email: "kamal@example.com", package: "10 Mbps", connection_status: "suspended", due_balance: 2400, advance_balance: 0, join_date: daysAgo(200), last_payment_date: daysAgo(62), package_id: "demo-p1" },
  { id: "demo-c4", name: "Nusrat Jahan", phone: "01612345681", email: "nusrat@example.com", package: "20 Mbps", connection_status: "active", due_balance: 0, advance_balance: 0, join_date: daysAgo(45), last_payment_date: daysAgo(5), package_id: "demo-p2" },
  { id: "demo-c5", name: "Shahin Alam", phone: "01512345682", email: "shahin@example.com", package: "100 Mbps", connection_status: "active", due_balance: 3000, advance_balance: 0, join_date: daysAgo(150), last_payment_date: daysAgo(40), package_id: "demo-p4" },
  { id: "demo-c6", name: "Anika Rahman", phone: "01312345683", email: "anika@example.com", package: "50 Mbps", connection_status: "active", due_balance: 0, advance_balance: 1000, join_date: daysAgo(30), last_payment_date: daysAgo(1), package_id: "demo-p3" },
  { id: "demo-c7", name: "Tanvir Islam", phone: "01412345684", email: "tanvir@example.com", package: "20 Mbps", connection_status: "pending", due_balance: 800, advance_balance: 0, join_date: daysAgo(7), last_payment_date: null, package_id: "demo-p2" },
  { id: "demo-c8", name: "Mithila Das", phone: "01712345699", email: "mithila@example.com", package: "10 Mbps", connection_status: "active", due_balance: 0, advance_balance: 200, join_date: daysAgo(180), last_payment_date: daysAgo(10), package_id: "demo-p1" },
];

// ─── Packages ─────────────────────────────────────────────
export const demoPackages = [
  { id: "demo-p1", name: "Starter 10", speed_label: "10 Mbps", monthly_price: 600, is_active: true },
  { id: "demo-p2", name: "Home 20", speed_label: "20 Mbps", monthly_price: 800, is_active: true },
  { id: "demo-p3", name: "Pro 50", speed_label: "50 Mbps", monthly_price: 1500, is_active: true },
  { id: "demo-p4", name: "Ultra 100", speed_label: "100 Mbps", monthly_price: 3000, is_active: true },
];

// ─── Payments ─────────────────────────────────────────────
export const demoPayments = [
  { id: "demo-pay1", customer_id: "demo-c1", amount: 800, method: "cash", created_at: daysAgo(3), customer: demoCustomers[0] },
  { id: "demo-pay2", customer_id: "demo-c6", amount: 1500, method: "online", created_at: daysAgo(1), customer: demoCustomers[5] },
  { id: "demo-pay3", customer_id: "demo-c4", amount: 800, method: "bank_transfer", created_at: daysAgo(5), customer: demoCustomers[3] },
  { id: "demo-pay4", customer_id: "demo-c8", amount: 600, method: "cash", created_at: daysAgo(10), customer: demoCustomers[7] },
  { id: "demo-pay5", customer_id: "demo-c1", amount: 800, method: "online", created_at: daysAgo(33), customer: demoCustomers[0] },
  { id: "demo-pay6", customer_id: "demo-c5", amount: 3000, method: "cash", created_at: daysAgo(40), customer: demoCustomers[4] },
];

// ─── Bills ────────────────────────────────────────────────
export const demoBills = [
  { id: "demo-b1", customer_id: "demo-c1", amount: 800, status: "paid", due_date: daysAgo(-5), created_at: monthStart(), invoice_number: "INV-DEMO-0001" },
  { id: "demo-b2", customer_id: "demo-c2", amount: 1500, status: "overdue", due_date: daysAgo(5), created_at: monthStart(), invoice_number: "INV-DEMO-0002" },
  { id: "demo-b3", customer_id: "demo-c3", amount: 600, status: "overdue", due_date: daysAgo(30), created_at: daysAgo(60), invoice_number: "INV-DEMO-0003" },
  { id: "demo-b4", customer_id: "demo-c4", amount: 800, status: "paid", due_date: daysAgo(-3), created_at: monthStart(), invoice_number: "INV-DEMO-0004" },
  { id: "demo-b5", customer_id: "demo-c5", amount: 3000, status: "due", due_date: daysAgo(-2), created_at: monthStart(), invoice_number: "INV-DEMO-0005" },
  { id: "demo-b6", customer_id: "demo-c6", amount: 1500, status: "paid", due_date: daysAgo(-1), created_at: monthStart(), invoice_number: "INV-DEMO-0006" },
];

// ─── Resellers ────────────────────────────────────────────
export const demoResellers = [
  { id: "demo-r1", name: "NetBridge Solutions", phone: "01711111111", status: "active", customers: 45, commission_type: "percentage", commission_value: 10, wallet_balance: 12500 },
  { id: "demo-r2", name: "FastConnect BD", phone: "01822222222", status: "active", customers: 28, commission_type: "flat", commission_value: 100, wallet_balance: 8200 },
  { id: "demo-r3", name: "LinkUp Digital", phone: "01933333333", status: "active", customers: 12, commission_type: "percentage", commission_value: 8, wallet_balance: 3400 },
];

// ─── Dashboard Metrics ───────────────────────────────────
export const demoMetrics = {
  totalCustomers: demoCustomers.length,
  activeCustomers: demoCustomers.filter((c) => c.connection_status === "active").length,
  suspendedCustomers: demoCustomers.filter((c) => c.connection_status === "suspended").length,
  pendingCustomers: demoCustomers.filter((c) => c.connection_status === "pending").length,
  monthlyRevenue: 7300,
  totalDue: demoCustomers.reduce((sum, c) => sum + c.due_balance, 0),
  customersWithDue: demoCustomers.filter((c) => c.due_balance > 0).length,
  newCustomersThisMonth: 2,
  collectionRate: 78,
  revenueGrowth: 12,
  customerGrowth: 15,
  monthlyBillsCount: demoBills.length,
};

// ─── Revenue Chart Data ──────────────────────────────────
export const demoRevenueChartData = [
  { month: "Jul", revenue: 42000, billed: 52000 },
  { month: "Aug", revenue: 48000, billed: 55000 },
  { month: "Sep", revenue: 51000, billed: 58000 },
  { month: "Oct", revenue: 55000, billed: 60000 },
  { month: "Nov", revenue: 53000, billed: 62000 },
  { month: "Dec", revenue: 61000, billed: 65000 },
  { month: "Jan", revenue: 58000, billed: 68000 },
  { month: "Feb", revenue: 63000, billed: 70000 },
];
