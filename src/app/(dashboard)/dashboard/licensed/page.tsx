"use client";

import { useState, useEffect, useCallback } from "react";
import { RecruitTable } from "@/components/recruits/recruit-table";
import { RecruitWithDisputes, RecruitStatus } from "@/types";

export default function LicensedPage() {
  const [recruits, setRecruits] = useState<RecruitWithDisputes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecruits = useCallback(async () => {
    try {
      const response = await fetch("/api/recruits?isLicensed=true");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recruits");
      }

      setRecruits(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recruits");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruits();
  }, [fetchRecruits]);

  const handleStatusChange = async (recruitId: string, status: RecruitStatus) => {
    try {
      const response = await fetch(`/api/recruits/${recruitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchRecruits();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleNotesChange = async (recruitId: string, notes: string) => {
    try {
      const response = await fetch(`/api/recruits/${recruitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notes");
      }

      fetchRecruits();
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  const handleDisputeSubmit = async (
    recruitId: string,
    reason: string,
    explanation: string
  ) => {
    const response = await fetch(`/api/recruits/${recruitId}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, explanation }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to submit dispute");
    }

    fetchRecruits();
  };

  const handleLicenseToggle = async (recruitId: string, isLicensed: boolean) => {
    try {
      const response = await fetch(`/api/recruits/${recruitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLicensed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update license status");
      }

      fetchRecruits();
    } catch (err) {
      console.error("Error updating license status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading recruits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Licensed Recruits</h1>
            <p className="text-sm text-slate-500">
              {recruits.length} recruit{recruits.length !== 1 ? "s" : ""} with active insurance license
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-100">Total Licensed</p>
              <p className="text-3xl font-bold mt-1">{recruits.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Signed Up</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {recruits.filter(r => r.status === "signed_up").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Contacted</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {recruits.filter(r => r.status === "contacted").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <RecruitTable
        recruits={recruits}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onDisputeSubmit={handleDisputeSubmit}
        onLicenseToggle={handleLicenseToggle}
        showLicenseAction={true}
      />
    </div>
  );
}
