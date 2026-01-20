"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoSlider from "@/components/landing/LogoSlider";

const rotatingWords = ["downline", "overrides", "business"];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);

  // Calculator state
  const [recruitsPerMonth, setRecruitsPerMonth] = useState(10);
  const [avgProduction, setAvgProduction] = useState(3000);
  const [overridePercent, setOverridePercent] = useState(10);

  const monthlyIncome = recruitsPerMonth * avgProduction * (overridePercent / 100);
  const annualIncome = monthlyIncome * 12;

  // Rotate headline words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Track scroll position and trigger message animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHasScrolled(scrollY > 50);

      // Trigger messages one by one based on scroll position
      if (scrollY > 20 && visibleMessages < 1) {
        setVisibleMessages(1);
      }
      if (scrollY > 60 && visibleMessages < 2) {
        setTimeout(() => setVisibleMessages(2), 300);
      }
      if (scrollY > 100 && visibleMessages < 3) {
        setTimeout(() => setVisibleMessages(3), 300);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleMessages]);

  const handleGetStarted = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setIsCheckoutLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsCheckoutLoading(false);
    }
  };

  const faqs = [
    {
      question: "What's the difference between licensed and unlicensed recruits?",
      answer: "Unlicensed recruits (ages 18-25) are ready to get licensed and start fresh with your training. Licensed recruits (ages 18-30) already have their license and can begin producing immediately."
    },
    {
      question: "How quickly will I receive the contact information?",
      answer: "Contact information is delivered instantly to your CRM after purchase. You can reach out to your new recruits immediately."
    },
    {
      question: "Are these recruits exclusive to me?",
      answer: "Yes. Each recruit is sold once and only once. No other agency will receive the same contact information."
    },
    {
      question: "What if a recruit doesn't respond?",
      answer: "All recruits have opted in within the last 24 hours and are expecting contact. However, all sales are final once delivered. We recommend reaching out across all platforms (call, text, email, Instagram) for best results."
    },
    {
      question: "How often does inventory refresh?",
      answer: "Inventory updates in real time as new recruits opt in through our advertising campaigns. Availability varies throughout the day based on ad performance."
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-[0.15em] text-sky-400">AGENTSURGE</h1>
            <p className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase">Recruiting Solutions</p>
          </div>
          {hasScrolled ? (
            <button
              onClick={handleGetStarted}
              disabled={isCheckoutLoading}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all transform animate-slideIn disabled:opacity-50 disabled:cursor-wait"
            >
              {isCheckoutLoading ? "Loading..." : "Try Free →"}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-sky-400 transition-colors font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-3 mb-8 animate-fadeIn">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">JM</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f093fb] to-[#f5576c] flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">SK</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">RD</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#43e97b] to-[#38f9d7] flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">AP</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fa709a] to-[#fee140] flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-900">TL</div>
            </div>
            <div className="text-left">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <span className="text-xs text-slate-500">Trusted by 200+ agents</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight text-center">
            <span className="block whitespace-nowrap">Expand your <span key={wordIndex} className="text-sky-400 inline-block animate-fadeInWord">{rotatingWords[wordIndex]}</span></span>
            <span className="block">in the click of a button</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            We find people who want to sell insurance both licensed and unlicensed. Create your account, pick how many you need, get their info in your CRM within minutes, then use our proven script to onboard them to your team fast.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 mb-12">
            {/* First row - two pills side by side */}
            <div className="flex justify-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Verified Contacts</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">24hr Fresh Leads</span>
              </div>
            </div>
            {/* Second row - single pill centered */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 4 12 14.01 9 11.01"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 12a10 10 0 1 1-5.93-9.14"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap">Exclusive Access</span>
            </div>
          </div>

          {/* iMessage Preview - Bubbles Only */}
          <div className="max-w-[380px] mx-auto">
            <div className="space-y-3">
              {/* Outgoing message 1 */}
              <div
                className="flex justify-end"
                style={{
                  opacity: visibleMessages >= 1 ? 1 : 0,
                  transform: visibleMessages >= 1 ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
                }}
              >
                <div className="bg-[#0b93f6] text-white px-4 py-3 rounded-[20px] rounded-br-[6px] max-w-[300px] text-[15px] leading-[22px] shadow-lg">
                  Hey Mark, this is John with <em>Your Agency Here</em>. I&apos;ll be helping you onboard with us from here on out.
                </div>
              </div>

              {/* Incoming message */}
              <div
                className="flex justify-start"
                style={{
                  opacity: visibleMessages >= 2 ? 1 : 0,
                  transform: visibleMessages >= 2 ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
                }}
              >
                <div className="bg-[#3b3b3d] text-white px-4 py-3 rounded-[20px] rounded-bl-[6px] max-w-[300px] text-[15px] leading-[22px] shadow-lg">
                  Perfect man, excited to get started
                </div>
              </div>

              {/* Outgoing message 2 */}
              <div
                className="flex justify-end"
                style={{
                  opacity: visibleMessages >= 3 ? 1 : 0,
                  transform: visibleMessages >= 3 ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
                }}
              >
                <div className="bg-[#0b93f6] text-white px-4 py-3 rounded-[20px] rounded-br-[6px] max-w-[300px] text-[15px] leading-[22px] shadow-lg">
                  Sweet, let me send you the steps
                </div>
              </div>
            </div>
            <p className="text-center text-slate-400 text-sm mt-8 font-medium">Start onboarding new agents within minutes</p>
          </div>
        </div>
      </section>

      {/* Purchase Card Section */}
      <section className="pb-20">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative">
              {/* Free Trial Badge */}
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 mb-6 text-center">
                <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">Start Free</div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-white">7-Day Free Trial</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">No charge during trial</p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-4 gap-2 py-4 mb-6 border-y border-slate-700">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-sky-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase">SSL</p>
                  <p className="text-[9px] text-slate-500">Encrypted</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-sky-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase">Secure</p>
                  <p className="text-[9px] text-slate-500">Checkout</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-sky-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase">Instant</p>
                  <p className="text-[9px] text-slate-500">Delivery</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto text-sky-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p className="text-[10px] font-semibold text-slate-300 uppercase">Verified</p>
                  <p className="text-[9px] text-slate-500">Contacts</p>
                </div>
              </div>

              {/* Pricing Pills */}
              <div className="flex justify-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-full">
                  <span className="text-sm text-slate-300">Unlicensed</span>
                  <span className="text-sm font-bold text-emerald-400">$35</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-full">
                  <span className="text-sm text-slate-300">Licensed</span>
                  <span className="text-sm font-bold text-emerald-400">$50</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                disabled={isCheckoutLoading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {isCheckoutLoading ? "Loading..." : "Try AgentSurge for Free →"}
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                No charge during trial • Cancel anytime
              </p>

              <p className="text-center text-sm text-slate-400 mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Slider */}
      <LogoSlider />

      {/* How It Works Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            How Does This Work?
          </h2>
          <p className="text-center text-slate-400 max-w-2xl mx-auto mb-16">
            We run targeted advertising campaigns across multiple platforms to find people actively interested in starting an insurance career.
            These leads flow directly into our verified database, and when you purchase, they&apos;re instantly delivered to your CRM—exclusive and ready to contact.
          </p>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                  <h3 className="text-xl font-semibold text-white">Targeted Ad Campaigns</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Our marketing team runs highly optimized campaigns across Instagram, Facebook, YouTube, and TikTok
                  specifically targeting people aged 18-30 who are actively looking to start a career in insurance sales.
                </p>
              </div>
              <div className="flex-1 order-1 lg:order-2 flex justify-center">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#405DE6] via-[#833AB4] to-[#E1306C] flex items-center justify-center text-white shadow-lg animate-float">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                      <circle cx="12" cy="12" r="3.5"/>
                    </svg>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-lg animate-float" style={{ animationDelay: "0.3s" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-lg animate-float" style={{ animationDelay: "0.6s" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-white shadow-lg animate-float" style={{ animationDelay: "0.9s" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-12 text-sky-500 animate-bounce-arrow" fill="none" viewBox="0 0 24 48" stroke="currentColor" strokeWidth="2">
                <path d="M12 0 L12 40 M6 34 L12 40 L18 34"/>
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 order-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="text-xl font-semibold text-white">Verified & Stored</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Interested prospects submit their information through our landing pages. Each lead is verified for accuracy
                  and stored securely in our database with full contact details including phone, email, and social profiles.
                </p>
              </div>
              <div className="flex-1 order-1 flex justify-center">
                {/* Animated Database Visual */}
                <div className="relative w-[200px] h-[160px]">
                  {/* Incoming recruit dots */}
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-moveToDb" style={{ top: "20%", left: "10%" }} />
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-moveToDb" style={{ top: "40%", left: "5%", animationDelay: "0.4s" }} />
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-moveToDb" style={{ top: "60%", left: "15%", animationDelay: "0.8s" }} />
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-moveToDb" style={{ top: "30%", left: "0%", animationDelay: "1.2s" }} />

                  {/* Database icon */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[120px] bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex flex-col items-center justify-center text-white shadow-[0_8px_24px_rgba(5,146,229,0.3)]">
                    <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 5v6c0 1.66-4.03 3-9 3s-9-1.34-9-3V5"/>
                      <path d="M21 11v6c0 1.66-4.03 3-9 3s-9-1.34-9-3v-6"/>
                    </svg>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Database</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-12 text-sky-500 animate-bounce-arrow" fill="none" viewBox="0 0 24 48" stroke="currentColor" strokeWidth="2">
                <path d="M12 0 L12 40 M6 34 L12 40 L18 34"/>
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="text-xl font-semibold text-white">Instant Delivery to You</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  When you purchase, recruits are immediately and exclusively assigned to you. Access them instantly through
                  your personalized CRM dashboard—no waiting, no sharing, no competition. Each recruit is yours alone to contact and convert.
                </p>
              </div>
              <div className="flex-1 order-1 lg:order-2 flex justify-center">
                {/* Animated Distribution Visual */}
                <div className="relative w-[280px] h-[180px]">
                  {/* Center hub */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white shadow-[0_6px_20px_rgba(16,185,129,0.4)] z-10">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>

                  {/* CRM Nodes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>
                  <div className="absolute top-[25%] right-0 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>
                  <div className="absolute bottom-[25%] right-0 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>
                  <div className="absolute bottom-[25%] left-0 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>
                  <div className="absolute top-[25%] left-0 w-[50px] h-[50px] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-400 shadow-lg">CRM</div>

                  {/* Pulse lines */}
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(0deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" />
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(60deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" style={{ animationDelay: "0.25s" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(120deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" style={{ animationDelay: "0.5s" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(180deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" style={{ animationDelay: "0.75s" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(240deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" style={{ animationDelay: "1s" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-transparent origin-left" style={{ transform: "rotate(300deg)" }}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full absolute animate-pulseLine" style={{ animationDelay: "1.25s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens After Sign Up */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            What Happens After I Sign Up?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Instant Access to Your CRM</h4>
                <p className="text-sm text-slate-400">After signing up, you&apos;ll be immediately redirected to our recruit management portal.</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-xl flex-shrink-0">👤</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Your Free Account is Ready</h4>
                <p className="text-sm text-slate-400">Your account is set up in seconds. Your login gives you 24/7 access to all your recruits.</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-xl flex-shrink-0">📋</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Your Recruits Are Delivered</h4>
                <p className="text-sm text-slate-400">Your recruits will be delivered to your dashboard with full contact details, ready for you to reach out.</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-xl flex-shrink-0">📊</div>
              <div>
                <h4 className="font-semibold text-white mb-1">Track & Manage Progress</h4>
                <p className="text-sm text-slate-400">Keep notes, track outreach status, and monitor your pipeline—all in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Receive */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">What You Receive</h2>
              <p className="text-slate-400 mb-6">
                Each purchase includes complete contact information for one verified individual actively seeking to join your agency as a downline.
              </p>
              <ul className="space-y-3">
                {[
                  "Full name, phone number, email, and IG handle",
                  "Unlicensed recruits: Ages 18-25, ready to get licensed",
                  "Licensed recruits: Ages 18-30, already licensed",
                  "Opted in within the last 24 hours",
                  "Exclusive to you—never sold to another agency",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Sample Card */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Sample Recruit Delivery</h2>
              <p className="text-slate-400 mb-6">Here&apos;s exactly what you&apos;ll receive after purchase</p>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-sky-500 px-4 py-3 flex items-center gap-2 text-white">
                  <span>📋</span>
                  <span className="font-medium">Your Recruit Details</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    ["Name", "John Smith"],
                    ["Phone", "(555) 123-4567"],
                    ["Email", "john@example.com"],
                    ["Instagram", "@johnsmith"],
                    ["Age", "23"],
                    ["Licensed", "No"],
                    ["Opted In", "Today, 2:34 PM"],
                  ].map(([label, value], i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-slate-500 text-sm">{label}</span>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Income Calculator */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-md mx-auto px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Calculate Your Override Income</h2>
          <p className="text-slate-400 text-center mb-8">See how much extra income you could earn by building your team</p>

          <div className="bg-gradient-to-b from-[#4a90d9] to-[#3b7bbf] rounded-2xl p-6">
            {/* Recruits Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/90 font-medium">Recruits per month</span>
                <span className="text-white font-bold text-3xl">{recruitsPerMonth}</span>
              </div>
              <input
                type="range"
                min="1"
                max="250"
                value={recruitsPerMonth}
                onChange={(e) => setRecruitsPerMonth(Number(e.target.value))}
                className="calc-slider w-full"
              />
            </div>

            {/* Avg Production Input */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm mb-2">Avg. monthly production per agent ($)</label>
              <input
                type="number"
                value={avgProduction}
                onChange={(e) => setAvgProduction(Number(e.target.value))}
                className="w-full bg-white/20 border-0 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Override Percentage Input */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2">Your override percentage (%)</label>
              <input
                type="number"
                value={overridePercent}
                onChange={(e) => setOverridePercent(Number(e.target.value))}
                className="w-full bg-white/20 border-0 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Results */}
            <div className="bg-white/20 rounded-xl p-6 text-center">
              <p className="text-white/80 text-sm mb-1">Estimated Monthly Income</p>
              <p className="text-4xl font-bold text-white mb-4">
                ${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-white/80 text-sm mb-1">Estimated Annual Income</p>
              <p className="text-4xl font-bold text-white">
                ${annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why AgentSurge - Comparison Table */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why AgentSurge?
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 font-semibold text-slate-400">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-400">Cold Calling</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-400">Job Boards</th>
                  <th className="text-center px-6 py-4 font-semibold text-sky-400">AgentSurge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="px-6 py-4 text-slate-300">Time to find 1 recruit</td>
                  <td className="px-6 py-4 text-center text-slate-500">4-6 hours</td>
                  <td className="px-6 py-4 text-center text-slate-500">2-3 days</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-400">Instant</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-300">Cost per recruit</td>
                  <td className="px-6 py-4 text-center text-slate-500">~$50 in time</td>
                  <td className="px-6 py-4 text-center text-slate-500">~$100+</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-400">$35-50</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-300">Pre-qualified</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-300">Exclusive to you</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-300">Contact info verified</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-slate-500">Sometimes</td>
                  <td className="px-6 py-4 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-300">Opted in today</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-red-400">✗</td>
                  <td className="px-6 py-4 text-center text-emerald-400">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Video Testimonial */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Hear From Our Users
          </h2>
          <p className="text-center text-slate-400 mb-10">
            Real results from real agents using AgentSurge
          </p>

          <div className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-black/50">
            <video
              controls
              playsInline
              className="w-full aspect-video"
              poster=""
            >
              <source src="https://res.cloudinary.com/djm2glsrr/video/upload/v1768607531/Matt_Testimonial_raw_msgi03.mov" type="video/quicktime" />
              <source src="https://res.cloudinary.com/djm2glsrr/video/upload/v1768607531/Matt_Testimonial_raw_msgi03.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Fresh Lead Guarantee</h3>
              <p className="text-slate-400">
                Every recruit opted in within 24 hours. If the contact info is invalid, we replace it free. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Grow Your Team?
          </h2>
          <p className="text-slate-400 mb-8">
            Get started today with full access to our exclusive recruit database.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={isCheckoutLoading}
            className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-wait"
          >
            {isCheckoutLoading ? "Loading..." : "Try AgentSurge for Free →"}
          </button>
          <p className="text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} AgentSurge Recruiting Solutions. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .calc-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          outline: none;
        }
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .calc-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
        @keyframes fadeInWord {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInWord {
          animation: fadeInWord 0.3s ease forwards;
        }
        @keyframes moveToDb {
          0% { opacity: 0; transform: translate(-30px, -20px) scale(0.5); }
          20% { opacity: 1; transform: translate(-20px, -10px) scale(1); }
          80% { opacity: 1; transform: translate(70px, 50px) scale(1); }
          100% { opacity: 0; transform: translate(70px, 50px) scale(0.5); }
        }
        .animate-moveToDb {
          animation: moveToDb 2s ease-in-out infinite;
        }
        @keyframes pulseLine {
          0% { left: 0; opacity: 1; }
          100% { left: 55px; opacity: 0; }
        }
        .animate-pulseLine {
          animation: pulseLine 1.5s ease-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        .animate-bounce-slow {
          animation: bounce 1.5s ease-in-out infinite;
        }
        .animate-bounce-arrow {
          animation: bounce 1.5s ease-in-out infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
