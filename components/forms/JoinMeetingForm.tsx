"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { parseMeetingInput } from "@/lib/meeting-utils";
import { meetingService } from "@/lib/api/meetings";
import { useMeetingsContext } from "../providers/MeetingsProvider";

interface JoinMeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialMeetingId?: string;
}

export function JoinMeetingForm({ onSuccess, onCancel, initialMeetingId = "" }: JoinMeetingFormProps) {
  const router = useRouter();
  const { currentUser } = useMeetingsContext();
  
  const [meetingInput, setMeetingInput] = useState(initialMeetingId);
  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    const parsedId = parseMeetingInput(meetingInput);
    if (!parsedId) {
      setError("Please enter a valid Meeting ID or personal link");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const meeting = await meetingService.getMeeting(parsedId);
      if (!meeting) {
        setError("Meeting not found. Check the ID and try again.");
        setIsLoading(false);
        return;
      }
      
      // We do NOT join the meeting here. We route to the pre-join screen,
      // EXCEPT if we are the host. If we are the host, we join directly.
      if (currentUser && meeting.hostId === currentUser.id) {
        await meetingService.joinMeeting(parsedId, currentUser.name, currentUser.id);
        router.push(`/meeting/${parsedId}`);
      } else {
        // Go to pre-join
        // We can pass displayName via query param to pre-fill
        router.push(`/meeting/${parsedId}?name=${encodeURIComponent(displayName)}`);
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Meeting ID or Personal Link Name"
        value={meetingInput}
        onChange={(e) => setMeetingInput(e.target.value)}
        placeholder="Enter Meeting ID or link"
        disabled={isLoading || !!initialMeetingId}
        required
      />
      
      <Input
        label="Your Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Enter your name"
        disabled={isLoading}
        required
      />

      {error && (
        <div className="text-sm font-medium text-danger bg-red-50 p-3 rounded border border-red-100" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end mt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading || !meetingInput || !displayName}>
          {isLoading ? "Joining..." : "Join"}
        </Button>
      </div>
    </form>
  );
}
