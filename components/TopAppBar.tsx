import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  variant?: 'solid' | 'transparent' | 'glass';
  className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  onBack,
  actions,
  variant = 'solid',
  className = '',
}) => {
  const variantClasses = {
    solid: 'bg-app-card border-b border-stroke-subtle',
    transparent: 'bg-transparent',
    glass: 'bg-app-glass backdrop-blur-md border-b border-stroke-glass',
  }[variant];

  return (
    <header className={`sticky top-0 z-40 w-full min-h-[56px] px-4 flex items-center justify-between transition-colors ${variantClasses} ${className}`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-content-primary hover:bg-green-100 dark:hover:bg-green-800 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col text-left">
          <h1 className="text-lg font-bold text-content-primary leading-tight">{title}</h1>
          {subtitle && <span className="text-xs text-content-secondary mt-0.5">{subtitle}</span>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
};
