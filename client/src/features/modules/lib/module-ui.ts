import type { ModuleStatus } from '../../../types/api';

export function statusMeta(status: ModuleStatus) {
  switch (status) {
    case 'NOT_STARTED':
      return {
        label: 'Не начат',
        tone: 'not-started' as const,
        action: 'Начать',
      };
    case 'IN_PROGRESS':
      return {
        label: 'В процессе',
        tone: 'in-progress' as const,
        action: 'Продолжить',
      };
    case 'COMPLETED':
      return {
        label: 'Завершён',
        tone: 'completed' as const,
        action: 'Повторить',
      };
  }
}
