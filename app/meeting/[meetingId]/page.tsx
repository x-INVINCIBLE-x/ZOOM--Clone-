"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PreJoinScreen } from "@/components/meeting-room/PreJoinScreen";
import { MeetingRoom } from "@/components/meeting-room/MeetingRoom";
import { meetingService } from "@/lib/api/meetings";
import { Meeting, Participant, RoomParticipant } from "@/types";
import { useMeetingsContext } from "@/components/providers/MeetingsProvider";
import { ErrorState } from "@/components/ui/EmptyState";
import { parseMeetingInput } from "@/lib/meeting-utils";
import { Navbar } from "@/components/layout/Navbar";

function MeetingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, isLoading: userLoading } = useMeetingsContext();
  
  const rawId = params.meetingId as string;
  const initialName = searchParams.get("name") || "";
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participant, setParticipant] = useState<RoomParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    
    const init = async () => {
      const parsedId = parseMeetingInput(rawId);
      if (!parsedId) {
        setError("Invalid meeting link");
        setIsLoading(false);
        return;
      }
      
      try {
        const m = await meetingService.getMeeting(parsedId);
        if (!m) {
          setError("Meeting not found");
          setIsLoading(false);
          return;
        }
        
        setMeeting(m);
        
        // If we're the host, we bypass pre-join and auto-join
        if (currentUser && m.hostId === currentUser.id) {
          const p = await meetingService.joinMeeting(parsedId, currentUser.name, currentUser.id);
          setParticipant({ ...p, isMuted: false, isVideoOn: false });
        }
        
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load meeting");
        setIsLoading(false);
      }
    };
    
    init();
  }, [rawId, currentUser, userLoading]);

  const handleJoin = async (name: string, isAudioOn: boolean, isVideoOn: boolean) => {
    if (!meeting) return;
    try {
      const p = await meetingService.joinMeeting(meeting.meetingId, name, currentUser?.id);
      setParticipant({ ...p, isMuted: !isAudioOn, isVideoOn });
    } catch (err: any) {
      alert(err.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    if (meeting && participant) {
      await meetingService.leaveMeeting(meeting.meetingId, participant.id);
    }
    router.push("/");
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="animate-pulse font-bold text-primary">Loading...</div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <ErrorState 
            title={error || "Meeting not found"} 
            description="Please check the link and try again." 
            actionLabel="Back to Home"
            onAction={() => router.push("/")}
          />
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <PreJoinScreen 
        meeting={meeting} 
        initialName={initialName || currentUser?.name || ""} 
        onJoin={handleJoin} 
      />
    );
  }

  return (
    <MeetingRoom 
      meeting={meeting} 
      currentParticipant={participant} 
      onLeave={handleLeave} 
    />
  );
}

export default function MeetingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-text">Loading...</div>}>
      <MeetingContent />
    </Suspense>
  );
}
