"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface LocalMediaState {
  isCameraOn: boolean;
  isMicOn: boolean;
  videoStream: MediaStream | null;
  micLevel: number;
  error: string | null;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;
  isCameraLoading: boolean;
  isMicLoading: boolean;
  clearError: () => void;
}

export const LocalMediaContext = createContext<LocalMediaState | null>(null);

export function useLocalMediaContext() {
  const ctx = useContext(LocalMediaContext);
  if (!ctx) throw new Error("useLocalMediaContext must be used within LocalMediaProvider");
  return ctx;
}

export function LocalMediaProvider({ children }: { children: ReactNode }) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isMicLoading, setIsMicLoading] = useState(false);
  
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rAFRef = useRef<number | null>(null);

  const clearError = () => setError(null);

  const videoStreamRef = useRef<MediaStream | null>(null);

  const cleanupCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
    }
    videoStreamRef.current = null;
    setVideoStream(null);
    setIsCameraOn(false);
  };

  const cleanupMic = () => {
    if (rAFRef.current !== null) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    analyserRef.current = null;
    setMicLevel(0);
    setIsMicOn(false);
  };

  useEffect(() => {
    return () => {
      cleanupCamera();
      cleanupMic();
    };
  }, []);

  const handleMediaError = (err: unknown, type: "camera" | "mic") => {
    console.error(`LocalMedia error (${type}):`, err);
    if (err instanceof Error) {
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setError(`${type === "camera" ? "Camera" : "Microphone"} access was blocked. Allow it in your browser's site settings and try again.`);
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(`No ${type === "camera" ? "camera" : "microphone"} found.`);
      } else {
        setError(`Couldn't start your ${type === "camera" ? "camera" : "microphone"}.`);
      }
    } else {
      setError(`Couldn't start your ${type === "camera" ? "camera" : "microphone"}.`);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      cleanupCamera();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera and microphone aren't available in this browser.");
      return;
    }
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          cleanupCamera();
          setError("Camera was disconnected.");
        };
      });
      setVideoStream(stream);
      videoStreamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      handleMediaError(err, "camera");
    } finally {
      setIsCameraLoading(false);
    }
  };

  const updateMicLevel = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Map 0-255 to 0-1
    setMicLevel(average / 255);
    
    rAFRef.current = requestAnimationFrame(updateMicLevel);
  };

  const toggleMic = async () => {
    if (isMicOn) {
      cleanupMic();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera and microphone aren't available in this browser.");
      return;
    }
    setIsMicLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getAudioTracks().forEach(track => {
        track.onended = () => {
          cleanupMic();
          setError("Microphone was disconnected.");
        };
      });
      audioStreamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // NEVER connect analyser to ctx.destination
      
      setIsMicOn(true);
      updateMicLevel();
    } catch (err) {
      handleMediaError(err, "mic");
    } finally {
      setIsMicLoading(false);
    }
  };

  return (
    <LocalMediaContext.Provider value={{
      isCameraOn, isMicOn, videoStream, micLevel, error, toggleCamera, toggleMic, isCameraLoading, isMicLoading, clearError
    }}>
      {children}
    </LocalMediaContext.Provider>
  );
}
