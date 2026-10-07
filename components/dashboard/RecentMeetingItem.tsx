"use client";

import React from "react";
import { Meeting } from "@/types";
import { formatMeetingId } from "@/lib/meeting-utils";
import { Badge } from "../ui/Badge";

interface RecentMeetingItemProps {
  meeting: Meeting;
}

export function RecentMeetingItem({ meeting }: RecentMeetingItemProps) {
  const date = new Date(meeting.scheduledAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors gap-2">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-text">{meeting.title}</h4>
          <Badge variant="neutral" className="text-[10px]">Ended</Badge>
        </div>
        <p className="text-sm text-text-muted mt-1">
          {dateString}, {timeString}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-text-muted">
          ID: {formatMeetingId(meeting.meetingId)}
        </div>
      </div>
    </div>
  );
}
