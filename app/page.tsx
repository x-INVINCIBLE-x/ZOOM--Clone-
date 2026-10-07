"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ActionTiles } from "@/components/dashboard/ActionTiles";
import { UpcomingMeetingCard } from "@/components/dashboard/UpcomingMeetingCard";
import { RecentMeetingItem } from "@/components/dashboard/RecentMeetingItem";
import { useMeetingsContext } from "@/components/providers/MeetingsProvider";
import { meetingService } from "@/lib/api/meetings";
import { Meeting } from "@/types";
import { Calendar, Info, Plus, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ErrorState } from "@/components/ui/EmptyState";

export default function Dashboard() {
  const { currentUser, isLoading } = useMeetingsContext();
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const router = useRouter();

  // Mock time state
  const [time, setTime] = useState<Date>(new Date());
  
  // UI preferences state
  const [showCalendarBanner, setShowCalendarBanner] = useState(true);
  const [showGetStarted, setShowGetStarted] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    import("@/lib/ui-preferences").then(({ uiPreferences }) => {
      setShowCalendarBanner(uiPreferences.get("showCalendarBanner", true));
      setShowGetStarted(uiPreferences.get("showGetStarted", true));
    });
  }, []);

  const dismissCalendarBanner = () => {
    setShowCalendarBanner(false);
    import("@/lib/ui-preferences").then(({ uiPreferences }) => uiPreferences.set("showCalendarBanner", false));
  };

  const dismissGetStarted = () => {
    setShowGetStarted(false);
    import("@/lib/ui-preferences").then(({ uiPreferences }) => uiPreferences.set("showGetStarted", false));
  };

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

  const todayStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-1 text-gray-800">{timeStr}</h1>
              <p className="text-sm text-text-muted">{todayStr}</p>
            </div>

            <ActionTiles />
            
            <div className="w-full mt-4 flex flex-col gap-4 relative">
              {/* Calendar connection banner */}
              {showCalendarBanner && (
                <div className="flex items-start md:items-center justify-between p-3 px-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <span>You haven&apos;t connected your calendar yet. <button className="text-primary hover:underline cursor-pointer">Connect now</button> to manage all your meetings and events in one place.</span>
                  </div>
                  <button onClick={dismissCalendarBanner} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upcoming / Calendar Section Box */}
              <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm min-h-[400px] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <button className="p-1 hover:bg-gray-100 rounded-md" aria-label="Add" title="Coming soon">
                    <Plus className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  <button className="flex items-center gap-1 font-semibold text-sm hover:bg-gray-50 px-3 py-1.5 rounded-md" title="Coming soon">
                    Today, {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  <button className="p-1 hover:bg-gray-100 rounded-md text-gray-500" aria-label="More options" title="Coming soon">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Subheader */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600 border border-gray-200 rounded px-2 py-1">
                    <Calendar className="w-4 h-4" />
                    Today
                  </div>
                  <div className="flex items-center">
                    <button className="p-1 hover:bg-gray-100 rounded-l border border-gray-200 border-r-0 text-gray-400" title="Coming soon">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-r border border-gray-200 text-gray-400" title="Coming soon">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 p-4 bg-gray-50/30 overflow-y-auto">
                  {fetchError ? (
                    <ErrorState 
                      title="Failed to load meetings" 
                      description={fetchError} 
                      actionLabel="Retry"
                      onAction={() => window.location.reload()}
                    />
                  ) : upcoming.length > 0 ? (
                    <div className="space-y-3">
                      {upcoming.map(meeting => (
                        <UpcomingMeetingCard 
                          key={meeting.id} 
                          meeting={meeting} 
                          isHost={currentUser?.id === meeting.hostId} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12">
                      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-50 relative">
                        {/* CSS Umbrella Placeholder since we can't reliably load images without public assets */}
                        <div className="absolute top-8 w-20 h-10 border-t-[3px] border-l-[3px] border-r-[3px] border-blue-300 rounded-t-full"></div>
                        <div className="absolute top-18 w-[2px] h-12 bg-gray-300"></div>
                      </div>
                      <p className="text-sm font-medium text-text-muted mb-2">No meetings scheduled.</p>
                      <button 
                        onClick={() => router.push("/schedule")}
                        className="text-primary hover:underline text-sm font-medium flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Schedule a meeting
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border bg-white flex justify-between items-center text-sm">
                  <button className="text-gray-500 hover:text-gray-700 font-medium" disabled title="Coming soon">
                    Open recordings &gt;
                  </button>
                </div>
              </div>
            </div>
            
          </div>

          {/* Floating Get Started Widget */}
          {showGetStarted && (
            <div className="hidden md:flex absolute bottom-4 right-4 bg-white border border-border shadow-lg rounded-lg w-72 flex-col overflow-hidden z-50">
              <div className="px-4 py-3 flex justify-between items-center font-bold text-sm border-b border-border">
                <span className="flex items-center gap-2">🚀 Get started</span>
                <div className="flex items-center gap-1">
                  <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded" aria-label="Minimize" title="Coming soon">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={dismissGetStarted} className="text-gray-400 hover:text-gray-600 p-0.5 rounded" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50/50">
                <p className="text-xs text-text-muted mb-3 leading-relaxed">
                  Kickstart your Zoom experience by completing your profile setup.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-primary rounded-full"></div>
                  </div>
                  <span>0/2</span>
                </div>
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
