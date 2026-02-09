"use client";

import { Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "unlicensed" | "licensed";
  quantity: number;
  pricePerUnit: number;
  isLoading: boolean;
  isEligibleForFree?: boolean;
}

export function PurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  quantity,
  pricePerUnit,
  isLoading,
  isEligibleForFree = false,
}: PurchaseModalProps) {
  const originalTotal = quantity * pricePerUnit;
  const total = isEligibleForFree
    ? Math.max(0, (quantity - 1) * pricePerUnit)
    : originalTotal;
  const isLicensed = type === "licensed";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Purchase">
      <div className="space-y-6">
        {/* Purchase Summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Recruit Type</span>
            <span className={cn(
              "px-2 py-1 rounded-lg text-xs font-semibold",
              isLicensed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            )}>
              {isLicensed ? "Licensed" : "Unlicensed"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Quantity</span>
            <span className="font-semibold text-slate-900">{quantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Price per recruit</span>
            <span className="font-semibold text-slate-900">${pricePerUnit}</span>
          </div>
          {isEligibleForFree && (
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-slate-600">Free recruit discount</span>
              <span className="font-semibold">-${pricePerUnit}</span>
            </div>
          )}
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            {isEligibleForFree && originalTotal !== total ? (
              <span className="text-xl font-bold text-slate-900">
                <span className="line-through text-slate-400 text-base mr-2">${originalTotal}</span>
                {total === 0 ? <span className="text-emerald-600">FREE</span> : `$${total}`}
              </span>
            ) : (
              <span className="text-xl font-bold text-slate-900">${total}</span>
            )}
          </div>
        </div>

        {/* Payment Notice */}
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-xl",
          total === 0 ? "bg-emerald-50" : "bg-sky-50"
        )}>
          <svg className={cn(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            total === 0 ? "text-emerald-500" : "text-sky-500"
          )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {total === 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            )}
          </svg>
          <div>
            <p className={cn(
              "text-sm font-medium",
              total === 0 ? "text-emerald-900" : "text-sky-900"
            )}>
              {total === 0 ? "Free Recruit!" : "Secure Checkout"}
            </p>
            <p className={cn(
              "text-xs mt-0.5",
              total === 0 ? "text-emerald-700" : "text-sky-700"
            )}>
              {total === 0
                ? "Your first recruit is on us - no payment required!"
                : `You'll be redirected to complete your $${total} purchase`
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl bg-gradient-to-r text-white font-semibold shadow-lg transition-all disabled:opacity-50",
              isLicensed
                ? "from-emerald-500 to-teal-500 shadow-emerald-500/25"
                : "from-amber-500 to-orange-500 shadow-amber-500/25"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Redirecting...
              </span>
            ) : (
              "Proceed to Checkout"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
