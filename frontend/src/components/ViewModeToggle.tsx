import { LayoutGrid, List, GanttChart } from 'lucide-react';
import { useViewMode, type ViewMode } from '@/contexts/ViewModeContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const viewModes: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
  { value: 'timeline', icon: <GanttChart className="h-4 w-4" />, label: 'Timeline' },
  { value: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Cards' },
  { value: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
];

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
      <TabsList>
        {viewModes.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <TabsTrigger value={mode.value} className="gap-2 px-3">
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">
              <p>{mode.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TabsList>
    </Tabs>
  );
}
