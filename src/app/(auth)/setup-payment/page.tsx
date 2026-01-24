"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { trackLead, trackInitiateCheckout } from "@/components/MetaPixel";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SetupForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: submitError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Failed to setup payment method");
        setIsLoading(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        // Confirm the card setup on our backend
        const response = await fetch("/api/stripe/setup-intent", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        if (response.ok) {
          trackLead();
          router.push("/dashboard");
        } else {
          const data = await response.json();
          setError(data.error || "Failed to complete setup");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Start 7-Day Free Trial"
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Your card will be charged $99/month after the trial ends.
        <br />
        Cancel anytime during your trial.
      </p>
    </form>
  );
}

export default function SetupPaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    trackInitiateCheckout(99);

    const createSetupIntent = async () => {
      try {
        const response = await fetch("/api/stripe/setup-intent", {
          method: "POST",
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize payment setup");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }

      setIsLoading(false);
    };

    createSetupIntent();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-[0.15em] text-sky-400">AGENTSURGE</h1>
          <p className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mt-1">Recruiting Solutions</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Start Your Free Trial</h2>
            <p className="text-slate-400 text-sm">
              Add a payment method to begin your 7-day free trial.
              You won&apos;t be charged until the trial ends.
            </p>
          </div>

          {/* Trial Benefits */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-white mb-3">Your trial includes:</p>
            <ul className="space-y-2">
              {[
                "Full access to the recruit database",
                "Unlimited recruit purchases",
                "CRM access to manage your pipeline",
                "Cancel anytime before trial ends",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading payment form...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#0ea5e9",
                    colorBackground: "#1e293b",
                    colorText: "#f1f5f9",
                    colorDanger: "#ef4444",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <SetupForm />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
