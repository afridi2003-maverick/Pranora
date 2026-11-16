import React from 'react';
import { Plus } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

export interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  onFabClick?: () => void;
  fabLabel?: string;
  fabIcon?: React.ReactNode;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onChange,
  onFabClick,
  fabLabel = 'যোগ করুন / Add',
  fabIcon = <Plus className="w-6 h-6 text-white stroke-[2.5]" />,
  className = '',
}) => {
  // Split items into left and right pairs to leave room for the center FAB
  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2, 4);

  return (
    <nav
      className={`relative w-full max-w-md mx-auto bg-app-card border-t border-stroke-subtle shadow-3 flex items-center justify-between px-3 py-2 z-40 ${className}`}
      aria-label="Bottom Navigation"
    >
      {/* Left items */}
      <div className="flex items-center justify-around flex-1">
        {leftItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors select-none cursor-pointer
                ${isActive ? 'text-green-600 dark:text-lime-400 font-semibold' : 'text-content-secondary hover:text-content-primary'}
              `}
            >
              <div className="relative">
                {item.icon}
                {item.badgeCount ? (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] bg-emergency-600 text-white font-bold">
                    {item.badgeCount}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Center Floating Action Button (Ref 1 inspired) */}
      <div className="relative -top-5 flex flex-col items-center px-2">
        <button
          type="button"
          onClick={onFabClick}
          aria-label={fabLabel}
          className="w-14 h-14 rounded-full bg-green-600 dark:bg-green-600 hover:bg-green-700 active:scale-95 shadow-3 flex items-center justify-center text-white ring-4 ring-app-bg transition-all duration-150 cursor-pointer"
        >
          {fabIcon}
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center justify-around flex-1">
        {rightItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors select-none cursor-pointer
                ${isActive ? 'text-green-600 dark:text-lime-400 font-semibold' : 'text-content-secondary hover:text-content-primary'}
              `}
            >
              <div className="relative">
                {item.icon}
                {item.badgeCount ? (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] bg-emergency-600 text-white font-bold">
                    {item.badgeCount}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
