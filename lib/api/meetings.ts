import { Meeting, Participant, ScheduleMeetingInput } from "@/types";
import { apiClient } from "./client";

export const meetingService = {
  createMeeting: async (hostId: string, title?: string): Promise<Meeting> => {
    return apiClient<Meeting>("/meetings", {
      method: "POST",
      body: JSON.stringify({ hostId, title }),
    });
  },

  getMeeting: async (meetingId: string): Promise<Meeting | null> => {
    try {
      return await apiClient<Meeting>(`/meetings/${meetingId}`, {
        method: "GET",
      });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return null;
      throw e;
    }
  },

  getUpcomingMeetings: async (): Promise<Meeting[]> => {
    return apiClient<Meeting[]>("/meetings/upcoming", { method: "GET" });
  },

  getRecentMeetings: async (): Promise<Meeting[]> => {
    return apiClient<Meeting[]>("/meetings/recent", { method: "GET" });
  },

  scheduleMeeting: async (input: ScheduleMeetingInput): Promise<Meeting> => {
    // Combine date and time
    let scheduledAtStr = new Date().toISOString();
    try {
      const dateTimeStr = `${input.date}T${input.time}:00`;
      scheduledAtStr = new Date(dateTimeStr).toISOString();
    } catch {
      // The backend validates scheduled_at
    }

    return apiClient<Meeting>("/meetings/schedule", {
      method: "POST",
      body: JSON.stringify({
        hostId: "u_1", // Default host
        title: input.title.trim(),
        description: input.description.trim(),
        scheduledAt: scheduledAtStr,
        timezone: input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        duration: input.duration,
      }),
    });
  },

  joinMeeting: async (meetingId: string, displayName: string, userId?: string): Promise<Participant> => {
    return apiClient<Participant>(`/meetings/${meetingId}/join`, {
      method: "POST",
      body: JSON.stringify({ displayName, userId }),
    });
  },

  getParticipants: async (meetingId: string): Promise<Participant[]> => {
    return apiClient<Participant[]>(`/meetings/${meetingId}/participants`, { method: "GET" });
  },

  leaveMeeting: async (meetingId: string, participantId: string): Promise<void> => {
    await apiClient<void>(`/meetings/${meetingId}/leave`, {
      method: "POST",
      body: JSON.stringify({ participantId }),
    });
  },
};
