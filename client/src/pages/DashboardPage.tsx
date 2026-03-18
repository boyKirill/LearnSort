import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Trophy, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorState } from '../components/ui/error-state';
import { LoadingScreen } from '../components/ui/loading-screen';
import { ProgressBar } from '../components/ui/progress-bar';
import { api, handleApiError } from '../lib/api';
import { showToast } from '../lib/toast-store';
import type { ProgressOverview } from '../types/api';
import { useAuthStore } from '../features/auth/store/auth-store';
import { statusMeta } from '../features/modules/lib/module-ui';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/progress/me');
      setData(response.data);
    } catch (requestError) {
      const message = handleApiError(requestError, 'Не удалось загрузить прогресс.');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleModuleAction(slug: string) {
    try {
      await api.post(`/modules/${slug}/start`);
      navigate(`/modules/${slug}`);
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось открыть модуль.');
    }
  }

  if (loading) {
    return (
      <div className="page-shell py-10">
        <LoadingScreen text="Загружаем ваш прогресс и учебные модули..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-shell py-10">
        <ErrorState
          title="Не удалось загрузить дашборд"
          description={error ?? 'Попробуйте обновить страницу.'}
          action={<Button onClick={() => void loadDashboard()}>Повторить</Button>}
        />
      </div>
    );
  }

  return (
    <div className="page-shell space-y-8 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden bg-hero p-8">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Личный кабинет</p>
            <h1 className="text-4xl font-extrabold">
              {user?.nickname}, ваш курс продвинут на {data.overallPercent}%.
            </h1>
            <p className="text-sm text-muted">
              Следите за статусом модулей, лучшими результатами по проверке знаний и переходите к сравнению алгоритмов в отдельном режиме.
            </p>
            <div className="space-y-3 rounded-[18px] border border-white/70 bg-white/80 p-4">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span>Общий прогресс курса</span>
                <span>{data.completedCount} из {data.totalModules} модулей завершено</span>
              </div>
              <ProgressBar value={data.overallPercent} />
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-[16px] bg-primary/10 p-3 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted">Лучший результат</p>
                <p className="text-2xl font-extrabold">{data.bestKnowledgePercent}%</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-[16px] bg-accent/10 p-3 text-accent">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted">Режим сравнения</p>
                <Link to="/compare" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Открыть compare mode
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-[16px] bg-cyan/10 p-3 text-cyan">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted">Профиль</p>
                <Link to="/profile" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Управление аккаунтом
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Учебные модули</p>
            <h2 className="text-3xl font-extrabold">Все алгоритмы курса</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              showToast({
                tone: 'info',
                title: 'Подсказка',
                description: 'Модуль станет завершённым только после результата 100% в проверке знаний.',
              })
            }
          >
            Напомнить правило завершения
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {data.modules.map((moduleItem) => {
            const meta = statusMeta(moduleItem.progress.status);

            return (
              <Card key={moduleItem.slug} className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">Модуль {moduleItem.order}</p>
                    <h3 className="mt-2 text-2xl font-extrabold">{moduleItem.title}</h3>
                    <p className="mt-2 text-sm text-muted">{moduleItem.description}</p>
                  </div>
                  <Badge label={meta.label} tone={meta.tone} />
                </div>
                <div className="space-y-3 rounded-[18px] border border-border bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Прогресс проверки знаний</span>
                    <span className="font-semibold">{moduleItem.progress.bestKnowledgeCheckPercent}%</span>
                  </div>
                  <ProgressBar value={moduleItem.progress.bestKnowledgeCheckPercent} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-2 text-sm font-medium text-success">
                    <Trophy className="h-4 w-4" />
                    Лучший результат: {moduleItem.progress.bestKnowledgeCheckPercent}%
                  </div>
                  <Button onClick={() => void handleModuleAction(moduleItem.slug)}>{meta.action}</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
