/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly LINK_PAGES_API_URL?: string;
  readonly PUBLIC_PLAUSIBLE_HOST?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
