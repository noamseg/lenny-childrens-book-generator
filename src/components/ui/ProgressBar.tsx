'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-600">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
      >
        <div
          className={`
            ${colors[color]} ${sizes[size]} rounded-full
            transition-all duration-500 ease-out
            ${animated ? 'relative overflow-hidden' : ''}
          `}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {animated && clampedProgress > 0 && clampedProgress < 100 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
