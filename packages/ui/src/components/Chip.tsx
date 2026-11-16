import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  variant?: 'filter' | 'status' | 'counter';
  statusType?: 'pending' | 'confirmed' | 'completed' | 'emergency' | 'neutral';
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filter',
  statusType = 'neutral',
  isSelected = false,
  onSelect,
  onRemove,
  icon,
  disabled = false,
  className = '',
}) => {
  if (variant === 'status') {
    const statusStyles = {
      pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      confirmed: 'bg-green-600 text-white border-transparent',
      completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
      emergency: 'bg-emergency-600 text-white border-transparent font-bold animate-pulse',
      neutral: 'bg-gray-100 dark:bg-gray-800 text-content-secondary border-stroke-subtle',
    }[statusType];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold border ${statusStyles} ${className}`}
      >
        {icon && <span className="w-3.5 h-3.5 inline-flex">{icon}</span>}
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-sm font-medium border transition-all duration-150 select-none cursor-pointer min-h-[36px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isSelected
            ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-lime-300 border-green-600 dark:border-lime-400 font-semibold shadow-1'
            : 'bg-app-card text-content-primary border-stroke-subtle hover:border-stroke-medium'
        }
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4 inline-flex text-current">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  );
};
