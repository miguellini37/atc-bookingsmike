import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { bookingsApi } from '../lib/api';
import type { Booking, BookingType } from '../types';

const getBookingColor = (type: BookingType): string => {
  switch (type) {
    case 'event':
      return 'bg-red-500';
    case 'exam':
      return 'bg-orange-500';
    case 'training':
      return 'bg-purple-500';
    default:
      return 'bg-blue-500';
  }
};

const getBookingBadge = (type: BookingType): string => {
  switch (type) {
    case 'event':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'exam':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'training':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
};

const getStatusInfo = (start: Date, end: Date) => {
  const now = new Date();

  if (isWithinInterval(now, { start, end })) {
    return {
      status: 'ACTIVE NOW',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      message: `Ends ${formatDistanceToNow(end, { addSuffix: true })}`,
    };
  } else if (isFuture(start)) {
    return {
      status: 'UPCOMING',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      message: `Starts ${formatDistanceToNow(start, { addSuffix: true })}`,
    };
  } else {
    return {
      status: 'COMPLETED',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      message: `Ended ${formatDistanceToNow(end, { addSuffix: true })}`,
    };
  }
};

function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 30 seconds for live countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: allBookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Categorize bookings
  const now = new Date();
  const activeBookings = allBookings.filter((b) =>
    isWithinInterval(now, { start: new Date(b.start), end: new Date(b.end) })
  );

  const upcomingBookings = allBookings
    .filter((b) => isFuture(new Date(b.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);

  const recentlyCompleted = allBookings
    .filter((b) => isPast(new Date(b.end)))
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, 5);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">ATC Positions</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {format(currentTime, 'HH:mm:ss')}
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-primary">
          Refresh
        </button>
      </div>

      {/* Active Bookings - Most Prominent */}
      {activeBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Active Now ({activeBookings.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeBookings.map((booking) => {
              const status = getStatusInfo(new Date(booking.start), new Date(booking.end));
              return (
                <BookingCard key={booking.id} booking={booking} status={status} prominent />
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Coming Up Next ({upcomingBookings.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => {
              const status = getStatusInfo(new Date(booking.start), new Date(booking.end));
              return <BookingCard key={booking.id} booking={booking} status={status} />;
            })}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-600 mb-4">Recently Completed</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentlyCompleted.map((booking) => {
              const status = getStatusInfo(new Date(booking.start), new Date(booking.end));
              return <BookingCard key={booking.id} booking={booking} status={status} compact />;
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allBookings.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
          <p className="text-gray-600">There are currently no ATC positions booked.</p>
        </div>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  status: ReturnType<typeof getStatusInfo>;
  prominent?: boolean;
  compact?: boolean;
}

function BookingCard({ booking, status, prominent = false, compact = false }: BookingCardProps) {
  const start = new Date(booking.start);
  const end = new Date(booking.end);

  return (
    <div
      className={`
        card hover:shadow-xl transition-all duration-200 border-2 animate-slide-in
        ${status.borderColor}
        ${prominent ? 'ring-4 ring-green-200 active-glow' : ''}
        ${compact ? 'p-4' : ''}
      `}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${status.color} text-white
            ${prominent ? 'text-sm px-4 py-2' : ''}
          `}
        >
          {status.status}
        </span>
        <span className={`px-2 py-1 rounded border text-xs font-medium ${getBookingBadge(booking.type)}`}>
          {booking.type}
        </span>
      </div>

      {/* Position/Callsign - LARGE and Prominent */}
      <div className="mb-3">
        <div className={`font-black tracking-tight ${prominent ? 'text-4xl' : compact ? 'text-2xl' : 'text-3xl'} text-gray-900`}>
          {booking.callsign}
        </div>
      </div>

      {/* Controller Name */}
      <div className="mb-4">
        <div className={`flex items-center gap-2 ${prominent ? 'text-xl' : compact ? 'text-base' : 'text-lg'}`}>
          <span className="text-gray-500">👤</span>
          <span className="font-semibold text-gray-800">
            {booking.apiKey?.name || 'Unknown Controller'}
          </span>
        </div>
      </div>

      {/* Time Information */}
      <div className={`space-y-2 ${compact ? 'text-sm' : 'text-base'}`}>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">🕐</span>
          <span className="font-mono">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">📅</span>
          <span>{format(start, 'EEE, MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Countdown/Status Message */}
      <div className={`mt-4 pt-4 border-t-2 ${status.borderColor}`}>
        <div className={`font-bold ${status.textColor} ${prominent ? 'text-lg' : 'text-base'}`}>
          {status.message}
        </div>
      </div>

      {/* Division/Subdivision Info */}
      <div className="mt-3 flex gap-2 text-xs">
        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
          {booking.division}
        </span>
        {booking.subdivision && (
          <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
            {booking.subdivision}
          </span>
        )}
      </div>
    </div>
  );
}

export default HomePage;
