import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { HomeExperience } from "@/components/features/homepage/HomeExperience";
import { Assurances, Guarantee } from "@/components/features/homepage/HomeSections";

export const metadata: Metadata = { title: "Public Home & Discover | StayLeb" };

export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="home-main">
        <HomeExperience>
          <Assurances />
        </HomeExperience>
        <Guarantee />
      </main>
      <Footer />
    </>
  );
}
