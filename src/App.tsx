import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import DashboardOverview from "./pages/dashboard-overview";
import Charts from "./pages/charts";
import UsersPage from "./pages/users";
import UserDetailPage from "./pages/user-detail";
import TransactionsPage from "./pages/transactions";
import ProductsPage from "./pages/products";
import ProductsStockPage from "./pages/products-stock";
import ProductDetailPage from "./pages/product-detail";
import AnalyticsPage from "./pages/analytics";
import RefDetailPage from "./pages/ref-detail";
// Advanced Analytics Pages
import AdvancedAnalyticsPage from "./pages/advanced-analytics";
import ProductPerformancePage from "./pages/product-performance";
import UserBehaviorPage from "./pages/user-behavior";
import FinancialAnalyticsPage from "./pages/financial-analytics";
import SalesAnalyticsPage from "./pages/sales-analytics";
import InventoryAnalyticsPage from "./pages/inventory-analytics";
// New Pages for Selia-style sidebar
import ProjectsPage from "./pages/projects";
import TasksPage from "./pages/tasks";
import ReportsOverviewPage from "./pages/reports-overview";
import CustomerReportPage from "./pages/customer-report";
import SalesReportPage from "./pages/sales-report";
import SettingsPage from "./pages/settings";
import HelpPage from "./pages/help";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out md:ml-0">
              <DashboardHeader />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in-50 duration-500 slide-in-from-bottom-4">
                  <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    {/* Selia-style routes */}
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/reports" element={<ReportsOverviewPage />} />
                    <Route path="/reports/overview" element={<ReportsOverviewPage />} />
                    <Route path="/reports/customer" element={<CustomerReportPage />} />
                    <Route path="/reports/sales" element={<SalesReportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    {/* Legacy routes */}
                    <Route path="/charts" element={<Charts />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:userId" element={<UserDetailPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products-stock" element={<ProductsStockPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/ref/:refId" element={<RefDetailPage />} />
                    {/* Advanced Analytics Routes */}
                    <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
                    <Route path="/product-performance" element={<ProductPerformancePage />} />
                    <Route path="/user-behavior" element={<UserBehaviorPage />} />
                    <Route path="/financial-analytics" element={<FinancialAnalyticsPage />} />
                    <Route path="/sales-analytics" element={<SalesAnalyticsPage />} />
                    <Route path="/inventory-analytics" element={<InventoryAnalyticsPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
