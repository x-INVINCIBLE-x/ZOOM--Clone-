import { ServiceError } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error implements ServiceError {
  code: ServiceError["code"];
  constructor(code: ServiceError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

// Fire-and-forget wake up
if (typeof window !== "undefined" && !(window as any).__wokeServer) {
  (window as any).__wokeServer = true;
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}

export async function apiClient<T>(endpoint: string, options?: RequestInit, isRetry = false): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 60000);
  
  // 3-second warning timer
  let warningTimer: NodeJS.Timeout | null = null;
  if (typeof window !== "undefined") {
    warningTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("zoomclone:wakingup"));
    }, 3000);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        throw new ApiError("UNKNOWN", "An unknown network error occurred");
      }
      
      const code = (errorData.code && ["NOT_FOUND", "VALIDATION", "UNKNOWN"].includes(errorData.code)) 
        ? errorData.code 
        : "UNKNOWN";
        
      throw new ApiError(code, errorData.message || "An error occurred");
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Auto retry once on network failure or timeout
    if (!isRetry) {
      return apiClient<T>(endpoint, options, true);
    }
    
    throw new ApiError("UNKNOWN", "The server didn't respond. Please check your connection and try again.");
  } finally {
    clearTimeout(id);
    if (warningTimer) clearTimeout(warningTimer);
  }
}
