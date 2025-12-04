"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/constants";
import type { Platform } from "@/types";

interface PlatformCardProps {
  platform: Platform;
  onDelete: (id: string) => void;
}

// Render the appropriate icon based on platform name
function renderPlatformIcon(name: string) {
  const normalizedName = name.toLowerCase();
  const iconClass = "h-5 w-5 text-primary";

  if (normalizedName.includes("linkedin")) {
    return <Linkedin className={iconClass} />;
  }
  if (normalizedName.includes("twitter") || normalizedName.includes("x (")) {
    return <Twitter className={iconClass} />;
  }
  if (normalizedName.includes("instagram")) {
    return <Instagram className={iconClass} />;
  }
  if (normalizedName.includes("youtube")) {
    return <Youtube className={iconClass} />;
  }
  if (normalizedName.includes("facebook")) {
    return <Facebook className={iconClass} />;
  }
  return <Share2 className={iconClass} />;
}

export function PlatformCard({ platform, onDelete }: PlatformCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`${ROUTES.PLATFORMS}/${platform.id}`);
  };

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {renderPlatformIcon(platform.name)}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">{platform.name}</CardTitle>
              {platform.maxLength && (
                <Badge variant="outline" className="text-xs">
                  Max {platform.maxLength} chars
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${ROUTES.PLATFORMS}/${platform.id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(platform.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">
          {platform.styleGuidelines}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
