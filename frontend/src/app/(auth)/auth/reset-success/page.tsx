import { AuthLayout } from "@/components/layout/AuthLayout";
import { SuccessContent } from "@/components/features/auth/SuccessContent";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Password reset successfully | StayLeb" };
export default function Page() {
  return (
    <AuthLayout variant="success">
      <SuccessContent />
    </AuthLayout>
  );
}
