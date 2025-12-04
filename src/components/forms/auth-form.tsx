"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/lib/utils/validation";

interface LoginFormProps {
  mode: "login";
  onSubmit: (data: LoginFormData) => Promise<void>;
}

interface RegisterFormProps {
  mode: "register";
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

type AuthFormProps = LoginFormProps | RegisterFormProps;

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === "login";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const handleFormSubmit = async (data: LoginFormData | RegisterFormData) => {
    setError(null);
    try {
      await onSubmit(data as never);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : errorMessage
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        {!isLogin && (
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        )}
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword" as keyof (LoginFormData | RegisterFormData))}
          />
          {"confirmPassword" in errors && errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLogin ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
}
