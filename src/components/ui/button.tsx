"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-semibold",
      "rounded-lg transition-all duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
      "active:scale-[0.98]"
    );

    const variants = {
      primary: cn(
        "bg-gradient-to-r from-sky-500 to-cyan-500 text-white",
        "hover:from-sky-600 hover:to-cyan-600",
        "shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30",
        "focus-visible:ring-sky-500"
      ),
      secondary: cn(
        "bg-slate-800 text-white",
        "hover:bg-slate-700",
        "shadow-md shadow-slate-800/20",
        "focus-visible:ring-slate-500"
      ),
      outline: cn(
        "border-2 border-slate-200 bg-white text-slate-700",
        "hover:border-slate-300 hover:bg-slate-50",
        "focus-visible:ring-slate-400"
      ),
      ghost: cn(
        "text-slate-600 bg-transparent",
        "hover:bg-slate-100 hover:text-slate-900",
        "focus-visible:ring-slate-400"
      ),
      danger: cn(
        "bg-gradient-to-r from-red-500 to-rose-500 text-white",
        "hover:from-red-600 hover:to-rose-600",
        "shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30",
        "focus-visible:ring-red-500"
      ),
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
