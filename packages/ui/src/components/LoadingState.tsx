import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: 'fullscreen' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <Loader2
      className={`animate-spin text-green-600 dark:text-lime-400 ${sizeClasses} ${className}`}
      aria-hidden="true"
    />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'লোড হচ্ছে... / Loading...',
  submessage,
  variant = 'card',
  size = 'md',
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 text-content-secondary ${className}`}
      >
        <Spinner size="sm" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-app-bg/80 backdrop-blur-sm ${className}`}
      >
        <Spinner size={size === 'sm' ? 'md' : 'lg'} />
        <p className="mt-4 text-base font-semibold text-content-primary tracking-wide text-center">
          {message}
        </p>
        {submessage && (
          <p className="mt-1 text-xs text-content-secondary text-center max-w-xs">{submessage}</p>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-app-card border border-stroke-subtle shadow-1 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/40 flex items-center justify-center mb-3">
        <Spinner size={size} />
      </div>
      <p className="text-base font-semibold text-content-primary leading-snug">{message}</p>
      {submessage && (
        <p className="text-xs text-content-secondary mt-1 max-w-xs">{submessage}</p>
      )}
    </div>
  );
};
