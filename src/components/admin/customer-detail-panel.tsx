"use client";

import { useState, useEffect } from "react";
import { Modal, Badge, Button } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";

interface CustomerDetails {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  stripeCustomerId: string | null;
  subscriptionStatus: string;
  subscriptionId: string | null;
  subscriptionPeriodEnd: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  purchases: Array<{
    id: string;
    type: string;
    amountCents: number;
    status: string;
    createdAt: string;
    recruit: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      status: string;
    } | null;
  }>;
  orders: Array<{
    id: string;
    quantity: number;
    amountCents: number;
    status: string;
    metadata: string | null;
    createdAt: string;
  }>;
  recruits: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    status: string;
    createdAt: string;
  }>;
  disputes: Array<{
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    recruit: {
      firstName: string;
      lastName: string;
    } | null;
  }>;
}

interface CustomerStats {
  totalPurchases: number;
  totalSpent: number;
  totalRecruits: number;
  totalDisputes: number;
  pendingDisputes: number;
}

interface CustomerDetailPanelProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, "green" | "blue" | "yellow" | "red" | "gray"> = {
  active: "green",
  trialing: "blue",
  past_due: "yellow",
  inactive: "gray",
  canceled: "red",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past Due",
  inactive: "Inactive",
  canceled: "Canceled",
};

type TabType = "overview" | "recruits" | "orders" | "disputes";

export function CustomerDetailPanel({
  customerId,
  isOpen,
  onClose,
}: CustomerDetailPanelProps) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchCustomer = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/subscriptions/${customerId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch customer");
        }

        setCustomer(data.user);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load customer");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, isOpen]);

  const name = customer?.firstName
    ? `${customer.firstName} ${customer.lastName || ""}`
    : customer?.email || "Customer";

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "recruits", label: `Recruits (${customer?.recruits?.length || 0})` },
    { id: "orders", label: `Orders (${customer?.orders?.length || 0})` },
    { id: "disputes", label: `Disputes (${customer?.disputes?.length || 0})` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={name} size="xl">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading customer details...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : customer ? (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <Badge
              color={STATUS_COLORS[customer.subscriptionStatus] || "gray"}
              size="lg"
            >
              {STATUS_LABELS[customer.subscriptionStatus] || customer.subscriptionStatus}
            </Badge>
            {customer.subscriptionStatus === "trialing" && customer.trialEndsAt && (
              <span className="text-sm text-gray-500">
                Trial ends {formatDate(customer.trialEndsAt)}
              </span>
            )}
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-gray-900 mt-1">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                <p className="text-sm text-gray-900 mt-1">
                  {customer.firstName
                    ? `${customer.firstName} ${customer.lastName || ""}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Joined</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalRecruits}</p>
                <p className="text-xs text-blue-600">Recruits</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">${(stats.totalSpent / 100).toFixed(0)}</p>
                <p className="text-xs text-green-600">Total Spent</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{customer.orders?.length || 0}</p>
                <p className="text-xs text-purple-600">Orders</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.pendingDisputes}</p>
                <p className="text-xs text-orange-600">Open Disputes</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Subscription Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <span className="font-medium">
                        {STATUS_LABELS[customer.subscriptionStatus] || customer.subscriptionStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stripe ID:</span>{" "}
                      <span className="font-mono text-xs">{customer.stripeCustomerId || "—"}</span>
                    </div>
                    {customer.subscriptionPeriodEnd && (
                      <div>
                        <span className="text-gray-500">Period Ends:</span>{" "}
                        <span className="font-medium">{formatDate(customer.subscriptionPeriodEnd)}</span>
                      </div>
                    )}
                    {customer.trialEndsAt && (
                      <div>
                        <span className="text-gray-500">Trial Ends:</span>{" "}
                        <span className="font-medium">{formatDate(customer.trialEndsAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {customer.orders?.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium">Order</span>
                          <span className="text-gray-500"> x{order.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${(order.amountCents / 100).toFixed(2)}</span>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    {(!customer.orders || customer.orders.length === 0) && (
                      <p className="text-sm text-gray-500 py-4 text-center">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "recruits" && (
              <div className="space-y-2">
                {customer.recruits?.map((recruit) => (
                  <div key={recruit.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">
                        {recruit.firstName} {recruit.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{recruit.email || recruit.phoneNumber || "—"}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        color={recruit.status === "new" ? "blue" : recruit.status === "contacted" ? "yellow" : "green"}
                        size="sm"
                      >
                        {recruit.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(recruit.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {(!customer.recruits || customer.recruits.length === 0) && (
                  <p className="text-sm text-gray-500 py-8 text-center">No recruits assigned</p>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-2">
                {customer.orders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">
                        Order <span className="text-gray-500">x{order.quantity}</span>
                      </p>
                      <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${(order.amountCents / 100).toFixed(2)}</p>
                      <Badge
                        color={order.status === "completed" ? "green" : order.status === "pending" ? "yellow" : "gray"}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!customer.orders || customer.orders.length === 0) && (
                  <p className="text-sm text-gray-500 py-8 text-center">No orders yet</p>
                )}
              </div>
            )}

            {activeTab === "disputes" && (
              <div className="space-y-2">
                {customer.disputes?.map((dispute) => (
                  <div key={dispute.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">
                        {dispute.recruit
                          ? `${dispute.recruit.firstName} ${dispute.recruit.lastName}`
                          : "Unknown Recruit"}
                      </p>
                      <p className="text-sm text-gray-500">{dispute.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        color={
                          dispute.status === "pending_review"
                            ? "yellow"
                            : dispute.status === "approved"
                            ? "green"
                            : "red"
                        }
                        size="sm"
                      >
                        {dispute.status === "pending_review" ? "Pending" : dispute.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(dispute.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {(!customer.disputes || customer.disputes.length === 0) && (
                  <p className="text-sm text-gray-500 py-8 text-center">No disputes filed</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
