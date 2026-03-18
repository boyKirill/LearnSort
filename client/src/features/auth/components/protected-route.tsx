import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/auth-store';
import { LoadingScreen } from '../../../components/ui/loading-screen';

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const bootstrapping = useAuthStore((state) => state.bootstrapping);
  const location = useLocation();

  if (bootstrapping) {
    return <LoadingScreen text="Проверяем активную сессию..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const bootstrapping = useAuthStore((state) => state.bootstrapping);

  if (bootstrapping) {
    return <LoadingScreen text="Проверяем активную сессию..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
