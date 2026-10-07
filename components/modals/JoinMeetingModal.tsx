"use client";

import React from "react";
import { Modal } from "./Modal";
import { JoinMeetingForm } from "../forms/JoinMeetingForm";

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Meeting">
      <JoinMeetingForm onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
