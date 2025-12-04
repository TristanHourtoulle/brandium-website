"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
import type { Profile } from "@/types";

interface ProfileCardProps {
  profile: Profile;
  onDelete: (id: string) => void;
}

function ProfileCardComponent({ profile, onDelete }: ProfileCardProps) {
  const router = useRouter();
  const tone = profile.tone ?? [];
  const doRules = profile.doRules ?? [];
  const dontRules = profile.dontRules ?? [];

  const handleCardClick = useCallback(() => {
    router.push(`${ROUTES.PROFILES}/${profile.id}`);
  }, [router, profile.id]);

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{profile.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {profile.bio}
            </CardDescription>
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
                <Link href={`${ROUTES.PROFILES}/${profile.id}`}>
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(profile.id);
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
        <div className="flex flex-wrap gap-1.5">
          {tone.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {tone.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tone.length - 3}
            </Badge>
          )}
        </div>
        {(doRules.length > 0 || dontRules.length > 0) && (
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            {doRules.length > 0 && <span>{doRules.length} do rules</span>}
            {dontRules.length > 0 && (
              <span>{dontRules.length} don&apos;t rules</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const ProfileCard = memo(ProfileCardComponent);
