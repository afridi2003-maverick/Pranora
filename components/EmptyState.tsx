import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-app-card border border-stroke-subtle shadow-1 max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-lime-300 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-content-primary leading-snug">{title}</h3>
      <p className="text-sm text-content-secondary mt-1.5 max-w-xs">{description}</p>

      {actionText && (
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
