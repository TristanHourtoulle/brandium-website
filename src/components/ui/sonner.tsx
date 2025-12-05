"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors={false}
      duration={4000}
      gap={12}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast w-full flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm bg-background/95 border-border relative overflow-hidden",
          title: "text-sm font-semibold text-foreground",
          description: "text-xs text-muted-foreground mt-1",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors",
          closeButton:
            "absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
          success:
            "!border-emerald-500/20 !bg-emerald-50/95 dark:!bg-emerald-950/50 [&_[data-title]]:!text-emerald-900 dark:[&_[data-title]]:!text-emerald-100 [&_[data-description]]:!text-emerald-700 dark:[&_[data-description]]:!text-emerald-300",
          error:
            "!border-red-500/20 !bg-red-50/95 dark:!bg-red-950/50 [&_[data-title]]:!text-red-900 dark:[&_[data-title]]:!text-red-100 [&_[data-description]]:!text-red-700 dark:[&_[data-description]]:!text-red-300",
          warning:
            "!border-amber-500/20 !bg-amber-50/95 dark:!bg-amber-950/50 [&_[data-title]]:!text-amber-900 dark:[&_[data-title]]:!text-amber-100 [&_[data-description]]:!text-amber-700 dark:[&_[data-description]]:!text-amber-300",
          info: "!border-blue-500/20 !bg-blue-50/95 dark:!bg-blue-950/50 [&_[data-title]]:!text-blue-900 dark:[&_[data-title]]:!text-blue-100 [&_[data-description]]:!text-blue-700 dark:[&_[data-description]]:!text-blue-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
