import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "yellow" | "orange" | "green" | "gray" | "red" | "cyan" | "purple";
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const colorStyles = {
  solid: {
    blue: "bg-blue-500 text-white",
    yellow: "bg-amber-500 text-white",
    orange: "bg-orange-500 text-white",
    green: "bg-emerald-500 text-white",
    gray: "bg-slate-500 text-white",
    red: "bg-red-500 text-white",
    cyan: "bg-cyan-500 text-white",
    purple: "bg-purple-500 text-white",
  },
  soft: {
    blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    yellow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    orange: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    gray: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
    red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
    purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  },
  outline: {
    blue: "text-blue-600 ring-1 ring-blue-300 bg-white",
    yellow: "text-amber-600 ring-1 ring-amber-300 bg-white",
    orange: "text-orange-600 ring-1 ring-orange-300 bg-white",
    green: "text-emerald-600 ring-1 ring-emerald-300 bg-white",
    gray: "text-slate-600 ring-1 ring-slate-300 bg-white",
    red: "text-red-600 ring-1 ring-red-300 bg-white",
    cyan: "text-cyan-600 ring-1 ring-cyan-300 bg-white",
    purple: "text-purple-600 ring-1 ring-purple-300 bg-white",
  },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  color = "gray",
  variant = "soft",
  size = "md",
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-md whitespace-nowrap",
        colorStyles[variant][color],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
