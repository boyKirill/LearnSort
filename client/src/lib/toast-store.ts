import { create } from 'zustand';

type ToastTone = 'success' | 'error' | 'info';
const MAX_TOASTS = 3;

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => {
      const alreadyExists = state.toasts.some(
        (item) =>
          item.tone === toast.tone &&
          item.title === toast.title &&
          item.description === toast.description,
      );

      if (alreadyExists) {
        return state;
      }

      return {
        toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }].slice(-MAX_TOASTS),
      };
    }),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function showToast(toast: Omit<ToastItem, 'id'>) {
  useToastStore.getState().push(toast);
}
