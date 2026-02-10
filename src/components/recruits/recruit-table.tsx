"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell, Dropdown, DropdownItem } from "@/components/ui";
import { StatusBadge } from "./status-badge";
import { EditNotesModal } from "./edit-notes-modal";
import { RecruitDetailsModal } from "./recruit-details-modal";
import { DisputeModal } from "@/components/disputes/dispute-modal";
import { RecruitWithDisputes, RecruitStatus } from "@/types";
import { formatPhoneNumber } from "@/lib/utils";

interface RecruitTableProps {
  recruits: RecruitWithDisputes[];
  onStatusChange: (recruitId: string, status: RecruitStatus) => void;
  onNotesChange: (recruitId: string, notes: string) => void;
  onDisputeSubmit: (recruitId: string, reason: string, explanation: string) => void;
  onLicenseToggle?: (recruitId: string, isLicensed: boolean) => void;
  showLicenseAction?: boolean;
}

export function RecruitTable({
  recruits,
  onStatusChange,
  onNotesChange,
  onDisputeSubmit,
  onLicenseToggle,
  showLicenseAction = false,
}: RecruitTableProps) {
  const [selectedRecruit, setSelectedRecruit] = useState<RecruitWithDisputes | null>(null);
  const [modalType, setModalType] = useState<"details" | "notes" | "dispute" | null>(null);

  const openModal = (recruit: RecruitWithDisputes, type: "details" | "notes" | "dispute") => {
    setSelectedRecruit(recruit);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedRecruit(null);
    setModalType(null);
  };

  const hasPendingDispute = (recruit: RecruitWithDisputes) => {
    return recruit.disputes.some((d) => d.status === "pending_review");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell header>Full Name</TableCell>
            <TableCell header>Phone</TableCell>
            <TableCell header>Email</TableCell>
            <TableCell header>IG Handle</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recruits.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500 py-8" colSpan={6}>
                No recruits found
              </TableCell>
            </TableRow>
          ) : (
            recruits.map((recruit) => (
              <TableRow key={recruit.id}>
                <TableCell className="font-medium text-gray-900">
                  {recruit.firstName} {recruit.lastName}
                </TableCell>
                <TableCell className="text-gray-600">
                  <a
                    href={`tel:${recruit.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatPhoneNumber(recruit.phoneNumber)}
                  </a>
                </TableCell>
                <TableCell className="text-gray-600">
                  {recruit.email ? (
                    <a
                      href={`mailto:${recruit.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {recruit.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-600">
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
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={recruit.status} />
                  {hasPendingDispute(recruit) && (
                    <span className="ml-2 text-xs text-yellow-600">(Disputed)</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Dropdown
                    trigger={
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openModal(recruit, "details")}>
                      View Details
                    </DropdownItem>
                    <DropdownItem onClick={() => openModal(recruit, "notes")}>
                      Edit Notes
                    </DropdownItem>
                    {showLicenseAction && onLicenseToggle && (
                      <DropdownItem
                        onClick={() => onLicenseToggle(recruit.id, !recruit.isLicensed)}
                      >
                        {recruit.isLicensed ? "Mark as Unlicensed" : "Mark as Licensed"}
                      </DropdownItem>
                    )}
                    <DropdownItem
                      onClick={() => openModal(recruit, "dispute")}
                      disabled={hasPendingDispute(recruit)}
                      danger
                    >
                      Open Dispute
                    </DropdownItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modals */}
      {selectedRecruit && modalType === "details" && (
        <RecruitDetailsModal
          recruit={selectedRecruit}
          isOpen={true}
          onClose={closeModal}
          onStatusChange={onStatusChange}
        />
      )}

      {selectedRecruit && modalType === "notes" && (
        <EditNotesModal
          recruit={selectedRecruit}
          isOpen={true}
          onClose={closeModal}
          onSave={onNotesChange}
        />
      )}

      {selectedRecruit && modalType === "dispute" && (
        <DisputeModal
          recruit={selectedRecruit}
          isOpen={true}
          onClose={closeModal}
          onSubmit={onDisputeSubmit}
        />
      )}
    </>
  );
}
