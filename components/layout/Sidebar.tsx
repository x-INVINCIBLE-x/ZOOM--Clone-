"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Video, MessageSquare, Box, MoreHorizontal, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home, active: pathname === "/", disabled: false },
    { name: "ZoomMate", href: "#", icon: Sparkles, active: false, disabled: true },
    { name: "Meetings", href: "/meetings", icon: Video, active: pathname === "/meetings", disabled: false },
    { name: "Chat", href: "#", icon: MessageSquare, active: false, disabled: true },
    { name: "Hub", href: "#", icon: Box, active: false, disabled: true },
    { name: "More", href: "#", icon: MoreHorizontal, active: false, disabled: true, badge: "New" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 bg-background h-[calc(100vh-3.5rem)] py-4 overflow-y-auto items-center justify-between">
      <nav className="flex flex-col gap-1 w-full px-2 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-medium transition-colors w-16 h-16 ${
                isActive 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-text-muted hover:bg-gray-100"
              } ${item.disabled ? "opacity-60 cursor-not-allowed hover:bg-transparent" : ""}`}
              onClick={e => item.disabled && e.preventDefault()}
              title={item.disabled ? "Coming soon" : item.name}
              aria-label={item.name}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-primary" : "text-gray-500"}`} strokeWidth={isActive ? 2 : 1.5} />
              {item.name}
              {item.badge && (
                <span className="absolute -top-1 right-0 bg-blue-500 text-white text-[8px] px-1 rounded border border-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 w-full flex justify-center">
        <button 
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-medium text-text-muted hover:bg-gray-100 disabled:opacity-50 w-16 h-16 opacity-60 cursor-not-allowed"
          disabled
          title="Coming soon"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 mb-1 text-gray-500" strokeWidth={1.5} />
          Settings
        </button>
      </div>
    </aside>
  );
}
