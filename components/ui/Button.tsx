import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

export function Button({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  fullWidth = false,
  ...props 
}: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-btn";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600",
    secondary: "bg-white border border-border text-text hover:bg-gray-50",
    danger: "bg-danger text-white hover:bg-red-700",
    ghost: "bg-transparent text-text hover:bg-gray-100",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10 p-2",
  };

  const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  return <button className={classes} {...props} />;
}
