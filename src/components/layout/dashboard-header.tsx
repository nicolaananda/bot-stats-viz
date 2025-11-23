import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="flex h-16 items-center px-4 md:px-6 gap-3 md:gap-4 bg-background/50 backdrop-blur-sm transition-all duration-300">
        <SidebarTrigger className="md:hidden mr-1 md:mr-2 text-muted-foreground hover:text-primary transition-colors relative" />

        {/* Breadcrumbs or Page Title could go here */}
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dashboard</span>
          <span className="mx-2">/</span>
          <span>Overview</span>
        </div>

        {/* Header Actions */}
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent p-0">
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm transition-transform hover:scale-105">
                  <AvatarImage src="/avatars/01.png" alt="@admin" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    RF
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">Rizal Fakhri</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    rizalfakhri@yayan.il
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-lg my-1">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-lg my-1">
                <Menu className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive rounded-lg my-1">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}