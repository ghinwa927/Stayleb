import type { Metadata } from "next";
import { UsersManagementSection0 } from "@/components/features/admin/UsersManagementSection0";
export const metadata: Metadata = { title: "Users Management | StayLeb" };
export default function Page() { return <div className="bg-surface font-body-md text-white antialiased"><UsersManagementSection0 /></div>; }
