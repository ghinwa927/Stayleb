import type { Metadata } from "next";
import { RulesManagementSection0 } from "@/components/features/admin/RulesManagementSection0";
export const metadata: Metadata = { title: "Rules Management | StayLeb" };
export default function Page() { return <div className="bg-surface font-body-md text-white antialiased"><RulesManagementSection0 /></div>; }
