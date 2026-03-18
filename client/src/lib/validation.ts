export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasValidationErrors<T extends string>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean);
}

export function validateEmail(value: string, emptyMessage = 'Введите email.') {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return emptyMessage;
  }

  if (!emailPattern.test(normalizedValue)) {
    return 'Введите корректный email.';
  }

  return undefined;
}

export function validateNickname(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 'Введите nickname.';
  }

  if (normalizedValue.length < 3) {
    return 'Никнейм должен содержать минимум 3 символа.';
  }

  if (normalizedValue.length > 32) {
    return 'Никнейм должен содержать не более 32 символов.';
  }

  return undefined;
}

export function validatePassword(value: string) {
  if (!value) {
    return 'Введите пароль.';
  }

  if (value.length < 10) {
    return 'Пароль должен содержать минимум 10 символов.';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Добавьте хотя бы одну заглавную букву.';
  }

  if (!/[a-z]/.test(value)) {
    return 'Добавьте хотя бы одну строчную букву.';
  }

  if (!/\d/.test(value)) {
    return 'Добавьте хотя бы одну цифру.';
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Добавьте хотя бы один специальный символ.';
  }

  return undefined;
}

export function validatePasswordConfirmation(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return 'Повторите пароль.';
  }

  if (password !== confirmPassword) {
    return 'Пароли не совпадают.';
  }

  return undefined;
}

export function validateVerificationCode(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 'Введите код подтверждения.';
  }

  if (!/^\d{6}$/.test(normalizedValue)) {
    return 'Код должен состоять из 6 цифр.';
  }

  return undefined;
}
