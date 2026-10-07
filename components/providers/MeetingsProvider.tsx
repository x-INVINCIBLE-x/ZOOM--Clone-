"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { Toast } from "../ui/Toast";

interface MeetingsContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wakingMsg, setWakingMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleWaking = () => setWakingMsg("Waking up the server, this can take up to a minute...");
    window.addEventListener("zoomclone:wakingup", handleWaking);
    return () => window.removeEventListener("zoomclone:wakingup", handleWaking);
  }, []);

  useEffect(() => {
    // Phase 2: Use fixed default user matching the backend seed
    setCurrentUser({
      id: "u_1",
      name: "Priya Sharma",
      email: "priya.sharma@acmecorp.com",
      avatarColor: "#0B5CFF",
      createdAt: new Date().toISOString()
    });
    
    setIsLoading(false);
  }, []);

  return (
    <MeetingsContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
      {wakingMsg && <Toast message={wakingMsg} onClose={() => setWakingMsg(null)} duration={10000} />}
    </MeetingsContext.Provider>
  );
}

export function useMeetingsContext() {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error("useMeetingsContext must be used within a MeetingsProvider");
  }
  return context;
}
