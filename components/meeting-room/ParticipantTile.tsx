"use client";

import React from "react";
import { MicOff } from "lucide-react";
import { RoomParticipant } from "@/types";

interface ParticipantTileProps {
  participant: RoomParticipant;
  isSpeaking?: boolean;
}

const colors = ["#0B5CFF", "#FF742E", "#10B981", "#8B5CF6", "#F59E0B"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ParticipantTile({ participant, isSpeaking = false }: ParticipantTileProps) {
  const initials = participant.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
    
  const bgColor = getAvatarColor(participant.displayName);

  return (
    <div 
      className={`relative w-full h-full bg-room-tile rounded-lg overflow-hidden flex items-center justify-center border-2 transition-colors ${
        isSpeaking ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "border-transparent"
      }`}
    >
      {!participant.isVideoOn ? (
        <div 
          className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-md"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-500">
          <span className="text-sm">Video Stream</span>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium">
        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
        <span className="truncate max-w-[150px]">{participant.displayName}</span>
        {participant.role === "host" && (
          <span className="text-[10px] text-gray-300 ml-1">(Host)</span>
        )}
      </div>
    </div>
  );
}
