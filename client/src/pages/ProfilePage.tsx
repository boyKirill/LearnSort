import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorState } from '../components/ui/error-state';
import { Input } from '../components/ui/input';
import { LoadingScreen } from '../components/ui/loading-screen';
import { Modal, ModalBody, ModalFooter } from '../components/ui/modal';
import { api, handleApiError } from '../lib/api';
import { showToast } from '../lib/toast-store';
import {
  hasValidationErrors,
  type FieldErrors,
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '../lib/validation';
import type { User } from '../types/api';
import { useAuthStore } from '../features/auth/store/auth-store';

type ProfileField =
  | 'nickname'
  | 'newEmail'
  | 'newPassword'
  | 'confirmPassword'
  | 'emailCode'
  | 'passwordCode';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [passwordCode, setPasswordCode] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileField>>({});

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/profile');
        setProfile(response.data);
        setNickname(response.data.nickname);
      } catch (requestError) {
        const message = handleApiError(requestError, 'Не удалось загрузить профиль.');
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, []);

  async function handleNicknameUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors<ProfileField> = {
      nickname: validateNickname(nickname),
    };

    setFieldErrors((state) => ({ ...state, ...nextErrors }));

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    try {
      const response = await api.put('/profile/nickname', { nickname: nickname.trim() });
      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      setProfile(response.data.user);
      showToast({
        tone: 'success',
        title: 'Никнейм обновлён',
      });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось обновить никнейм.');
    }
  }

  async function handleEmailRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors<ProfileField> = {
      newEmail: validateEmail(newEmail, 'Введите новый email.'),
    };

    setFieldErrors((state) => ({ ...state, ...nextErrors }));

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    try {
      await api.post('/profile/email/change-request', { newEmail: newEmail.trim() });
      setEmailModalOpen(true);
      showToast({
        tone: 'info',
        title: 'Письмо отправлено',
        description: 'Проверьте новую почту и введите код подтверждения.',
      });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось отправить запрос на смену email.');
    }
  }

  async function handleEmailConfirm() {
    const nextErrors: FieldErrors<ProfileField> = {
      emailCode: validateVerificationCode(emailCode),
    };

    setFieldErrors((state) => ({ ...state, ...nextErrors }));

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    try {
      const response = await api.post('/profile/email/confirm', { code: emailCode.trim() });
      setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
      setProfile(response.data.user);
      setEmailModalOpen(false);
      setEmailCode('');
      setNewEmail('');
      setFieldErrors((state) => ({ ...state, newEmail: undefined, emailCode: undefined }));
      showToast({
        tone: 'success',
        title: 'Email обновлён',
        description: 'Новый адрес сохранён в профиле.',
      });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось подтвердить новый email.');
    }
  }

  async function handlePasswordRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors<ProfileField> = {
      newPassword: validatePassword(newPassword),
      confirmPassword: validatePasswordConfirmation(newPassword, confirmPassword),
    };

    setFieldErrors((state) => ({ ...state, ...nextErrors }));

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    try {
      await api.post('/profile/password/change-request', {
        newPassword,
        confirmPassword,
      });
      setPasswordModalOpen(true);
      showToast({
        tone: 'info',
        title: 'Письмо отправлено',
        description: 'Проверьте почту и введите код подтверждения.',
      });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось отправить запрос на смену пароля.');
    }
  }

  async function handlePasswordConfirm() {
    const nextErrors: FieldErrors<ProfileField> = {
      passwordCode: validateVerificationCode(passwordCode),
    };

    setFieldErrors((state) => ({ ...state, ...nextErrors }));

    if (hasValidationErrors(nextErrors)) {
      return;
    }

    try {
      await api.post('/profile/password/confirm', { code: passwordCode.trim() });
      await api.post('/auth/logout');
      clearSession();
      showToast({
        tone: 'success',
        title: 'Пароль обновлён',
        description: 'Теперь войдите снова с новым паролем.',
      });
      navigate('/login', { replace: true });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось подтвердить смену пароля.');
    }
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
      clearSession();
      navigate('/', { replace: true });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось выйти из системы.');
    }
  }

  if (loading) {
    return (
      <div className="page-shell py-10">
        <LoadingScreen text="Загружаем профиль..." />
      </div>
    );
  }

  if (error || !profile || !user) {
    return (
      <div className="page-shell py-10">
        <ErrorState
          title="Не удалось открыть профиль"
          description={error ?? 'Попробуйте снова.'}
          action={<Button onClick={() => window.location.reload()}>Повторить</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6 py-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Профиль</p>
        <h1 className="text-4xl font-extrabold">Управление аккаунтом</h1>
        <p className="max-w-3xl text-sm text-muted">
          Здесь можно изменить nickname, обновить email, задать новый пароль и выйти из аккаунта.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-2xl font-extrabold">Текущие данные</h2>
          <div className="space-y-3 rounded-[18px] border border-border bg-slate-50 p-4 text-sm">
            <p>
              <span className="font-semibold">Email:</span> {profile.email}
            </p>
            <p>
              <span className="font-semibold">Nickname:</span> {profile.nickname}
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleNicknameUpdate} noValidate>
            <Input
              label="Новый nickname"
              error={fieldErrors.nickname}
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setFieldErrors((state) => ({ ...state, nickname: undefined }));
              }}
            />
            <Button type="submit">Сохранить nickname</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-extrabold">Смена email</h2>
          <p className="text-sm text-muted">
            Код подтверждения придёт на новый адрес. Текущий email получит уведомление о запросе.
          </p>
          <form className="space-y-4" onSubmit={handleEmailRequest} noValidate>
            <Input
              label="Новый email"
              type="email"
              error={fieldErrors.newEmail}
              value={newEmail}
              onChange={(event) => {
                setNewEmail(event.target.value);
                setFieldErrors((state) => ({ ...state, newEmail: undefined }));
              }}
            />
            <Button type="submit">Запросить смену email</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-extrabold">Смена пароля</h2>
          <p className="text-sm text-muted">
            После подтверждения новый пароль сразу начнёт действовать.
          </p>
          <form className="space-y-4" onSubmit={handlePasswordRequest} noValidate>
            <Input
              label="Новый пароль"
              type="password"
              helperText="Минимум 10 символов, заглавная, строчная, цифра и спецсимвол."
              error={fieldErrors.newPassword}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setFieldErrors((state) => ({
                  ...state,
                  newPassword: undefined,
                  confirmPassword: undefined,
                }));
              }}
            />
            <Input
              label="Подтверждение нового пароля"
              type="password"
              error={fieldErrors.confirmPassword}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setFieldErrors((state) => ({ ...state, confirmPassword: undefined }));
              }}
            />
            <Button type="submit">Запросить смену пароля</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl font-extrabold">Выход из системы</h2>
          <p className="text-sm text-muted">
            Завершает текущий вход и возвращает на главную страницу.
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            Выйти из системы
          </Button>
        </Card>
      </div>

      <Modal
        open={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setFieldErrors((state) => ({ ...state, emailCode: undefined }));
        }}
        title="Подтвердите новый email"
        description="Введите 6-значный код из письма, которое пришло на новый адрес."
      >
        <ModalBody>
          <Input
            label="Код подтверждения"
            error={fieldErrors.emailCode}
            value={emailCode}
            onChange={(event) => {
              setEmailCode(event.target.value);
              setFieldErrors((state) => ({ ...state, emailCode: undefined }));
            }}
            placeholder="123456"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={() => void handleEmailConfirm()}>Подтвердить email</Button>
        </ModalFooter>
      </Modal>

      <Modal
        open={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setFieldErrors((state) => ({ ...state, passwordCode: undefined }));
        }}
        title="Подтвердите смену пароля"
        description="Введите 6-значный код из письма, которое пришло на вашу почту."
      >
        <ModalBody>
          <Input
            label="Код подтверждения"
            error={fieldErrors.passwordCode}
            value={passwordCode}
            onChange={(event) => {
              setPasswordCode(event.target.value);
              setFieldErrors((state) => ({ ...state, passwordCode: undefined }));
            }}
            placeholder="123456"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={() => void handlePasswordConfirm()}>Подтвердить пароль</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
