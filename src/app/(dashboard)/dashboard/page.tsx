"use client";

import { useState, useEffect, useCallback } from "react";
import { RecruitTable } from "@/components/recruits/recruit-table";
import { InventoryCard } from "@/components/purchase/inventory-card";
import { PurchaseModal } from "@/components/purchase/purchase-modal";
import { PendingBanner } from "@/components/purchase/pending-banner";
import { RecruitWithDisputes, RecruitStatus } from "@/types";

const PRICES = {
  unlicensed: 35,
  licensed: 50,
};

export default function UnlicensedPage() {
  const [recruits, setRecruits] = useState<RecruitWithDisputes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Inventory state
  const [inventory, setInventory] = useState({ unlicensed: 0, licensed: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  // Purchase modal state
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    type: "unlicensed" | "licensed";
    quantity: number;
  }>({ isOpen: false, type: "unlicensed", quantity: 1 });
  const [isPurchasing, setIsPurchasing] = useState(false);

  const fetchRecruits = useCallback(async () => {
    try {
      const response = await fetch("/api/recruits?isLicensed=false");
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

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      if (response.ok) {
        setInventory(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  }, []);

  const fetchPendingPurchases = useCallback(async () => {
    try {
      const response = await fetch("/api/purchases");
      const data = await response.json();
      if (response.ok) {
        const pending = data.purchases?.filter(
          (p: { status: string }) => p.status === "pending"
        ).length || 0;
        setPendingCount(pending);
      }
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
  }, []);

  useEffect(() => {
    fetchRecruits();
    fetchInventory();
    fetchPendingPurchases();

    // Poll for pending purchases
    const interval = setInterval(() => {
      fetchPendingPurchases();
      if (pendingCount > 0) {
        fetchRecruits();
        fetchInventory();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRecruits, fetchInventory, fetchPendingPurchases, pendingCount]);

  const handlePurchaseClick = (type: "unlicensed" | "licensed", quantity: number) => {
    setPurchaseModal({ isOpen: true, type, quantity });
  };

  const handlePurchaseConfirm = async () => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: purchaseModal.type,
          quantity: purchaseModal.quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      // Success - close modal and refresh data
      setPurchaseModal({ ...purchaseModal, isOpen: false });
      fetchInventory();
      fetchPendingPurchases();
      fetchRecruits();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

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
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
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
      {/* Pending Delivery Banner */}
      <PendingBanner pendingCount={pendingCount} />

      {/* Buy Recruits Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Buy Recruits</h2>
            <p className="text-sm text-slate-500">One-click purchase with card on file</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InventoryCard
            type="unlicensed"
            available={inventory.unlicensed}
            price={PRICES.unlicensed}
            onPurchase={(qty) => handlePurchaseClick("unlicensed", qty)}
            disabled={isPurchasing}
          />
          <InventoryCard
            type="licensed"
            available={inventory.licensed}
            price={PRICES.licensed}
            onPurchase={(qty) => handlePurchaseClick("licensed", qty)}
            disabled={isPurchasing}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Unlicensed Recruits</h1>
            <p className="text-sm text-slate-500">
              {recruits.length} recruit{recruits.length !== 1 ? "s" : ""} awaiting insurance license
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Unlicensed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{recruits.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">New Recruits</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {recruits.filter(r => r.status === "new_recruit").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Follow Up Needed</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {recruits.filter(r => r.status === "follow_up_needed").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {/* Purchase Confirmation Modal */}
      <PurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ ...purchaseModal, isOpen: false })}
        onConfirm={handlePurchaseConfirm}
        type={purchaseModal.type}
        quantity={purchaseModal.quantity}
        pricePerUnit={PRICES[purchaseModal.type]}
        isLoading={isPurchasing}
      />
    </div>
  );
}
