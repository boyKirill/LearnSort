import { ArrowRight, BarChart3, BookOpen, Gauge, Layers3, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../features/auth/store/auth-store';

const advantages = [
  {
    icon: BookOpen,
    title: 'Содержательная теория',
    text: 'Каждый алгоритм сопровождается полноценным учебным разбором с ключевыми идеями, свойствами и примерами.',
  },
  {
    icon: Gauge,
    title: 'Пошаговая визуализация',
    text: 'Каждое сравнение, обмен и перезапись отображаются отдельно, а лог действий помогает удерживать контекст.',
  },
  {
    icon: BarChart3,
    title: 'Режим сравнения',
    text: 'Можно запускать два алгоритма на одном массиве и смотреть, как отличаются стратегии и метрики.',
  },
  {
    icon: Trophy,
    title: 'Осмысленная проверка знаний',
    text: 'Вопросы основаны на теории, проверяются автоматически и действительно помогают понять, как работает алгоритм.',
  },
];

const steps = [
  'Изучите идею алгоритма, сложность, свойства и типичные заблуждения.',
  'Запустите визуализацию и проследите, как массив меняется по шагам.',
  'Пройдите проверку знаний и получите пояснения к каждому ответу.',
  'Сравните алгоритмы между собой и закрепите различия на одном и том же массиве.',
];

export function LandingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-16 pb-16">
      <section className="page-shell pt-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-hero px-6 py-10 shadow-soft sm:px-10 lg:py-14">
            <div className="absolute -right-16 top-8 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                  Изучайте алгоритмы сортировки через теорию, визуализацию и практическую проверку знаний.
                </h1>
                <p className="max-w-2xl text-lg text-muted">
                  SortLearn объединяет учебные модули, пошаговую анимацию, режим сравнения и отслеживание прогресса в одном аккуратном EdTech-интерфейсе.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={user ? '/dashboard' : '/register'}>
                  <Button className="px-5 py-3 text-base">
                    Начать обучение
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" className="px-5 py-3 text-base">
                    Как это работает
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="bg-white/95">
              <p className="text-sm uppercase tracking-[0.14em] text-primary">5 модулей</p>
              <h3 className="mt-3 text-2xl font-extrabold">Bubble, Selection, Insertion, Merge, Quick</h3>
              <p className="mt-2 text-sm text-muted">
                От простых квадратичных подходов до divide-and-conquer с полноценным сравнением свойств.
              </p>
            </Card>
            <Card className="bg-gradient-to-br from-primary to-accent text-white">
              <p className="text-sm uppercase tracking-[0.14em] text-white/80">Синхронное сравнение</p>
              <h3 className="mt-3 text-2xl font-extrabold">Один массив, два алгоритма, общие метрики</h3>
              <p className="mt-2 text-sm text-white/85">
                Наглядно видно, где алгоритмы выигрывают, а где платят временем или количеством операций.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="advantages" className="page-shell space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Преимущества</p>
          <h2 className="text-3xl font-extrabold">Теория, визуализация и практика работают вместе.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {advantages.map((item) => (
            <Card key={item.title} className="space-y-4">
              <div className="w-fit rounded-[16px] bg-primary/10 p-3 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="page-shell">
        <Card className="space-y-8 overflow-hidden bg-white/95 p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Как это работает</p>
              <h2 className="text-3xl font-extrabold">Переход от идеи к пониманию строится по четырём шагам.</h2>
              <p className="text-sm text-muted">
                SortLearn специально организует материал так, чтобы студент видел связь между теорией, поведением алгоритма и итоговой проверкой знаний.
              </p>
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[18px] border border-border bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm text-ink">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <div className="w-fit rounded-[16px] bg-cyan/10 p-3 text-cyan">
              <Layers3 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold">Почему визуализация действительно помогает понять сортировки</h2>
            <p className="text-sm text-muted">
              Алгоритм сортировки сложно усвоить только по псевдокоду: студент видит циклы, но не ощущает динамику. Визуализация показывает, какие элементы сравниваются, где происходит обмен, когда фиксируется отсортированная часть и почему одни алгоритмы ведут себя иначе, чем другие.
            </p>
            <p className="text-sm text-muted">
              За счёт пошагового воспроизведения и журнала действий SortLearn превращает абстрактный код в последовательность осмысленных состояний массива. Это особенно полезно, когда нужно не только назвать сложность, но и объяснить механику работы алгоритма.
            </p>
          </Card>
          <Card className="space-y-4 bg-gradient-to-br from-slate-950 to-primary text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Фокус на результате</p>
            <h2 className="text-3xl font-extrabold text-white">Личный кабинет показывает реальный прогресс по модулям и закрепляет знания.</h2>
            <p className="text-sm text-white/80">
              Модуль считается завершённым только при результате 100% в проверке знаний. Такой подход мотивирует не просто пролистать вкладки, а действительно разобраться в алгоритме.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="mt-4 inline-flex">
              <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                Перейти к обучению
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
