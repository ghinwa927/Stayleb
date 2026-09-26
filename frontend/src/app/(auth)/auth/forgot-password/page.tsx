import { AuthLayout } from "@/components/layout/AuthLayout";
import { ForgotForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Forgot password | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="forgot">
      <ForgotForm />
    </AuthLayout>
  );
}
