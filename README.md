# not-tools-frontend

Единый репозиторий фронтенда для `not.online`.

- корень — редактор и личный кабинет на React + Vite;
- `apps/not-online` — публичный SSR-рендерер страниц `not.online/:handle` на Astro.
- `apps/router` — Cloudflare Worker, распределяющий запросы одного домена между двумя приложениями.

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

## Один домен в production

На `not.online` запрос сначала принимает Worker из `apps/router`:

- `/:handle`, `/_astro/*` и `/assets/site/*` направляются в публичный SSR;
- всё остальное направляется в редактор.

Перед первым деплоем в `apps/router/wrangler.jsonc` нужно указать имена двух
развёрнутых Cloudflare Workers. `wrangler.jsonc` в корне уже описывает Worker
редактора со статическими файлами Vite. API остаётся отдельным сервисом,
например `api.not.online`.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
npm run build:online
# либо собрать оба приложения
npm run build:all
```

Перед production-сборкой задайте `VITE_API_URL` и `LINK_PAGES_API_URL` в
соответствующих `.env.production` файлах. Затем выполните `npm run deploy:tools`,
`npm run deploy:online` и `npm run deploy:router`. Доменный маршрут
`not.online` добавляется как Custom Domain только роутеру.
