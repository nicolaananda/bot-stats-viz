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
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-secondary">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardHeader />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <Routes>
                  <Route path="/" element={<DashboardOverview />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:userId" element={<UserDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/stock" element={<ProductsStockPage />} />
                  <Route path="/products/:productId" element={<ProductDetailPage />} />
                  <Route path="/ref/:reffId" element={<RefDetailPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
