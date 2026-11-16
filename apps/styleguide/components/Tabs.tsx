import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar ${
        variant === 'underline' ? 'border-b border-stroke-subtle' : 'p-1 bg-gray-100 dark:bg-green-950/40 rounded-pill'
      } ${className}`}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;

        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium transition-all duration-150 min-h-[40px] whitespace-nowrap cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600
                ${
                  isActive
                    ? 'bg-green-600 text-white shadow-1 font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-white/50 dark:hover:bg-green-900/40'
                }
              `}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-800 text-content-primary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer border-b-2 -mb-[2px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600
              ${
                isActive
                  ? 'border-green-600 dark:border-lime-400 text-green-700 dark:text-lime-300 font-semibold'
                  : 'border-transparent text-content-secondary hover:text-content-primary hover:border-stroke-medium'
              }
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
