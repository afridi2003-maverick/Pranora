import React from 'react';
import { Check } from 'lucide-react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  colorScheme?: 'green' | 'lime' | 'emergency';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = false,
  colorScheme = 'green',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const barColors = {
    green: 'bg-green-600',
    lime: 'bg-lime-400',
    emergency: 'bg-emergency-600',
  }[colorScheme];

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-content-secondary">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${barColors}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export interface StepTrackerProps {
  steps: { id: string; label: string }[];
  currentStepIndex: number;
  className?: string;
}

export const StepTracker: React.FC<StepTrackerProps> = ({
  steps,
  currentStepIndex,
  className = '',
}) => {
  return (
    <div className={`w-full flex items-center justify-between ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center gap-1.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-green-100 dark:bg-green-900 border-2 border-green-600 dark:border-lime-400 text-green-700 dark:text-lime-300 ring-2 ring-green-600/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-content-disabled border border-stroke-subtle'
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] sm:text-xs leading-tight max-w-[70px] ${
                  isCurrent
                    ? 'font-bold text-green-700 dark:text-lime-300'
                    : isCompleted
                    ? 'font-medium text-content-primary'
                    : 'text-content-disabled'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] -mt-5 transition-colors ${
                  idx < currentStepIndex ? 'bg-green-600' : 'bg-stroke-subtle'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
