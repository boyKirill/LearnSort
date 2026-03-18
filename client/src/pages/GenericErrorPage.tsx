import { Link } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { ErrorState } from '../components/ui/error-state';

export function GenericErrorPage() {
  return (
    <div className="page-shell py-12">
      <ErrorState
        title="Произошла неожиданная ошибка"
        description="Интерфейс столкнулся с непредвиденным состоянием. Обновите страницу или перейдите в стабильный раздел приложения."
        action={
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
            <Link to="/dashboard">
              <Button variant="outline">Открыть дашборд</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
