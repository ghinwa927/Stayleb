import Link from "next/link";
import { ArrowRight, Shield, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";
export function SuccessContent() {
  return (
    <>
      <div className="auth-top success-top">
        <Logo variant="success" />
        <span className="pill">Step 4 of 4</span>
      </div>
      <div className="auth-inner success-inner">
        <div className="success-check">
          <ShieldCheck size={34} />
        </div>
        <h1>Password reset successfully</h1>
        <p className="auth-description">
          Your credentials have been securely refreshed. You can now log in with
          your newly created password.
        </p>
        <div className="notice security-notice">
          <ShieldCheck size={20} />
          <div>
            <h2>Security Notice</h2>
            <p>
              All active sessions on other devices and browsers have been
              securely signed out. Your account credentials have been updated
              and synchronized across the StayLeb network.
            </p>
            <small>
              This one-time recovery link is permanently invalidated and cannot
              be reused.
            </small>
          </div>
        </div>
        <Link href="/auth/login" className="primary-button">
          Back to Login <ArrowRight size={17} />
        </Link>
        <p className="support-line">
          Didn&apos;t initiate this change?{" "}
          <LocalAction message="Contact support at +961 9 546 800 for assistance.">
            Contact Support Desk
          </LocalAction>
        </p>
      </div>
      <div className="success-footer">
        <span>
          <Shield size={14} />
          StayLeb Identity Guard © 2025
        </span>
        <span>
          <LocalAction>Privacy Policy</LocalAction> •{" "}
          <LocalAction>Terms of Service</LocalAction>
        </span>
      </div>
    </>
  );
}
