import { AuthLayout } from "@/components/layout/AuthLayout";
import { VerifyForm } from "@/components/features/auth/VerifyForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Verify email | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="verify">
      <VerifyForm />
    </AuthLayout>
  );
}
