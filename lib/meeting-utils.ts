
export function formatMeetingId(id: string): string {
  if (id.length !== 9) return id;
  return `${id.slice(0, 3)} ${id.slice(3, 6)} ${id.slice(6, 9)}`;
}

export function parseMeetingInput(input: string): string | null {
  const cleanInput = input.trim();
  // Check if it's a direct ID
  const digitOnly = cleanInput.replace(/[-\s]/g, "");
  if (/^\d{9}$/.test(digitOnly)) {
    return digitOnly;
  }
  
  // Check if it's a URL
  try {
    const url = new URL(cleanInput);
    // paths can be /j/123456789 or /meeting/123456789
    const parts = url.pathname.split("/");
    const lastPart = parts[parts.length - 1];
    if (/^\d{9}$/.test(lastPart)) {
      return lastPart;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export function buildInviteLink(meetingId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/j/${meetingId}`;
  }
  return `/j/${meetingId}`;
}
