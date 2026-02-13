import * as React from 'react';

export type TimezoneMode = 'UTC' | 'local';

interface TimezoneContextType {
  timezone: TimezoneMode;
  setTimezone: (tz: TimezoneMode) => void;
  tzString: string;
}

const TimezoneContext = React.createContext<TimezoneContextType | undefined>(undefined);

const STORAGE_KEY = 'atc-booking-timezone';

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = React.useState<TimezoneMode>(() => {
    if (typeof window === 'undefined') return 'UTC';
    const stored = localStorage.getItem(STORAGE_KEY) as TimezoneMode | null;
    return stored === 'local' ? 'local' : 'UTC';
  });

  const setTimezone = React.useCallback((tz: TimezoneMode) => {
    setTimezoneState(tz);
    localStorage.setItem(STORAGE_KEY, tz);
  }, []);

  const tzString = timezone === 'UTC' ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, tzString }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = React.useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
