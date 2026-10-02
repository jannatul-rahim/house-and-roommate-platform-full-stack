import { z } from "zod";

// Mirrors the API's RegisterZodSchema / LoginZodSchema so users see the same
// rules before the request ever leaves the browser.
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please provide a valid email address")
  .max(255, "Email must be at most 255 characters")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.input<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters"),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || (v.length >= 6 && v.length <= 20), "Phone must be 6-20 characters")
      .optional(),
    role: z.enum(["TENANT", "OWNER"], { error: "Choose how you'll use NestMate" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterFormInput = z.input<typeof registerSchema>;
