"use client";

import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Wand2,
  FileText,
  User,
  Briefcase,
  Share2,
  LifeBuoy,
  Send,
  Lightbulb,
  Zap,
  Layout,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/use-auth";
import { APP_NAME, ROUTES } from "@/config/constants";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavSecondary } from "./nav-secondary";
import { NavTheme } from "./nav-theme";
import { NavUser } from "./nav-user";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const platformNavItems = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Ideas",
    url: ROUTES.IDEAS,
    icon: Lightbulb,
  },
  {
    title: "Hooks",
    url: ROUTES.GENERATE_HOOKS,
    icon: Zap,
  },
  {
    title: "Templates",
    url: ROUTES.TEMPLATES,
    icon: Layout,
  },
  {
    title: "Posts",
    url: ROUTES.POSTS,
    icon: FileText,
  },
];

const projectNavItems = [
  {
    title: "Profiles",
    url: ROUTES.PROFILES,
    icon: User,
  },
  {
    title: "Projects",
    url: ROUTES.PROJECTS,
    icon: Briefcase,
  },
  {
    title: "Platforms",
    url: ROUTES.PLATFORMS,
    icon: Share2,
  },
];

const secondaryNavItems = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
];

function GenerateButton() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const button = (
    <Button
      asChild
      className="w-full justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
      size={isCollapsed ? "icon" : "lg"}
    >
      <Link href={ROUTES.GENERATE}>
        <Wand2 className="size-4" />
        {!isCollapsed && <span className="font-semibold">Generate Post</span>}
      </Link>
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">Generate Post</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={APP_NAME}>
              <a href={ROUTES.DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 group-data-[collapsible=icon]:size-4 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Personal Branding
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* CTA Button - Main Feature */}
        <SidebarGroup className="px-3 py-2 group-data-[collapsible=icon]:px-2">
          <GenerateButton />
        </SidebarGroup>

        <NavMain items={platformNavItems} label="Platform" />
        <NavProjects projects={projectNavItems} label="Workspace" />
        <NavSecondary items={secondaryNavItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavTheme />
        {user && (
          <NavUser
            user={{ email: user.email }}
            onLogout={logout}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
