# not-online-router

Cloudflare Worker, который оставляет единый origin `not.online`, но передаёт
публичные страницы пользователей в Astro-приложение.

## Маршрутизация

| Запрос | Сервис |
| --- | --- |
| `/:handle` (только lowercase буквы, цифры и дефисы) | `ONLINE` |
| `/_astro/*`, `/assets/site/*` | `ONLINE` |
| всё остальное | `TOOLS` |

В [`wrangler.jsonc`](./wrangler.jsonc) значения `service` должны совпадать с
именами уже развёрнутых Workers для редактора и публичного рендерера.

## Деплой

```bash
npm install
npm run deploy
```

Привяжите к этому Worker маршрут `not.online/*`. Только router должен иметь
этот доменный маршрут; дочерние Workers вызываются через service bindings.
