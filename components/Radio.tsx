import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  asCard?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, asCard = false, checked, disabled, className = '', id, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;

    if (asCard) {
      return (
        <label
          htmlFor={radioId}
          className={`flex items-start gap-3.5 p-4 rounded-lg border transition-all duration-150 cursor-pointer select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-400'}
            ${checked ? 'bg-green-50 dark:bg-green-900/40 border-green-600 dark:border-lime-400 shadow-1' : 'bg-app-card border-stroke-subtle'}
            ${className}
          `}
        >
          <input
            type="radio"
            id={radioId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center shrink-0 mt-0.5
              peer-focus-visible:ring-2 peer-focus-visible:ring-green-600 peer-focus-visible:ring-offset-2
              ${checked ? 'border-green-600 dark:border-lime-400' : 'border-stroke-medium'}
            `}
          >
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-lime-400" />}
          </div>
          <div className="flex flex-col text-left">
            {label && <span className="text-sm font-semibold text-content-primary">{label}</span>}
            {description && <span className="text-xs text-content-secondary mt-0.5">{description}</span>}
          </div>
        </label>
      );
    }

    return (
      <label
        htmlFor={radioId}
        className={`inline-flex items-start gap-3 min-h-[44px] cursor-pointer select-none py-1.5 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center
              peer-focus-visible:ring-2 peer-focus-visible:ring-green-600 peer-focus-visible:ring-offset-2
              ${checked ? 'border-green-600 dark:border-lime-400' : 'border-stroke-medium hover:border-green-600'}
            `}
          >
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-lime-400" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && <span className="text-sm font-medium text-content-primary leading-tight">{label}</span>}
            {description && <span className="text-xs text-content-secondary mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
