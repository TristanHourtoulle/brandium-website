"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { APP_NAME, ROUTES } from "@/config/constants";
import { NavLink } from "./nav-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Menu,
  LayoutDashboard,
  User,
  Briefcase,
  Share2,
  Wand2,
  FileText,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
  { href: ROUTES.PROFILES, icon: User, label: "Profiles" },
  { href: ROUTES.PROJECTS, icon: Briefcase, label: "Projects" },
  { href: ROUTES.PLATFORMS, icon: Share2, label: "Platforms" },
  { href: ROUTES.GENERATE, icon: Wand2, label: "Generate" },
  { href: ROUTES.POSTS, icon: FileText, label: "Posts" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">{APP_NAME}</span>
      </div>

      {/* Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {APP_NAME}
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={handleNavClick}
              />
            ))}
          </nav>

          <Separator />

          {/* User Section */}
          <div className="p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-2 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
