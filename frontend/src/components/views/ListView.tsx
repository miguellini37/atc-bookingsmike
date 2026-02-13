import * as React from 'react';
import { format } from 'date-fns';
import { cn, getPositionType, getPositionColor, formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/StatusIndicator';
import type { Booking, BookingType } from '@/types';

interface ListViewProps {
  bookings: Booking[];
  onBookingClick?: (booking: Booking) => void;
}

type SortKey = 'callsign' | 'start' | 'end' | 'type' | 'controller' | 'division';
type SortDirection = 'asc' | 'desc';

const bookingTypeBadge: Record<BookingType, 'booking' | 'event' | 'exam' | 'training'> = {
  booking: 'booking',
  event: 'event',
  exam: 'exam',
  training: 'training',
};

export const ListView = React.memo(function ListView({ bookings, onBookingClick }: ListViewProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('start');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedBookings = React.useMemo(() => {
    return [...bookings].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'callsign':
          comparison = a.callsign.localeCompare(b.callsign);
          break;
        case 'start':
          comparison = new Date(a.start).getTime() - new Date(b.start).getTime();
          break;
        case 'end':
          comparison = new Date(a.end).getTime() - new Date(b.end).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'controller':
          comparison = (a.apiKey?.name || a.cid).localeCompare(b.apiKey?.name || b.cid);
          break;
        case 'division':
          comparison = a.division.localeCompare(b.division);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [bookings, sortKey, sortDirection]);

  const SortHeader = ({
    label,
    sortKeyName,
    className,
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
  }) => (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors',
        className
      )}
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  const getBookingStatus = (booking: Booking): 'active' | 'upcoming' | 'completed' => {
    const now = new Date();
    const start = new Date(booking.start);
    const end = new Date(booking.end);
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'upcoming';
    return 'completed';
  };

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed py-12 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 w-10"></th>
              <SortHeader label="Position" sortKeyName="callsign" />
              <SortHeader label="Start" sortKeyName="start" />
              <SortHeader label="End" sortKeyName="end" />
              <SortHeader label="Type" sortKeyName="type" className="w-28" />
              <SortHeader label="Controller" sortKeyName="controller" />
              <SortHeader label="Division" sortKeyName="division" className="w-24" />
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((booking) => {
              const positionType = getPositionType(booking.callsign);
              const positionColors = getPositionColor(positionType);
              const status = getBookingStatus(booking);

              return (
                <tr
                  key={booking.id}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    onBookingClick && 'cursor-pointer',
                    status === 'active' && 'bg-green-500/5'
                  )}
                  onClick={() => onBookingClick?.(booking)}
                >
                  <td className="p-4">
                    <StatusIndicator status={status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', positionColors.badge)} />
                      <span className={cn('font-mono font-medium', positionColors.text)}>
                        {booking.callsign}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatTime(booking.start)}z
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(booking.start), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatTime(booking.end)}z
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(booking.end), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={bookingTypeBadge[booking.type]}>
                      {booking.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.apiKey?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">CID: {booking.cid}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{booking.division}</span>
                      {booking.subdivision && (
                        <span className="text-muted-foreground">/ {booking.subdivision}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
