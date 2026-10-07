import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="bg-gray-800 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 text-sm">
        <span>{message}</span>
        <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
