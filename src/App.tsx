import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { lazy, Suspense } from "react";

// Lazy load pages
const DashboardOverview = lazy(() => import("./pages/dashboard-overview"));
const Charts = lazy(() => import("./pages/charts"));
const UsersPage = lazy(() => import("./pages/users"));
const UserDetailPage = lazy(() => import("./pages/user-detail"));
const TransactionsPage = lazy(() => import("./pages/transactions"));
const ProductsPage = lazy(() => import("./pages/products"));
const AnalyticsPage = lazy(() => import("./pages/analytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

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
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/charts" element={<Charts />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:userId" element={<UserDetailPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
