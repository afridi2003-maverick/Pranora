import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, disabled, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-content-primary">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-[44px] pl-3.5 pr-10 py-2.5 rounded-md text-base bg-app-card text-content-primary border appearance-none transition-colors duration-150 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
              disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-green-900/20 disabled:cursor-not-allowed
              ${error ? 'border-emergency-500 ring-1 ring-emergency-500' : 'border-stroke-subtle hover:border-stroke-medium'}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-app-card text-content-primary">
                {opt.label}
              </option>
            ))}
          </select>

          <span className="absolute right-3.5 pointer-events-none text-content-secondary">
            <ChevronDown className="w-5 h-5" />
          </span>
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

Select.displayName = 'Select';
