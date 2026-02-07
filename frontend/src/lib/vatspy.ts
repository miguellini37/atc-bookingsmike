import type { PositionType } from './utils';

// --- Types ---

export interface AirportData {
  name: string;
  lat: number;
  lon: number;
  fir: string;
}

export interface FirData {
  icao: string;
  name: string;
  boundaryId: string;
}

export interface ResolvedPosition {
  type: 'airport' | 'fir';
  /** For airports: lat/lon. For FIRs: undefined (use boundary polygon). */
  lat?: number;
  lon?: number;
  /** For FIRs: the boundary ID to find in the GeoJSON. */
  boundaryId?: string;
  /** Display name */
  name: string;
}

// --- In-memory caches ---

let airportsCache: Record<string, AirportData> | null = null;
let firsCache: Record<string, FirData> | null = null;
let boundariesCache: GeoJSON.FeatureCollection | null = null;

// --- Loaders ---

export async function loadAirports(): Promise<Record<string, AirportData>> {
  if (airportsCache) return airportsCache;
  const res = await fetch('/data/airports.json');
  airportsCache = await res.json();
  return airportsCache!;
}

export async function loadFirs(): Promise<Record<string, FirData>> {
  if (firsCache) return firsCache;
  const res = await fetch('/data/firs.json');
  firsCache = await res.json();
  return firsCache!;
}

export async function loadBoundaries(): Promise<GeoJSON.FeatureCollection> {
  if (boundariesCache) return boundariesCache;
  const res = await fetch('/data/boundaries.geojson');
  boundariesCache = await res.json();
  return boundariesCache!;
}

// --- Callsign Resolution ---

const AIRPORT_SUFFIXES = new Set(['DEL', 'GND', 'TWR', 'APP', 'DEP']);
const FIR_SUFFIXES = new Set(['CTR', 'FSS']);

/**
 * Resolve a callsign to a map position.
 *
 * Airport positions (DEL/GND/TWR/APP/DEP):
 *   Strip suffix, look up ICAO in airports.json → lat/lon
 *
 * FIR positions (CTR/FSS):
 *   Strip suffix, look up callsign prefix in firs.json → boundaryId
 */
export function resolveCallsign(
  callsign: string,
  airports: Record<string, AirportData>,
  firs: Record<string, FirData>
): ResolvedPosition | null {
  const parts = callsign.split('_');
  const suffix = parts[parts.length - 1]?.toUpperCase();

  if (AIRPORT_SUFFIXES.has(suffix)) {
    // Everything before the last underscore is the ICAO
    const icao = parts.slice(0, -1).join('_').toUpperCase();
    const airport = airports[icao];
    if (airport) {
      return {
        type: 'airport',
        lat: airport.lat,
        lon: airport.lon,
        name: `${airport.name} (${icao})`,
      };
    }
    return null;
  }

  if (FIR_SUFFIXES.has(suffix)) {
    // The prefix before _CTR/_FSS is the callsign prefix
    const prefix = parts.slice(0, -1).join('_').toUpperCase();
    const fir = firs[prefix];
    if (fir) {
      return {
        type: 'fir',
        boundaryId: fir.boundaryId,
        name: `${fir.name} (${fir.icao})`,
      };
    }
    return null;
  }

  return null;
}

// --- Color Helpers ---

/**
 * Returns hex color for a position type, matching the Tailwind palette used elsewhere.
 */
export function getPositionHexColor(type: PositionType): string {
  const colors: Record<PositionType, string> = {
    DEL: '#06b6d4', // cyan-500
    GND: '#22c55e', // green-500
    TWR: '#3b82f6', // blue-500
    APP: '#a855f7', // purple-500
    DEP: '#f97316', // orange-500
    CTR: '#ef4444', // red-500
    FSS: '#6b7280', // gray-500
    UNKNOWN: '#64748b', // slate-500
  };
  return colors[type];
}

/**
 * Returns hex color for a booking type.
 */
export function getBookingTypeHexColor(
  type: 'booking' | 'event' | 'exam' | 'training'
): string {
  const colors: Record<string, string> = {
    booking: '#3b82f6', // blue
    event: '#ef4444', // red
    exam: '#f97316', // orange
    training: '#a855f7', // purple
  };
  return colors[type] || '#3b82f6';
}
