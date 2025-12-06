"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NavTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={toggleTheme}
          className="cursor-pointer"
          tooltip="Toggle theme"
        >
          <div className="relative flex h-4 w-4 items-center justify-center">
            <Sun
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                color: "#f59e0b",
                transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isDark ? "rotate(90deg) scale(0)" : "rotate(0deg) scale(1)",
                opacity: isDark ? 0 : 1,
              }}
            />
            <Moon
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                color: "#60a5fa",
                transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0)",
                opacity: isDark ? 1 : 0,
              }}
            />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">
            {isDark ? "Light mode" : "Dark mode"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
