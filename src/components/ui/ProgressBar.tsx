'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-all duration-500 ${
                      isCompleted ? 'bg-gold-400' : 'bg-cream-300'
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? 'bg-gold-400 text-coffee-900'
                      : isActive
                      ? 'bg-coffee-700 text-cream-50 ring-2 ring-gold-400 ring-offset-1'
                      : 'bg-cream-200 text-coffee-400'
                  }`}
                >
                  {isCompleted ? '✓' : step}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-all duration-500 ${
                      step < currentStep ? 'bg-gold-400' : 'bg-cream-300'
                    }`}
                  />
                )}
              </div>
              {labels && (
                <span
                  className={`text-[10px] mt-1 text-center leading-tight ${
                    isActive ? 'text-coffee-700 font-semibold' : 'text-coffee-400'
                  }`}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
