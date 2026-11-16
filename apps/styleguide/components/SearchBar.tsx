import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'সার্চ করুন / Search...',
  shortcutHint,
  className = '',
  disabled,
  ...props
}) => {
  const [internalVal, setInternalVal] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalVal(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    setInternalVal('');
    onClear?.();
  };

  const hasContent = Boolean(value !== undefined ? value : internalVal);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <span className="absolute left-3.5 text-content-secondary pointer-events-none">
        <Search className="w-5 h-5" />
      </span>

      <input
        type="search"
        value={value !== undefined ? value : internalVal}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-[44px] pl-10 pr-16 py-2.5 rounded-pill text-base bg-app-card text-content-primary border border-stroke-subtle
          placeholder:text-content-disabled hover:border-stroke-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-1"
        {...props}
      />

      <div className="absolute right-3.5 flex items-center gap-1.5">
        {hasContent && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-content-secondary hover:text-content-primary hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {shortcutHint && (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-semibold text-content-secondary bg-app-bg border border-stroke-subtle rounded">
            {shortcutHint}
          </kbd>
        )}
      </div>
    </div>
  );
};
