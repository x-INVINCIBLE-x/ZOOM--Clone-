"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

interface ChatPanelProps {
  onClose: () => void;
  currentUserName: string;
}

export function ChatPanel({ onClose, currentUserName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "Alex Johnson", text: "Hello everyone!", timestamp: "10:00 AM", isMe: false },
    { id: "2", sender: "System", text: "Recording has started.", timestamp: "10:01 AM", isMe: false }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUserName,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="w-full md:w-80 h-full bg-white flex flex-col border-l border-border shadow-lg z-10 absolute md:relative right-0 top-0 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text">Chat</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
            <span className="text-[11px] text-gray-500 mb-1">
              {msg.isMe ? "Me" : msg.sender} • {msg.timestamp}
            </span>
            <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
              msg.isMe 
                ? "bg-primary text-white rounded-br-none" 
                : msg.sender === "System" 
                  ? "bg-gray-100 text-gray-600 italic w-full text-center" 
                  : "bg-gray-100 text-text rounded-bl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Type message here..."
            className="flex-1 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[40px] max-h-[120px] resize-y"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-primary hover:bg-primary/90 text-white p-2 rounded disabled:opacity-50 h-[40px]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
