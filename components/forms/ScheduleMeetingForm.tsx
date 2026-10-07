"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { meetingService } from "@/lib/api/meetings";
import { ScheduleMeetingInput } from "@/types";

interface ScheduleMeetingFormProps {
  onSuccess: (meetingId: string, inviteLink: string) => void;
  onCancel: () => void;
}

export function ScheduleMeetingForm({ onSuccess, onCancel }: ScheduleMeetingFormProps) {
  const [title, setTitle] = useState("New Meeting");
  const [description, setDescription] = useState("");
  
  // default to today and nearest 30 min block
  const now = new Date();
  now.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
  
  const [date, setDate] = useState(now.toISOString().split("T")[0]);
  const [time, setTime] = useState(now.toTimeString().substring(0, 5));
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const input: ScheduleMeetingInput = {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      const meeting = await meetingService.scheduleMeeting(input);
      onSuccess(meeting.meetingId, meeting.inviteLink);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to schedule meeting");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      <Input
        label="Topic"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isLoading}
      />
      
      <Input
        label="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={isLoading}
        />
        <Input
          type="time"
          label="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-text">Duration</label>
        <select 
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>1 hour</option>
          <option value={90}>1 hour 30 minutes</option>
          <option value={120}>2 hours</option>
        </select>
      </div>

      <div className="text-sm text-text-muted">
        Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </div>

      {error && (
        <div className="text-sm font-medium text-danger bg-red-50 p-3 rounded border border-red-100" role="alert">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !title}>
          {isLoading ? "Scheduling..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
