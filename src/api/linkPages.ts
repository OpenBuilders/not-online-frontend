import { AVATAR_PRESETS } from '@/data/siteAssets';
import type { SiteConfig, SiteLink } from '@/types';
import { ApiError } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type AvatarMode = 'initials' | 'preset' | 'upload';

interface LinkPageLinkResponse {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
}

export interface LinkPageResponse {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatarMode: AvatarMode;
  avatarPreset: string | null;
  avatar: string | null;
  uploadedAvatarUrl: string | null;
  template: SiteConfig['template'];
  palette: string;
  backdrop: string;
  backdropImage: string | null;
  buttonStyle: string;
  buttonColor: string;
  folderColor: string;
  seed: number;
  publishedAt: string | null;
  links: LinkPageLinkResponse[];
}

interface ErrorResponse {
  message?: string | string[];
}

function errorMessage(body: ErrorResponse | null, status: number): string {
  return Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message || `Request failed with status ${status}`;
}

async function responseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new ApiError('The server returned an empty response.', response.status);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status);
  }
}

async function dataUrlToFile(value: string, name: string): Promise<File> {
  const response = await fetch(value);
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || 'application/octet-stream' });
}

function avatarMode(avatar: string | null): AvatarMode {
  if (!avatar) return 'initials';
  return AVATAR_PRESETS.includes(avatar) ? 'preset' : 'upload';
}

function toSaveConfig(site: SiteConfig) {
  const mode = avatarMode(site.avatar);
  return {
    handle: site.handle,
    name: site.name,
    bio: site.bio,
    avatarMode: mode,
    avatarPreset: mode === 'preset' ? site.avatar : null,
    template: site.template,
    palette: site.palette,
    backdrop: site.backdrop,
    buttonStyle: site.buttonStyle,
    buttonColor: site.buttonColor,
    folderColor: site.folderColor,
    seed: site.seed,
    links: (site.template === 'button' ? site.links.slice(0, 1) : site.links)
      .filter((link) => link.title.trim() && link.url.trim())
      .map((link) => ({
        ...link,
        id: isServerLinkId(link.id) ? link.id : undefined,
      })),
  };
}

function isServerLinkId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function toSiteConfig(
  page: LinkPageResponse,
  presentation?: Pick<SiteConfig, 'views' | 'clicks'>,
): SiteConfig {
  return {
    handle: page.handle,
    name: page.name,
    bio: page.bio,
    avatar: page.avatar,
    template: page.template,
    palette: page.palette,
    backdrop: page.backdrop,
    backdropImage: page.backdropImage,
    buttonStyle: page.buttonStyle,
    buttonColor: page.buttonColor,
    folderColor: page.folderColor,
    seed: page.seed,
    views: presentation?.views ?? 0,
    clicks: presentation?.clicks ?? 0,
    links: page.links
      .slice()
      .sort((left, right) => left.position - right.position)
      .map<SiteLink>(({ id, title, url, icon }) => ({ id, title, url, icon })),
  };
}

export async function getMyLinkPage(): Promise<LinkPageResponse | null> {
  const response = await fetch(`${API_URL}/link-pages/me`, { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new ApiError(errorMessage(body, response.status), response.status);
  }
  return responseJson<LinkPageResponse | null>(response);
}

export async function saveLinkPage(site: SiteConfig): Promise<LinkPageResponse> {
  const body = new FormData();
  body.set('config', JSON.stringify(toSaveConfig(site)));

  if (site.avatar?.startsWith('data:')) {
    body.set('avatar', await dataUrlToFile(site.avatar, 'avatar'));
  }
  if (site.backdrop === 'photo' && site.backdropImage?.startsWith('data:')) {
    body.set('background', await dataUrlToFile(site.backdropImage, 'background'));
  }

  const response = await fetch(`${API_URL}/link-pages/me`, {
    method: 'PUT',
    credentials: 'include',
    body,
  });
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new ApiError(errorMessage(errorBody, response.status), response.status);
  }
  return responseJson<LinkPageResponse>(response);
}
