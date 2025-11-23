import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShoppingBag,
  CreditCard,
  Home,
  Search,
  TrendingUp,
  Package,
  Brain,
  DollarSign,
  Activity,
  Target,
  UserCheck,
  Clock,
  ChevronDown,
  Settings,
  HelpCircle,
  FileText,
  Briefcase,
  CheckSquare
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Overview", url: "/", icon: Home },
  { title: "Charts", url: "/charts", icon: BarChart3 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Products", url: "/products", icon: ShoppingBag },
  { title: "Stock", url: "/products-stock", icon: Package },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
];

const advancedAnalyticsItems = [
  { title: "Advanced", url: "/advanced-analytics", icon: Brain },
  { title: "Performance", url: "/product-performance", icon: Target },
  { title: "Behavior", url: "/user-behavior", icon: UserCheck },
  { title: "Financial", url: "/financial-analytics", icon: DollarSign },
  { title: "Real-time", url: "/realtime-dashboard", icon: Activity },
  { title: "Predictive", url: "/predictive-analytics", icon: Clock },
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
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-all duration-300 rounded-xl px-3 py-2.5 mb-1 group relative overflow-hidden";
    if (isActive(path)) {
      return cn(baseClasses, "bg-primary text-primary-foreground shadow-md font-medium");
    }
    return cn(baseClasses, "text-muted-foreground hover:text-foreground hover:bg-secondary/50");
  };

  return (
    <Sidebar className={cn(
      "border-r-0 bg-transparent transition-all duration-300 ease-in-out py-4 pl-4",
      collapsed ? "w-20" : "w-72"
    )}>
      <div className={cn(
        "h-full rounded-2xl border border-border/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300",
        "bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60"
      )}>
        <SidebarContent className="flex flex-col h-full scrollbar-hide">
          {/* Logo */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Dash
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">Analytics Pro</p>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-4 py-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/20 transition-all duration-300 rounded-xl h-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
                  ⌘K
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold px-4 mb-2">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className={getNavClasses(item.url)}
                        >
                          <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive(item.url) ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                          {!collapsed && <span>{item.title}</span>}
                          {isActive(item.url) && !collapsed && (
                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Advanced Analytics */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold px-4 mb-2">
                Intelligence
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {advancedAnalyticsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className={getNavClasses(item.url)}
                        >
                          <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive(item.url) ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* User Profile */}
          <div className="p-4 mt-auto">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-secondary/80 group border border-transparent hover:border-border/50",
              collapsed ? "justify-center" : ""
            )}>
              <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src="/avatars/01.png" alt="Rizal Fakhri" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                  RF
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">Rizal Fakhri</p>
                  <p className="text-xs text-muted-foreground truncate">rizal@example.com</p>
                </div>
              )}
              {!collapsed && (
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}