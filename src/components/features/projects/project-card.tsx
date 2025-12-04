"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Users, MessageSquare } from "lucide-react";
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
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const keyMessages = project.keyMessages ?? [];

  const handleCardClick = () => {
    router.push(`${ROUTES.PROJECTS}/${project.id}`);
  };

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
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
                <Link href={`${ROUTES.PROJECTS}/${project.id}`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Users className="h-4 w-4" />
          <span className="line-clamp-1">{project.audience}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keyMessages.slice(0, 2).map((message, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <MessageSquare className="mr-1 h-3 w-3" />
              {message.length > 20 ? `${message.slice(0, 20)}...` : message}
            </Badge>
          ))}
          {keyMessages.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{keyMessages.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
