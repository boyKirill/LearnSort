import { Link } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function NotFoundPage() {
  return (
    <div className="page-shell py-12">
      <Card className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">404</p>
        <h1 className="text-4xl font-extrabold">Страница не найдена</h1>
        <p className="text-sm text-muted">
          Похоже, вы открыли несуществующий маршрут. Вернитесь на главную или продолжите обучение из дашборда.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="outline">На главную</Button>
          </Link>
          <Link to="/dashboard">
            <Button>В дашборд</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
