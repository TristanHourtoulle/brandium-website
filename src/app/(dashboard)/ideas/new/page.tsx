"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { GenerateIdeasForm } from "@/components/features/ideas";
import { useGenerateIdeas } from "@/lib/hooks/use-post-ideas";
import { useProfiles } from "@/lib/hooks/use-profiles";
import { useProjects } from "@/lib/hooks/use-projects";
import { usePlatforms } from "@/lib/hooks/use-platforms";
import { ROUTES } from "@/config/constants";
import type { GenerateIdeasRequest, PostIdea } from "@/types";

export default function GenerateIdeasPage() {
  const router = useRouter();
  const { profiles } = useProfiles();
  const { projects } = useProjects();
  const { platforms } = usePlatforms();
  const { isGenerating, generatedIdeas, context, usage, generate, reset } =
    useGenerateIdeas();

  const handleSubmit = async (data: GenerateIdeasRequest): Promise<boolean> => {
    const success = await generate(data);
    return success;
  };

  const handleViewIdeas = () => {
    router.push(ROUTES.IDEAS);
  };

  const handleGenerateMore = () => {
    reset();
  };

  if (generatedIdeas.length > 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ideas Generated!"
          description={`Successfully generated ${generatedIdeas.length} new post ideas.`}
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateMore}>
              Generate More
            </Button>
            <Button onClick={handleViewIdeas}>View All Ideas</Button>
          </div>
        </PageHeader>

        {/* Context Summary */}
        {context && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generation Context</CardTitle>
              <CardDescription>
                Based on your selection, we analyzed{" "}
                {context.historicalPostsAnalyzed} historical posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {context.profile && (
                  <Badge variant="default">Profile: {context.profile.name}</Badge>
                )}
                {context.project && (
                  <Badge variant="secondary">
                    Project: {context.project.name}
                  </Badge>
                )}
                {context.platform && (
                  <Badge variant="secondary">
                    Platform: {context.platform.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Stats */}
        {usage && (
          <div className="text-sm text-muted-foreground text-center">
            Tokens used: {usage.totalTokens.toLocaleString()} (prompt:{" "}
            {usage.promptTokens.toLocaleString()}, completion:{" "}
            {usage.completionTokens.toLocaleString()})
          </div>
        )}

        {/* Generated Ideas Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generatedIdeas.map((idea) => (
            <GeneratedIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Post Ideas"
        description="Create AI-powered post ideas based on your profiles, projects, and platforms."
      >
        <Button variant="outline" asChild>
          <Link href={ROUTES.IDEAS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Link>
        </Button>
      </PageHeader>

      <div className="max-w-2xl">
        <GenerateIdeasForm
          profiles={profiles}
          projects={projects}
          platforms={platforms}
          onSubmit={handleSubmit}
          isLoading={isGenerating}
        />
      </div>
    </div>
  );
}

interface GeneratedIdeaCardProps {
  idea: PostIdea;
}

function GeneratedIdeaCard({ idea }: GeneratedIdeaCardProps) {
  const relevancePercent = Math.round(idea.relevanceScore * 100);

  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <CardTitle className="text-base line-clamp-2">{idea.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {idea.description}
        </CardDescription>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Relevance</span>
            <span className="font-medium">{relevancePercent}%</span>
          </div>
          <Progress value={relevancePercent} className="h-1.5" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {idea.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {idea.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{idea.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
