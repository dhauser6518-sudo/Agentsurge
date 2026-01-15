"use client";

interface PendingBannerProps {
  pendingCount: number;
}

export function PendingBanner({ pendingCount }: PendingBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-sky-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sky-400">
            {pendingCount} recruit{pendingCount > 1 ? "s" : ""} being delivered...
          </p>
          <p className="text-sm text-slate-400">
            Your recruits will appear below momentarily
          </p>
        </div>
      </div>
    </div>
  );
}
