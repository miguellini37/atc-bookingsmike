import * as React from 'react';

export type ViewMode = 'timeline' | 'cards' | 'list' | 'map';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = React.createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'atc-booking-view-mode';

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = React.useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'cards';
    const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    return stored || 'cards';
  });

  const setViewMode = React.useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = React.useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
