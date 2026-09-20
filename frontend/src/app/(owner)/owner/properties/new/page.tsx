import { PropertyWizard } from "@/components/features/owner/PropertyWizard";
import type { Metadata } from "next";
import { AddPropertySection0 } from "@/components/features/owner/AddPropertySection0";
export const metadata: Metadata = { title: "Add Property | StayLeb" };
export default function Page() { return <PropertyWizard><div className="bg-surface font-body-md text-body-md text-white antialiased"><AddPropertySection0 /></div></PropertyWizard>; }
