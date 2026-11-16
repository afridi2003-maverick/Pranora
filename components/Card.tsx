import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'basic' | 'glass' | 'tinted' | 'outline';
  isInteractive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'basic',
  isInteractive = false,
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  const variantClasses = {
    basic: 'bg-app-card border border-stroke-subtle shadow-1',
    glass: 'bg-app-glass backdrop-blur-md border border-stroke-glass shadow-2',
    tinted: 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800',
    outline: 'bg-transparent border-2 border-stroke-medium',
  }[variant];

  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:border-green-400 hover:shadow-2 active:scale-[0.99] transition-all duration-200'
    : '';

  return (
    <div
      className={`rounded-lg transition-colors ${variantClasses} ${paddingClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
