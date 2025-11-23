import { useState } from "react";
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
  ChevronRight,
  Settings,
  HelpCircle,
  FileText,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  Sparkles,
  Zap,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { title: "Overview", url: "/", icon: Home },
      { title: "Analytics", url: "/analytics", icon: TrendingUp },
      { title: "Charts", url: "/charts", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Products", url: "/products", icon: ShoppingBag },
      { title: "Stock", url: "/products-stock", icon: Package },
      { title: "Transactions", url: "/transactions", icon: CreditCard },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { title: "Advanced", url: "/advanced-analytics", icon: Brain },
      { title: "Performance", url: "/product-performance", icon: Target },
      { title: "Behavior", url: "/user-behavior", icon: UserCheck },
      { title: "Financial", url: "/financial-analytics", icon: DollarSign },
      { title: "Real-time", url: "/realtime-dashboard", icon: Activity },
      { title: "Predictive", url: "/predictive-analytics", icon: Clock },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Reports",
    items: [
      { title: "Overview", url: "/reports", icon: FileText },
      { title: "Customer", url: "/reports/customer", icon: Users },
      { title: "Sales", url: "/reports/sales", icon: DollarSign },
    ],
    collapsible: true,
    defaultOpen: false,
  },
];

const utilityItems: NavItem[] = [
  { title: "Projects", url: "/projects", icon: Briefcase },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Intelligence: false,
    Reports: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses =
      "w-full justify-start transition-all duration-200 rounded-lg px-3 py-2.5 mb-0.5 group relative overflow-hidden";
    if (isActive(path)) {
      return cn(
        baseClasses,
        "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
      );
    }
    return cn(
      baseClasses,
      "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    );
  };

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const filteredSections = navigationSections.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <Sidebar
      className={cn(
        "border-r-0 bg-transparent transition-all duration-300 ease-in-out py-4 pl-4 pr-2 z-50",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div
        className={cn(
          "h-full rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 relative",
          "bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70"
        )}
      >
        <SidebarContent className="flex flex-col h-full scrollbar-hide">
          {/* Logo Section */}
          <div className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
              </div>
              {!collapsed && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex-1 min-w-0">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-accent">
                    Dash Pro
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Analytics Platform
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-4 py-3 border-b border-border/50 animate-in fade-in zoom-in-95 duration-500 delay-100">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20 bg-secondary/30 border-border/50 focus:bg-background focus:border-primary/30 transition-all duration-300 rounded-lg h-9 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/50">
            {filteredSections.map((section) => {
              if (section.collapsible && !collapsed) {
                const isOpen = openSections[section.title] ?? section.defaultOpen;
                return (
                  <Collapsible
                    key={section.title}
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-3 py-2 h-auto font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-2"
                        )}
                      >
                        <span>{section.title}</span>
                        {isOpen ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-0.5">
                      <SidebarMenu>
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                              <NavLink
                                to={item.url}
                                className={getNavClasses(item.url)}
                              >
                                <item.icon
                                  className={cn(
                                    "mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                                    isActive(item.url)
                                      ? "text-white"
                                      : "text-muted-foreground group-hover:text-primary"
                                  )}
                                />
                                {!collapsed && (
                                  <span className="flex-1 text-sm">{item.title}</span>
                                )}
                                {item.badge && !collapsed && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto h-5 px-1.5 text-[10px] font-semibold"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                {isActive(item.url) && !collapsed && (
                                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <SidebarGroup key={section.title}>
                  {!collapsed && (
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold px-3 mb-2 mt-1">
                      {section.title}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild tooltip={item.title}>
                            <NavLink
                              to={item.url}
                              className={getNavClasses(item.url)}
                            >
                              <item.icon
                                className={cn(
                                  "mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                                  isActive(item.url)
                                    ? "text-white"
                                    : "text-muted-foreground group-hover:text-primary"
                                )}
                              />
                              {!collapsed && (
                                <span className="flex-1 text-sm">{item.title}</span>
                              )}
                              {item.badge && !collapsed && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto h-5 px-1.5 text-[10px] font-semibold"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {isActive(item.url) && !collapsed && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}

            {/* Utility Items */}
            {!collapsed && (
              <SidebarGroup className="mt-4 pt-4 border-t border-border/50">
                <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold px-3 mb-2">
                  Quick Access
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {utilityItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <NavLink
                            to={item.url}
                            className={getNavClasses(item.url)}
                          >
                            <item.icon
                              className={cn(
                                "mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                                isActive(item.url)
                                  ? "text-white"
                                  : "text-muted-foreground group-hover:text-primary"
                              )}
                            />
                            <span className="flex-1 text-sm">{item.title}</span>
                            {isActive(item.url) && (
                              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-3 space-y-1">
            {!collapsed ? (
              <>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <NavLink
                        to="/settings"
                        className={getNavClasses("/settings")}
                      >
                        <Settings
                          className={cn(
                            "mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                            isActive("/settings")
                              ? "text-white"
                              : "text-muted-foreground group-hover:text-primary"
                          )}
                        />
                        <span className="flex-1 text-sm">Settings</span>
                        {isActive("/settings") && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Help">
                      <NavLink
                        to="/help"
                        className={getNavClasses("/help")}
                      >
                        <HelpCircle
                          className={cn(
                            "mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0",
                            isActive("/help")
                              ? "text-white"
                              : "text-muted-foreground group-hover:text-primary"
                          )}
                        />
                        <span className="flex-1 text-sm">Help</span>
                        {isActive("/help") && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-3 pt-2 pb-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        System Active
                      </p>
                      <p className="text-[10px]">All systems operational</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <SidebarMenuButton asChild tooltip="Settings">
                  <NavLink
                    to="/settings"
                    className={cn(
                      "w-full justify-center p-2 rounded-lg",
                      isActive("/settings")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </NavLink>
                </SidebarMenuButton>
                <SidebarMenuButton asChild tooltip="Help">
                  <NavLink
                    to="/help"
                    className={cn(
                      "w-full justify-center p-2 rounded-lg",
                      isActive("/help")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </NavLink>
                </SidebarMenuButton>
              </div>
            )}
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
