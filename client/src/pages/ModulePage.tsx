import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorState } from '../components/ui/error-state';
import { LoadingScreen } from '../components/ui/loading-screen';
import { ProgressBar } from '../components/ui/progress-bar';
import { Table } from '../components/ui/table';
import { Tabs } from '../components/ui/tabs';
import { api, handleApiError } from '../lib/api';
import { showToast } from '../lib/toast-store';
import type { KnowledgeAttemptResponse, KnowledgeCheckPayload, ModuleDetail } from '../types/api';
import { SortingControls } from '../features/modules/components/sorting-controls';
import { VisualizerPane } from '../features/modules/components/visualizer-pane';
import { createRandomArray, type AlgorithmSlug } from '../features/modules/lib/sorting';
import { useSortPlayback } from '../features/modules/lib/use-sort-playback';

function TheoryMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: content }) => (
          <p className="text-[15px] leading-8 text-slate-700">{content}</p>
        ),
        ul: ({ children: content }) => (
          <ul className="space-y-3 rounded-[16px] bg-slate-50 p-4">{content}</ul>
        ),
        li: ({ children: content }) => (
          <li className="flex gap-3 text-[15px] leading-7 text-slate-700">
            <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
            <span>{content}</span>
          </li>
        ),
        strong: ({ children: content }) => (
          <strong className="font-extrabold text-ink">{content}</strong>
        ),
        code: ({ children: content }) => (
          <code className="rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
            {content}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function TheorySections({ theory }: { theory: string }) {
  const sections = theory
    .split(/\n(?=## )/g)
    .map((section) => section.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-5">
      {sections.map((section, index) => {
        const normalizedSection = section.replace(/^##\s*/, '');
        const lines = normalizedSection.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n').trim();

        return (
          <Card key={`${index}-${title}`} className="overflow-hidden p-0">
            <div className="border-b border-primary/10 bg-gradient-to-r from-primary/10 via-cyan/10 to-white px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Раздел {index + 1}
                </span>
                <h3 className="text-2xl font-extrabold">{title}</h3>
              </div>
            </div>
            <div className="space-y-4 px-6 py-5">
              <TheoryMarkdown>{content}</TheoryMarkdown>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function ModulePage() {
  const { slug } = useParams();
  const [moduleItem, setModuleItem] = useState<ModuleDetail | null>(null);
  const [knowledgeCheck, setKnowledgeCheck] = useState<KnowledgeCheckPayload | null>(null);
  const [attemptResult, setAttemptResult] = useState<KnowledgeAttemptResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('theory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [arraySize, setArraySize] = useState(18);
  const [speed, setSpeed] = useState(260);
  const [sourceArray, setSourceArray] = useState(() => createRandomArray(18));

  const playback = useSortPlayback({
    algorithm: (slug ?? 'bubble-sort') as AlgorithmSlug,
    sourceArray,
    speedMs: speed,
  });

  useEffect(() => {
    async function run() {
      if (!slug) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await api.post(`/modules/${slug}/start`);
        const [moduleResponse, knowledgeCheckResponse] = await Promise.all([
          api.get(`/modules/${slug}`),
          api.get(`/modules/${slug}/knowledge-check`),
        ]);

        setModuleItem(moduleResponse.data);
        setKnowledgeCheck(knowledgeCheckResponse.data);
        setAnswers({});
        setAttemptResult(null);
      } catch (requestError) {
        const message = handleApiError(requestError, 'Не удалось загрузить модуль.');
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [slug]);

  useEffect(() => {
    setSourceArray(createRandomArray(arraySize));
  }, [arraySize]);

  async function handleSubmitAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!knowledgeCheck || !slug) {
      return;
    }

    const preparedAnswers = knowledgeCheck.questions.map((question) => ({
      questionId: question.id,
      optionId: answers[question.id],
    }));

    if (preparedAnswers.some((answer) => !answer.optionId)) {
      showToast({
        tone: 'error',
        title: 'Не все вопросы заполнены',
        description: 'Ответьте на все вопросы перед отправкой.',
      });
      return;
    }

    setSubmittingAttempt(true);

    try {
      const response = await api.post(`/knowledge-checks/${knowledgeCheck.id}/attempts`, {
        answers: preparedAnswers,
      });

      setAttemptResult(response.data);

      if (response.data.moduleCompleted) {
        await api.post(`/modules/${slug}/complete`);
      }

      const [moduleResponse, knowledgeCheckResponse] = await Promise.all([
        api.get(`/modules/${slug}`),
        api.get(`/modules/${slug}/knowledge-check`),
      ]);

      setModuleItem(moduleResponse.data);
      setKnowledgeCheck(knowledgeCheckResponse.data);
      setAnswers({});

      showToast({
        tone: response.data.percent === 100 ? 'success' : 'info',
        title:
          response.data.percent === 100
            ? 'Модуль завершён'
            : `Результат сохранён: ${response.data.percent}%`,
        description:
          response.data.percent === 100
            ? 'Отлично! Вы набрали 100% и завершили модуль.'
            : 'Попробуйте ещё раз, чтобы улучшить результат.',
      });
    } catch (requestError) {
      handleApiError(requestError, 'Не удалось отправить ответы.');
    } finally {
      setSubmittingAttempt(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell py-10">
        <LoadingScreen text="Загружаем модуль и контент..." />
      </div>
    );
  }

  if (error || !moduleItem) {
    return (
      <div className="page-shell py-10">
        <ErrorState
          title="Не удалось открыть модуль"
          description={error ?? 'Попробуйте ещё раз.'}
          action={<Button onClick={() => window.location.reload()}>Повторить</Button>}
        />
      </div>
    );
  }

  const tabItems = [
    {
      id: 'theory',
      label: 'Теория',
      content: (
        <div className="space-y-6">
          <TheorySections theory={moduleItem.theory} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Алгоритм
                </span>
                <h3 className="text-2xl font-extrabold">Псевдокод</h3>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-[18px] bg-slate-950 p-5 text-sm leading-7 text-slate-50">
                {moduleItem.pseudocode}
              </pre>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Анализ
                </span>
                <h3 className="text-2xl font-extrabold">Сложность</h3>
              </div>
              <Table className="mt-4">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">Лучший случай</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.complexity.best}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">Средний случай</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.complexity.average}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">Худший случай</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.complexity.worst}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Память</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.complexity.memory}</td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Свойства
                </span>
                <h3 className="text-2xl font-extrabold">Ключевые характеристики</h3>
              </div>
              <Table className="mt-4">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">Стабильность</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.properties.stability}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">In-place</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.properties.inPlace}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">Адаптивность</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.properties.adaptivity}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Структура</td>
                    <td className="px-4 py-3 text-muted">{moduleItem.properties.controlFlow}</td>
                  </tr>
                </tbody>
              </Table>
            </Card>

            <Card className="space-y-5">
              <div>
                <h3 className="text-2xl font-extrabold">Преимущества</h3>
                <ul className="mt-4 space-y-3">
                  {moduleItem.advantages.map((item) => (
                    <li key={item} className="rounded-[16px] bg-success/10 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">Недостатки</h3>
                <ul className="mt-4 space-y-3">
                  {moduleItem.disadvantages.map((item) => (
                    <li key={item} className="rounded-[16px] bg-destructive/10 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">Практические замечания</h3>
                <ul className="mt-4 space-y-3">
                  {moduleItem.usageNotes.map((item) => (
                    <li key={item} className="rounded-[16px] bg-cyan/10 px-4 py-3 text-sm text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'visualization',
      label: 'Визуализация',
      content: (
        <div className="space-y-4">
          <SortingControls
            className="sticky top-24 z-20 border border-white/70 bg-white/95 shadow-soft"
            isPlaying={playback.isPlaying}
            speed={speed}
            size={arraySize}
            onStart={playback.start}
            onPause={playback.pause}
            onStep={playback.stepForward}
            onReset={playback.reset}
            onNewArray={() => setSourceArray(createRandomArray(arraySize))}
            onSpeedChange={setSpeed}
            onSizeChange={setArraySize}
          />
          <VisualizerPane
            title={moduleItem.title}
            description="Ниже видно, как массив меняется по шагам: сравнения, обмены, перезаписи и уже зафиксированные позиции."
            values={playback.array}
            totalSteps={playback.totalSteps}
            currentStep={playback.steps}
            comparisons={playback.comparisons}
            swaps={playback.swaps}
            overwrites={playback.overwrites}
            simulatedDurationMs={playback.simulatedDurationMs}
            completed={playback.completed}
            comparingIndices={playback.comparingIndices}
            swappingIndices={playback.swappingIndices}
            overwrittenIndices={playback.overwrittenIndices}
            sortedIndices={playback.sortedIndices}
            pivotIndex={playback.pivotIndex}
            logs={playback.logs}
          />
        </div>
      ),
    },
    {
      id: 'knowledge',
      label: 'Проверка знаний',
      content: knowledgeCheck ? (
        <div className="space-y-6">
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold">Проверка знаний по модулю</h3>
                <p className="mt-2 text-sm text-muted">
                  Результат сохраняется автоматически. Для завершения модуля нужен результат 100%.
                </p>
              </div>
              <div className="rounded-[18px] bg-primary/10 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.12em] text-primary">Лучший результат</p>
                <p className="text-2xl font-extrabold text-primary">
                  {moduleItem.progress.bestKnowledgeCheckPercent}%
                </p>
              </div>
            </div>
            <ProgressBar value={moduleItem.progress.bestKnowledgeCheckPercent} />
          </Card>

          <form className="space-y-5" onSubmit={handleSubmitAttempt}>
            {knowledgeCheck.questions.map((question) => (
              <Card key={question.id} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Вопрос {question.order}
                  </p>
                  <h4 className="text-lg font-extrabold">{question.text}</h4>
                </div>
                <div className="grid gap-3">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-border bg-slate-50 px-4 py-3 transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => setAnswers((state) => ({ ...state, [question.id]: option.id }))}
                      />
                      <span className="text-sm text-ink">{option.text}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}

            <Button type="submit" loading={submittingAttempt}>
              Отправить ответы
            </Button>
          </form>

          {attemptResult ? (
            <Card className="space-y-4">
              <h3 className="text-2xl font-extrabold">Попытка сохранена</h3>
              <p className="text-sm text-muted">
                Ваш результат: {attemptResult.score} из {attemptResult.maxScore} ({attemptResult.percent}%).
              </p>
              <ProgressBar value={attemptResult.percent} />
              <p className="text-sm text-muted">
                {attemptResult.percent === 100
                  ? 'Модуль успешно завершён.'
                  : 'Можно пройти проверку ещё раз и улучшить результат.'}
              </p>
            </Card>
          ) : null}
        </div>
      ) : (
        <LoadingScreen text="Загружаем вопросы для проверки знаний..." />
      ),
    },
  ];

  return (
    <div className="page-shell space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/dashboard" className="text-sm font-semibold text-primary hover:underline">
            ← Вернуться в дашборд
          </Link>
          <h1 className="text-4xl font-extrabold">{moduleItem.title}</h1>
          <p className="max-w-3xl text-sm text-muted">{moduleItem.description}</p>
        </div>
        <div className="rounded-[18px] border border-border bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Лучший результат</p>
          <p className="text-2xl font-extrabold">{moduleItem.progress.bestKnowledgeCheckPercent}%</p>
        </div>
      </div>

      <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
    </div>
  );
}
