import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a NestMate account to rent a room, find roommates or list your property.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
