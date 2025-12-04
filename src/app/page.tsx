import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME } from "@/config/constants";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.LOGIN}>Login</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.REGISTER}>Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Personal Branding,{" "}
            <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Generate personalized social media posts that match your voice,
            style, and brand. Create content for LinkedIn, Twitter, and more in
            seconds.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href={ROUTES.REGISTER}>Start for Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={ROUTES.LOGIN}>Sign In</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
