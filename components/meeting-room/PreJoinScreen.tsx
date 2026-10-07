"use client";

import React, { useState } from "react";
import { Meeting } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Navbar } from "../layout/Navbar";

interface PreJoinScreenProps {
  meeting: Meeting;
  initialName: string;
  onJoin: (name: string, isAudioOn: boolean, isVideoOn: boolean) => void;
}

export function PreJoinScreen({ meeting, initialName, onJoin }: PreJoinScreenProps) {
  const [name, setName] = useState(initialName);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-8 md:gap-16">
        
        {/* Video Preview */}
        <div className="w-full max-w-xl aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-lg flex flex-col">
          {!isVideoOn ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-medium text-white">
                {name ? name.substring(0, 2).toUpperCase() : "?"}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <Video className="w-16 h-16 opacity-20" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button 
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3 rounded-full ${isAudioOn ? "bg-gray-700/80 hover:bg-gray-600 text-white" : "bg-danger hover:bg-red-600 text-white"}`}
              aria-label={isAudioOn ? "Mute" : "Unmute"}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full ${isVideoOn ? "bg-gray-700/80 hover:bg-gray-600 text-white" : "bg-danger hover:bg-red-600 text-white"}`}
              aria-label={isVideoOn ? "Stop Video" : "Start Video"}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Join Form */}
        <div className="w-full max-w-sm bg-white p-6 rounded-xl border border-border shadow-sm text-center">
          <h2 className="text-xl font-bold text-text mb-2">{meeting.title}</h2>
          <p className="text-sm text-text-muted mb-6">
            Hosted by {meeting.hostId} {/* in a real app we'd fetch the host's name */}
          </p>
          
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="mb-4 text-center"
          />
          
          <Button 
            fullWidth 
            onClick={() => onJoin(name, isAudioOn, isVideoOn)}
            disabled={!name.trim()}
          >
            Join
          </Button>
        </div>

      </div>
    </div>
  );
}
