import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import type { Booking } from '@/types';
import {
  loadAirports,
  loadFirs,
  loadBoundaries,
  resolveCallsign,
} from '@/lib/vatspy';
import { TileLayerWithTheme } from './map/TileLayerWithTheme';
import { AirportMarker } from './map/AirportMarker';
import { FirBoundaryLayer } from './map/FirBoundaryLayer';
import { MapLegend } from './map/MapLegend';

interface MapViewProps {
  bookings: Booking[];
}

interface AirportGroup {
  lat: number;
  lon: number;
  name: string;
  bookings: Booking[];
}

interface FirGroup {
  boundaryId: string;
  name: string;
  bookings: Booking[];
}

export function MapView({ bookings }: MapViewProps) {
  // Load VATSpy data with infinite stale time (static data)
  const { data: airports } = useQuery({
    queryKey: ['vatspy-airports'],
    queryFn: loadAirports,
    staleTime: Infinity,
  });

  const { data: firs } = useQuery({
    queryKey: ['vatspy-firs'],
    queryFn: loadFirs,
    staleTime: Infinity,
  });

  const { data: boundaries } = useQuery({
    queryKey: ['vatspy-boundaries'],
    queryFn: loadBoundaries,
    staleTime: Infinity,
  });

  // Resolve bookings to map positions and group
  const { airportGroups, firGroups, unmappedCount } = React.useMemo(() => {
    if (!airports || !firs) {
      return { airportGroups: [], firGroups: [], unmappedCount: 0 };
    }

    const airportMap = new Map<string, AirportGroup>();
    const firMap = new Map<string, FirGroup>();
    let unmapped = 0;

    for (const booking of bookings) {
      const resolved = resolveCallsign(booking.callsign, airports, firs);

      if (!resolved) {
        unmapped++;
        console.warn('[MapView] Unmapped callsign:', booking.callsign);
        continue;
      }

      if (resolved.type === 'airport' && resolved.lat != null && resolved.lon != null) {
        const key = `${resolved.lat},${resolved.lon}`;
        const existing = airportMap.get(key);
        if (existing) {
          existing.bookings.push(booking);
        } else {
          airportMap.set(key, {
            lat: resolved.lat,
            lon: resolved.lon,
            name: resolved.name,
            bookings: [booking],
          });
        }
      } else if (resolved.type === 'fir' && resolved.boundaryId) {
        const key = resolved.boundaryId;
        const existing = firMap.get(key);
        if (existing) {
          existing.bookings.push(booking);
        } else {
          firMap.set(key, {
            boundaryId: resolved.boundaryId,
            name: resolved.name,
            bookings: [booking],
          });
        }
      } else {
        unmapped++;
      }
    }

    return {
      airportGroups: Array.from(airportMap.values()),
      firGroups: Array.from(firMap.values()),
      unmappedCount: unmapped,
    };
  }, [bookings, airports, firs]);

  // Build a lookup from boundary ID to GeoJSON feature
  const boundaryFeatures = React.useMemo(() => {
    if (!boundaries) return new Map<string, GeoJSON.Feature>();
    const map = new Map<string, GeoJSON.Feature>();
    for (const feature of boundaries.features) {
      const id = feature.properties?.id;
      if (id) map.set(id, feature);
    }
    return map;
  }, [boundaries]);

  const isLoading = !airports || !firs;

  return (
    <div className="relative rounded-lg border overflow-hidden" style={{ height: '70vh' }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full bg-card">
          <div className="text-muted-foreground text-sm">Loading map data...</div>
        </div>
      ) : (
        <>
          <MapContainer
            center={[30, 0]}
            zoom={2}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayerWithTheme />

            {/* Airport markers */}
            {airportGroups.map((group) => (
              <AirportMarker
                key={`${group.lat},${group.lon}`}
                lat={group.lat}
                lon={group.lon}
                locationName={group.name}
                bookings={group.bookings}
              />
            ))}

            {/* FIR boundary polygons */}
            {firGroups.map((group) => {
              const feature = boundaryFeatures.get(group.boundaryId);
              if (!feature) return null;
              return (
                <FirBoundaryLayer
                  key={group.boundaryId}
                  boundaryId={group.boundaryId}
                  locationName={group.name}
                  bookings={group.bookings}
                  feature={feature}
                />
              );
            })}
          </MapContainer>

          <MapLegend />

          {/* Unmapped bookings notice */}
          {unmappedCount > 0 && (
            <div className="absolute top-4 right-4 z-[1000] rounded-lg border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {unmappedCount} booking{unmappedCount !== 1 ? 's' : ''} not mapped
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
