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

import { useLocalMediaContext } from "@/hooks/useLocalMedia";

export function PreJoinScreen({ meeting, initialName, onJoin }: PreJoinScreenProps) {
  const [name, setName] = useState(initialName);
  
  const {
    isCameraOn, isMicOn, videoStream, micLevel,
    toggleCamera, toggleMic, isCameraLoading, isMicLoading
  } = useLocalMediaContext();

  // Attach video stream to video element
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, isCameraOn]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-8 md:gap-16">
        
        {/* Video Preview */}
        <div className="w-full max-w-xl aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-lg flex flex-col">
          {!isCameraOn ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-medium text-white relative">
                {name ? name.substring(0, 2).toUpperCase() : "?"}
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full h-full bg-black relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
                style={{ transform: "scaleX(-1)" }} 
              />
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button 
              onClick={toggleMic}
              disabled={isMicLoading}
              aria-pressed={isMicOn}
              className={`p-3 rounded-full relative ${isMicOn ? "bg-gray-700/80 hover:bg-gray-600 text-white" : "bg-danger hover:bg-red-600 text-white"}`}
              aria-label={isMicOn ? "Mute" : "Unmute"}
            >
              {isMicOn ? <Mic className="w-5 h-5 relative z-10" /> : <MicOff className="w-5 h-5 relative z-10" />}
              {isMicOn && micLevel > 0 && (
                <div 
                  className="absolute inset-0 bg-green-500 rounded-full opacity-30 transition-transform duration-75"
                  style={{ transform: `scale(${1 + micLevel * 1.5})` }}
                />
              )}
            </button>
            <button 
              onClick={toggleCamera}
              disabled={isCameraLoading}
              aria-pressed={isCameraOn}
              className={`p-3 rounded-full ${isCameraOn ? "bg-gray-700/80 hover:bg-gray-600 text-white" : "bg-danger hover:bg-red-600 text-white"}`}
              aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
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
            onClick={() => onJoin(name, isMicOn, isCameraOn)}
            disabled={!name.trim()}
          >
            Join
          </Button>
        </div>

      </div>
    </div>
  );
}
