"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, PlusSquare, Calendar as CalendarIcon, ArrowUpSquare, Edit, ChevronDown } from "lucide-react";
import { meetingService } from "@/lib/api/meetings";
import { useMeetingsContext } from "../providers/MeetingsProvider";
import { JoinMeetingModal } from "../modals/JoinMeetingModal";

export function ActionTiles() {
  const router = useRouter();
  const { currentUser } = useMeetingsContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleNewMeeting = async () => {
    if (!currentUser) return;
    setIsCreating(true);
    try {
      const meeting = await meetingService.createMeeting(currentUser.id, `${currentUser.name}'s Zoom Meeting`);
      // Join as host immediately
      await meetingService.joinMeeting(meeting.meetingId, currentUser.name, currentUser.id);
      router.push(`/meeting/${meeting.meetingId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create meeting");
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-3xl mx-auto mb-10">
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleNewMeeting}
            disabled={isCreating || !currentUser}
            aria-label="New meeting"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-orange hover:bg-orange/90 text-white flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:hover:scale-100"
          >
            <Video className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
          </button>
          <div className="flex items-center text-sm font-medium text-text cursor-pointer hover:text-primary">
            New meeting <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            aria-label="Join"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-primary hover:bg-primary/90 text-white flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <PlusSquare className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
          </button>
          <div className="text-sm font-medium text-text">Join</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => router.push("/schedule")}
            aria-label="Schedule"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-primary hover:bg-primary/90 text-white flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <CalendarIcon className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
          </button>
          <div className="text-sm font-medium text-text">Schedule</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            disabled
            title="Coming soon"
            aria-label="Share screen"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-primary text-white flex flex-col items-center justify-center shadow-sm opacity-60 cursor-not-allowed"
          >
            <ArrowUpSquare className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
          </button>
          <div className="text-sm font-medium text-text opacity-60">Share screen</div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            disabled
            title="Coming soon"
            aria-label="My Notes"
            className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-primary text-white flex flex-col items-center justify-center shadow-sm opacity-60 cursor-not-allowed"
          >
            <Edit className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
          </button>
          <div className="text-sm font-medium text-text opacity-60">My Notes</div>
        </div>
      </div>

      <JoinMeetingModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </>
  );
}
