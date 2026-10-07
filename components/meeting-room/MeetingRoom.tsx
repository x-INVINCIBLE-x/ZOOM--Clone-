"use client";

import React, { useEffect, useState } from "react";
import { Meeting, RoomParticipant } from "@/types";
import { formatMeetingId } from "@/lib/meeting-utils";
import { MeetingControls } from "./MeetingControls";
import { ParticipantGrid } from "./ParticipantGrid";
import { ParticipantPanel } from "./ParticipantPanel";
import { ChatPanel } from "./ChatPanel";
import { LeaveConfirmModal } from "../modals/LeaveConfirmModal";
import { Shield, Info } from "lucide-react";
import { meetingService } from "@/lib/api/meetings";
import { CopyLinkButton } from "../ui/CopyLinkButton";
import { useLocalMediaContext } from "@/hooks/useLocalMedia";

interface MeetingRoomProps {
  meeting: Meeting;
  currentParticipant: RoomParticipant;
  onLeave: () => void;
}

export function MeetingRoom({ meeting, currentParticipant, onLeave }: MeetingRoomProps) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([currentParticipant]);
  const [activePanel, setActivePanel] = useState<"none" | "participants" | "chat">("none");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const {
    isCameraOn, isMicOn, toggleCamera, toggleMic, isCameraLoading, isMicLoading, videoStream, micLevel
  } = useLocalMediaContext();

  const isHost = currentParticipant.role === "host";

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch initial participants
    const fetchParticipants = async () => {
      try {
        const parts = await meetingService.getParticipants(meeting.meetingId);
        // Combine with local state, mapping to RoomParticipant
        const roomParts: RoomParticipant[] = parts.map(p => ({
          ...p,
          isMuted: p.id === currentParticipant.id ? !isMicOn : true,
          isVideoOn: p.id === currentParticipant.id ? isCameraOn : false,
        }));
        
        // Ensure current participant is always in the list with up-to-date state
        const filteredParts = roomParts.filter(p => p.id !== currentParticipant.id);
        const updatedCurrent = { ...currentParticipant, isMuted: !isMicOn, isVideoOn: isCameraOn };
        
        setParticipants([updatedCurrent, ...filteredParts]);
      } catch (err) {
        console.error("Failed to load participants", err);
      }
    };
    
    fetchParticipants();
    
    // In a real app we'd poll or use WebSockets. Here we'll just poll every 3s for demo purposes.
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [meeting.meetingId, currentParticipant, isMicOn, isCameraOn]);

  const togglePanel = (panel: "participants" | "chat") => {
    setActivePanel(prev => prev === panel ? "none" : panel);
  };



  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-room-bg overflow-hidden text-white">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-black/60 rounded px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-black/80" onClick={() => setShowInfo(!showInfo)}>
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Zoom Meeting</span>
            <Info className="w-4 h-4 text-gray-400 ml-1" />
          </div>
          
          <div className="bg-black/60 rounded px-3 py-1.5 flex items-center">
            <span className="text-sm font-medium">{formatTime(elapsedSeconds)}</span>
          </div>
          
          {showInfo && (
            <div className="absolute top-12 left-4 bg-white text-text p-4 rounded shadow-lg w-80 z-20 pointer-events-auto">
              <h3 className="font-bold text-lg mb-4">{meeting.title}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-muted font-medium">Meeting ID</p>
                  <p className="text-sm font-medium">{formatMeetingId(meeting.meetingId)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium">Host</p>
                  <p className="text-sm font-medium">{meeting.hostId}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium">Invite Link</p>
                  <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 border border-border rounded">
                    <span className="text-xs truncate mr-2">{meeting.inviteLink}</span>
                    <CopyLinkButton link={meeting.inviteLink} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative flex items-center justify-center pt-12 pb-2">
          <ParticipantGrid participants={participants} speakingParticipantId={isMicOn ? currentParticipant.id : null} />
        </div>
        
        {/* Side Panels */}
        {activePanel === "participants" && (
          <ParticipantPanel 
            participants={participants} 
            onClose={() => setActivePanel("none")} 
          />
        )}
        
        {activePanel === "chat" && (
          <ChatPanel 
            currentUserName={currentParticipant.displayName}
            onClose={() => setActivePanel("none")} 
          />
        )}
      </div>

      {/* Bottom Controls */}
      <MeetingControls
        isMuted={!isMicOn}
        isVideoOn={isCameraOn}
        onToggleMute={toggleMic}
        onToggleVideo={toggleCamera}
        isMicLoading={isMicLoading}
        isCameraLoading={isCameraLoading}
        onToggleParticipants={() => togglePanel("participants")}
        onToggleChat={() => togglePanel("chat")}
        onLeave={() => setIsLeaveModalOpen(true)}
        isHost={isHost}
        participantsCount={participants.length}
        activePanel={activePanel}
      />

      <LeaveConfirmModal 
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={onLeave}
        isHost={isHost}
      />
    </div>
  );
}
