import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { api, handleApiError } from '../lib/api';
import {
  hasValidationErrors,
  type FieldErrors,
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
} from '../lib/validation';
import { showToast } from '../lib/toast-store';
import { useAuthStore } from '../features/auth/store/auth-store';

type RegisterField = 'email' | 'nickname' | 'password' | 'confirmPassword';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors<RegisterField> = {
      email: validateEmail(form.email),
      nickname: validateNickname(form.nickname),
      password: validatePassword(form.password),
      confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
    };

    setErrors(nextErrors);

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      showToast({
        tone: 'success',
        title: 'Регистрация завершена',
        description: 'Аккаунт создан, можно начинать обучение.',
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      handleApiError(error, 'Не удалось зарегистрироваться.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell py-10">
      <div className="mx-auto max-w-xl">
        <Card className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold">Регистрация в SortLearn</h1>
            <p className="text-sm text-muted">
              Создайте аккаунт, чтобы отслеживать прогресс и проходить модули по алгоритмам сортировки.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
            <div className="md:col-span-2">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="student@example.com"
                error={errors.email}
                value={form.email}
                onChange={(event) => {
                  setForm((state) => ({ ...state, email: event.target.value }));
                  setErrors((state) => ({ ...state, email: undefined }));
                }}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Nickname"
                name="nickname"
                placeholder="Например, kirill_sort"
                helperText="Никнейм используется в личном кабинете."
                error={errors.nickname}
                value={form.nickname}
                onChange={(event) => {
                  setForm((state) => ({ ...state, nickname: event.target.value }));
                  setErrors((state) => ({ ...state, nickname: undefined }));
                }}
              />
            </div>
            <Input
              label="Пароль"
              name="password"
              type="password"
              placeholder="Минимум 10 символов"
              helperText="Добавьте заглавную, строчную букву, цифру и спецсимвол."
              error={errors.password}
              value={form.password}
              onChange={(event) => {
                setForm((state) => ({ ...state, password: event.target.value }));
                setErrors((state) => ({ ...state, password: undefined, confirmPassword: undefined }));
              }}
            />
            <Input
              label="Подтверждение пароля"
              name="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              error={errors.confirmPassword}
              value={form.confirmPassword}
              onChange={(event) => {
                setForm((state) => ({ ...state, confirmPassword: event.target.value }));
                setErrors((state) => ({ ...state, confirmPassword: undefined }));
              }}
            />
            <div className="md:col-span-2">
              <Button className="w-full" type="submit" loading={loading}>
                Создать аккаунт
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Войти
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
