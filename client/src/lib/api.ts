import axios from 'axios';

import { useAuthStore } from '../features/auth/store/auth-store';
import { showToast } from './toast-store';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api';

export const authlessApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;
let bootstrapPromise: Promise<void> | null = null;
let bootstrapAttempted = false;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const requestUrl = originalRequest?.url ?? '';

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = authlessApi
          .post('/auth/refresh')
          .then((response) => {
            useAuthStore.getState().setSession({
              user: response.data.user,
              accessToken: response.data.accessToken,
            });

            return response.data.accessToken as string;
          })
          .catch(() => {
            useAuthStore.getState().clearSession();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  },
);

export async function bootstrapSession() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  if (bootstrapAttempted) {
    useAuthStore.getState().setBootstrapping(false);
    return Promise.resolve();
  }

  bootstrapAttempted = true;
  bootstrapPromise = (async () => {
    try {
      const response = await authlessApi.post('/auth/refresh');

      useAuthStore.getState().setSession({
        user: response.data.user,
        accessToken: response.data.accessToken,
      });
    } catch {
      useAuthStore.getState().clearSession();
    } finally {
      useAuthStore.getState().setBootstrapping(false);
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}

export function handleApiError(error: unknown, fallback = 'Что-то пошло не так.') {
  const message =
    axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
      ? error.response.data.message
      : error instanceof Error
        ? error.message
        : fallback;

  showToast({
    tone: 'error',
    title: 'Ошибка',
    description: message,
  });

  return message;
}
