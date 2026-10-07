"use client";

import React, { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";
import { RoomParticipant } from "@/types";
import { LocalMediaContext } from "@/hooks/useLocalMedia";

interface ParticipantTileProps {
  participant: RoomParticipant;
  isSpeaking?: boolean;
  isCurrentUser?: boolean;
}

const colors = ["#0B5CFF", "#FF742E", "#10B981", "#8B5CF6", "#F59E0B"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ParticipantTile({ participant, isSpeaking = false, isCurrentUser = false }: ParticipantTileProps) {
  const initials = participant.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
    
  const bgColor = getAvatarColor(participant.displayName);
  
  // We must always call hooks unconditionally
  const localMedia = React.useContext(LocalMediaContext);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const showVideo = isCurrentUser ? localMedia?.isCameraOn : participant.isVideoOn;
  const showMuted = isCurrentUser ? !localMedia?.isMicOn : participant.isMuted;
  
  // If current user is speaking based on micLevel
  const localMicLevel = localMedia?.micLevel || 0;
  const actuallySpeaking = isCurrentUser ? (localMicLevel > 0.05) : isSpeaking;

  useEffect(() => {
    if (isCurrentUser && showVideo && videoRef.current && localMedia?.videoStream) {
      videoRef.current.srcObject = localMedia.videoStream;
    }
  }, [isCurrentUser, showVideo, localMedia?.videoStream]);

  return (
    <div 
      className={`relative w-full h-full bg-room-tile rounded-lg overflow-hidden flex items-center justify-center border-2 transition-colors ${
        actuallySpeaking ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "border-transparent"
      }`}
    >
      {!showVideo ? (
        <div 
          className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-md"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      ) : (
        <div className="absolute inset-0 bg-black flex items-center justify-center text-gray-500">
          {isCurrentUser ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
              style={{ transform: "scaleX(-1)" }} 
            />
          ) : (
            <span className="text-sm">Video Stream</span>
          )}
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium z-10">
        {showMuted && <MicOff className="w-3 h-3 text-red-500" />}
        {!showMuted && isCurrentUser && localMicLevel > 0 && (
          <div className="flex items-end h-3 gap-0.5" aria-hidden="true">
            <div className="w-0.5 bg-green-500 transition-all duration-75" style={{ height: Math.max(2, localMicLevel * 12) + "px" }} />
            <div className="w-0.5 bg-green-500 transition-all duration-75" style={{ height: Math.max(2, (localMicLevel * 12) * 0.7) + "px" }} />
            <div className="w-0.5 bg-green-500 transition-all duration-75" style={{ height: Math.max(2, (localMicLevel * 12) * 0.4) + "px" }} />
          </div>
        )}
        <span className="truncate max-w-[150px]">{participant.displayName}</span>
        {participant.role === "host" && (
          <span className="text-[10px] text-gray-300 ml-1">(Host)</span>
        )}
      </div>
    </div>
  );
}
