import { getPositionHexColor } from '@/lib/vatspy';
import type { PositionType } from '@/lib/utils';
import { getPositionName } from '@/lib/utils';

const POSITION_TYPES: PositionType[] = ['DEL', 'GND', 'TWR', 'APP', 'DEP', 'CTR', 'FSS'];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border bg-card/95 backdrop-blur p-3 shadow-lg">
      <div className="text-xs font-semibold mb-1.5 text-card-foreground">Position Types</div>
      <div className="space-y-1">
        {POSITION_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2 text-xs text-card-foreground/80">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getPositionHexColor(type) }}
            />
            <span>
              {type} – {getPositionName(type)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
