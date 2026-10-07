"use client";

import React from "react";
import { X, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { RoomParticipant } from "@/types";

interface ParticipantPanelProps {
  participants: RoomParticipant[];
  onClose: () => void;
}

export function ParticipantPanel({ participants, onClose }: ParticipantPanelProps) {
  // Sort hosts first, then alphabetically
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === "host" && b.role !== "host") return -1;
    if (a.role !== "host" && b.role === "host") return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <div className="w-full md:w-80 h-full bg-white flex flex-col border-l border-border shadow-lg z-10 absolute md:relative right-0 top-0 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text">Participants ({participants.length})</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {sortedParticipants.map(p => (
            <li key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text truncate">
                    {p.displayName}
                  </span>
                  {p.role === "host" && (
                    <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Host</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                {p.isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-green-500" />}
                {p.isVideoOn ? <Video className="w-4 h-4 text-gray-600" /> : <VideoOff className="w-4 h-4 text-red-500" />}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-border flex gap-2">
        <button className="flex-1 py-2 text-sm font-medium border border-border rounded text-text hover:bg-gray-50 disabled:opacity-50" disabled>
          Invite
        </button>
        <button className="flex-1 py-2 text-sm font-medium border border-border rounded text-text hover:bg-gray-50 disabled:opacity-50" disabled>
          Mute All
        </button>
      </div>
    </div>
  );
}
