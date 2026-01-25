"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Badge,
  Select,
  Input,
} from "@/components/ui";
import { truncateId, formatDate } from "@/lib/utils";
import { CustomerDetailPanel } from "@/components/admin/customer-detail-panel";

interface CustomerWithCounts {
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
  _count: {
    purchases: number;
    recruits: number;
  };
}

const statusFilterOptions = [
  { value: "", label: "Active & Trial" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past Due" },
  { value: "inactive", label: "Inactive" },
];

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

export default function AdminSubscriptionsPage() {
  const [customers, setCustomers] = useState<CustomerWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customers");
      }

      setCustomers(data.data);
      setTotalCustomers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Subscriptions</h1>
        <p className="text-sm text-gray-600 mt-1">
          {totalCustomers} customer{totalCustomers !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Customer</TableCell>
              <TableCell header>Email</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Recruits</TableCell>
              <TableCell header>Purchases</TableCell>
              <TableCell header>Trial/Period Ends</TableCell>
              <TableCell header>Joined</TableCell>
              <TableCell header></TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const name = customer.firstName
                  ? `${customer.firstName} ${customer.lastName || ""}`
                  : "—";

                const endDate = customer.subscriptionStatus === "trialing"
                  ? customer.trialEndsAt
                  : customer.subscriptionPeriodEnd;

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-gray-900">
                      {name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {customer.email}
                    </TableCell>
                    <TableCell>
                      <Badge color={STATUS_COLORS[customer.subscriptionStatus] || "gray"}>
                        {STATUS_LABELS[customer.subscriptionStatus] || customer.subscriptionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {customer._count.recruits}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {customer._count.purchases}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {endDate ? formatDate(endDate) : "—"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomerId && (
        <CustomerDetailPanel
          customerId={selectedCustomerId}
          isOpen={true}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
