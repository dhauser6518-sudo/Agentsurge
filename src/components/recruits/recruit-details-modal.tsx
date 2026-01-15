"use client";

import { useState } from "react";
import { Modal, Button, Select, Badge } from "@/components/ui";
import {
  RecruitWithDisputes,
  RecruitStatus,
  RECRUIT_STATUS_LABELS,
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUS_COLORS,
  DISPUTE_REASON_LABELS,
} from "@/types";
import { formatPhoneNumber, formatDate } from "@/lib/utils";

interface RecruitDetailsModalProps {
  recruit: RecruitWithDisputes;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (recruitId: string, status: RecruitStatus) => void;
}

const statusOptions = Object.entries(RECRUIT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function RecruitDetailsModal({
  recruit,
  isOpen,
  onClose,
  onStatusChange,
}: RecruitDetailsModalProps) {
  const [status, setStatus] = useState<RecruitStatus>(recruit.status as RecruitStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async () => {
    if (status === recruit.status) return;
    setIsSaving(true);
    try {
      await onStatusChange(recruit.id, status);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recruit Details" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase">Full Name</label>
            <p className="font-medium">
              {recruit.firstName} {recruit.lastName}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Phone</label>
            <p>
              <a
                href={`tel:${recruit.phoneNumber}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {formatPhoneNumber(recruit.phoneNumber)}
              </a>
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Email</label>
            <p>
              {recruit.email ? (
                <a
                  href={`mailto:${recruit.email}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {recruit.email}
                </a>
              ) : (
                <span className="text-gray-400">Not provided</span>
              )}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">IG Handle</label>
            <p>
              {recruit.igHandle ? (
                <a
                  href={`https://instagram.com/${recruit.igHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {recruit.igHandle.startsWith('@') ? recruit.igHandle : `@${recruit.igHandle}`}
                </a>
              ) : (
                <span className="text-gray-400">Not provided</span>
              )}
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">License Status</label>
            <p>
              <Badge color={recruit.isLicensed ? "green" : "yellow"}>
                {recruit.isLicensed ? "Licensed" : "Unlicensed"}
              </Badge>
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Added</label>
            <p>{formatDate(recruit.createdAt)}</p>
          </div>
        </div>

        {/* Status */}
        <div className="border-t pt-4">
          <label className="text-xs text-gray-500 uppercase block mb-2">Status</label>
          <div className="flex items-center gap-4">
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as RecruitStatus)}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleStatusChange}
              isLoading={isSaving}
              disabled={status === recruit.status}
            >
              Update
            </Button>
          </div>
        </div>

        {/* Notes */}
        {recruit.notes && (
          <div className="border-t pt-4">
            <label className="text-xs text-gray-500 uppercase block mb-2">Notes</label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{recruit.notes}</p>
          </div>
        )}

        {/* Disputes */}
        {recruit.disputes.length > 0 && (
          <div className="border-t pt-4">
            <label className="text-xs text-gray-500 uppercase block mb-2">Disputes</label>
            <div className="space-y-2">
              {recruit.disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {DISPUTE_REASON_LABELS[dispute.reason as keyof typeof DISPUTE_REASON_LABELS]}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDate(dispute.createdAt)}
                    </span>
                  </div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
