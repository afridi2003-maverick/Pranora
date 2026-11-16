import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'emergency';
  icon?: React.ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  icon,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  }[size];

  const getInitials = (str?: string) => {
    if (!str) return '🐾';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    emergency: 'bg-emergency-600 animate-ping',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-lime-300 flex items-center justify-center border border-stroke-subtle select-none shadow-1 ${sizeClasses}`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : icon ? (
          icon
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-app-bg ${statusColors[status]}`}
        />
      )}
    </div>
  );
};
