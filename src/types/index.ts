// User Roles
export type UserRole = 
  | 'super_admin' 
  | 'isp_owner' 
  | 'admin' 
  | 'manager' 
  | 'staff' 
  | 'accountant' 
  | 'marketing' 
  | 'member';

// Connection Status
export type ConnectionStatus = 'active' | 'suspended' | 'pending';

// Payment Status
export type PaymentStatus = 'paid' | 'due' | 'partial' | 'overdue';

// Billing Cycle
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

// Tenant/ISP
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  theme?: TenantTheme;
  settings: TenantSettings;
  subscriptionStatus: 'active' | 'suspended' | 'trial';
  createdAt: Date;
}

export interface TenantTheme {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

export interface TenantSettings {
  autoSuspendDays: number;
  enableOnlinePayment: boolean;
  currency: string;
  timezone: string;
  language: 'en' | 'bn';
}

// Customer/Member
export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  packageId: string;
  packageName?: string;
  connectionStatus: ConnectionStatus;
  dueBalance: number;
  advanceBalance: number;
  joinDate: Date;
  lastPaymentDate?: Date;
}

// Internet Package
export interface Package {
  id: string;
  tenantId: string;
  name: string;
  speedLabel: string;
  monthlyPrice: number;
  validity: number; // days
  isActive: boolean;
}

// Bill
export interface Bill {
  id: string;
  customerId: string;
  tenantId: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
}

// Payment
export interface Payment {
  id: string;
  customerId: string;
  tenantId: string;
  amount: number;
  method: 'cash' | 'online' | 'bank_transfer';
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalDue: number;
  collectionRate: number;
  newCustomersThisMonth: number;
}

// Navigation Item
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
  children?: NavItem[];
}
