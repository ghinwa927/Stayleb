import type { Metadata } from "next";
import { OwnerDashboardSection0 } from "@/components/features/owner/OwnerDashboardSection0";
export const metadata: Metadata = { title: "Owner Dashboard | StayLeb" };
export default function Page() { return <div className="bg-surface font-body-md text-white antialiased"><OwnerDashboardSection0 /></div>; }
