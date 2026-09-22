# not-online

Public SSR renderer for pages created in the Not Tools `Your Links Page` widget.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

The local backend must be running at the URL configured by `LINK_PAGES_API_URL`.
Open `http://127.0.0.1:4321/<handle>`.

## Runtime contract

The renderer fetches `GET /link-pages/:handle` from `notportal-backend`. Only published pages are returned by that API; unknown handles render as HTTP 404.

## Deployment

The project targets Cloudflare Workers. Set `LINK_PAGES_API_URL` to the deployed backend URL. Do not map `not.online/*` to this Worker directly: the shared-domain route belongs to `apps/router`, which invokes this Worker through a Cloudflare service binding. The editor and public renderer stay separate applications; images are served directly from Spaces.

## Link analytics

To enable Plausible in public pages, add these **Text** variables in Cloudflare
Dashboard: **Workers & Pages** → **not-online** → **Settings** → **Variables and
Secrets**. Deploy after saving the values.

```env
PUBLIC_PLAUSIBLE_HOST=https://plausible.example.com
PUBLIC_PLAUSIBLE_DOMAIN=not.online
```

`PUBLIC_PLAUSIBLE_HOST` is the public URL of the Plausible instance: use
`https://plausible.io` for Plausible Cloud or the public dashboard URL of a
self-hosted Plausible installation. Do not append `/api/event`. These are public
browser settings, not secrets.

Every click on a user-configured link sends the `Link Click` custom event with
`page_handle`, `link_id`, `link_title`, and `link_position` properties. Add a
custom-event goal named `Link Click` in Plausible to report those clicks.
