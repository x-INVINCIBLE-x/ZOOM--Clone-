import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "neutral" | "danger";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-800",
    neutral: "bg-gray-100 text-gray-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
