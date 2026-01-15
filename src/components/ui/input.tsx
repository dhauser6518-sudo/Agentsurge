"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-lg px-4 py-3",
            "bg-white border-2 border-slate-200",
            "text-slate-900 text-sm placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none",
            "hover:border-slate-300",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
