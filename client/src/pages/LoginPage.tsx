import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { api, handleApiError } from '../lib/api';
import { hasValidationErrors, type FieldErrors, validateEmail } from '../lib/validation';
import { showToast } from '../lib/toast-store';
import { useAuthStore } from '../features/auth/store/auth-store';

type LoginField = 'email' | 'password';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors<LoginField> = {
      email: validateEmail(form.email),
      password: form.password ? undefined : 'Введите пароль.',
    };

    setErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });
      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      showToast({
        tone: 'success',
        title: 'Вход выполнен',
        description: 'Добро пожаловать в SortLearn.',
      });
      navigate(location.state?.from ?? '/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        const message = error.response.data.message;

        if (error.response?.status === 400 || error.response?.status === 401) {
          setErrors({ password: message });
          return;
        }
      }

      handleApiError(error, 'Не удалось выполнить вход.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell py-10">
      <div className="mx-auto max-w-lg">
        <Card className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold">Вход в SortLearn</h1>
            <p className="text-sm text-muted">
              Используйте свой email и пароль, чтобы продолжить обучение.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="student@example.com"
              error={errors.email}
              value={form.email}
              onChange={(event) => {
                setForm((state) => ({ ...state, email: event.target.value }));
                setErrors((state) => ({ ...state, email: undefined, password: undefined }));
              }}
            />
            <Input
              label="Пароль"
              name="password"
              type="password"
              placeholder="Введите пароль"
              error={errors.password}
              value={form.password}
              onChange={(event) => {
                setForm((state) => ({ ...state, password: event.target.value }));
                setErrors((state) => ({ ...state, password: undefined }));
              }}
            />
            <Button className="w-full" type="submit" loading={loading}>
              Войти
            </Button>
          </form>

          <p className="text-center text-sm text-muted">
            Ещё нет аккаунта?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
