"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { AuthForm } from "@/components/forms/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES, APP_NAME } from "@/config/constants";
import type { LoginFormData } from "@/lib/utils/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    await login(data);
    toast.success("Welcome back!");
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your {APP_NAME} account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode="login" onSubmit={handleLogin} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
