"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/20">
            <span className="text-lg">!</span>
          </div>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="pl-10 h-11"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          {isLogin && (
            <button
              type="button"
              onClick={() => {
                toast.warning("Password reset is coming soon!", {
                  description: "This feature is not yet implemented.",
                });
              }}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="pl-10 pr-10 h-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        {!isLogin && (
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, and numbers
          </p>
        )}
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="pl-10 pr-10 h-11"
              {...register("confirmPassword" as keyof (LoginFormData | RegisterFormData))}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {"confirmPassword" in errors && errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 text-base font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLogin ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
