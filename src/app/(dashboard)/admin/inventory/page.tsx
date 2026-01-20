"use client";

import { useState, useEffect } from "react";

interface InventoryCounts {
  unlicensed: number;
  licensed: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryCounts>({ unlicensed: 0, licensed: 0 });
  const [addUnlicensed, setAddUnlicensed] = useState(0);
  const [addLicensed, setAddLicensed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/admin/inventory");
      const data = await response.json();
      if (response.ok) {
        setInventory(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInventory = async (type: "unlicensed" | "licensed") => {
    const quantity = type === "unlicensed" ? addUnlicensed : addLicensed;
    if (quantity <= 0) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: `Added ${quantity} ${type} recruits to inventory` });
        setInventory(data.inventory);
        if (type === "unlicensed") setAddUnlicensed(0);
        else setAddLicensed(0);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update inventory" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update inventory" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetInventory = async (type: "unlicensed" | "licensed", count: number) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, count }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: `Set ${type} inventory to ${count}` });
        setInventory(data.inventory);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update inventory" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update inventory" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Manage available recruit inventory</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current Inventory */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Unlicensed Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Unlicensed Recruits</h2>
              <p className="text-sm text-gray-500">Ages 18-25, ready to get licensed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-4">{inventory.unlicensed}</div>

          {/* Add Inventory */}
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min="0"
              value={addUnlicensed}
              onChange={(e) => setAddUnlicensed(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Quantity to add"
            />
            <button
              onClick={() => handleAddInventory("unlicensed")}
              disabled={isSaving || addUnlicensed <= 0}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Quick Set */}
          <div className="flex gap-2 flex-wrap">
            {[0, 10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => handleSetInventory("unlicensed", num)}
                disabled={isSaving}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Set to {num}
              </button>
            ))}
          </div>
        </div>

        {/* Licensed Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Licensed Recruits</h2>
              <p className="text-sm text-gray-500">Ages 18-30, already licensed</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-4">{inventory.licensed}</div>

          {/* Add Inventory */}
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min="0"
              value={addLicensed}
              onChange={(e) => setAddLicensed(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Quantity to add"
            />
            <button
              onClick={() => handleAddInventory("licensed")}
              disabled={isSaving || addLicensed <= 0}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Quick Set */}
          <div className="flex gap-2 flex-wrap">
            {[0, 10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => handleSetInventory("licensed", num)}
                disabled={isSaving}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Set to {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-6">
        <h3 className="font-semibold text-sky-900 mb-2">How Inventory Works</h3>
        <ul className="text-sm text-sky-800 space-y-1">
          <li>• When you add inventory, placeholder recruit records are created in the pool</li>
          <li>• When an agent purchases a recruit, one is assigned from the pool and marked as unavailable</li>
          <li>• You should update real recruit details (name, phone, email) before delivery</li>
          <li>• Use "Set to X" buttons to quickly adjust inventory levels</li>
        </ul>
      </div>
    </div>
  );
}
