"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create setup intent when component mounts
    fetch("/api/stripe/setup-intent", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => {
        setError("Failed to initialize payment. Please try again.");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError("Card element not found");
        setIsLoading(false);
        return;
      }

      // Confirm the setup intent with the card details
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Failed to process card");
        setIsLoading(false);
        return;
      }

      if (setupIntent?.payment_method) {
        // Confirm the card setup and start the trial
        const res = await fetch("/api/stripe/setup-intent", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setIsLoading(false);
          return;
        }

        // Success - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Card Details
        </label>
        <div className="bg-white border border-slate-300 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1e293b",
                  "::placeholder": {
                    color: "#94a3b8",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !clientSecret || isLoading}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Start My Free Trial"
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Your card will not be charged during the 7-day trial. Cancel anytime.
      </p>
    </form>
  );
}

export default function StartTrialPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-[0.2em] text-sky-400">AGENTSURGE</h1>
            <p className="text-sm font-medium tracking-[0.25em] text-slate-300 mt-2">RECRUITING SOLUTIONS</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">7-Day Free Trial</h3>
                <p className="text-emerald-400 text-sm">No charge until trial ends</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Try AgentSurge risk-free. Your card won&apos;t be charged during the trial period. Cancel anytime with one click.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold">What&apos;s included:</h4>
            <ul className="space-y-3">
              {[
                "Unlimited access to recruit database",
                "Personal CRM dashboard",
                "Proven onboarding scripts",
                "Real-time lead notifications",
                "Priority support",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <svg className="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Checkout Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-3xl font-light tracking-[0.2em] text-sky-500">AGENTSURGE</h1>
            <p className="text-xs font-medium tracking-[0.25em] text-slate-600 mt-1">RECRUITING SOLUTIONS</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Start Your Free Trial</h2>
              <p className="text-slate-500 mt-2">Enter your card to begin your 7-day free trial</p>
            </div>

            {/* Trial Badge */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-900 font-semibold">7-Day Free Trial</p>
                  <p className="text-sky-700 text-sm">Then $29/month</p>
                </div>
                <div className="text-right">
                  <p className="text-sky-900 font-bold text-2xl">$0</p>
                  <p className="text-sky-700 text-xs">due today</p>
                </div>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                SSL Encrypted
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
