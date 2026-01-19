"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";

interface HeaderProps {
  userName: string;
  userRole: string;
  onMenuClick: () => void;
}

export function Header({ userName, userRole, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 xl:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg xl:hidden"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {userName}
            </h2>
            <p className="text-sm text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}
