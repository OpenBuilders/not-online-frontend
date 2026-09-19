interface Env {
  TOOLS: Fetcher;
  ONLINE: Fetcher;
}

const HANDLE_PATH = /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPublicPageRequest(request: Request): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const { pathname } = new URL(request.url);

  return (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/assets/site/') ||
    HANDLE_PATH.test(pathname)
  );
}

export default {
  fetch(request, env): Promise<Response> {
    return isPublicPageRequest(request)
      ? env.ONLINE.fetch(request)
      : env.TOOLS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
