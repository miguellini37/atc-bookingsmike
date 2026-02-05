import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, Building2, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LiveClock } from '@/components/LiveClock';

function Layout() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Bookings', icon: <Calendar className="h-4 w-4" /> },
    { to: '/org/login', label: 'Organization', icon: <Building2 className="h-4 w-4" /> },
    { to: '/api-docs', label: 'API', icon: <FileCode className="h-4 w-4" /> },
    { to: '/admin', label: 'Admin', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Aviation-inspired dark theme */}
      <header className="sticky top-0 z-50 w-full border-b bg-slate-900 text-slate-100 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/vatsim-logo.png"
                alt="VATSIM"
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">ATC Booking System</h1>
                <p className="text-xs text-slate-400">Position Management</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    )}
                  >
                    {link.icon}
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side: Clock and Theme Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5">
                <LiveClock showIcon showLabel className="text-sm text-slate-300" />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <a
              href="https://vatsim.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <img
                src="/vatsim-logo.png"
                alt="VATSIM"
                className="h-5 w-auto"
              />
            </a>
            <span className="text-sm text-muted-foreground">
              Not affiliated with or endorsed by VATSIM
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
