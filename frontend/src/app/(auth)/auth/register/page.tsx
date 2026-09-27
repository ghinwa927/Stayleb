import Image from "next/image";
import { MapPin } from "lucide-react";
import { RegisterForm } from "@/components/features/auth/AuthForms";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create your account | StayLeb" };
export default function Page() {
  return (
    <main className="grid h-screen w-full bg-white lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block h-full" aria-label="Luxury seaside villa in Lebanon at sunset">
        <Image
          src="/images/register-villa-sunset.png"
          alt="Mediterranean stone villa overlooking the sea at sunset, Lebanon"
          fill
          priority
          sizes="50vw"
          className="object-cover h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        <div className="absolute left-8 top-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            <MapPin size={16} />
            Batroun Coastal Strip
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-white/85">
            <span aria-hidden="true" className="inline-block h-px w-10 bg-[#D1A695]" />
            MORE THAN A STAY
          </p>
          <p className="mt-3 max-w-md text-[40px] font-bold leading-[1.08] tracking-tight text-white drop-shadow-lg">
            Find your perfect stay in Lebanon
          </p>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/85">
            Charming homes. Breathtaking views. Unforgettable stays across Lebanon.
          </p>
        </div>
      </aside>
      <section className="relative flex items-center justify-center bg-gradient-to-br from-white via-white to-[#46B1B1]/[0.07] px-6 py-12 sm:px-12 overflow-y-auto h-full">
        {/* Decorative organic shapes (presentation only) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Pale teal flowing waves, top-right */}
          <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#46B1B1]/[0.08]" />
          <div className="absolute -right-16 top-10 h-80 w-80 rotate-[18deg] rounded-[50%] bg-[#46B1B1]/[0.07]" />
          <div className="absolute right-24 top-40 h-56 w-40 rotate-[28deg] rounded-full bg-[#46B1B1]/[0.06] blur-xl" />
          {/* Terracotta botanical sprig, top-right */}
          <div className="absolute right-10 top-24 hidden sm:block">
            <span className="absolute h-16 w-3 rotate-[28deg] rounded-full bg-[#D1A695]/40 blur-[1px]" />
            <span className="absolute left-4 top-5 h-12 w-3 rotate-[40deg] rounded-full bg-[#D1A695]/30 blur-[1px]" />
            <span className="absolute -left-3 top-10 h-10 w-3 rotate-[16deg] rounded-full bg-[#D1A695]/25 blur-[1px]" />
          </div>
          {/* Pale teal organic shape, lower-left */}
          <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#46B1B1]/[0.08]" />
          <div className="absolute -left-20 bottom-24 h-64 w-64 -rotate-[18deg] rounded-[50%] bg-[#46B1B1]/[0.06]" />
          {/* Terracotta botanical detail, bottom-left */}
          <div className="absolute bottom-16 left-8 hidden sm:block">
            <span className="absolute h-20 w-3.5 -rotate-[22deg] rounded-full bg-[#D1A695]/35 blur-[1px]" />
            <span className="absolute left-5 top-6 h-14 w-3 -rotate-[34deg] rounded-full bg-[#D1A695]/25 blur-[1px]" />
            <span className="absolute -left-4 top-12 h-12 w-3 -rotate-[10deg] rounded-full bg-[#D1A695]/20 blur-[1px]" />
          </div>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}