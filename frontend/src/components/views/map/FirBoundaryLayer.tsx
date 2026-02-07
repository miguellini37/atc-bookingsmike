import { GeoJSON, Popup } from 'react-leaflet';
import type { Booking } from '@/types';
import { getPositionType } from '@/lib/utils';
import { getPositionHexColor } from '@/lib/vatspy';
import { BookingPopupContent } from './BookingPopup';

interface FirBoundaryLayerProps {
  boundaryId: string;
  locationName: string;
  bookings: Booking[];
  feature: GeoJSON.Feature;
}

export function FirBoundaryLayer({
  locationName,
  bookings,
  feature,
}: FirBoundaryLayerProps) {
  const primaryType = getPositionType(bookings[0].callsign);
  const color = getPositionHexColor(primaryType);

  return (
    <GeoJSON
      key={`${feature.properties?.id}-${bookings.map((b) => b.id).join(',')}`}
      data={feature}
      style={{
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.6,
      }}
    >
      <Popup>
        <BookingPopupContent bookings={bookings} locationName={locationName} />
      </Popup>
    </GeoJSON>
  );
}
