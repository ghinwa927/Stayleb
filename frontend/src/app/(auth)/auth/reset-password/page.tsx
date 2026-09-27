import Image from "next/image";
import { MapPin, LockKeyhole, ShieldCheck } from "lucide-react";
import { ResetForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reset password | StayLeb" };
export default function Page() {
  return (
    <main className="grid min-h-screen w-full bg-white lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block" aria-label="Luxury mountain chalet in Faraya, Mount Lebanon">
        <Image
          src="/images/stayleb-01.jpg"
          alt="Luxury mountain chalet in Faraya, Mount Lebanon"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        <div className="absolute left-8 top-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <MapPin size={16} />
            StayLeb Chalets
          </span>
          <span className="absolute left-8 top-20 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <LockKeyhole size={14} />
            256-bit Encrypted
          </span>
          <span className="absolute left-8 top-32 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <ShieldCheck size={14} />
            Identity Protected
          </span>
        </div>
      </aside>
      <section className="relative flex justify-center overflow-hidden bg-gradient-to-br from-white via-white to-[#46B1B1]/[0.07] px-6 py-12 sm:px-12 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#46B1B1]/[0.08]" />
          <div className="absolute -right-16 top-10 h-80 w-80 rotate-[18deg] rounded-[50%] bg-[#46B1B1]/[0.07]" />
          <div className="absolute right-24 top-40 h-56 w-40 rotate-[28deg] rounded-full bg-[#46B1B1]/[0.06] blur-xl" />
          <div className="absolute right-10 top-24 hidden sm:block">
            <span className="absolute h-16 w-3 rotate-[28deg] rounded-full bg-[#D1A695]/40 blur-[1px]" />
            <span className="absolute left-4 top-5 h-12 w-3 rotate-[40deg] rounded-full bg-[#D1A695]/30 blur-[1px]" />
            <span className="absolute -left-3 top-10 h-10 w-3 rotate-[16deg] rounded-full bg-[#D1A695]/25 blur-[1px]" />
          </div>
          <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#46B1B1]/[0.08]" />
          <div className="absolute -left-20 bottom-24 h-64 w-64 -rotate-[18deg] rounded-[50%] bg-[#46B1B1]/[0.06]" />
          <div className="absolute bottom-16 left-8 hidden sm:block">
            <span className="absolute h-20 w-3.5 -rotate-[22deg] rounded-full bg-[#D1A695]/35 blur-[1px]" />
            <span className="absolute left-5 top-6 h-14 w-3 -rotate-[34deg] rounded-full bg-[#D1A695]/25 blur-[1px]" />
            <span className="absolute -left-4 top-12 h-12 w-3 -rotate-[10deg] rounded-full bg-[#D1A695]/20 blur-[1px]" />
          </div>
        </div>
        <ResetForm />
      </section>
    </main>
  );
}