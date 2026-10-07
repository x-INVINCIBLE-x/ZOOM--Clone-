"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useMeetingsContext } from "@/components/providers/MeetingsProvider";
import { meetingService } from "@/lib/api/meetings";
import { Meeting } from "@/types";
import { UpcomingMeetingCard } from "@/components/dashboard/UpcomingMeetingCard";
import { RecentMeetingItem } from "@/components/dashboard/RecentMeetingItem";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function MeetingsPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useMeetingsContext();
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "previous">("upcoming");

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      setFetchError(null);
      try {
        const upcomingData = await meetingService.getUpcomingMeetings();
        const recentData = await meetingService.getRecentMeetings();
        setUpcoming(upcomingData);
        setRecent(recentData);
      } catch (err: any) {
        console.error("Failed to fetch meetings", err);
        setFetchError(err.message || "Failed to load meetings");
      } finally {
        setMeetingsLoading(false);
      }
    };

    if (!isLoading) {
      fetchMeetings();
    }
  }, [isLoading]);

  if (isLoading || meetingsLoading) {
    return (
      <div className="flex h-screen w-full bg-background items-center justify-center">
        <div className="animate-pulse text-primary font-bold">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "previous", label: "Previous" },
    { id: "personal", label: "Personal Room", disabled: true },
    { id: "templates", label: "Meeting Templates", disabled: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
              <Button variant="primary" onClick={() => router.push("/schedule")} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Schedule a meeting
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border mb-6 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-text-muted hover:text-text hover:bg-gray-50 border-b-2 border-transparent"
                  } ${tab.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}`}
                  title={tab.disabled ? "Coming soon" : ""}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div>
              {fetchError ? (
                <div className="mt-4">
                  <ErrorState 
                    title="Failed to load meetings" 
                    description={fetchError} 
                    actionLabel="Retry"
                    onAction={() => window.location.reload()}
                  />
                </div>
              ) : activeTab === "upcoming" && (
                <div>
                  {upcoming.length > 0 ? (
                    <div className="space-y-4">
                      {upcoming.map((meeting) => (
                        <UpcomingMeetingCard 
                          key={meeting.id} 
                          meeting={meeting} 
                          isHost={currentUser?.id === meeting.hostId} 
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      title="No upcoming meetings"
                      description="You don't have any upcoming meetings scheduled."
                      actionLabel="Schedule a meeting"
                      onAction={() => router.push("/schedule")}
                    />
                  )}
                </div>
              )}

              {activeTab === "previous" && (
                <div>
                  {recent.length > 0 ? (
                    <div className="bg-white border border-border rounded-lg p-4">
                      {recent.map((meeting) => (
                        <RecentMeetingItem key={meeting.id} meeting={meeting} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      title="No previous meetings"
                      description="You don't have any recent meetings."
                    />
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
