import * as React from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { cn, type PositionType } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingType } from '@/types';

export interface FilterState {
  search: string;
  positionTypes: PositionType[];
  bookingTypes: BookingType[];
  timeRange: 'all' | 'today' | 'tomorrow' | 'week' | 'month';
  division: string;
  subdivision: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  divisions?: string[];
  subdivisions?: string[];
}

const positionTypeOptions: { value: PositionType; label: string; color: string }[] = [
  { value: 'CTR', label: 'CTR', color: 'bg-red-500' },
  { value: 'APP', label: 'APP', color: 'bg-purple-500' },
  { value: 'DEP', label: 'DEP', color: 'bg-orange-500' },
  { value: 'TWR', label: 'TWR', color: 'bg-blue-500' },
  { value: 'GND', label: 'GND', color: 'bg-green-500' },
  { value: 'DEL', label: 'DEL', color: 'bg-cyan-500' },
  { value: 'FSS', label: 'FSS', color: 'bg-gray-500' },
];

const bookingTypeOptions: { value: BookingType; label: string }[] = [
  { value: BookingType.BOOKING, label: 'Booking' },
  { value: BookingType.EVENT, label: 'Event' },
  { value: BookingType.EXAM, label: 'Exam' },
  { value: BookingType.TRAINING, label: 'Training' },
];

const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today (UTC)' },
  { value: 'tomorrow', label: 'Tomorrow (UTC)' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export const defaultFilters: FilterState = {
  search: '',
  positionTypes: [],
  bookingTypes: [],
  timeRange: 'all',
  division: '',
  subdivision: '',
};

export function FilterBar({ filters, onChange, divisions = [], subdivisions = [] }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.positionTypes.length +
    filters.bookingTypes.length +
    (filters.timeRange !== 'all' ? 1 : 0) +
    (filters.division ? 1 : 0) +
    (filters.subdivision ? 1 : 0);

  const togglePositionType = (type: PositionType) => {
    const newTypes = filters.positionTypes.includes(type)
      ? filters.positionTypes.filter((t) => t !== type)
      : [...filters.positionTypes, type];
    onChange({ ...filters, positionTypes: newTypes });
  };

  const toggleBookingType = (type: BookingType) => {
    const newTypes = filters.bookingTypes.includes(type)
      ? filters.bookingTypes.filter((t) => t !== type)
      : [...filters.bookingTypes, type];
    onChange({ ...filters, bookingTypes: newTypes });
  };

  const clearAll = () => {
    onChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search callsign or controller..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Time range select */}
        <Select
          value={filters.timeRange}
          onValueChange={(value) =>
            onChange({ ...filters, timeRange: value as FilterState['timeRange'] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Division select */}
        {divisions.length > 0 && (
          <Select
            value={filters.division}
            onValueChange={(value) => onChange({ ...filters, division: value === 'all' ? '' : value, subdivision: '' })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Subdivision select */}
        {subdivisions.length > 0 && (
          <Select
            value={filters.subdivision}
            onValueChange={(value) => onChange({ ...filters, subdivision: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subdivision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subdivisions</SelectItem>
              {subdivisions.map((subdivision) => (
                <SelectItem key={subdivision} value={subdivision}>
                  {subdivision}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Expand/collapse button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2">
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4 space-y-4 animate-fade-in">
          {/* Position types */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Position Type
            </label>
            <div className="flex flex-wrap gap-2">
              {positionTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => togglePositionType(option.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    filters.positionTypes.includes(option.value)
                      ? `${option.color} text-white`
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      filters.positionTypes.includes(option.value) ? 'bg-white' : option.color
                    )}
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Booking types */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Booking Type</label>
            <div className="flex flex-wrap gap-2">
              {bookingTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleBookingType(option.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    filters.bookingTypes.includes(option.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
