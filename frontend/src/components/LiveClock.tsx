import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveClockProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

export function LiveClock({ className, showIcon = true, showLabel = false }: LiveClockProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  });

  return (
    <div className={cn('flex items-center gap-2 font-mono', className)}>
      {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
      <span className="tabular-nums">{formattedTime}</span>
      {showLabel && <span className="text-muted-foreground text-xs">UTC</span>}
    </div>
  );
}
