"use client";

import React from "react";
import { Modal } from "../modals/Modal";
import { Button } from "../ui/Button";

interface LeaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isHost: boolean;
}

export function LeaveConfirmModal({ isOpen, onClose, onConfirm, isHost }: LeaveConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isHost ? "End Meeting" : "Leave Meeting"}>
      <div className="flex flex-col gap-6">
        <p className="text-text">
          {isHost 
            ? "You are the host. Do you want to end this meeting for everyone?" 
            : "Are you sure you want to leave this meeting?"}
        </p>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button variant="danger" fullWidth onClick={onConfirm}>
            {isHost ? "End Meeting for All" : "Leave Meeting"}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
