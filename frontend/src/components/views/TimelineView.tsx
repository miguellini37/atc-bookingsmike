import * as React from 'react';
import { format, startOfDay, endOfDay, differenceInMinutes, isWithinInterval } from 'date-fns';
import { cn, getPositionType, getPositionColor } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Booking, BookingType } from '@/types';

interface TimelineViewProps {
  bookings: Booking[];
  date?: Date;
}

// Generate hour labels for the timeline
function generateHourLabels(): string[] {
  return Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, '0')}:00`;
  });
}

// Group bookings by callsign
function groupByCallsign(bookings: Booking[]): Map<string, Booking[]> {
  const grouped = new Map<string, Booking[]>();
  bookings.forEach((booking) => {
    const existing = grouped.get(booking.callsign) || [];
    grouped.set(booking.callsign, [...existing, booking]);
  });
  return grouped;
}

// Sort callsigns by position type then alphabetically
function sortCallsigns(callsigns: string[]): string[] {
  const typeOrder = ['CTR', 'APP', 'DEP', 'TWR', 'GND', 'DEL', 'FSS', 'UNKNOWN'];
  return callsigns.sort((a, b) => {
    const typeA = getPositionType(a);
    const typeB = getPositionType(b);
    const orderA = typeOrder.indexOf(typeA);
    const orderB = typeOrder.indexOf(typeB);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
}

// Calculate position percentage on timeline (0-100)
function calculatePosition(time: Date, dayStart: Date): number {
  const totalMinutes = 24 * 60;
  const minutesFromStart = differenceInMinutes(time, dayStart);
  return Math.max(0, Math.min(100, (minutesFromStart / totalMinutes) * 100));
}

const bookingTypeColors: Record<BookingType, string> = {
  booking: 'bg-blue-500',
  event: 'bg-red-500',
  exam: 'bg-orange-500',
  training: 'bg-purple-500',
};

export function TimelineView({ bookings, date = new Date() }: TimelineViewProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const hourLabels = generateHourLabels();
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter bookings that overlap with the selected day
  const dayBookings = React.useMemo(() => {
    return bookings.filter((booking) => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      return (
        isWithinInterval(start, { start: dayStart, end: dayEnd }) ||
        isWithinInterval(end, { start: dayStart, end: dayEnd }) ||
        (start <= dayStart && end >= dayEnd)
      );
    });
  }, [bookings, dayStart, dayEnd]);

  const groupedBookings = groupByCallsign(dayBookings);
  const sortedCallsigns = sortCallsigns(Array.from(groupedBookings.keys()));

  // Calculate current time position
  const isToday = format(date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd');
  const currentTimePosition = isToday ? calculatePosition(currentTime, dayStart) : null;

  if (sortedCallsigns.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No bookings for this day</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header with hour labels */}
      <div className="flex border-b bg-muted/50 sticky top-0 z-10">
        <div className="w-36 flex-shrink-0 px-4 py-3 font-medium text-sm text-muted-foreground border-r">
          Position
        </div>
        <div className="flex-1 relative">
          <div className="flex">
            {hourLabels.map((label, i) => (
              <div
                key={label}
                className={cn(
                  'flex-1 text-center py-3 text-xs text-muted-foreground border-l first:border-l-0',
                  i % 2 === 0 ? 'bg-muted/30' : ''
                )}
              >
                {i % 2 === 0 && label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline rows */}
      <div className="relative">
        {sortedCallsigns.map((callsign) => {
          const callsignBookings = groupedBookings.get(callsign) || [];
          const positionType = getPositionType(callsign);
          const positionColors = getPositionColor(positionType);

          return (
            <div
              key={callsign}
              className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              {/* Callsign label */}
              <div
                className={cn(
                  'w-36 flex-shrink-0 px-4 py-3 font-mono text-sm border-r flex items-center gap-2',
                  positionColors.text
                )}
              >
                <div className={cn('w-2 h-2 rounded-full', positionColors.badge)} />
                <span className="truncate">{callsign}</span>
              </div>

              {/* Timeline bar area */}
              <div className="flex-1 relative h-14">
                {/* Hour grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {hourLabels.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 border-l first:border-l-0',
                        i % 2 === 0 ? 'bg-muted/20' : ''
                      )}
                    />
                  ))}
                </div>

                {/* Booking bars */}
                {callsignBookings.map((booking) => {
                  const start = new Date(booking.start);
                  const end = new Date(booking.end);
                  const clampedStart = start < dayStart ? dayStart : start;
                  const clampedEnd = end > dayEnd ? dayEnd : end;

                  const leftPercent = calculatePosition(clampedStart, dayStart);
                  const rightPercent = calculatePosition(clampedEnd, dayStart);
                  const widthPercent = rightPercent - leftPercent;

                  // Check if booking is active
                  const now = new Date();
                  const isActive = now >= start && now <= end;

                  return (
                    <Tooltip key={booking.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'absolute top-2 h-10 rounded-md cursor-pointer transition-all',
                            bookingTypeColors[booking.type],
                            isActive && 'ring-2 ring-green-400 animate-pulse-ring',
                            'hover:brightness-110 hover:scale-y-110'
                          )}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(widthPercent, 1)}%`,
                          }}
                        >
                          {widthPercent > 8 && (
                            <div className="px-2 py-1 text-xs text-white truncate h-full flex items-center">
                              {booking.apiKey?.name || booking.cid}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-semibold">{booking.callsign}</div>
                          <div className="text-sm">
                            {format(start, 'HH:mm')} - {format(end, 'HH:mm')}z
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.apiKey?.name || booking.cid}
                          </div>
                          <Badge variant={booking.type as 'booking' | 'event' | 'exam' | 'training'} className="mt-1">
                            {booking.type.toUpperCase()}
                          </Badge>
                          {isActive && (
                            <Badge variant="active" className="ml-1">
                              ACTIVE
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {/* Current time indicator */}
                {currentTimePosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                    style={{ left: `${currentTimePosition}%` }}
                  >
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 border-t bg-muted/30 text-xs">
        <span className="text-muted-foreground font-medium">Types:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Booking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Exam</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>Training</span>
        </div>
        {isToday && (
          <>
            <span className="text-muted-foreground">|</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500" />
              <span>Current Time</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
