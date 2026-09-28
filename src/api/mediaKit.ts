import { ApiError } from './auth';
import type { SmmPhoto, SmmPost, SmmPostDraft } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface ApiPhoto {
  id: string;
  url: string;
  position: number;
}

interface ApiPost extends Omit<SmmPost, 'createdAt' | 'updatedAt' | 'photos'> {
  photos: ApiPhoto[];
  createdAt: string;
  updatedAt: string;
}

interface ApiMediaKit {
  posts: ApiPost[];
  bingoCrossed: string[];
}

export interface MediaKitData {
  posts: SmmPost[];
  bingoCrossed: string[];
}

interface ErrorResponse {
  message?: string | string[];
}

function message(body: ErrorResponse | null, status: number): string {
  return Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message || `Request failed with status ${status}`;
}

async function responseJson<T>(response: Response): Promise<T> {
  const raw = await response.text();
  if (!raw) throw new ApiError('The server returned an empty response.', response.status);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new ApiError(message(body, response.status), response.status);
  }
  return responseJson<T>(response);
}

async function requestVoid(path: string, init: RequestInit = {}): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new ApiError(message(body, response.status), response.status);
  }
}

function toPost(post: ApiPost): SmmPost {
  return {
    ...post,
    photos: post.photos.slice().sort((a, b) => a.position - b.position).map<SmmPhoto>((photo) => ({ ...photo })),
    createdAt: Date.parse(post.createdAt),
    updatedAt: Date.parse(post.updatedAt),
  };
}

export async function getMediaKit(): Promise<MediaKitData> {
  const data = await request<ApiMediaKit>('/media-kit/me');
  return { posts: data.posts.map(toPost), bingoCrossed: data.bingoCrossed };
}

export async function createMediaKitPost(draft: SmmPostDraft): Promise<SmmPost> {
  return toPost(await request<ApiPost>('/media-kit/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  }));
}

export async function updateMediaKitPost(post: SmmPost, draft: SmmPostDraft): Promise<SmmPost> {
  return toPost(await request<ApiPost>(`/media-kit/posts/${post.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...draft, revision: post.revision }),
  }));
}

/**
 * A best-effort last write for a tab that is closing. `keepalive` lets the
 * browser finish this small JSON request after the page has started leaving;
 * photos deliberately use their normal upload endpoint instead.
 */
export function backupMediaKitPost(post: SmmPost | null, draft: SmmPostDraft): void {
  const path = post ? `/media-kit/posts/${post.id}` : '/media-kit/posts';
  const body = post ? { ...draft, revision: post.revision } : draft;
  void fetch(`${API_URL}${path}`, {
    method: post ? 'PATCH' : 'POST',
    credentials: 'include',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}

export async function deleteMediaKitPost(postId: string): Promise<void> {
  await requestVoid(`/media-kit/posts/${postId}`, { method: 'DELETE' });
}

export async function uploadMediaKitPhotos(postId: string, files: File[]): Promise<SmmPost> {
  const body = new FormData();
  files.forEach((file) => body.append('photos', file));
  return toPost(await request<ApiPost>(`/media-kit/posts/${postId}/photos`, { method: 'POST', body }));
}

export async function deleteMediaKitPhoto(postId: string, photoId: string): Promise<SmmPost> {
  return toPost(await request<ApiPost>(`/media-kit/posts/${postId}/photos/${photoId}`, { method: 'DELETE' }));
}

export async function setMediaKitBingo(squareId: string, crossed: boolean): Promise<{ id: string; crossed: boolean }> {
  return request<{ id: string; crossed: boolean }>(`/media-kit/bingo/${encodeURIComponent(squareId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crossed }),
  });
}
