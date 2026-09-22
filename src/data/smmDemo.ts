import type { SmmPlatform } from '@/types';

/**
 * The post the guided demo writes for you.
 *
 * It arrives finished because the demo is about the loop — write, file,
 * schedule — and not about the writing. A visitor asked to invent a post
 * before they have seen what the tool does with one usually invents
 * nothing and closes the window.
 *
 * The copy is a real post rather than filler, so the card, the calendar
 * cell and the wallpaper all show something a person would actually plan.
 */
export const DEMO_POST: {
  title: string;
  body: string;
  platform: SmmPlatform;
  labels: string[];
} = {
  title: 'What we threw away this week',
  body: 'Three things that did not make it: a logo that was just a circle, a slogan with the word "journey" in it, and a founder video shot at golden hour. Posting the rejects is still posting.',
  platform: 'instagram',
  labels: ['behind the scenes'],
};
