import React from "react";
import { Button } from "./Button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-border bg-white h-64">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-text">{title}</h3>
      <p className="mt-1 mb-4 text-sm text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title, description, actionLabel, onAction }: Omit<EmptyStateProps, "icon">) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-100 rounded-lg">
      <h3 className="text-lg font-medium text-danger">{title}</h3>
      <p className="mt-1 mb-4 text-sm text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
