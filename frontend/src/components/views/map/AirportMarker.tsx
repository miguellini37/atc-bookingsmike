import { CircleMarker, Popup } from 'react-leaflet';
import type { Booking } from '@/types';
import { getPositionType } from '@/lib/utils';
import { getPositionHexColor } from '@/lib/vatspy';
import { BookingPopupContent } from './BookingPopup';

interface AirportMarkerProps {
  lat: number;
  lon: number;
  locationName: string;
  bookings: Booking[];
}

export function AirportMarker({ lat, lon, locationName, bookings }: AirportMarkerProps) {
  // Use the first booking's position type for the marker color
  const primaryType = getPositionType(bookings[0].callsign);
  const color = getPositionHexColor(primaryType);

  // Scale radius based on number of bookings
  const radius = Math.min(6 + bookings.length * 2, 14);

  return (
    <CircleMarker
      center={[lat, lon]}
      radius={radius}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
        opacity: 0.9,
      }}
    >
      <Popup>
        <BookingPopupContent bookings={bookings} locationName={locationName} />
      </Popup>
    </CircleMarker>
  );
}
