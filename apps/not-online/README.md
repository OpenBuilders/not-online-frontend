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

Public pages send analytics directly to
`https://plausible.probablynothing.xyz/api/event` for the `not.online` site.
The endpoint and domain are deliberately hardcoded public browser configuration,
so no Cloudflare variables are needed for Plausible.

Every click on a user-configured link sends the `Link Click` custom event with
`page_handle` and `link_title` properties. Add a
custom-event goal named `Link Click` in Plausible to report those clicks.
