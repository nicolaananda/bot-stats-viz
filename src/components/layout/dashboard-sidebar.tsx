import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShoppingBag,
  CreditCard,
  Home,
  Search,
  Download,
  TrendingUp,
  Package,
  Brain,
  PieChart,
  DollarSign,
  Activity,
  Target,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Overview", url: "/", icon: Home },
  { title: "Charts", url: "/charts", icon: BarChart3 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Products", url: "/products", icon: ShoppingBag },
  { title: "Manajemen Produk", url: "/products/stock", icon: Package },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
];

const advancedAnalyticsItems = [
  { title: "Advanced Analytics", url: "/analytics/advanced", icon: Brain },
  { title: "Product Performance", url: "/analytics/products", icon: Target },
  { title: "User Behavior", url: "/analytics/users", icon: UserCheck },
  { title: "Financial Analytics", url: "/analytics/financial", icon: DollarSign },
  { title: "Real-time Dashboard", url: "/analytics/realtime", icon: Activity },
  { title: "Predictive Analytics", url: "/analytics/predictive", icon: PieChart },
];

const toolItems = [
  { title: "Search", url: "/search", icon: Search },
  { title: "Export", url: "/export", icon: Download },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    // Ensure '/products' only highlights on exact match, not for nested routes like '/products/stock'
    if (path === "/products") {
      return currentPath === "/products";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-gradient-primary text-primary-foreground shadow-glow`;
    }
    return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar`}>
      <SidebarContent>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Dashboard
                </h2>
                <p className="text-xs text-muted-foreground">WhatsApp Bot Analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Advanced Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Advanced Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedAnalyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
    </Sidebar>
  );
}