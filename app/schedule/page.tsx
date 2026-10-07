"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScheduleMeetingForm } from "@/components/forms/ScheduleMeetingForm";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { Button } from "@/components/ui/Button";
import { formatMeetingId } from "@/lib/meeting-utils";
import { CheckCircle2 } from "lucide-react";

export default function SchedulePage() {
  const router = useRouter();
  const [successData, setSuccessData] = useState<{ id: string, link: string } | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h1 className="text-xl font-bold">Schedule a Meeting</h1>
            </div>
            
            <div className="p-6">
              {successData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Meeting Scheduled!</h2>
                  <p className="text-text-muted mb-6">Your meeting has been successfully scheduled.</p>
                  
                  <div className="bg-gray-50 border border-border rounded-lg p-6 w-full max-w-md text-left mb-8">
                    <p className="text-sm font-medium text-text-muted mb-1">Meeting ID</p>
                    <p className="text-lg font-bold mb-4">{formatMeetingId(successData.id)}</p>
                    
                    <p className="text-sm font-medium text-text-muted mb-1">Invite Link</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 bg-white border border-border rounded px-3 py-2 text-sm truncate">
                        {successData.link}
                      </div>
                      <CopyLinkButton link={successData.link} />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => router.push("/")}>
                      Back to Dashboard
                    </Button>
                    <Button variant="primary" onClick={() => router.push(`/meeting/${successData.id}`)}>
                      Start Meeting Now
                    </Button>
                  </div>
                </div>
              ) : (
                <ScheduleMeetingForm 
                  onSuccess={(id, link) => setSuccessData({ id, link })} 
                  onCancel={() => router.push("/")} 
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
