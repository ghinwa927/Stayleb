import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBookingsSection0 } from "@/components/features/account/MyBookingsSection0";
export const metadata: Metadata = { title: "My Bookings | StayLeb" };
export const dynamic = "force-dynamic";
export default function Page() { return <div className="bg-background font-body-md text-body-md text-on-surface"><Suspense fallback={<div className="p-8 text-center">Loading bookings…</div>}><MyBookingsSection0 /></Suspense></div>; }
