export type LinkPageTemplate = 'poster' | 'stickers' | 'web1' | 'button' | 'bold' | 'folders';

export interface PublicLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}

export interface PublicLinkPage {
  handle: string;
  name: string;
  bio: string;
  avatar: string | null;
  template: LinkPageTemplate;
  palette: string;
  backdrop: string;
  backdropImage: string | null;
  buttonStyle: string;
  buttonColor: string;
  folderColor: string;
  seed: number;
  links: PublicLink[];
}

const apiUrl = (import.meta.env.LINK_PAGES_API_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

export async function getPublicLinkPage(handle: string): Promise<PublicLinkPage | null> {
  const response = await fetch(`${apiUrl}/link-pages/${encodeURIComponent(handle)}`, {
    headers: { Accept: 'application/json' },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Link page API returned ${response.status}`);
  }

  const text = await response.text();
  if (!text) throw new Error('Link page API returned an empty response');
  return JSON.parse(text) as PublicLinkPage;
}
