/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly LINK_PAGES_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
