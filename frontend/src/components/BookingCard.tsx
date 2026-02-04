import { Clock, Calendar, User, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getPositionType, getPositionColor, formatTime } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/StatusIndicator';
import { TimeRangeDisplay } from '@/components/Countdown';
import type { Booking, BookingType } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

const bookingTypeBadge: Record<BookingType, 'booking' | 'event' | 'exam' | 'training'> = {
  booking: 'booking',
  event: 'event',
  exam: 'exam',
  training: 'training',
};

function getBookingStatus(booking: Booking): 'active' | 'upcoming' | 'completed' {
  const now = new Date();
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  if (now >= start && now <= end) return 'active';
  if (now < start) return 'upcoming';
  return 'completed';
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const positionType = getPositionType(booking.callsign);
  const positionColors = getPositionColor(positionType);
  const status = getBookingStatus(booking);

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        status === 'active' && 'ring-2 ring-green-500/50 active-glow',
        status === 'completed' && 'opacity-60',
        onClick && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      {/* Position type color accent */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', positionColors.badge)} />

      <div className="p-5 pl-6">
        {/* Header: Callsign and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <StatusIndicator status={status} size="lg" />
            <div>
              <div className={cn('text-2xl font-bold font-mono tracking-tight', positionColors.text)}>
                {booking.callsign}
              </div>
              <Badge variant={positionType.toLowerCase() as 'del' | 'gnd' | 'twr' | 'app' | 'dep' | 'ctr' | 'fss'} className="mt-1">
                {positionType}
              </Badge>
            </div>
          </div>

          <Badge variant={bookingTypeBadge[booking.type]} className="shrink-0">
            {booking.type.toUpperCase()}
          </Badge>
        </div>

        {/* Time Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatTime(booking.start)} - {formatTime(booking.end)}z
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.start), 'EEEE, dd MMM yyyy')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Radio className="h-4 w-4 text-muted-foreground" />
            <TimeRangeDisplay start={booking.start} end={booking.end} />
          </div>
        </div>

        {/* Controller Info */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{booking.apiKey?.name || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">CID: {booking.cid}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{booking.division}</div>
            {booking.subdivision && (
              <div className="text-xs text-muted-foreground">{booking.subdivision}</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface BookingCardGridProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

export function BookingCardGrid({ bookings, onBookingClick }: BookingCardGridProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed py-12 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onClick={onBookingClick ? () => onBookingClick(booking) : undefined}
        />
      ))}
    </div>
  );
}
