# SortLearn

SortLearn — полнофункциональная учебная веб-платформа для ВКР по теме: «Интерактивная веб-платформа для изучения алгоритмов сортировки посредством визуализации».

## Стек

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, axios
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT access token, refresh token в httpOnly cookie, bcryptjs
- Dev tools: ESLint, Prettier, Docker Compose

## Что установить

- Node.js LTS
- Docker Desktop
- VS Code

## Структура монорепо

- `client` — frontend-приложение
- `server` — Express API и Prisma

## Быстрый старт

1. Установите зависимости:

```bash
npm run install:all
```

2. Поднимите PostgreSQL:

```bash
docker compose up -d
```

3. Создайте env-файлы:

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

4. Сгенерируйте Prisma Client:

```bash
npm run prisma:generate --workspace server
```

5. Выполните миграции Prisma:

```bash
npm run prisma:migrate --workspace server
```

6. Заполните БД seed-данными:

```bash
npm run prisma:seed --workspace server
```

7. Запустите backend и frontend:

```bash
npm run dev
```

## Отдельный запуск client/server

Backend:

```bash
npm run dev:server
```

Frontend:

```bash
npm run dev:client
```

## URL для открытия

- Клиент: [http://127.0.0.1:4173](http://127.0.0.1:4173)
- API: [http://localhost:5000/api](http://localhost:5000/api)
- Health-check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- PostgreSQL (host): `localhost:5433`

## Тестовый пользователь

- Email: `student@sortlearn.local`
- Пароль: `SortLearn123!`
- Nickname: `demo_student`

## Как проверить ключевые сценарии

### 1. Регистрация и вход

- Откройте `/register`, создайте нового пользователя.
- После регистрации откроется `/dashboard`.
- Перезагрузите страницу: клиент попробует `POST /api/auth/refresh`, access token будет восстановлен из httpOnly cookie.

### 2. Дашборд и прогресс

- Войдите под тестовым пользователем.
- Откройте `/dashboard`.
- Убедитесь, что отображаются 5 модулей, статусы и общий progress bar.

### 3. Модуль и завершение

- Откройте любой модуль, например `/modules/bubble-sort`.
- На вкладке «Проверка знаний» ответьте правильно на все 12 вопросов.
- После результата 100% сервер обновит `ModuleProgress.status` на `COMPLETED`.
- Вернитесь в дашборд и проверьте, что общий прогресс вырос.

### 4. Compare mode

- Откройте `/compare`.
- Выберите два алгоритма, например Bubble Sort и Quick Sort.
- Нажмите `Старт`: обе панели начнут проигрываться непрерывно до конца.
- Попробуйте `Пауза`, `Следующий шаг`, `Сброс`, `Новый массив` и изменение скорости.
- Выберите один и тот же алгоритм дважды: страница покажет предупреждение, но продолжит работать.

### 5. Настройка отправки писем

- Укажите в `server/.env` рабочие SMTP-параметры: `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.
- После этого коды подтверждения будут приходить на реальные email-адреса.
- Важно: код нигде не отображается ни во frontend UI, ни в API-ответах.

### 6. Проверка смены пароля

- В профиле укажите новый пароль и отправьте запрос.
- Откройте письмо в своей почте и возьмите код подтверждения.
- Подтвердите код.
- После успеха refresh token будет инвалидирован, клиент выполнит logout и попросит войти заново.

### 7. Проверка refresh token

- Войдите в систему.
- Откройте DevTools -> Network.
- Обновите страницу.
- Клиент отправит `POST /api/auth/refresh`, access token снова загрузится только в память, а refresh token останется в httpOnly cookie.

## Команды

Root:

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run install:all`
- `npm run build`
- `npm run lint`
- `npm run format`

Server:

- `npm run prisma:generate --workspace server`
- `npm run prisma:migrate --workspace server`
- `npm run prisma:seed --workspace server`

## Production deployment

Проект готов к деплою как один production-сервис с PostgreSQL и HTTPS через Caddy.

1. Подготовьте домен и направьте A-запись на IP сервера.

2. Создайте production env:

```bash
copy .env.deploy.example .env.deploy
```

3. Заполните в `.env.deploy`:

- `DOMAIN`
- `ACME_EMAIL`
- `PUBLIC_URL`
- `POSTGRES_*`
- `DATABASE_URL`
- `ACCESS_TOKEN_SECRET`
- `MAIL_*`

4. Запустите production stack:

```bash
docker compose --env-file .env.deploy -f docker-compose.prod.yml up -d --build
```

5. Проверка после деплоя:

- приложение: `https://ваш-домен`
- health: `https://ваш-домен/api/health`

Что делает production stack:

- `app` собирает backend и frontend в одном контейнере
- backend раздаёт `client/dist` и API с того же origin
- `postgres` хранит данные
- `caddy` выдаёт HTTPS-сертификат и проксирует трафик в приложение

## Меры безопасности и привязка к OWASP Top 10:2025

### A01 Broken Access Control

- Все защищённые endpoints требуют `Authorization: Bearer <accessToken>`.
- `userId` берётся только из JWT, а не из тела запроса.
- Профиль, прогресс, попытки проверки знаний и подтверждения кодов работают только в контексте авторизованного пользователя.

### A02 Security Misconfiguration

- Используются `helmet`, строгий CORS whitelist, отключён `x-powered-by`.
- Ограничен размер JSON body.
- Refresh cookie создаётся с `httpOnly`, `sameSite=lax`, `secure` в production.

### A03 Software Supply Chain Failures

- Используется lockfile после `npm install`.
- Зависимости ограничены необходимым минимумом.
- В проекте нет `eval`, динамического выполнения пользовательского кода и загрузки пользовательских URL сервером.

### A04 Cryptographic Failures

- Пароли хэшируются через `bcryptjs`.
- Verification codes и refresh tokens хранятся в БД только в виде SHA-256 hash.
- Секреты и параметры окружения вынесены в `.env`.
- Refresh token никогда не доступен JavaScript-коду клиента.

### A05 Injection

- Входные данные валидируются через `zod`.
- Для доступа к БД используется Prisma вместо сырого SQL.
- Проверка знаний выполняется на сервере и не доверяет клиентским данным.

### A06 Insecure Design

- Нет debug-bypass flow для email/password change.
- Завершение модуля возможно только после серверной проверки результата 100%.
- Теория рендерится через markdown без пользовательского HTML.

### A07 Authentication Failures

- Для auth и чувствительных действий настроен rate limit.
- Реализована refresh token rotation.
- При смене пароля все refresh tokens пользователя ревокуются.
- Для refresh/logout и чувствительных профильных операций проверяются `Origin/Referer`.

### A08 Software or Data Integrity Failures

- Нет небезопасного выполнения кода.
- Критичные внутренние данные не возвращаются клиенту.
- Вопросы и ответы оцениваются только на сервере.

### A09 Security Logging and Alerting Failures

- Сервер логирует регистрации, входы, refresh, ошибки, запросы на смену email и пароля.
- Логи не содержат пароли, refresh token или verification codes.

### A10 Mishandling of Exceptional Conditions

- Есть централизованный `errorHandler`.
- Клиент показывает безопасные loading/error states.
- Stack trace не возвращается во frontend.

## Дополнительные замечания

- Визуализация реализована как step-based engine с событиями `compare`, `swap`, `markSorted`, `setPivot`, `overwrite`, `done`.
- Баг с кнопкой `Старт`, когда проигрывался только один шаг, исправлен через таймерный цикл в `useSortPlayback`: воспроизведение идёт непрерывно до `done` или нажатия `Пауза`.
