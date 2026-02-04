import * as React from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: Date | string;
  prefix?: string;
  className?: string;
  showSeconds?: boolean;
  onComplete?: () => void;
}

function formatDuration(ms: number, showSeconds: boolean): string {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  if (showSeconds && parts.length < 3) parts.push(`${seconds}s`);

  return parts.join(' ');
}

export function Countdown({
  targetDate,
  prefix,
  className,
  showSeconds = false,
  onComplete,
}: CountdownProps) {
  const [now, setNow] = React.useState(new Date());
  const target = React.useMemo(
    () => (typeof targetDate === 'string' ? new Date(targetDate) : targetDate),
    [targetDate]
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, showSeconds ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [showSeconds]);

  const diff = target.getTime() - now.getTime();
  const isComplete = diff <= 0;
  const isSoon = diff > 0 && diff < 15 * 60 * 1000; // Less than 15 minutes

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <span
      className={cn(
        'tabular-nums',
        isSoon && 'text-orange-500 font-medium',
        className
      )}
    >
      {prefix && `${prefix} `}
      {formatDuration(diff, showSeconds)}
    </span>
  );
}

interface TimeRangeDisplayProps {
  start: Date | string;
  end: Date | string;
  className?: string;
}

export function TimeRangeDisplay({ start, end, className }: TimeRangeDisplayProps) {
  const [now, setNow] = React.useState(new Date());
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isCompleted = now > endDate;

  if (isActive) {
    const remaining = endDate.getTime() - now.getTime();
    return (
      <span className={cn('text-green-500 font-medium', className)}>
        Ends in {formatDuration(remaining, false)}
      </span>
    );
  }

  if (isUpcoming) {
    const until = startDate.getTime() - now.getTime();
    return (
      <span className={cn('text-muted-foreground', className)}>
        Starts in {formatDuration(until, false)}
      </span>
    );
  }

  if (isCompleted) {
    const ago = now.getTime() - endDate.getTime();
    return (
      <span className={cn('text-muted-foreground', className)}>
        Ended {formatDuration(ago, false)} ago
      </span>
    );
  }

  return null;
}
