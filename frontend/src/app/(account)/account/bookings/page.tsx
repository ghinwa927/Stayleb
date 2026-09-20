import type { Metadata } from "next";
import { MyBookingsSection0 } from "@/components/features/account/MyBookingsSection0";
export const metadata: Metadata = { title: "My Bookings | StayLeb" };
export default function Page() { return <div className="bg-background font-body-md text-body-md text-on-surface"><MyBookingsSection0 /></div>; }
