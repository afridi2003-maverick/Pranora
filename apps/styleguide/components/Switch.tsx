import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
  className = '',
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const toggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-3 min-h-[44px] cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={toggle}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2
          ${isSmall ? 'w-9 h-5' : 'w-12 h-6'}
          ${checked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}
        `}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-1 transform transition duration-200 ease-in-out
            ${isSmall ? 'w-4 h-4' : 'w-5 h-5'}
            ${
              checked
                ? isSmall
                  ? 'translate-x-4'
                  : 'translate-x-6'
                : 'translate-x-0'
            }
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-sm font-medium text-content-primary">{label}</span>}
          {description && <span className="text-xs text-content-secondary">{description}</span>}
        </div>
      )}
    </div>
  );
};
