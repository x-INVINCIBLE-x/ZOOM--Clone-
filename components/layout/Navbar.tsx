"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Calendar as CalendarIcon, Menu } from "lucide-react";
import { useMeetingsContext } from "../providers/MeetingsProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

export function Navbar() {
  const { currentUser } = useMeetingsContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between bg-white px-4 md:px-6 sticky top-0 z-10 border-b border-border">
      <div className="flex flex-1 items-center gap-2 md:gap-6">
        <button 
          className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex flex-col -gap-1">
          <div className="text-primary font-black text-xl tracking-tighter leading-none">zoom</div>
          <span className="text-gray-500 font-medium text-xs leading-none">Workplace</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search (Ctrl+E)"
            className="h-8 w-full rounded-full bg-gray-100 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
            disabled
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        <button 
          className="hidden md:inline-flex items-center justify-center h-8 px-4 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-full transition-colors"
          title="Coming soon"
          aria-label="Upgrade"
        >
          Upgrade
        </button>

        <button 
          className="text-text-muted hover:bg-gray-100 p-1.5 rounded-full"
          title="Coming soon"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        <button 
          className="text-text-muted hover:bg-gray-100 p-1.5 rounded-full"
          title="Coming soon"
          aria-label="Calendar"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>

        <div className="relative ml-1">
          <button 
            className="flex items-center gap-2 rounded-full hover:ring-2 ring-primary ring-offset-2 transition-all focus:outline-none"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Profile menu"
          >
            {currentUser ? (
              <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            )}
          </button>

          {profileOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white border border-border py-1 text-sm z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-medium text-text">{currentUser.name}</p>
                <p className="text-text-muted truncate">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-text hover:bg-gray-100 disabled:opacity-50" disabled>Profile (Coming soon)</button>
                <button className="w-full text-left px-4 py-2 text-text hover:bg-gray-100 disabled:opacity-50" disabled>Settings</button>
              </div>
              <div className="py-1 border-t border-border">
                <button className="w-full text-left px-4 py-2 text-text hover:bg-gray-100 disabled:opacity-50" disabled>Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 w-64 bg-white border-r border-b border-border shadow-lg p-2 flex flex-col md:hidden z-50">
          <Link href="/" className="px-4 py-3 rounded-md hover:bg-gray-50 flex items-center gap-3 font-medium text-primary">
            Home
          </Link>
          <div className="px-4 py-3 rounded-md text-text-muted flex items-center gap-3 opacity-60 cursor-not-allowed">
            ZoomMate
          </div>
          <Link href="/meetings" className="px-4 py-3 rounded-md hover:bg-gray-50 flex items-center gap-3 font-medium text-text">
            Meetings
          </Link>
          <div className="px-4 py-3 rounded-md text-text-muted flex items-center gap-3 opacity-60 cursor-not-allowed">
            Chat
          </div>
          <div className="px-4 py-3 rounded-md text-text-muted flex items-center gap-3 opacity-60 cursor-not-allowed">
            Hub
          </div>
          <div className="px-4 py-3 rounded-md text-text-muted flex items-center gap-3 opacity-60 cursor-not-allowed">
            More
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <div className="px-4 py-3 rounded-md text-text-muted flex items-center gap-3 opacity-60 cursor-not-allowed">
              Settings
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
