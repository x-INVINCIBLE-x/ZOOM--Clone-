# ZOOM WEB APP CLONE, PHASE 1 PLAN

## Folder Structure

```text
app/
  layout.tsx               # Root layout (MeetingsProvider, font loading, globals.css)
  page.tsx                 # Dashboard (Tiles, Upcoming/Recent lists)
  schedule/
    page.tsx               # Schedule Meeting Form
  join/
    page.tsx               # Join Meeting Form (standalone)
  meeting/[meetingId]/
    page.tsx               # Pre-join and Meeting Room
components/
  layout/
    Navbar.tsx             # Top navigation, logo, profile dropdown
    Sidebar.tsx            # Left navigation (Home, Meetings)
  providers/
    MeetingsProvider.tsx   # Context for meetings and current user
  dashboard/
    ActionTiles.tsx        # New Meeting, Join, Schedule buttons
    UpcomingMeetingCard.tsx
    RecentMeetingItem.tsx
    MeetingDetailsModal.tsx # Shows invite link and copy button
  forms/
    JoinMeetingForm.tsx
    ScheduleMeetingForm.tsx
  meeting-room/
    PreJoinScreen.tsx
    MeetingRoom.tsx        # Main room layout
    ParticipantGrid.tsx
    ParticipantTile.tsx
    ParticipantPanel.tsx
    MeetingControls.tsx    # Bottom bar (Mute, Video, Share, Leave)
    ChatPanel.tsx
  modals/
    JoinMeetingModal.tsx
    LeaveConfirmModal.tsx
  ui/
    Button.tsx, Input.tsx, Badge.tsx, Avatar.tsx, EmptyState.tsx, ErrorState.tsx, CopyLinkButton.tsx, Toast.tsx
lib/
  api/
    meetings.ts            # meetingService
    config.ts              # API URL constants
  storage.ts               # localStorage wrapper (zoomclone:*)
  mock-data.ts             # Initial seed data
  meeting-utils.ts         # ID generation, URL parsing, invite link building
  validation.ts            # Form validation logic
types/
  index.ts                 # Domain models
```

## Domain Models (types/index.ts)

```ts
export type MeetingStatus = "scheduled" | "live" | "ended";
export type ParticipantRole = "host" | "participant";
export type MeetingDuration = number;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  meetingId: string;
  hostId: string;
  title: string;
  description: string;
  scheduledAt: string;
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
```

## Service Method Signatures (lib/api/meetings.ts)

```ts
export const meetingService = {
  createMeeting: async (hostId: string, title?: string): Promise<Meeting> => {},
  getMeeting: async (meetingId: string): Promise<Meeting | null> => {},
  getUpcomingMeetings: async (): Promise<Meeting[]> => {},
  getRecentMeetings: async (): Promise<Meeting[]> => {},
  scheduleMeeting: async (input: ScheduleMeetingInput): Promise<Meeting> => {},
  joinMeeting: async (meetingId: string, displayName: string, userId?: string): Promise<Participant> => {},
  getParticipants: async (meetingId: string): Promise<Participant[]> => {},
  leaveMeeting: async (meetingId: string, participantId: string): Promise<void> => {},
};
```

I am setting up Next.js right now and will build this out incrementally, starting with the data layer.
