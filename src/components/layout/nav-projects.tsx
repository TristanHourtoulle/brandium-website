"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface ProjectItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavProjectsProps {
  projects: ProjectItem[];
  label?: string;
  moreLabel?: string;
  moreUrl?: string;
}

export function NavProjects({
  projects,
  label = "Projects",
  moreLabel = "More",
  moreUrl,
}: NavProjectsProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {projects.map((project) => {
          const isActive =
            pathname === project.url || pathname.startsWith(`${project.url}/`);

          return (
            <SidebarMenuItem key={project.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={project.title}>
                <Link href={project.url}>
                  <project.icon />
                  <span>{project.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        {moreUrl && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={moreLabel}>
              <Link href={moreUrl}>
                <MoreHorizontal />
                <span>{moreLabel}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
