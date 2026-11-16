import React from 'react';
import { Sun, Moon } from 'lucide-react';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: (theme: 'light' | 'dark') => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => onToggle(isDark ? 'light' : 'dark')}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-app-card border border-stroke-subtle shadow-1 text-content-primary hover:border-stroke-medium transition-all duration-150 min-h-[36px] cursor-pointer ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4 text-lime-400" />
          <span className="text-xs font-semibold">Dark Forest</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold">Light</span>
        </>
      )}
    </button>
  );
};
