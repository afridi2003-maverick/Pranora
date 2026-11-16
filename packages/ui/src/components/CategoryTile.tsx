import React from 'react';

export interface CategoryTileProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  colorScheme?: 'green' | 'amber' | 'blue' | 'lime' | 'rose';
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  icon,
  title,
  subtitle,
  colorScheme = 'green',
  onClick,
  isActive = false,
  className = '',
}) => {
  const schemeStyles = {
    green: 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    lime: 'bg-lime-50 dark:bg-lime-950/30 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  }[colorScheme];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer text-center select-none min-h-[96px]
        hover:scale-[1.03] active:scale-[0.98] shadow-1 hover:shadow-2
        ${schemeStyles}
        ${isActive ? 'ring-2 ring-green-600 dark:ring-lime-400 font-bold' : ''}
        ${className}
      `}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white/70 dark:bg-white/10 shadow-sm">
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-semibold leading-tight line-clamp-1">{title}</span>
      {subtitle && <span className="text-[11px] opacity-75 mt-0.5">{subtitle}</span>}
    </button>
  );
};
