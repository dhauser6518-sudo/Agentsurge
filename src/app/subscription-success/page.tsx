"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "creating" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Missing session ID");
      return;
    }

    const processSubscription = async () => {
      try {
        setStatus("creating");

        // Call API to process the subscription and create account
        const res = await fetch("/api/stripe/process-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to process subscription");
        }

        setStatus("success");

        // Auto sign in with the temporary password
        if (data.email && data.tempPassword) {
          const result = await signIn("credentials", {
            email: data.email,
            password: data.tempPassword,
            redirect: false,
          });

          if (result?.ok) {
            router.push("/dashboard");
            router.refresh();
          } else {
            // Redirect to login if auto-signin fails
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    processSubscription();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center">
          {status === "loading" || status === "creating" ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sky-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-sky-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {status === "loading" ? "Processing..." : "Creating your account..."}
              </h1>
              <p className="text-slate-400">
                Please wait while we set up your AgentSurge account.
              </p>
            </>
          ) : status === "success" ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to AgentSurge!</h1>
              <p className="text-slate-400">Redirecting you to your dashboard...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
