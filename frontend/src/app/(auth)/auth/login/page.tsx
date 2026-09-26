import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Log in | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="login">
      <LoginForm />
    </AuthLayout>
  );
}
