import { AuthLayout } from "@/components/layout/AuthLayout";
import { ResetForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reset password | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="reset">
      <ResetForm />
    </AuthLayout>
  );
}
