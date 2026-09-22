import type { SmmPost } from '@/types';

/**
 * Sequence appended to every id.
 *
 * `Date.now()` alone is not unique: two posts created inside the same
 * millisecond — a double click on the bingo board, two brainstorm
 * questions taken in quick succession — came out with identical ids, and
 * every update or delete by id then hit both of them. The counter makes
 * collisions impossible within a session, and the timestamp keeps ids
 * sorting by creation order.
 */
let seq = 0;

export function newPostId(): string {
  seq += 1;
  return `smm_${Date.now().toString(36)}_${seq}`;
}

/** A draft with nothing decided about it except what it says and where it goes. */
export function blankPost(title: string, labels: string[] = []): SmmPost {
  return {
    id: newPostId(),
    title,
    body: '',
    platform: 'instagram',
    labels,
    photos: [],
    status: 'draft',
    day: null,
    createdAt: Date.now(),
  };
}
