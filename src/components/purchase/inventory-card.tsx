"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  type: "unlicensed" | "licensed";
  available: number;
  price: number;
  onPurchase: (quantity: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function InventoryCard({
  type,
  available,
  price,
  onPurchase,
  isLoading = false,
  disabled = false,
}: InventoryCardProps) {
  const [quantity, setQuantity] = useState(1);

  const isLicensed = type === "licensed";
  const colorScheme = isLicensed
    ? {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-400",
        button: "from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40",
      }
    : {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        badge: "bg-amber-500/20 text-amber-400",
        button: "from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40",
      };

  const maxQty = Math.min(available, 10);
  const total = quantity * price;

  return (
    <div className={cn(
      "rounded-2xl border p-6",
      colorScheme.bg,
      colorScheme.border
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={cn(
            "inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-2",
            colorScheme.badge
          )}>
            {isLicensed ? "Licensed" : "Unlicensed"}
          </span>
          <h3 className="text-lg font-semibold text-white">
            {isLicensed ? "Licensed Recruits" : "Unlicensed Recruits"}
          </h3>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-bold", colorScheme.text)}>
            ${price}
          </p>
          <p className="text-xs text-slate-500">per recruit</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 py-3 border-y border-slate-700/50">
        <span className="text-sm text-slate-400">Available</span>
        <span className={cn("text-lg font-semibold", colorScheme.text)}>
          {available}
        </span>
      </div>

      {available > 0 ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-slate-400">Qty:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || disabled}
                className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center text-white font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty || disabled}
                className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-sm text-slate-500 ml-auto">
              Total: <span className="text-white font-semibold">${total}</span>
            </span>
          </div>

          <button
            onClick={() => onPurchase(quantity)}
            disabled={disabled || isLoading || available === 0}
            className={cn(
              "w-full py-3 px-4 rounded-xl bg-gradient-to-r text-white font-semibold shadow-lg transition-all",
              colorScheme.button,
              "disabled:opacity-50 disabled:cursor-not-allowed"
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
              `Buy ${quantity} Recruit${quantity > 1 ? "s" : ""}`
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-500">No recruits available</p>
          <p className="text-xs text-slate-600 mt-1">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
