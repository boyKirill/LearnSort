import { create } from 'zustand';

import type { User } from '../../../types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  bootstrapping: boolean;
  setSession: (payload: { user: User; accessToken: string }) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
  setBootstrapping: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  bootstrapping: true,
  setSession: ({ user, accessToken }) =>
    set({
      user,
      accessToken,
    }),
  updateUser: (user) =>
    set((state) => ({
      ...state,
      user,
    })),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
    }),
  setBootstrapping: (bootstrapping) => set({ bootstrapping }),
}));
