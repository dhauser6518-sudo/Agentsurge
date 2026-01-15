"use client";

import { useState } from "react";
import { Modal, Button, Select, Textarea } from "@/components/ui";
import { Recruit, DISPUTE_REASON_LABELS } from "@/types";

interface DisputeModalProps {
  recruit: Recruit;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (recruitId: string, reason: string, explanation: string) => void;
}

const reasonOptions = [
  { value: "", label: "Select a reason..." },
  ...Object.entries(DISPUTE_REASON_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export function DisputeModal({ recruit, isOpen, onClose, onSubmit }: DisputeModalProps) {
  const [reason, setReason] = useState<string>("");
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!reason) {
      setError("Please select a reason for the dispute.");
      return;
    }

    if (reason === "other" && !explanation.trim()) {
      setError("Please provide an explanation for 'Other' disputes.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(recruit.id, reason, explanation);
      onClose();
    } catch {
      setError("Failed to submit dispute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open Dispute">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            Disputes should only be submitted for valid reasons. Once submitted, you
            cannot edit or withdraw the dispute.
          </p>
        </div>

        <div className="text-sm">
          <span className="text-gray-500">Recruit:</span>{" "}
          <span className="font-medium">
            {recruit.firstName} {recruit.lastName}
          </span>
        </div>

        <Select
          label="Reason for Dispute"
          options={reasonOptions}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={error && !reason ? error : undefined}
        />

        <Textarea
          label={`Explanation ${reason === "other" ? "(Required)" : "(Optional)"}`}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Provide additional details about this dispute..."
          error={error && reason === "other" && !explanation.trim() ? error : undefined}
        />

        <div className="text-xs text-gray-500">
          <p>
            <strong>File upload</strong> and <strong>call reference ID</strong> features
            coming soon.
          </p>
        </div>

        {error && reason && (reason !== "other" || explanation.trim()) && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} isLoading={isSubmitting}>
            Submit Dispute
          </Button>
        </div>
      </div>
    </Modal>
  );
}
