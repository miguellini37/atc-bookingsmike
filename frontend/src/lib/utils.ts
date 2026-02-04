import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Position types for ATC callsigns
 */
export type PositionType = 'DEL' | 'GND' | 'TWR' | 'APP' | 'DEP' | 'CTR' | 'FSS' | 'UNKNOWN';

/**
 * Extracts the position type suffix from an ATC callsign
 * @example getPositionType('KJFK_TWR') => 'TWR'
 */
export function getPositionType(callsign: string): PositionType {
  const suffix = callsign.split('_').pop()?.toUpperCase();
  const validTypes: PositionType[] = ['DEL', 'GND', 'TWR', 'APP', 'DEP', 'CTR', 'FSS'];
  return validTypes.includes(suffix as PositionType) ? (suffix as PositionType) : 'UNKNOWN';
}

/**
 * Returns Tailwind CSS classes for a position type
 */
export function getPositionColor(type: PositionType): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  badge: string;
} {
  const colors: Record<PositionType, { bg: string; text: string; border: string; ring: string; badge: string }> = {
    DEL: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-500',
      border: 'border-cyan-500',
      ring: 'ring-cyan-500/30',
      badge: 'bg-cyan-500 text-white',
    },
    GND: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500',
      ring: 'ring-green-500/30',
      badge: 'bg-green-500 text-white',
    },
    TWR: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500',
      ring: 'ring-blue-500/30',
      badge: 'bg-blue-500 text-white',
    },
    APP: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500',
      ring: 'ring-purple-500/30',
      badge: 'bg-purple-500 text-white',
    },
    DEP: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      border: 'border-orange-500',
      ring: 'ring-orange-500/30',
      badge: 'bg-orange-500 text-white',
    },
    CTR: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500',
      ring: 'ring-red-500/30',
      badge: 'bg-red-500 text-white',
    },
    FSS: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-500',
      border: 'border-gray-500',
      ring: 'ring-gray-500/30',
      badge: 'bg-gray-500 text-white',
    },
    UNKNOWN: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-500',
      border: 'border-slate-500',
      ring: 'ring-slate-500/30',
      badge: 'bg-slate-500 text-white',
    },
  };
  return colors[type];
}

/**
 * Returns the full position name
 */
export function getPositionName(type: PositionType): string {
  const names: Record<PositionType, string> = {
    DEL: 'Delivery',
    GND: 'Ground',
    TWR: 'Tower',
    APP: 'Approach',
    DEP: 'Departure',
    CTR: 'Center',
    FSS: 'Flight Service',
    UNKNOWN: 'Unknown',
  };
  return names[type];
}

/**
 * Format time for display (24hr format)
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}z`;
}

/**
 * Get relative time description
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'now';
  if (diffMins > 0) {
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h ${diffMins % 60}m`;
    return `in ${diffDays}d`;
  } else {
    const absMins = Math.abs(diffMins);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMins < 60) return `${absMins}m ago`;
    if (absHours < 24) return `${absHours}h ago`;
    return `${absDays}d ago`;
  }
}
