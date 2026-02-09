"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { InventoryCard } from "@/components/purchase/inventory-card";
import { PurchaseModal } from "@/components/purchase/purchase-modal";
import { PendingBanner } from "@/components/purchase/pending-banner";

const PRICES = {
  unlicensed: 35,
  licensed: 50,
};

const SHOPIFY_STORE = "0rgv5t-st.myshopify.com";
const SHOPIFY_VARIANTS = {
  unlicensed: "42366682759239",
  licensed: "42366682792007",
};

interface UserStatus {
  freeRecruitClaimed: boolean;
}

export default function BuyRecruitsPage() {
  const { data: session } = useSession();

  // Inventory state
  const [inventory, setInventory] = useState({ unlicensed: 0, licensed: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

  // Purchase modal state
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    type: "unlicensed" | "licensed";
    quantity: number;
  }>({ isOpen: false, type: "unlicensed", quantity: 1 });
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  const fetchUserStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/user/status");
      const data = await response.json();
      if (response.ok) {
        setUserStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch user status:", err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchPendingPurchases();
    fetchUserStatus();

    // Poll for pending purchases
    const interval = setInterval(() => {
      fetchPendingPurchases();
      if (pendingCount > 0) {
        fetchInventory();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchInventory, fetchPendingPurchases, fetchUserStatus, pendingCount]);

  const handlePurchaseClick = (type: "unlicensed" | "licensed", quantity: number) => {
    setPurchaseModal({ isOpen: true, type, quantity });
  };

  const handlePurchaseConfirm = () => {
    setIsPurchasing(true);

    // Build Shopify checkout URL
    const variantId = SHOPIFY_VARIANTS[purchaseModal.type];
    const quantity = purchaseModal.quantity;
    const email = session?.user?.email || "";

    let checkoutUrl = `https://${SHOPIFY_STORE}/cart/${variantId}:${quantity}`;

    // Pre-fill email if available
    if (email) {
      checkoutUrl += `?checkout[email]=${encodeURIComponent(email)}`;
    }

    // Redirect to Shopify checkout
    window.location.href = checkoutUrl;
  };

  const isEligibleForFree = userStatus && !userStatus.freeRecruitClaimed;

  return (
    <div className="animate-fadeIn">
      {/* Free First Recruit Banner */}
      {isEligibleForFree && (
        <div className="mb-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Your First Recruit is FREE!</h3>
              <p className="text-white/90 mt-1">
                Welcome to AgentSurge! Purchase any recruit below and your first one is on us.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Delivery Banner */}
      <PendingBanner pendingCount={pendingCount} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buy Recruits</h1>
            <p className="text-sm text-slate-500">Select quantity and checkout securely</p>
          </div>
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InventoryCard
          type="unlicensed"
          available={inventory.unlicensed}
          price={PRICES.unlicensed}
          onPurchase={(qty) => handlePurchaseClick("unlicensed", qty)}
          disabled={isPurchasing}
          isEligibleForFree={isEligibleForFree || false}
        />
        <InventoryCard
          type="licensed"
          available={inventory.licensed}
          price={PRICES.licensed}
          onPurchase={(qty) => handlePurchaseClick("licensed", qty)}
          disabled={isPurchasing}
          isEligibleForFree={isEligibleForFree || false}
        />
      </div>

      {/* How it works section */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sky-600 font-bold">1</span>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Select Quantity</h3>
              <p className="text-sm text-slate-500 mt-1">Choose how many recruits you want to purchase</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sky-600 font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Secure Checkout</h3>
              <p className="text-sm text-slate-500 mt-1">Complete your purchase securely</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sky-600 font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Receive Recruits</h3>
              <p className="text-sm text-slate-500 mt-1">Recruits will be delivered to your dashboard</p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-slate-900">If They Don&apos;t Onboard, You Don&apos;t Pay</h3>
            <p className="text-sm text-slate-500 mt-0.5">Recruit didn&apos;t work out? We&apos;ll provide a replacement or refund, no questions asked.</p>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <PurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ ...purchaseModal, isOpen: false })}
        onConfirm={handlePurchaseConfirm}
        type={purchaseModal.type}
        quantity={purchaseModal.quantity}
        pricePerUnit={PRICES[purchaseModal.type]}
        isLoading={isPurchasing}
        isEligibleForFree={isEligibleForFree || false}
      />
    </div>
  );
}
