"use client";

import { useState } from "react";

export default function ScriptsPage() {
  const [yourName, setYourName] = useState("Your Name");
  const [agencyName, setAgencyName] = useState("Your Agency");
  const [copied, setCopied] = useState<string | null>(null);

  const scripts = [
    {
      id: "initial-outreach",
      title: "Initial Outreach",
      description: "First message to send when you receive a new recruit",
      template: `Hey {firstName}, this is ${yourName} with ${agencyName}. I'll be helping you onboard with us moving forward.`,
      preview: (firstName: string) =>
        `Hey ${firstName}, this is ${yourName} with ${agencyName}. I'll be helping you onboard with us moving forward.`,
    },
    {
      id: "follow-up",
      title: "Follow Up (No Response)",
      description: "Send this if they haven't responded within 24 hours",
      template: `Hey {firstName}, just following up! Are you still interested in getting started with ${agencyName}? Let me know if you have any questions.`,
      preview: (firstName: string) =>
        `Hey ${firstName}, just following up! Are you still interested in getting started with ${agencyName}? Let me know if you have any questions.`,
    },
    {
      id: "positive-response",
      title: "After Positive Response",
      description: "When they express interest and are ready to move forward",
      template: `Perfect! Let me send you the steps to get started. First, I'll need you to complete your application. I'll send that over right now.`,
      preview: () =>
        `Perfect! Let me send you the steps to get started. First, I'll need you to complete your application. I'll send that over right now.`,
    },
    {
      id: "scheduling",
      title: "Schedule Onboarding Call",
      description: "To schedule a call with the recruit",
      template: `Great talking with you {firstName}! Let's schedule a quick call to go over everything and answer any questions. What times work best for you this week?`,
      preview: (firstName: string) =>
        `Great talking with you ${firstName}! Let's schedule a quick call to go over everything and answer any questions. What times work best for you this week?`,
    },
    {
      id: "licensing-info",
      title: "Licensing Information",
      description: "For unlicensed recruits who need to get licensed",
      template: `To get started, you'll need to get your insurance license. Don't worry - I'll walk you through the entire process. The exam prep usually takes about 2 weeks of studying. Ready to begin?`,
      preview: () =>
        `To get started, you'll need to get your insurance license. Don't worry - I'll walk you through the entire process. The exam prep usually takes about 2 weeks of studying. Ready to begin?`,
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recommended Scripts</h1>
        <p className="text-gray-500 mt-1">
          Copy and customize these proven scripts to onboard your recruits effectively
        </p>
      </div>

      {/* Customization Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalize Your Scripts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Enter your agency name"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          These values will automatically update in all scripts below. Replace <code className="bg-gray-100 px-1 rounded">{"{firstName}"}</code> with your recruit&apos;s actual name when sending.
        </p>
      </div>

      {/* Scripts */}
      <div className="space-y-4">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{script.title}</h3>
                  <p className="text-sm text-gray-500">{script.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(script.preview("Mark"), script.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied === script.id
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                  }`}
                >
                  {copied === script.id ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Script Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0b93f6] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed">{script.preview("Mark")}</p>
                    <p className="text-xs text-gray-400 mt-2">Preview with &quot;Mark&quot; as the recruit name</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl border border-sky-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Pro Tips for Higher Response Rates
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Reach out within <strong>15 minutes</strong> of receiving the recruit for best results</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Use <strong>multiple channels</strong> - text, call, email, and Instagram DM</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Keep messages <strong>short and friendly</strong> - don&apos;t overwhelm with info</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Follow up <strong>at least 3 times</strong> over 48 hours before moving on</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
