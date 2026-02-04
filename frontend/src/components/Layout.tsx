import { Outlet, Link, useLocation } from 'react-router-dom';
import { Plane, Calendar, Settings, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LiveClock } from '@/components/LiveClock';

function Layout() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Bookings', icon: <Calendar className="h-4 w-4" /> },
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">ATC Booking System</h1>
                <p className="text-xs text-slate-400">VATSIM Position Management</p>
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
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plane className="h-4 w-4" />
              <span>VATSIM ATC Booking System</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with React + TypeScript + Express</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
