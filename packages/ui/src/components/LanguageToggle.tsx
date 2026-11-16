import React from 'react';
import { Languages } from 'lucide-react';

export interface LanguageToggleProps {
  currentLocale: 'bn' | 'en';
  onToggle: (locale: 'bn' | 'en') => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLocale,
  onToggle,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-pill bg-app-card border border-stroke-subtle shadow-1 ${className}`}
    >
      <div className="pl-2 pr-1 text-content-secondary">
        <Languages className="w-4 h-4" />
      </div>

      <button
        type="button"
        onClick={() => onToggle('bn')}
        className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all duration-150 cursor-pointer min-h-[30px]
          ${
            currentLocale === 'bn'
              ? 'bg-green-600 text-white shadow-1'
              : 'text-content-secondary hover:text-content-primary'
          }
        `}
      >
        বাংলা
      </button>

      <button
        type="button"
        onClick={() => onToggle('en')}
        className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all duration-150 cursor-pointer min-h-[30px]
          ${
            currentLocale === 'en'
              ? 'bg-green-600 text-white shadow-1'
              : 'text-content-secondary hover:text-content-primary'
          }
        `}
      >
        English
      </button>
    </div>
  );
};
