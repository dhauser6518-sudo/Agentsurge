"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "@/components/ui";
import {
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUS_COLORS,
  DISPUTE_REASON_LABELS,
} from "@/types";
import { truncateId, formatDate } from "@/lib/utils";

interface DisputeWithRecruit {
  id: string;
  reason: string;
  explanation: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  recruit: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export default function AgentDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeWithRecruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDisputes = useCallback(async () => {
    try {
      const response = await fetch("/api/disputes");
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
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
        <p className="text-sm text-gray-600 mt-1">
          {disputes.length} dispute{disputes.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>ID</TableCell>
              <TableCell header>Recruit</TableCell>
              <TableCell header>Reason</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Submitted</TableCell>
              <TableCell header>Admin Notes</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-gray-500 py-8" colSpan={6}>
                  No disputes found
                </TableCell>
              </TableRow>
            ) : (
              disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-gray-500">
                    {truncateId(dispute.id)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {dispute.recruit.firstName} {dispute.recruit.lastName}
                  </TableCell>
                  <TableCell>
                    {DISPUTE_REASON_LABELS[dispute.reason as keyof typeof DISPUTE_REASON_LABELS]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={
                        DISPUTE_STATUS_COLORS[dispute.status as keyof typeof DISPUTE_STATUS_COLORS] as
                          | "yellow"
                          | "green"
                          | "red"
                      }
                    >
                      {DISPUTE_STATUS_LABELS[dispute.status as keyof typeof DISPUTE_STATUS_LABELS]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(dispute.createdAt)}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {dispute.adminNotes || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
