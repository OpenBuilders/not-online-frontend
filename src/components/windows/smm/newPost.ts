import type { SmmPost, SmmPostDraft } from '@/types';

/** A draft with nothing decided about it except what it says and where it goes. */
export function blankPost(title: string, labels: string[] = []): SmmPostDraft {
  return {
    title,
    body: '',
    platform: 'instagram',
    labels,
    status: 'draft',
    day: null,
  };
}

export function postDraft(post: SmmPost, patch: Partial<SmmPostDraft> = {}): SmmPostDraft {
  return {
    title: post.title,
    body: post.body,
    platform: post.platform,
    labels: post.labels,
    status: post.status,
    day: post.day,
    ...patch,
  };
}
