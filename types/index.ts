export type MeetingStatus = "scheduled" | "live" | "ended";
export type ParticipantRole = "host" | "participant";
export type MeetingDuration = number; // minutes, 1 to 1440

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  meetingId: string; // 9 digits
  hostId: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO 8601
  timezone: string;
  duration: MeetingDuration;
  status: MeetingStatus;
  inviteLink: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface Participant {
  id: string;
  meetingId: string;
  userId: string | null;
  displayName: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt: string | null;
}

export interface RoomParticipant extends Participant {
  isMuted: boolean;
  isVideoOn: boolean;
}

export interface ScheduleMeetingInput {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
}

export interface ServiceError {
  code: "NOT_FOUND" | "VALIDATION" | "UNKNOWN";
  message: string;
}
