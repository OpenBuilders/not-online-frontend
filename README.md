# not-tools-frontend

Минимальное React + TypeScript приложение для email/OTP авторизации через
`notportal-backend`. Серверное состояние и mutations управляются через TanStack
React Query.

## Запуск

Сначала запустите backend, MySQL и Redis. Затем:

```bash
npm install
npm run dev
```

Frontend откроется на `http://localhost:4321` и по умолчанию обращается к API
на `http://localhost:3000`.

Чтобы указать другой backend, создайте `.env`:

```env
VITE_API_URL=https://api.example.com
```

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```
