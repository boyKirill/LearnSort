import { BarChart3, BookOpenText, LogOut, UserCircle2 } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../features/auth/store/auth-store';
import { api, handleApiError } from '../lib/api';
import { showToast } from '../lib/toast-store';
import { Button } from './ui/button';

export function SiteHeader() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
      clearSession();
      showToast({
        tone: 'info',
        title: 'Сессия завершена',
        description: 'Вы вышли из системы.',
      });
      navigate('/');
    } catch (error) {
      handleApiError(error, 'Не удалось выйти из системы.');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-[16px] bg-gradient-to-br from-primary to-cyan p-3 text-white shadow-soft">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-xl font-extrabold">SortLearn</p>
            <p className="text-xs text-muted">Визуальное изучение сортировок</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className="rounded-[14px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
              >
                Дашборд
              </NavLink>
              <NavLink
                to="/compare"
                className="rounded-[14px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
              >
                Сравнение
              </NavLink>
              <NavLink
                to="/profile"
                className="rounded-[14px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
              >
                Профиль
              </NavLink>
            </>
          ) : isLandingPage ? (
            <>
              <a
                href="#advantages"
                className="rounded-[14px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
              >
                Преимущества
              </a>
              <a
                href="#how-it-works"
                className="rounded-[14px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink"
              >
                Как это работает
              </a>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm md:flex">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-ink">{user.nickname}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout} aria-label="Выйти из системы">
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link to="/register">
                <Button>
                  <BookOpenText className="h-4 w-4" />
                  Начать обучение
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
