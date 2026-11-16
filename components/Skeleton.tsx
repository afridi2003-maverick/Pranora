import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }[variant];

  const inlineStyles: React.CSSProperties = {
    width: width,
    height: height,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 dark:bg-green-950/60 ${variantStyles} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg bg-app-card border border-stroke-subtle flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height={80} />
      <div className="flex justify-between items-center mt-1">
        <Skeleton variant="text" width="30%" height={14} />
        <Skeleton variant="rectangular" width={70} height={28} className="rounded-pill" />
      </div>
    </div>
  );
};
