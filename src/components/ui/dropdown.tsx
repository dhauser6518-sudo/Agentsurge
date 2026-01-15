"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-10 mt-2 w-52",
            "bg-white rounded-xl shadow-xl",
            "ring-1 ring-slate-200",
            "animate-slideDown",
            "overflow-hidden",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="py-1.5" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
}

export function DropdownItem({ children, onClick, disabled, danger, icon }: DropdownItemProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium",
        "transition-colors duration-150",
        disabled
          ? "text-slate-300 cursor-not-allowed"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <span className="w-4 h-4 opacity-60">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1.5 border-t border-slate-100" />;
}
