import type { Metadata } from "next";
import { CinematicHome } from "@/components/features/homepage/cinema/CinematicHome";

export const metadata: Metadata = { title: "Public Home & Discover | StayLeb" };

export default function Page() {
  return (
    <main id="main-content">
      <CinematicHome />
    </main>
  );
}
