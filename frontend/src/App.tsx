import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider>
      <ViewModeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster />
          </ErrorBoundary>
        </TooltipProvider>
      </ViewModeProvider>
    </ThemeProvider>
  );
}

export default App;
