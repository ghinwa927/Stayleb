import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create your account | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="register">
      <RegisterForm />
    </AuthLayout>
  );
}
