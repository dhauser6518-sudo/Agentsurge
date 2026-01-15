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
}

export function PurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  quantity,
  pricePerUnit,
  isLoading,
}: PurchaseModalProps) {
  const total = quantity * pricePerUnit;
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
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900">${total}</span>
          </div>
        </div>

        {/* Payment Notice */}
        <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
          <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-sky-900">One-Click Purchase</p>
            <p className="text-xs text-sky-700 mt-0.5">
              Your card on file will be charged ${total}
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
                Processing...
              </span>
            ) : (
              "Confirm Purchase"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
