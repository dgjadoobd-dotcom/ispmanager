import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { SuperAdminLayout } from "@/components/admin/SuperAdminLayout";
import MobileLayout from "@/components/mobile/MobileLayout";
import { OfflineFallback } from "@/components/mobile/OfflineFallback";
import { StaffRoute } from "@/components/StaffRoute";
import { CustomerRoute } from "@/components/CustomerRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ResellerImpersonationProvider } from "@/contexts/ResellerImpersonationContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import React, { lazy, Suspense } from "react";

// Dashboard Pages
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Packages from "@/pages/Packages";
import Billing from "@/pages/Billing";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import NetworkPage from "@/pages/NetworkPage";
import MikrotikServersPage from "@/pages/network/MikrotikServersPage";
import MikrotikBackupPage from "@/pages/network/MikrotikBackupPage";
import MikrotikImportPage from "@/pages/network/MikrotikImportPage";
import BulkClientsImportPage from "@/pages/network/BulkClientsImportPage";
import OltDevicesPage from "@/pages/OltDevicesPage";
import OltUsersPage from "@/pages/OltUsersPage";
import Notifications from "@/pages/Notifications";
import Resellers from "@/pages/Resellers";
import ResellerDetail from "@/pages/ResellerDetail";
import ResellerDashboardPage from "@/pages/reseller/ResellerDashboardPage";
import ResellerCustomersPage from "@/pages/reseller/ResellerCustomersPage";
import ResellerPaymentsPage from "@/pages/reseller/ResellerPaymentsPage";
import ResellerWalletPage from "@/pages/reseller/ResellerWalletPage";
import ResellerPackageTariffPage from "@/pages/reseller/ResellerPackageTariffPage";
import ResellerFundingPage from "@/pages/reseller/ResellerFundingPage";
import ResellerPgwSettlementPage from "@/pages/reseller/ResellerPgwSettlementPage";
import NotFound from "@/pages/NotFound";
import PlaceholderPage from "@/pages/placeholder/PlaceholderPage";
import CompanySetupPage from "@/pages/system/CompanySetupPage";
import AppUsersPage from "@/pages/system/AppUsersPage";
import InvoiceSetupPage from "@/pages/system/InvoiceSetupPage";
import PeriodsSetupPage from "@/pages/system/PeriodsSetupPage";
import PaymentGatewaysPage from "@/pages/system/PaymentGatewaysPage";
import TaskManagementPage from "@/pages/support/TaskManagementPage";
import SupportCategoryPage from "@/pages/support/SupportCategoryPage";
import TaskCategoryPage from "@/pages/support/TaskCategoryPage";
import ClientSupportPage from "@/pages/support/ClientSupportPage";
import SupportHistoryPage from "@/pages/support/SupportHistoryPage";
import TaskHistoryPage from "@/pages/support/TaskHistoryPage";
import EmployeeListPage from "@/pages/hr/EmployeeListPage";
import DepartmentPage from "@/pages/hr/DepartmentPage";
import SalarySheetPage from "@/pages/hr/SalarySheetPage";
import AttendancePage from "@/pages/hr/AttendancePage";
import LeaveCategoryPage from "@/pages/hr/LeaveCategoryPage";
import LeaveSetupPage from "@/pages/hr/LeaveSetupPage";
import LeaveApplyPage from "@/pages/hr/LeaveApplyPage";
import LeaveApprovalPage from "@/pages/hr/LeaveApprovalPage";
import ZonesPage from "@/pages/config/ZonesPage";
import ConnectionTypePage from "@/pages/config/ConnectionTypePage";
import ClientTypePage from "@/pages/config/ClientTypePage";
import ProtocolTypePage from "@/pages/config/ProtocolTypePage";
import AreaManagementPage from "@/pages/config/AreaManagementPage";
import BillingStatusPage from "@/pages/config/BillingStatusPage";
import NewRequestPage from "@/pages/clients/NewRequestPage";
import AddNewClientPage from "@/pages/clients/AddNewClientPage";
import LeftClientsPage from "@/pages/clients/LeftClientsPage";
import ChangeRequestPage from "@/pages/clients/ChangeRequestPage";
import DailyCollectionPage from "@/pages/billing/DailyCollectionPage";
import MonthlyBillingReport from "@/pages/billing/MonthlyBillingReport";
import DailyIncomePage from "@/pages/finance/DailyIncomePage";
import DailyExpensePage from "@/pages/finance/DailyExpensePage";
import DailyAccountClosingPage from "@/pages/finance/DailyAccountClosingPage";
import FinancialHistoryPage from "@/pages/finance/FinancialHistoryPage";
import AccountingDashboardPage from "@/pages/finance/AccountingDashboardPage";
import ChartOfAccountsPage from "@/pages/finance/ChartOfAccountsPage";
import JournalVoucherPage from "@/pages/finance/JournalVoucherPage";
import BalanceSheetPage from "@/pages/finance/BalanceSheetPage";
import ProfitLossPage from "@/pages/finance/ProfitLossPage";
import TrialBalancePage from "@/pages/finance/TrialBalancePage";
import ItemsPage from "@/pages/inventory/ItemsPage";
import StockPage from "@/pages/inventory/StockPage";
import AssetsPage from "@/pages/inventory/AssetsPage";
import VendorsPage from "@/pages/purchase/VendorsPage";
import PurchasePage from "@/pages/purchase/PurchasePage";
import PurchaseBillPage from "@/pages/purchase/PurchaseBillPage";
import SendSmsPage from "@/pages/sms/SendSmsPage";
import SmsTemplatePage from "@/pages/sms/SmsTemplatePage";
import SmsGatewayPage from "@/pages/sms/SmsGatewayPage";
import PaymentProcessingFeePage from "@/pages/system/PaymentProcessingFeePage";
import VatSetupPage from "@/pages/system/VatSetupPage";
import ActivityLoggersPage from "@/pages/system/ActivityLoggersPage";
import AutomaticProcessPage from "@/pages/system/AutomaticProcessPage";
import PortalManagePage from "@/pages/portal-manage/PortalManagePage";
import CorporateClientsPage from "@/pages/clients/CorporateClientsPage";

// Auth Pages
import StaffLogin from "@/pages/auth/StaffLogin";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import TenantOnboarding from "@/pages/auth/TenantOnboarding";

// Portal Pages
import Login from "@/pages/portal/Login";
import Signup from "@/pages/portal/Signup";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalBills from "@/pages/portal/PortalBills";
import PortalPayments from "@/pages/portal/PortalPayments";
import PortalProfile from "@/pages/portal/PortalProfile";

// Mobile App Pages
import MobileLogin from "@/pages/mobile/MobileLogin";
import MobileHome from "@/pages/mobile/MobileHome";
import MobileBills from "@/pages/mobile/MobileBills";
import MobilePayments from "@/pages/mobile/MobilePayments";
import MobileProfile from "@/pages/mobile/MobileProfile";
import MobileInstall from "@/pages/mobile/MobileInstall";

// Super Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTenants from "@/pages/admin/AdminTenants";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminPricing from "@/pages/admin/AdminPricing";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminSystemHealth from "@/pages/admin/AdminSystemHealth";
import AdminActivityLogs from "@/pages/admin/AdminActivityLogs";
import AdminAddons from "@/pages/admin/AdminAddons";
import AdminRevenue from "@/pages/admin/AdminRevenue";
import AdminWallets from "@/pages/admin/AdminWallets";
import AdminPayouts from "@/pages/admin/AdminPayouts";
import AdminPaymentInfra from "@/pages/admin/AdminPaymentInfra";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminNetworkIntegrations from "@/pages/admin/AdminNetworkIntegrations";
import AdminUsersRoles from "@/pages/admin/AdminUsersRoles";
import AdminApiUsage from "@/pages/admin/AdminApiUsage";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
    },
  },
});

// Helper for placeholder routes
const PH = ({ title }: { title: string }) => <PlaceholderPage title={title} />;

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <ResellerImpersonationProvider>
        <DemoModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineFallback />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Staff Auth Routes */}
              <Route path="/login" element={<StaffLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<TenantOnboarding />} />
              
              {/* Admin Dashboard Routes (ISP Staff) - Protected by role */}
              <Route
                element={
                  <StaffRoute>
                    <DashboardLayout />
                  </StaffRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Client Management */}
                <Route path="/dashboard/customers" element={<Customers />} />
                <Route path="/dashboard/customers/:customerId" element={<CustomerDetail />} />
                <Route path="/dashboard/clients/new-request" element={<NewRequestPage />} />
                <Route path="/dashboard/clients/add" element={<AddNewClientPage />} />
                <Route path="/dashboard/clients/left" element={<LeftClientsPage />} />
                <Route path="/dashboard/clients/change-request" element={<ChangeRequestPage />} />
                <Route path="/dashboard/clients/corporate" element={<CorporateClientsPage />} />
                <Route path="/dashboard/portal-manage" element={<PortalManagePage />} />

                {/* Configuration */}
                <Route path="/dashboard/config/zones" element={<ZonesPage />} />
                <Route path="/dashboard/config/connection-type" element={<ConnectionTypePage />} />
                <Route path="/dashboard/config/client-type" element={<ClientTypePage />} />
                <Route path="/dashboard/config/protocol-type" element={<ProtocolTypePage />} />
                <Route path="/dashboard/config/district" element={<AreaManagementPage />} />
                <Route path="/dashboard/config/billing-status" element={<BillingStatusPage />} />

                {/* Packages */}
                <Route path="/dashboard/packages" element={<Packages />} />

                {/* Billing & Finance */}
                <Route path="/dashboard/billing" element={<Billing />} />
                <Route path="/dashboard/billing/daily" element={<DailyCollectionPage />} />
                <Route path="/dashboard/billing/monthly" element={<MonthlyBillingReport />} />
                <Route path="/dashboard/payments" element={<Payments />} />
                <Route path="/dashboard/reports" element={<Reports />} />

                {/* Income & Expense */}
                <Route path="/dashboard/finance/income" element={<DailyIncomePage />} />
                <Route path="/dashboard/finance/expense" element={<DailyExpensePage />} />
                <Route path="/dashboard/finance/closing" element={<DailyAccountClosingPage />} />
                <Route path="/dashboard/finance/history" element={<FinancialHistoryPage />} />

                {/* Accounting */}
                <Route path="/dashboard/accounting" element={<AccountingDashboardPage />} />
                <Route path="/dashboard/accounting/chart" element={<ChartOfAccountsPage />} />
                <Route path="/dashboard/accounting/journal" element={<JournalVoucherPage />} />
                <Route path="/dashboard/accounting/balance-sheet" element={<BalanceSheetPage />} />
                <Route path="/dashboard/accounting/profit-loss" element={<ProfitLossPage />} />
                <Route path="/dashboard/accounting/trial-balance" element={<TrialBalancePage />} />

                {/* Network */}
                <Route path="/dashboard/network" element={<NetworkPage />} />
                <Route path="/dashboard/mikrotik/servers" element={<MikrotikServersPage />} />
                <Route path="/dashboard/mikrotik/backup" element={<MikrotikBackupPage />} />
                <Route path="/dashboard/mikrotik/import" element={<MikrotikImportPage />} />
                <Route path="/dashboard/mikrotik/bulk-import" element={<BulkClientsImportPage />} />
                <Route path="/dashboard/olt" element={<OltDevicesPage />} />
                <Route path="/dashboard/olt/users" element={<OltUsersPage />} />
                <Route path="/dashboard/network-diagram" element={<PH title="Network Diagram" />} />

                {/* Support & Ticketing */}
                <Route path="/dashboard/support" element={<ClientSupportPage />} />
                <Route path="/dashboard/support/category" element={<SupportCategoryPage />} />
                <Route path="/dashboard/support/history" element={<SupportHistoryPage />} />

                {/* Task Management */}
                <Route path="/dashboard/tasks" element={<TaskManagementPage />} />
                <Route path="/dashboard/tasks/category" element={<TaskCategoryPage />} />
                <Route path="/dashboard/tasks/history" element={<TaskHistoryPage />} />

                {/* HR & Payroll */}
                <Route path="/dashboard/hr/employees" element={<EmployeeListPage />} />
                <Route path="/dashboard/hr/department" element={<DepartmentPage />} />
                <Route path="/dashboard/hr/salary" element={<SalarySheetPage />} />
                <Route path="/dashboard/hr/attendance" element={<AttendancePage />} />
                <Route path="/dashboard/hr/leave/category" element={<LeaveCategoryPage />} />
                <Route path="/dashboard/hr/leave/setup" element={<LeaveSetupPage />} />
                <Route path="/dashboard/hr/leave/apply" element={<LeaveApplyPage />} />
                <Route path="/dashboard/hr/leave/approval" element={<LeaveApprovalPage />} />

                {/* Inventory & Assets */}
                <Route path="/dashboard/inventory/items" element={<ItemsPage />} />
                <Route path="/dashboard/inventory/stock" element={<StockPage />} />
                <Route path="/dashboard/inventory/assets" element={<AssetsPage />} />

                {/* Purchase & Vendors */}
                <Route path="/dashboard/purchase/vendors" element={<VendorsPage />} />
                <Route path="/dashboard/purchase" element={<PurchasePage />} />
                <Route path="/dashboard/purchase/bill" element={<PurchaseBillPage />} />

                {/* Resellers */}
                <Route path="/dashboard/resellers" element={<Resellers />} />
                <Route path="/dashboard/resellers/:resellerId" element={<ResellerDetail />} />
                <Route path="/dashboard/resellers/tariff" element={<ResellerPackageTariffPage />} />
                <Route path="/dashboard/resellers/funding" element={<ResellerFundingPage />} />
                <Route path="/dashboard/resellers/pgw" element={<ResellerPgwSettlementPage />} />

                {/* SMS Service */}
                <Route path="/dashboard/sms/send" element={<SendSmsPage />} />
                <Route path="/dashboard/sms/template" element={<SmsTemplatePage />} />
                <Route path="/dashboard/sms/gateway" element={<SmsGatewayPage />} />

                {/* System */}
                <Route path="/dashboard/notifications" element={<Notifications />} />
                <Route path="/dashboard/settings" element={<Settings />} />
                <Route path="/dashboard/system/app-users" element={<AppUsersPage />} />
                <Route path="/dashboard/system/company-setup" element={<CompanySetupPage />} />
                <Route path="/dashboard/system/invoice-setup" element={<InvoiceSetupPage />} />
                <Route path="/dashboard/system/periods-setup" element={<PeriodsSetupPage />} />
                <Route path="/dashboard/system/payment-gateways" element={<PaymentGatewaysPage />} />
                <Route path="/dashboard/system/email-setup" element={<PH title="Email Setup" />} />
                <Route path="/dashboard/system/system-setup" element={<PH title="System Setup" />} />
                <Route path="/dashboard/system/processing-fee" element={<PaymentProcessingFeePage />} />
                <Route path="/dashboard/system/vat-setup" element={<VatSetupPage />} />
                <Route path="/dashboard/system/activity-loggers" element={<ActivityLoggersPage />} />
                <Route path="/dashboard/system/automatic-process" element={<AutomaticProcessPage />} />

                {/* Reseller self-service */}
                <Route path="/dashboard/reseller" element={<ResellerDashboardPage />} />
                <Route path="/dashboard/reseller/customers" element={<ResellerCustomersPage />} />
                <Route path="/dashboard/reseller/payments" element={<ResellerPaymentsPage />} />
                <Route path="/dashboard/reseller/wallet" element={<ResellerWalletPage />} />
              </Route>

              {/* Customer Portal Routes (Web) */}
              <Route path="/portal/login" element={<Login />} />
              <Route path="/portal/signup" element={<Signup />} />
              <Route
                element={
                  <CustomerRoute>
                    <PortalLayout />
                  </CustomerRoute>
                }
              >
                <Route path="/portal" element={<PortalDashboard />} />
                <Route path="/portal/bills" element={<PortalBills />} />
                <Route path="/portal/payments" element={<PortalPayments />} />
                <Route path="/portal/profile" element={<PortalProfile />} />
              </Route>

              {/* Mobile Customer App Routes (PWA) */}
              <Route path="/app/login" element={<MobileLogin />} />
              <Route path="/app/install" element={<MobileInstall />} />
              <Route
                element={
                  <MobileLayout>
                    <></>
                  </MobileLayout>
                }
              >
                <Route path="/app" element={<MobileLayout><MobileHome /></MobileLayout>} />
                <Route path="/app/bills" element={<MobileLayout><MobileBills /></MobileLayout>} />
                <Route path="/app/payments" element={<MobileLayout><MobilePayments /></MobileLayout>} />
                <Route path="/app/profile" element={<MobileLayout><MobileProfile /></MobileLayout>} />
              </Route>

              {/* Super Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                element={
                  <SuperAdminRoute>
                    <SuperAdminLayout />
                  </SuperAdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/health" element={<AdminSystemHealth />} />
                <Route path="/admin/activity" element={<AdminActivityLogs />} />
                <Route path="/admin/tenants" element={<AdminTenants />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/addons" element={<AdminAddons />} />
                <Route path="/admin/revenue" element={<AdminRevenue />} />
                <Route path="/admin/wallets" element={<AdminWallets />} />
                <Route path="/admin/payouts" element={<AdminPayouts />} />
                <Route path="/admin/payments" element={<AdminPaymentInfra />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/network" element={<AdminNetworkIntegrations />} />
                <Route path="/admin/users" element={<AdminUsersRoles />} />
                <Route path="/admin/api" element={<AdminApiUsage />} />
                <Route path="/admin/audit" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/pricing" element={<AdminPricing />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </DemoModeProvider>
        </ResellerImpersonationProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
