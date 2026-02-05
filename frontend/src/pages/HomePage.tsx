import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  isPast,
  isFuture,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { RefreshCw, Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { useViewMode } from '@/contexts/ViewModeContext';
import { getPositionType } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { FilterBar, defaultFilters, type FilterState } from '@/components/FilterBar';
import { QuickFilters } from '@/components/QuickFilters';
import { TimelineView } from '@/components/views/TimelineView';
import { ListView } from '@/components/views/ListView';
import { BookingCardGrid } from '@/components/BookingCard';
import { BookingCardSkeletonGrid } from '@/components/skeletons/BookingCardSkeleton';
import { TimelineSkeleton } from '@/components/skeletons/TimelineRowSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

function HomePage() {
  const { viewMode } = useViewMode();
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const {
    data: allBookings = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Extract unique divisions for filter dropdown
  const divisions = React.useMemo(() => {
    const divisionSet = new Set(allBookings.map((b) => b.division));
    return Array.from(divisionSet).sort();
  }, [allBookings]);

  // Extract unique subdivisions for selected division (or all if no division selected)
  const subdivisions = React.useMemo(() => {
    const filtered = filters.division
      ? allBookings.filter((b) => b.division === filters.division)
      : allBookings;
    const subdivSet = new Set(
      filtered.map((b) => b.subdivision).filter((s): s is string => !!s)
    );
    return Array.from(subdivSet).sort();
  }, [allBookings, filters.division]);

  // Apply filters to bookings
  const filteredBookings = React.useMemo(() => {
    let result = [...allBookings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.callsign.toLowerCase().includes(searchLower) ||
          b.apiKey?.name?.toLowerCase().includes(searchLower) ||
          b.cid.toLowerCase().includes(searchLower)
      );
    }

    // Position type filter
    if (filters.positionTypes.length > 0) {
      result = result.filter((b) => {
        const posType = getPositionType(b.callsign);
        return filters.positionTypes.includes(posType);
      });
    }

    // Booking type filter
    if (filters.bookingTypes.length > 0) {
      result = result.filter((b) => filters.bookingTypes.includes(b.type));
    }

    // Division filter
    if (filters.division) {
      result = result.filter((b) => b.division === filters.division);
    }

    // Subdivision filter
    if (filters.subdivision) {
      result = result.filter((b) => b.subdivision === filters.subdivision);
    }

    // Time range filter
    const now = new Date();
    if (filters.timeRange !== 'all') {
      let rangeStart: Date;
      let rangeEnd: Date;

      switch (filters.timeRange) {
        case 'today':
          rangeStart = startOfDay(now);
          rangeEnd = endOfDay(now);
          break;
        case 'week':
          rangeStart = startOfWeek(now);
          rangeEnd = endOfWeek(now);
          break;
        case 'month':
          rangeStart = startOfMonth(now);
          rangeEnd = endOfMonth(now);
          break;
        default:
          rangeStart = new Date(0);
          rangeEnd = new Date(8640000000000000);
      }

      result = result.filter((b) => {
        const start = new Date(b.start);
        const end = new Date(b.end);
        return (
          isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
          isWithinInterval(end, { start: rangeStart, end: rangeEnd }) ||
          (start <= rangeStart && end >= rangeEnd)
        );
      });
    }

    return result;
  }, [allBookings, filters]);

  // Categorize bookings for cards view
  const now = new Date();
  const activeBookings = filteredBookings.filter((b) =>
    isWithinInterval(now, { start: new Date(b.start), end: new Date(b.end) })
  );

  const upcomingBookings = filteredBookings
    .filter((b) => isFuture(new Date(b.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const completedBookings = filteredBookings
    .filter((b) => isPast(new Date(b.end)))
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, 10);

  // Date navigation for timeline view
  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate((prev) => addDays(prev, direction === 'next' ? 1 : -1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-xl text-destructive">Error loading bookings. Please try again.</div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ATC Bookings</h1>
          <p className="text-muted-foreground">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            {activeBookings.length > 0 && (
              <span className="ml-2 text-green-500 font-medium">
                ({activeBookings.length} active)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ViewModeToggle />
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm text-muted-foreground">
          While controllers are able to book positions on their local facility websites, this serves as no ultimate guarantee that the position will be open at the published time. Remember that this is a voluntary network and members are providing this service in their spare time.
        </AlertDescription>
      </Alert>

      {/* Quick Filters */}
      <QuickFilters filters={filters} onChange={setFilters} />

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={setFilters} divisions={divisions} subdivisions={subdivisions} />

      {/* Timeline Date Navigator (only for timeline view) */}
      {viewMode === 'timeline' && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Day
          </Button>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              {selectedDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
            Next Day
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Content based on view mode */}
      {isLoading ? (
        viewMode === 'timeline' ? (
          <TimelineSkeleton />
        ) : (
          <BookingCardSkeletonGrid />
        )
      ) : (
        <>
          {viewMode === 'timeline' && (
            <TimelineView bookings={filteredBookings} date={selectedDate} />
          )}

          {viewMode === 'list' && <ListView bookings={filteredBookings} />}

          {viewMode === 'cards' && (
            <div className="space-y-8">
              {/* Active Bookings - Most Prominent */}
              {activeBookings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-green-500 mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-dot" />
                    Active Now ({activeBookings.length})
                  </h2>
                  <BookingCardGrid bookings={activeBookings} />
                </section>
              )}

              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    Upcoming ({upcomingBookings.length})
                  </h2>
                  <BookingCardGrid bookings={upcomingBookings} />
                </section>
              )}

              {/* Recently Completed */}
              {completedBookings.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-muted-foreground mb-4">
                    Recently Completed
                  </h2>
                  <BookingCardGrid bookings={completedBookings} />
                </section>
              )}

              {/* Empty State */}
              {filteredBookings.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {allBookings.length === 0
                      ? 'There are currently no ATC positions booked.'
                      : 'No bookings match your current filters. Try adjusting your search criteria.'}
                  </p>
                  {allBookings.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setFilters(defaultFilters)}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
