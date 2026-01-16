"use client";

import { useState } from "react";

export default function CustomRequestPage() {
  const [formData, setFormData] = useState({
    recruitType: "unlicensed",
    quantity: 1,
    state: "",
    specialRequirements: "",
    timeline: "standard",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // For now, just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitStatus({
        type: "success",
        message: "Your custom request has been submitted. Our team will contact you within 24-48 hours.",
      });

      // Reset form
      setFormData({
        recruitType: "unlicensed",
        quantity: 1,
        state: "",
        specialRequirements: "",
        timeline: "standard",
      });
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Custom Request</h1>
            <p className="text-sm text-slate-500">Submit a custom recruit order with specific requirements</p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {submitStatus.type && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 ${
            submitStatus.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {submitStatus.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          {submitStatus.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {/* Recruit Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Recruit Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, recruitType: "unlicensed" })}
              className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                formData.recruitType === "unlicensed"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`font-medium ${formData.recruitType === "unlicensed" ? "text-sky-700" : "text-slate-900"}`}>
                Unlicensed
              </span>
              <p className="text-sm text-slate-500 mt-0.5">$35 per recruit</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, recruitType: "licensed" })}
              className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                formData.recruitType === "licensed"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`font-medium ${formData.recruitType === "licensed" ? "text-emerald-700" : "text-slate-900"}`}>
                Licensed
              </span>
              <p className="text-sm text-slate-500 mt-0.5">$50 per recruit</p>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max="100"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
        </div>

        {/* State Preference */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
            State Preference (Optional)
          </label>
          <input
            type="text"
            id="state"
            placeholder="e.g., California, Texas, Florida"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <p className="text-xs text-slate-500 mt-1">Leave blank for any state</p>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Timeline</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, timeline: "standard" })}
              className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${
                formData.timeline === "standard"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`font-medium ${formData.timeline === "standard" ? "text-sky-700" : "text-slate-900"}`}>
                Standard
              </span>
              <p className="text-xs text-slate-500 mt-0.5">3-5 days</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, timeline: "rush" })}
              className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${
                formData.timeline === "rush"
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`font-medium ${formData.timeline === "rush" ? "text-amber-700" : "text-slate-900"}`}>
                Rush
              </span>
              <p className="text-xs text-slate-500 mt-0.5">1-2 days</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, timeline: "urgent" })}
              className={`px-4 py-3 rounded-xl border-2 text-center transition-all ${
                formData.timeline === "urgent"
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`font-medium ${formData.timeline === "urgent" ? "text-red-700" : "text-slate-900"}`}>
                Urgent
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Same day</p>
            </button>
          </div>
        </div>

        {/* Special Requirements */}
        <div>
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-slate-700 mb-2">
            Special Requirements (Optional)
          </label>
          <textarea
            id="specialRequirements"
            rows={4}
            placeholder="Describe any specific requirements for your recruits..."
            value={formData.specialRequirements}
            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Custom Request"
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Need something special?</p>
            <p>Custom requests allow you to specify exact requirements for your recruit orders. Our team will review your request and contact you within 24-48 hours to confirm availability and pricing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
