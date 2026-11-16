import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

export interface PromoBannerProps {
  tag: string;
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  illustration?: React.ReactNode;
  variant?: 'green' | 'lime' | 'dark';
  className?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  tag,
  title,
  description,
  ctaText,
  onCtaClick,
  illustration,
  variant = 'green',
  className = '',
}) => {
  const variantStyles = {
    green: 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-2',
    lime: 'bg-gradient-to-r from-lime-400 to-green-300 text-green-900 shadow-2',
    dark: 'bg-gradient-to-r from-green-900 to-green-800 text-white border border-white/10 shadow-3',
  }[variant];

  const tagStyles = {
    green: 'bg-white/20 text-white border border-white/30',
    lime: 'bg-green-900/15 text-green-900 border border-green-900/20 font-semibold',
    dark: 'bg-lime-400 text-green-900 font-bold',
  }[variant];

  return (
    <div className={`relative overflow-hidden rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${variantStyles} ${className}`}>
      <div className="flex-1 z-10 flex flex-col items-start gap-2">
        <span className={`px-2.5 py-1 rounded-pill text-xs tracking-wide uppercase ${tagStyles}`}>
          {tag}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold leading-snug">{title}</h3>
        <p className="text-sm opacity-90 max-w-md">{description}</p>
        {ctaText && (
          <div className="mt-2">
            <Button
              size="sm"
              variant={variant === 'lime' ? 'primary' : 'lime'}
              onClick={onCtaClick}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {ctaText}
            </Button>
          </div>
        )}
      </div>

      {illustration && (
        <div className="shrink-0 self-center sm:self-auto opacity-95">
          {illustration}
        </div>
      )}
    </div>
  );
};
