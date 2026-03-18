import { useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { ToastViewport } from '../components/ui/toast-viewport';
import { bootstrapSession } from '../lib/api';
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth/components/protected-route';
import { ComparePage } from '../pages/ComparePage';
import { DashboardPage } from '../pages/DashboardPage';
import { GenericErrorPage } from '../pages/GenericErrorPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { ModulePage } from '../pages/ModulePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';

function AppLayout() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>
      <SiteFooter />
      <ToastViewport />
    </div>
  );
}

function AppBootstrap() {
  useEffect(() => {
    void bootstrapSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/modules/:slug" element={<ModulePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/error" element={<GenericErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return <AppBootstrap />;
}
