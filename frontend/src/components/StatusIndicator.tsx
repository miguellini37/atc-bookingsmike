import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'active' | 'upcoming' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig = {
  active: {
    color: 'bg-green-500',
    glow: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    label: 'Active',
    animate: true,
  },
  upcoming: {
    color: 'bg-blue-500',
    glow: '',
    label: 'Upcoming',
    animate: false,
  },
  completed: {
    color: 'bg-gray-400',
    glow: '',
    label: 'Completed',
    animate: false,
  },
};

const sizeConfig = {
  sm: { dot: 'w-2 h-2', text: 'text-xs' },
  md: { dot: 'w-3 h-3', text: 'text-sm' },
  lg: { dot: 'w-4 h-4', text: 'text-base' },
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'rounded-full',
          sizes.dot,
          config.color,
          config.glow,
          config.animate && 'animate-pulse-dot'
        )}
      />
      {showLabel && (
        <span className={cn('font-medium', sizes.text, status === 'active' && 'text-green-500')}>
          {config.label}
        </span>
      )}
    </div>
  );
}
