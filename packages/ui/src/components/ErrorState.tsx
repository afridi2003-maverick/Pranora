import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'card' | 'fullscreen' | 'inline' | 'banner';
  actionText?: string;
  onRetry?: () => void;
  errorDetails?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'কিছু সমস্যা হয়েছে / Something went wrong',
  description = 'অনুগ্রহ করে পুনরায় চেষ্টা করুন বা ইন্টারনেট সংযোগ পরীক্ষা করুন। / Please try again or check your internet connection.',
  icon,
  variant = 'card',
  actionText = 'আবার চেষ্টা করুন / Retry',
  onRetry,
  errorDetails,
  className = '',
}) => {
  const defaultIcon = <AlertCircle className="w-8 h-8 text-emergency-500" />;

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={`inline-flex items-center gap-2 text-emergency-600 dark:text-emergency-500 text-sm ${className}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{title}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 font-bold underline hover:opacity-80 cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={`w-full p-4 rounded-xl bg-emergency-50 dark:bg-emergency-900/30 border border-emergency-200 dark:border-emergency-800 flex items-start justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-emergency-600 dark:text-emergency-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emergency-900 dark:text-emergency-100">{title}</h4>
            <p className="text-xs text-emergency-700 dark:text-emergency-300 mt-0.5">{description}</p>
            {errorDetails && (
              <p className="text-[11px] font-mono text-emergency-600/80 dark:text-emergency-400/80 mt-1 bg-emergency-100/50 dark:bg-emergency-950/50 p-1 rounded">
                {errorDetails}
              </p>
            )}
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 rounded-pill bg-emergency-600 hover:bg-emergency-700 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        role="alert"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-app-bg text-center ${className}`}
      >
        <div className="w-20 h-20 rounded-full bg-emergency-50 dark:bg-emergency-900/40 flex items-center justify-center mb-4">
          {icon || <AlertCircle className="w-10 h-10 text-emergency-500" />}
        </div>
        <h2 className="text-xl font-bold text-content-primary">{title}</h2>
        <p className="text-sm text-content-secondary mt-2 max-w-sm">{description}</p>
        {errorDetails && (
          <pre className="text-xs font-mono text-content-secondary mt-3 p-2 bg-gray-100 dark:bg-green-950/40 rounded max-w-md overflow-x-auto text-left">
            {errorDetails}
          </pre>
        )}
        {onRetry && (
          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-app-card border border-stroke-subtle shadow-1 max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-emergency-50 dark:bg-emergency-900/40 flex items-center justify-center mb-4">
        {icon || defaultIcon}
      </div>

      <h3 className="text-lg font-bold text-content-primary leading-snug">{title}</h3>
      <p className="text-sm text-content-secondary mt-1.5 max-w-xs">{description}</p>

      {errorDetails && (
        <pre className="w-full text-xs font-mono text-content-secondary mt-3 p-2 bg-gray-100 dark:bg-green-950/40 rounded overflow-x-auto text-left">
          {errorDetails}
        </pre>
      )}

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
