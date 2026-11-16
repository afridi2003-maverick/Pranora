import React from 'react';

export interface SegmentOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedId,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="group"
      className={`inline-flex p-1 rounded-pill bg-gray-100 dark:bg-green-950/60 border border-stroke-subtle ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 min-h-[36px] select-none cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600
              ${
                isSelected
                  ? 'bg-app-card text-content-primary shadow-1 font-semibold dark:bg-green-800'
                  : 'text-content-secondary hover:text-content-primary'
              }
            `}
          >
            {option.icon && <span className="w-4 h-4">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
