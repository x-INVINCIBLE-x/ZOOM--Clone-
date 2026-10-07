"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { JoinMeetingForm } from "@/components/forms/JoinMeetingForm";
import { Navbar } from "@/components/layout/Navbar";

export default function JoinPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-border shadow-md w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Join Meeting</h1>
          <JoinMeetingForm 
            onCancel={() => router.push("/")} 
          />
        </div>
      </div>
    </div>
  );
}
