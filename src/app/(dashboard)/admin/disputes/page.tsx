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
} from "@/components/ui";
import { AdminDisputePanel } from "@/components/disputes/admin-dispute-panel";
import {
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUS_COLORS,
  DISPUTE_REASON_LABELS,
} from "@/types";
import { truncateId, formatDate } from "@/lib/utils";

interface DisputeWithRelations {
  id: string;
  reason: string;
  explanation: string | null;
  status: string;
  adminNotes: string | null;
  resolutionAction: string | null;
  createdAt: string;
  resolvedAt: string | null;
  recruit: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    status: string;
    notes: string | null;
  };
  agent: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDispute, setSelectedDispute] =
    useState<DisputeWithRelations | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      const url = statusFilter
        ? `/api/admin/disputes?status=${statusFilter}`
        : "/api/admin/disputes";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch disputes");
      }

      setDisputes(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load disputes");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async (
    disputeId: string,
    action: "approve" | "deny",
    adminNotes: string,
    resolutionAction?: string
  ) => {
    const response = await fetch(`/api/admin/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNotes, resolutionAction }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to resolve dispute");
    }

    fetchDisputes();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading disputes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Queue</h1>
          <p className="text-sm text-gray-600 mt-1">
            {disputes.length} dispute{disputes.length !== 1 ? "s" : ""}
          </p>
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
              <TableCell header>ID</TableCell>
              <TableCell header>Agent</TableCell>
              <TableCell header>Recruit</TableCell>
              <TableCell header>Reason</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Date</TableCell>
              <TableCell header></TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-gray-500 py-8" colSpan={7}>
                  No disputes found
                </TableCell>
              </TableRow>
            ) : (
              disputes.map((dispute) => {
                const agentName = dispute.agent.firstName
                  ? `${dispute.agent.firstName} ${dispute.agent.lastName || ""}`
                  : dispute.agent.email;

                return (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-mono text-gray-500">
                      {truncateId(dispute.id)}
                    </TableCell>
                    <TableCell className="text-gray-900">{agentName}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {dispute.recruit.firstName} {dispute.recruit.lastName}
                    </TableCell>
                    <TableCell>
                      {
                        DISPUTE_REASON_LABELS[
                          dispute.reason as keyof typeof DISPUTE_REASON_LABELS
                        ]
                      }
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={
                          DISPUTE_STATUS_COLORS[
                            dispute.status as keyof typeof DISPUTE_STATUS_COLORS
                          ] as "yellow" | "green" | "red"
                        }
                      >
                        {
                          DISPUTE_STATUS_LABELS[
                            dispute.status as keyof typeof DISPUTE_STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(dispute.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        {dispute.status === "pending_review" ? "Review" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedDispute && (
        <AdminDisputePanel
          dispute={selectedDispute}
          isOpen={true}
          onClose={() => setSelectedDispute(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
