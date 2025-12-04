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
import type { RegisterFormData } from "@/lib/utils/validation";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const handleRegister = async (data: RegisterFormData) => {
    await registerUser(data);
    toast.success("Account created successfully!");
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Get started with {APP_NAME} for free
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode="register" onSubmit={handleRegister} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
