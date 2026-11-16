import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, maxLength, currentLength, disabled, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={textareaId} className="text-sm font-medium text-content-primary">
              {label}
            </label>
          )}
          {maxLength !== undefined && currentLength !== undefined && (
            <span className="text-xs text-content-secondary">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            maxLength={maxLength}
            disabled={disabled}
            className={`w-full min-h-[100px] p-3 rounded-md text-base bg-app-card text-content-primary border transition-colors duration-150 resize-y
              placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-green-900/20 disabled:cursor-not-allowed
              ${error ? 'border-emergency-500 ring-1 ring-emergency-500 pr-10' : 'border-stroke-subtle hover:border-stroke-medium'}
              ${className}
            `}
            {...props}
          />
          {error && (
            <span className="absolute top-3 right-3 text-emergency-500 pointer-events-none">
              <AlertCircle className="w-5 h-5" />
            </span>
          )}
        </div>

        {error ? (
          <p className="text-xs text-emergency-600 dark:text-emergency-500 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-content-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
