import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'center' | 'bottomSheet';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'center',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSheet = variant === 'bottomSheet';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-app-card text-content-primary shadow-3 border border-stroke-subtle flex flex-col transition-all duration-200 max-h-[90vh] overflow-hidden
          ${
            isSheet
              ? 'rounded-t-2xl sm:rounded-2xl max-w-lg mt-auto sm:my-auto'
              : 'rounded-xl max-w-lg mx-4'
          }
          ${className}
        `}
      >
        {/* Bottom sheet drag handle indicator */}
        {isSheet && (
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 sm:hidden" />
        )}

        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stroke-subtle">
          <div>
            {title && <h2 className="text-lg font-bold leading-tight">{title}</h2>}
            {description && <p className="text-xs text-content-secondary mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-content-secondary hover:text-content-primary hover:bg-green-100 dark:hover:bg-green-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="p-4 sm:p-5 bg-gray-50/50 dark:bg-green-950/20 border-t border-stroke-subtle flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
