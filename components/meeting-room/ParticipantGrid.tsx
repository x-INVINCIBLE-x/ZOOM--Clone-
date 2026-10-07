"use client";

import React, { useMemo } from "react";
import { RoomParticipant } from "@/types";
import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  participants: RoomParticipant[];
  speakingParticipantId?: string | null;
}

import { useMeetingsContext } from "../providers/MeetingsProvider";

export function ParticipantGrid({ participants, speakingParticipantId }: ParticipantGridProps) {
  const { currentUser } = useMeetingsContext();
  const count = participants.length;
  
  // Calculate grid layout based on number of participants
  const gridClass = useMemo(() => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-3 md:grid-cols-4 lg:grid-cols-5"; // 10+
  }, [count]);

  return (
    <div className={`w-full h-full p-2 md:p-4 grid gap-2 md:gap-4 ${gridClass} content-center`}>
      {participants.slice(0, 25).map((p) => (
        <div key={p.id} className="w-full h-full min-h-[150px] max-h-[800px] flex items-center justify-center">
          <ParticipantTile 
            participant={p} 
            isSpeaking={p.id === speakingParticipantId}
            isCurrentUser={currentUser?.id === p.id}
          />
        </div>
      ))}
    </div>
  );
}
