import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ListItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  showChevron = false,
  isActive = false,
  disabled = false,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (isClickable && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-lg transition-colors select-none min-h-[56px]
        ${isClickable ? 'cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 active:scale-[0.99]' : ''}
        ${isActive ? 'bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800' : 'bg-app-card border-b border-stroke-subtle'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="flex flex-col text-left min-w-0 flex-1">
          <div className="text-sm sm:text-base font-semibold text-content-primary truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs sm:text-sm text-content-secondary mt-0.5 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {trailing}
        {showChevron && <ChevronRight className="w-5 h-5 text-content-secondary" />}
      </div>
    </div>
  );
};
