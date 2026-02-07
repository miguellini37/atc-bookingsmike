import { TileLayer } from 'react-leaflet';
import { useTheme } from '@/contexts/ThemeContext';

const CARTO_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const CARTO_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function TileLayerWithTheme() {
  const { resolvedTheme } = useTheme();
  const url = resolvedTheme === 'dark' ? CARTO_DARK : CARTO_LIGHT;

  return <TileLayer key={resolvedTheme} attribution={ATTRIBUTION} url={url} />;
}
