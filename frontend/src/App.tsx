import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrgLoginPage = lazy(() => import('./pages/OrgLoginPage'));
const OrgPortalPage = lazy(() => import('./pages/OrgPortalPage'));
const ApiDocsPage = lazy(() => import('./pages/ApiDocsPage'));

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
                  <Route path="/org/login" element={<OrgLoginPage />} />
                  <Route path="/org" element={<OrgPortalPage />} />
                  <Route path="/api-docs" element={<ApiDocsPage />} />
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
