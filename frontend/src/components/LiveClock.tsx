import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn, getTimezoneAbbr } from '@/lib/utils';
import { useTimezone } from '@/contexts/TimezoneContext';

interface LiveClockProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

export function LiveClock({ className, showIcon = true }: LiveClockProps) {
  const [time, setTime] = React.useState(new Date());
  const { timezone, setTimezone, tzString } = useTimezone();

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
    timeZone: tzString,
  });

  const abbr = getTimezoneAbbr(tzString);

  const toggleTimezone = () => {
    setTimezone(timezone === 'UTC' ? 'local' : 'UTC');
  };

  return (
    <div className={cn('flex items-center gap-2 font-mono', className)}>
      {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
      <span className="tabular-nums">{formattedTime}</span>
      <button
        onClick={toggleTimezone}
        className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted hover:bg-muted-foreground/20 transition-colors cursor-pointer"
        title={`Switch to ${timezone === 'UTC' ? 'local' : 'UTC'} time`}
      >
        {abbr}
      </button>
    </div>
  );
}
