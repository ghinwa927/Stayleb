import type { Metadata } from "next";
import { AdminDashboardSection0 } from "@/components/features/admin/AdminDashboardSection0";
export const metadata: Metadata = { title: "Admin Dashboard | StayLeb" };
export default function Page() { return <div className="bg-surface font-body-md text-white antialiased"><AdminDashboardSection0 /></div>; }
