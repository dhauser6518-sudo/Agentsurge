"use client";

import { useState } from "react";
import { Modal, Button, Select, Textarea, Badge } from "@/components/ui";
import {
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUS_COLORS,
  DISPUTE_REASON_LABELS,
  RESOLUTION_ACTION_LABELS,
} from "@/types";
import { formatPhoneNumber, formatDateTime } from "@/lib/utils";

interface DisputeDetails {
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

interface AdminDisputePanelProps {
  dispute: DisputeDetails;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    disputeId: string,
    action: "approve" | "deny",
    adminNotes: string,
    resolutionAction?: string
  ) => Promise<void>;
}

const resolutionOptions = [
  { value: "", label: "Select resolution action..." },
  ...Object.entries(RESOLUTION_ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export function AdminDisputePanel({
  dispute,
  isOpen,
  onClose,
  onResolve,
}: AdminDisputePanelProps) {
  const [adminNotes, setAdminNotes] = useState(dispute.adminNotes || "");
  const [resolutionAction, setResolutionAction] = useState(
    dispute.resolutionAction || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPending = dispute.status === "pending_review";

  const handleAction = async (action: "approve" | "deny") => {
    setIsSubmitting(true);
    try {
      await onResolve(
        dispute.id,
        action,
        adminNotes,
        action === "approve" ? resolutionAction : undefined
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const agentName = dispute.agent.firstName
    ? `${dispute.agent.firstName} ${dispute.agent.lastName || ""}`
    : dispute.agent.email;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Dispute" size="lg">
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <Badge
            color={
              DISPUTE_STATUS_COLORS[
                dispute.status as keyof typeof DISPUTE_STATUS_COLORS
              ] as "yellow" | "green" | "red"
            }
          >
            {DISPUTE_STATUS_LABELS[dispute.status as keyof typeof DISPUTE_STATUS_LABELS]}
          </Badge>
          <span className="text-sm text-gray-500">
            Submitted {formatDateTime(dispute.createdAt)}
          </span>
        </div>

        {/* Agent Info */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Agent</h4>
          <p className="text-sm">{agentName}</p>
          <p className="text-xs text-gray-500">{dispute.agent.email}</p>
        </div>

        {/* Recruit Info */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recruit</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>{" "}
              {dispute.recruit.firstName} {dispute.recruit.lastName}
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>{" "}
              {formatPhoneNumber(dispute.recruit.phoneNumber)}
            </div>
          </div>
          {dispute.recruit.notes && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Agent Notes:</span>{" "}
              <span className="italic">{dispute.recruit.notes}</span>
            </div>
          )}
        </div>

        {/* Dispute Details */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Dispute Reason
          </h4>
          <p className="font-medium">
            {DISPUTE_REASON_LABELS[dispute.reason as keyof typeof DISPUTE_REASON_LABELS]}
          </p>
          {dispute.explanation && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {dispute.explanation}
            </p>
          )}
        </div>

        {/* Admin Response */}
        {isPending ? (
          <>
            <div className="border-t pt-4">
              <Textarea
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this dispute resolution..."
              />
            </div>

            <Select
              label="Resolution Action (if approving)"
              options={resolutionOptions}
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleAction("deny")}
                isLoading={isSubmitting}
              >
                Deny
              </Button>
              <Button
                onClick={() => handleAction("approve")}
                isLoading={isSubmitting}
              >
                Approve
              </Button>
            </div>
          </>
        ) : (
          <>
            {dispute.adminNotes && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {dispute.adminNotes}
                </p>
              </div>
            )}
            {dispute.resolutionAction && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Resolution Action
                </h4>
                <p className="text-sm">
                  {RESOLUTION_ACTION_LABELS[
                    dispute.resolutionAction as keyof typeof RESOLUTION_ACTION_LABELS
                  ]}
                </p>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
