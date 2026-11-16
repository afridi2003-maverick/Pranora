import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';

export interface EmergencyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'floating' | 'banner' | 'pill';
  label?: string;
  sublabel?: string;
  isCalling?: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  variant = 'pill',
  label = 'জরুরি সেবা / Emergency',
  sublabel,
  isCalling = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-emergency-600 hover:bg-emergency-700 active:scale-95 text-white shadow-3 flex items-center justify-center cursor-pointer transition-all duration-200 ring-4 ring-emergency-600/30 animate-pulse focus:outline-none focus-visible:ring-4 focus-visible:ring-emergency-400 ${
          disabled ? 'opacity-50 cursor-not-allowed animate-none' : ''
        } ${className}`}
        {...props}
      >
        {isCalling ? (
          <PhoneCall className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        )}
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full p-4 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white shadow-2 flex items-center justify-between transition-all duration-150 cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emergency-600 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        {...props}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isCalling ? <PhoneCall className="w-5 h-5 text-white" /> : <AlertTriangle className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="text-base font-bold leading-tight">{label}</div>
            {sublabel && <div className="text-xs text-white/90 mt-0.5">{sublabel}</div>}
          </div>
        </div>

        <span className="px-3 py-1 rounded-pill bg-white text-emergency-700 text-xs font-bold uppercase tracking-wider shrink-0">
          ১-ট্যাপ কল
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] rounded-pill bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-base shadow-2 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emergency-600 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      <AlertTriangle className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};
