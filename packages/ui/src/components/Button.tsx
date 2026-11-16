import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';
  size?: 'sm' | 'md' | 'lg' | 'fab';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  // Base classes with 44px+ tap target enforcement
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' +
    'active:scale-[0.98]';

  // Variant classes
  const variantClasses = {
    primary:
      'bg-green-600 hover:bg-green-700 text-white shadow-1 hover:shadow-2 ' +
      'focus-visible:ring-green-600 focus-visible:ring-offset-app-bg',
    secondary:
      'bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/40 ' +
      'dark:text-lime-400 dark:border-lime-400 focus-visible:ring-green-600',
    ghost:
      'bg-transparent text-content-primary hover:bg-green-50 dark:hover:bg-green-900/30 ' +
      'focus-visible:ring-green-600',
    danger:
      'bg-emergency-600 hover:bg-emergency-700 text-white shadow-1 hover:shadow-2 ' +
      'focus-visible:ring-emergency-600 focus-visible:ring-offset-app-bg',
    lime:
      'bg-lime-400 hover:bg-lime-500 text-green-900 font-semibold shadow-1 hover:shadow-2 ' +
      'focus-visible:ring-lime-400',
  }[variant];

  // Size classes
  const sizeClasses = {
    sm: 'min-h-[36px] px-3.5 py-1.5 text-sm rounded-pill gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-base rounded-pill gap-2',
    lg: 'min-h-[52px] px-7 py-3.5 text-lg rounded-pill gap-2.5 font-semibold',
    fab: 'w-14 h-14 min-w-[56px] min-h-[56px] rounded-full p-0 shadow-3 gap-0',
  }[size];

  const widthClass = isFullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {size !== 'fab' && <span>লোড হচ্ছে... / Loading...</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
