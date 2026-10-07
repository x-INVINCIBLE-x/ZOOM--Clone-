"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, Users, MessageSquare, Share, MoreHorizontal, Info, Shield, LayoutGrid } from "lucide-react";
import { formatMeetingId } from "@/lib/meeting-utils";
import { Toast } from "../ui/Toast";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
  isHost: boolean;
  participantsCount: number;
  activePanel?: "none" | "participants" | "chat";
  isMicLoading?: boolean;
  isCameraLoading?: boolean;
}

export function MeetingControls({
  isMuted,
  isVideoOn,
  onToggleMute,
  onToggleVideo,
  onToggleParticipants,
  onToggleChat,
  onLeave,
  isHost,
  participantsCount,
  activePanel = "none",
  isMicLoading = false,
  isCameraLoading = false
}: MeetingControlsProps) {

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMoreMenu(false);
    };
    if (showMoreMenu) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showMoreMenu]);

  const handleShare = () => {
    setToastMessage("Screen sharing isn't available in this demo.");
  };

  const handleMore = () => {
    setToastMessage("Coming soon");
  };

  return (
    <div className="h-16 bg-room-control border-t border-gray-800 flex items-center justify-between px-2 md:px-4 text-white">
      
      {/* Left side */}
      <div className="flex items-center gap-1 md:gap-2">
        <button 
          className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] ${isMicLoading ? "opacity-50" : ""}`} 
          onClick={onToggleMute}
          aria-pressed={!isMuted}
          disabled={isMicLoading}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-5 h-5 text-red-500 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
          <span className={`text-[10px] ${isMuted ? "text-red-500" : "text-gray-300"}`}>
            {isMuted ? "Unmute" : "Mute"}
          </span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] ${isCameraLoading ? "opacity-50" : ""}`} 
          onClick={onToggleVideo}
          aria-pressed={isVideoOn}
          disabled={isCameraLoading}
          aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
        >
          {!isVideoOn ? <VideoOff className="w-5 h-5 text-red-500 mb-1" /> : <Video className="w-5 h-5 mb-1" />}
          <span className={`text-[10px] ${!isVideoOn ? "text-red-500" : "text-gray-300"}`}>
            {!isVideoOn ? "Start Video" : "Stop Video"}
          </span>
        </button>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1 md:gap-2">
        <button className="hidden md:flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] opacity-50">
          <Shield className="w-5 h-5 mb-1 text-green-500" />
          <span className="text-[10px] text-gray-300">Security</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] relative ${activePanel === "participants" ? "bg-gray-800" : ""}`}
          onClick={onToggleParticipants}
          aria-pressed={activePanel === "participants"}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-1" />
            <span className="absolute -top-2 -right-2 bg-gray-700 text-[9px] px-1 rounded-full">{participantsCount}</span>
          </div>
          <span className="text-[10px] text-gray-300">Participants</span>
        </button>

        <button 
          className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] ${activePanel === "chat" ? "bg-gray-800" : ""}`}
          onClick={onToggleChat}
          aria-pressed={activePanel === "chat"}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px] text-gray-300">Chat</span>
        </button>

        <button 
          className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px]" 
          onClick={handleShare}
        >
          <Share className="w-5 h-5 mb-1 text-green-500" />
          <span className="text-[10px] text-green-500">Share Screen</span>
        </button>

        <div className="relative hidden md:flex flex-col items-center">
          <button 
            className={`flex flex-col items-center justify-center p-2 rounded hover:bg-gray-800 cursor-pointer min-w-[60px] ${showMoreMenu ? "bg-gray-800" : ""}`}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            aria-expanded={showMoreMenu}
            aria-haspopup="true"
          >
            <MoreHorizontal className="w-5 h-5 mb-1" />
            <span className="text-[10px] text-gray-300">More</span>
          </button>
          
          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded shadow-lg py-1 w-48 z-50 text-text">
                <button 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setToastMessage("Recording coming soon");
                  }}
                >
                  Record
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setToastMessage("Reactions coming soon");
                  }}
                >
                  Reactions
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center">
        <button 
          onClick={onLeave}
          className="bg-danger hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded"
        >
          {isHost ? "End" : "Leave"}
        </button>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
