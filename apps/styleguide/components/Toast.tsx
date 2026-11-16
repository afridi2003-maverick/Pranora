import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  description?: string;
  type?: 'success' | 'emergency' | 'info' | 'warning';
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  description,
  type = 'success',
  onDismiss,
  actionText,
  onAction,
  className = '',
}) => {
  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      border: 'border-green-600',
      bg: 'bg-app-card',
    },
    emergency: {
      icon: <AlertCircle className="w-5 h-5 text-emergency-500" />,
      border: 'border-emergency-600',
      bg: 'bg-app-card',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      border: 'border-amber-500',
      bg: 'bg-app-card',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      border: 'border-blue-500',
      bg: 'bg-app-card',
    },
  }[type];

  return (
    <div
      role="status"
      className={`inline-flex items-center gap-3 p-3.5 sm:p-4 rounded-lg shadow-3 border-l-4 ${typeConfig.border} ${typeConfig.bg} border border-stroke-subtle min-w-[300px] max-w-md ${className}`}
    >
      <div className="shrink-0">{typeConfig.icon}</div>

      <div className="flex flex-col text-left flex-1 min-w-0">
        <span className="text-sm font-semibold text-content-primary">{message}</span>
        {description && <span className="text-xs text-content-secondary mt-0.5">{description}</span>}
      </div>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-green-600 dark:text-lime-400 hover:underline uppercase px-2 py-1 cursor-pointer"
        >
          {actionText}
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-full text-content-secondary hover:text-content-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
