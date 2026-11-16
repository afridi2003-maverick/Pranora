import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isPhone?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, isPhone = false, leftIcon, rightIcon, disabled, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-content-primary">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {isPhone && (
            <span className="absolute left-3.5 flex items-center text-sm font-semibold text-content-secondary border-r border-stroke-subtle pr-2 select-none">
              +880
            </span>
          )}

          {!isPhone && leftIcon && (
            <span className="absolute left-3.5 text-content-secondary pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-md text-base bg-app-card text-content-primary border transition-colors duration-150
              placeholder:text-content-disabled focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-green-900/20 disabled:cursor-not-allowed
              ${isPhone ? 'pl-20' : leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon || error ? 'pr-10' : 'pr-3.5'}
              ${error ? 'border-emergency-500 ring-1 ring-emergency-500' : 'border-stroke-subtle hover:border-stroke-medium'}
              ${className}
            `}
            {...props}
          />

          {error ? (
            <span className="absolute right-3.5 text-emergency-500 pointer-events-none">
              <AlertCircle className="w-5 h-5" />
            </span>
          ) : (
            rightIcon && (
              <span className="absolute right-3.5 text-content-secondary">
                {rightIcon}
              </span>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs text-emergency-600 dark:text-emergency-500 font-medium flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-content-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
