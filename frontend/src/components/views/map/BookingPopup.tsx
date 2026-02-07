import { format } from 'date-fns';
import type { Booking } from '@/types';
import { getPositionType, getPositionName } from '@/lib/utils';
import { getPositionHexColor } from '@/lib/vatspy';

interface BookingPopupProps {
  bookings: Booking[];
  locationName: string;
}

export function BookingPopupContent({ bookings, locationName }: BookingPopupProps) {
  return (
    <div className="min-w-[200px] max-w-[300px]">
      <div className="font-semibold text-sm mb-2 pb-1 border-b border-current/20">
        {locationName}
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {bookings.map((booking) => {
          const posType = getPositionType(booking.callsign);
          const color = getPositionHexColor(posType);
          return (
            <div key={booking.id} className="text-xs space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono font-medium">{booking.callsign}</span>
                <span className="text-[10px] opacity-70">
                  {getPositionName(posType)}
                </span>
              </div>
              <div className="pl-3.5 opacity-80">
                {format(new Date(booking.start), 'dd MMM HH:mm')}z –{' '}
                {format(new Date(booking.end), 'HH:mm')}z
              </div>
              {booking.apiKey?.name && (
                <div className="pl-3.5 opacity-60 truncate">
                  {booking.apiKey.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
