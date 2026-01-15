"use client";

import { useState } from "react";
import { Modal, Button, Textarea } from "@/components/ui";
import { Recruit } from "@/types";

interface EditNotesModalProps {
  recruit: Recruit;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recruitId: string, notes: string) => void;
}

export function EditNotesModal({ recruit, isOpen, onClose, onSave }: EditNotesModalProps) {
  const [notes, setNotes] = useState(recruit.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(recruit.id, notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Notes">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Recruit:</span> {recruit.firstName} {recruit.lastName}
        </div>

        <Textarea
          label="Internal Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this recruit..."
          rows={6}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Notes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
