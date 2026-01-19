"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // We could verify the session with Stripe here if needed
    // For now, we just show a generic success message
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-[0.2em] text-sky-400">AGENTSURGE</h1>
          <p className="text-xs font-medium tracking-[0.25em] text-slate-400 mt-1">RECRUITING SOLUTIONS</p>
        </div>

        {/* Success Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your 7-day free trial has started. We&apos;ve sent a welcome email with a link to set up your password and access your dashboard.
          </p>

          {/* Email Instructions */}
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sky-400 font-semibold">Check Your Email</span>
            </div>
            <p className="text-sm text-slate-400">
              Look for an email from <span className="text-white font-medium">AgentSurge</span> with the subject &quot;Welcome to AgentSurge! Set up your account&quot;
            </p>
          </div>

          {/* What's next */}
          <div className="text-left space-y-3 mb-6">
            <h3 className="text-white font-semibold text-sm">What&apos;s next:</h3>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p className="text-sm text-slate-400">Open the welcome email we just sent</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p className="text-sm text-slate-400">Click &quot;Set Up My Account&quot; button</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p className="text-sm text-slate-400">Create your password and start using AgentSurge!</p>
            </div>
          </div>

          {/* Spam notice */}
          <p className="text-xs text-slate-500">
            Don&apos;t see the email? Check your spam folder or{" "}
            <Link href="/login" className="text-sky-400 hover:text-sky-300">
              go to login
            </Link>
            {" "}to request a new link.
          </p>
        </div>

        {/* Trial info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Your card won&apos;t be charged during the 7-day trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
