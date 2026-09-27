import type { Metadata } from "next";
import { AmenitiesManagementSection0 } from "@/components/features/admin/AmenitiesManagementSection0";
export const metadata: Metadata = { title: "Amenities Management | StayLeb" };
export default function Page() { return <div className="bg-surface font-body-md text-white antialiased"><AmenitiesManagementSection0 /></div>; }
