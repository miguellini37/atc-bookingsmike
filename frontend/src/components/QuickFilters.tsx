import * as React from 'react';
import { Zap, Clock, Sunrise, CalendarDays, GraduationCap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingType } from '@/types';
import type { FilterState } from './FilterBar';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  apply: (currentFilters: FilterState) => Partial<FilterState>;
  isActive: (filters: FilterState) => boolean;
}

const quickFilters: QuickFilter[] = [
  {
    id: 'active',
    label: 'Active Now',
    icon: <Zap className="h-4 w-4" />,
    apply: () => ({ timeRange: 'active' as const }),
    isActive: (f) => f.timeRange === 'active',
  },
  {
    id: 'today',
    label: 'Today',
    icon: <Clock className="h-4 w-4" />,
    apply: () => ({ timeRange: 'today' as const }),
    isActive: (f) => f.timeRange === 'today',
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    icon: <Sunrise className="h-4 w-4" />,
    apply: () => ({ timeRange: 'tomorrow' as const }),
    isActive: (f) => f.timeRange === 'tomorrow',
  },
  {
    id: 'week',
    label: 'This Week',
    icon: <CalendarDays className="h-4 w-4" />,
    apply: () => ({ timeRange: 'week' as const }),
    isActive: (f) => f.timeRange === 'week',
  },
  {
    id: 'events',
    label: 'Events',
    icon: <Star className="h-4 w-4" />,
    apply: () => ({ bookingTypes: [BookingType.EVENT] }),
    isActive: (f) => f.bookingTypes.length === 1 && f.bookingTypes[0] === BookingType.EVENT,
  },
  {
    id: 'training',
    label: 'Training',
    icon: <GraduationCap className="h-4 w-4" />,
    apply: () => ({ bookingTypes: [BookingType.TRAINING] }),
    isActive: (f) => f.bookingTypes.length === 1 && f.bookingTypes[0] === BookingType.TRAINING,
  },
];

interface QuickFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

export function QuickFilters({ filters, onChange, className }: QuickFiltersProps) {
  const handleClick = (filter: QuickFilter) => {
    if (filter.isActive(filters)) {
      // Toggle off - only reset the properties this filter controls
      const appliedKeys = Object.keys(filter.apply(filters));
      const reset: Partial<FilterState> = {};
      for (const key of appliedKeys) {
        if (key === 'timeRange') reset.timeRange = 'all';
        if (key === 'bookingTypes') reset.bookingTypes = [];
      }
      onChange({
        ...filters,
        ...reset,
      });
    } else {
      onChange({
        ...filters,
        ...filter.apply(filters),
      });
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {quickFilters.map((filter) => {
        const isActive = filter.isActive(filters);
        return (
          <button
            key={filter.id}
            onClick={() => handleClick(filter)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {filter.icon}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
