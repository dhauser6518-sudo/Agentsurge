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
import { StatusBadge } from "@/components/recruits/status-badge";
import { RecruitStatus } from "@/types";
import { truncateId, formatDate, formatPhoneNumber } from "@/lib/utils";

interface RecruitWithAgent {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: RecruitStatus;
  createdAt: string;
  agent: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  disputes: {
    id: string;
    status: string;
  }[];
}

export default function AdminRecruitsPage() {
  const [recruits, setRecruits] = useState<RecruitWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecruits = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/recruits");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading recruits...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">All Recruits</h1>
        <p className="text-sm text-gray-600 mt-1">
          {recruits.length} recruit{recruits.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>ID</TableCell>
              <TableCell header>Agent</TableCell>
              <TableCell header>Recruit Name</TableCell>
              <TableCell header>Phone</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Disputes</TableCell>
              <TableCell header>Created</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruits.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-gray-500 py-8" colSpan={7}>
                  No recruits found
                </TableCell>
              </TableRow>
            ) : (
              recruits.map((recruit) => {
                const agentName = recruit.agent.firstName
                  ? `${recruit.agent.firstName} ${recruit.agent.lastName || ""}`
                  : recruit.agent.email;
                const pendingDisputes = recruit.disputes.filter(
                  (d) => d.status === "pending_review"
                ).length;

                return (
                  <TableRow key={recruit.id}>
                    <TableCell className="font-mono text-gray-500">
                      {truncateId(recruit.id)}
                    </TableCell>
                    <TableCell className="text-gray-600">{agentName}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {recruit.firstName} {recruit.lastName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatPhoneNumber(recruit.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={recruit.status} />
                    </TableCell>
                    <TableCell>
                      {recruit.disputes.length > 0 ? (
                        <span className="text-sm">
                          {recruit.disputes.length} total
                          {pendingDisputes > 0 && (
                            <Badge color="yellow" className="ml-2">
                              {pendingDisputes} pending
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(recruit.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
