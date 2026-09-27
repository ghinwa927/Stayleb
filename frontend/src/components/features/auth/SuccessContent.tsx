"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";

export function SuccessContent() {
  return (
    <div className="login-split relative z-10 mx-auto flex w-full max-w-[480px] flex-col">
      <Link href="/" aria-label="StayLeb home" className="mb-10 inline-block">
        <Image
          src="/images/stayleb_brand_logo.png"
          alt="StayLeb — Stays · People · Lebanon"
          width={220}
          height={120}
          className="h-20 w-auto object-contain"
          priority
        />
        <span className="mt-3 block text-[11px] font-semibold tracking-[0.32em] text-[#64748B]">
          STAYS · PEOPLE · LEBANON
        </span>
      </Link>
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#157375]/10">
          <ShieldCheck size={28} className="text-[#157375]" />
        </div>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-[#157375] font-bold tracking-tight mb-2">Password reset successfully</h1>
      <p className="font-body-md text-body-md text-[#64748B] mb-7">
        Your credentials have been securely refreshed. You can now log in with your newly created password.
      </p>
      <div className="notice security-notice mb-6 p-4 bg-[#F2FAFA] border border-[#157375]/20 rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#157375] flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-label-md text-label-md text-[#1E293B] mb-1">Security Notice</h2>
            <p className="font-body-md text-body-md text-[#64748B] text-sm">
              All active sessions on other devices and browsers have been securely signed out. Your account credentials have been updated and synchronized across the StayLeb network.
            </p>
            <small className="text-[#94a3b8] block mt-1">This one-time recovery link is permanently invalidated and cannot be reused.</small>
          </div>
        </div>
      </div>
      <Link href="/auth/login" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#157375] font-label-md text-label-md font-semibold text-white shadow-[0_12px_28px_rgba(21,115,117,0.28)] transition-all hover:bg-[#0f5a5b] active:scale-[0.99] mb-6">
        Back to Login <ArrowRight size={17} />
      </Link>
      <div className="mt-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <span className="text-sm font-medium tracking-widest text-[#94a3b8]">OR</span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      </div>
      <p className="mt-5 text-center font-body-md text-body-md text-[#64748B]">
        Didn't initiate this change?{" "}
        <LocalAction message="Contact support at +961 9 546 800 for assistance." className="inline-flex items-center gap-1 font-semibold text-[#157375] hover:underline">
          Contact Support Desk <ArrowRight size={14} />
        </LocalAction>
      </p>
      <p className="mt-6 text-center flex items-center justify-center gap-1.5 text-[12px] text-[#94a3b8]">
        <Shield size={13} />
        StayLeb Identity Guard © 2025
      </p>
      <p className="mt-3 text-center flex items-center justify-center gap-3 text-[11px] text-[#94a3b8]">
        <LocalAction>Privacy Policy</LocalAction> · <LocalAction>Terms of Service</LocalAction>
      </p>
    </div>
  );
}