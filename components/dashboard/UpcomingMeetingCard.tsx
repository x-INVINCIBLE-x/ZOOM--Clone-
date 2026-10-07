"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Meeting } from "@/types";
import { formatMeetingId } from "@/lib/meeting-utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { CopyLinkButton } from "../ui/CopyLinkButton";
import { Modal } from "../modals/Modal";

interface UpcomingMeetingCardProps {
  meeting: Meeting;
  isHost: boolean;
}

export function UpcomingMeetingCard({ meeting, isHost }: UpcomingMeetingCardProps) {
  const router = useRouter();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isLive = meeting.status === "live";
  const date = new Date(meeting.scheduledAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const handleJoin = () => {
    // Navigate to pre-join, or if host, just route to meeting and it will auto-join
    router.push(`/meeting/${meeting.meetingId}`);
  };

  return (
    <>
      <div className="bg-white border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-shadow hover:shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-text">{meeting.title}</h3>
            {isLive ? (
              <Badge variant="success">Live</Badge>
            ) : (
              <Badge variant="neutral">Scheduled</Badge>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm text-text-muted mt-2">
            <span>{dateString}, {timeString}</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>ID: {formatMeetingId(meeting.meetingId)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="secondary" onClick={() => setIsDetailsOpen(true)} className="flex-1 md:flex-none">
            View details
          </Button>
          <Button variant={isLive ? "success" : "primary"} onClick={handleJoin} className="flex-1 md:flex-none">
            {isHost ? (isLive ? "Join" : "Start") : "Join"}
          </Button>
        </div>
      </div>

      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Meeting Details">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-muted">Topic</h4>
            <p className="text-base text-text font-medium">{meeting.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-text-muted">Time</h4>
            <p className="text-base text-text">{dateString} {timeString}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-text-muted">Meeting ID</h4>
            <p className="text-base text-text">{formatMeetingId(meeting.meetingId)}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2">Invite Link</h4>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-md">
              <span className="text-sm text-text break-all truncate mr-2">{meeting.inviteLink}</span>
              <CopyLinkButton link={meeting.inviteLink} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
