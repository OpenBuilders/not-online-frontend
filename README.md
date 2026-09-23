# not-tools-frontend

Единый репозиторий фронтенда для `not.online`.

- корень — редактор и личный кабинет на React + Vite;
- `apps/not-online` — публичный SSR-рендерер страниц `not.online/:handle` на Astro.

Оба приложения собираются и разворачиваются одним Cloudflare Worker `not-online`.

Бэкенд остаётся отдельным репозиторием `notportal-backend`.

Для Cloudflare Workers нужен Node.js 22 или новее.

## Запуск

Сначала запустите backend, MySQL и Redis. Затем:

```bash
npm install
npm run dev
```

Редактор откроется на `http://localhost:4321` и по умолчанию обращается к API
на `http://localhost:3000`.

Чтобы указать другой backend, создайте `.env`:

```env
VITE_API_URL=https://api.example.com
```

## Публичные страницы

```bash
cd apps/not-online
cp .env.example .env
npm install
cd ../..
npm run dev:online
```

Публичный рендерер доступен на `http://127.0.0.1:4321/<handle>`. Для него
переменная `LINK_PAGES_API_URL` должна указывать на `notportal-backend`.

## Один Worker в production

`npm run build:online` сначала собирает редактор Vite, затем добавляет его
статические файлы к assets Astro и собирает SSR-рендерер. Получившийся Worker
обслуживает весь `not.online`:

- `/:handle` рендерятся через Astro SSR;
- `/_astro/*`, `/assets/*` и `/images/*` отдаются как статические файлы;
- остальные пути возвращают SPA-оболочку редактора.

Custom Domain `not.online` нужно привязать только к Worker `not-online`.
API остаётся отдельным сервисом, например `api.not.online`.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build:online
```

Перед production-сборкой задайте `VITE_API_URL` и `LINK_PAGES_API_URL` в
соответствующих `.env.production` файлах. Затем выполните один раз
`npm run deploy`.

## Аналитика

Редактор, как и публичные страницы, отправляет анонимную аналитику для
`not.online` в self-hosted Plausible CE по адресу
`https://plausible.probablynothing.xyz/api/event`. Конфигурация публичная и
зашита в клиентской сборке, поэтому для неё не нужны переменные Cloudflare или
`.env`. Кастомные события — `trackEvent()` из `src/lib/analytics.ts`.
