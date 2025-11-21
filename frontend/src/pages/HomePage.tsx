import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { bookingsApi } from '../lib/api';
import type { Booking, BookingType } from '../types';

// Setup date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = momentLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
} as any); // Type assertion due to react-big-calendar typing issues

interface BookingEvent extends Event {
  id: number;
  resource: Booking;
}

const getBookingColor = (type: BookingType): string => {
  switch (type) {
    case 'event':
      return '#ef4444'; // Red
    case 'exam':
      return '#f59e0b'; // Orange
    case 'training':
      return '#8b5cf6'; // Purple
    default:
      return '#0ea5e9'; // Blue
  }
};

function HomePage() {
  const [view, setView] = useState<'current' | 'past' | 'future'>('current');

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', view],
    queryFn: () => bookingsApi.getAll({ order: view }),
  });

  const events: BookingEvent[] = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.callsign} - ${booking.apiKey?.name || 'Unknown'}`,
    start: new Date(booking.start),
    end: new Date(booking.end),
    resource: booking,
  }));

  const eventStyleGetter = (event: BookingEvent) => {
    const backgroundColor = getBookingColor(event.resource.type);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-red-600">Error loading bookings. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ATC Booking Calendar</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setView('past')}
            className={`btn ${view === 'past' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Past
          </button>
          <button
            onClick={() => setView('current')}
            className={`btn ${view === 'current' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Current
          </button>
          <button
            onClick={() => setView('future')}
            className={`btn ${view === 'future' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Future
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0ea5e9' }}></div>
            <span>Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span>Training</span>
          </div>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          tooltipAccessor={(event: BookingEvent) => {
            const b = event.resource;
            return `${b.callsign}\nType: ${b.type}\nDivision: ${b.division}\nController: ${b.apiKey?.name || 'Unknown'}`;
          }}
        />
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No bookings found for this time period.
        </div>
      )}
    </div>
  );
}

export default HomePage;
