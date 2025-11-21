import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold hover:text-primary-100 transition-colors">
              VATSIM ATC Booking Calendar
            </Link>
            <nav className="flex gap-4">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Calendar
              </Link>
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>VATSIM ATC Booking System - Modern TypeScript Edition</p>
          <p className="text-sm mt-2">Built with React, TypeScript, Express & Prisma</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
