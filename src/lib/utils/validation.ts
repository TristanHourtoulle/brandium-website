import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Profile validation schemas
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
  tone: z
    .array(z.string())
    .min(1, "Select at least one tone")
    .max(5, "Maximum 5 tones allowed"),
  doRules: z.array(z.string()).default([]),
  dontRules: z.array(z.string()).default([]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Project validation schemas
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  audience: z
    .string()
    .min(1, "Target audience is required")
    .max(200, "Audience must be less than 200 characters"),
  keyMessages: z
    .array(z.string().min(1, "Message cannot be empty"))
    .min(1, "At least one key message is required")
    .max(10, "Maximum 10 key messages allowed"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Platform validation schemas
export const platformSchema = z.object({
  name: z
    .string()
    .min(1, "Platform name is required")
    .max(50, "Name must be less than 50 characters"),
  styleGuidelines: z
    .string()
    .min(10, "Style guidelines must be at least 10 characters")
    .max(1000, "Style guidelines must be less than 1000 characters"),
  maxLength: z
    .number()
    .int("Max length must be a whole number")
    .positive("Max length must be positive")
    .max(10000, "Max length cannot exceed 10000")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
});

export type PlatformFormData = z.infer<typeof platformSchema>;
