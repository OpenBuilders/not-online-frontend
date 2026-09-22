/**
 * The brainstorming board: nine squares, each a post you could actually
 * make this week. Prompts are concrete on purpose — "show the thing you
 * scrapped" gets made, "share your journey" does not.
 *
 * Nine, not twenty-five. A 5x5 board put so much text in one panel that
 * reading it was itself a task, which is the opposite of what you want
 * from the thing you open when you are already stuck. Nine squares fit the
 * window at a size where each prompt is a card rather than a cell.
 *
 * Squares are stored in reading order and the grid is 3 wide, so index 4
 * is the middle one. That middle square is the free space, the way a paper
 * bingo card has one, and it says nothing — which is the joke and also the
 * point of the whole desktop.
 */

import type { LabelTone } from '@/components/shared/LabelPill';

export type BingoTopic = 'interaction' | 'life' | 'process' | 'craft' | 'nothing';

export interface BingoSquare {
  id: string;
  topic: BingoTopic;
  text: string;
  /** Revealed only once the square is crossed off — see BingoPanel. */
  art: string;
}

/** Which sticker colour each topic wears — see shared/LabelPill. */
export const TOPIC_TONE: Record<BingoTopic, LabelTone> = {
  interaction: 'lime',
  life: 'pink',
  process: 'ink',
  craft: 'paper',
  nothing: 'paper',
};

/* One word where possible. A square carries a sticker label, and longer
   names wrapped or ran off the edge. */
export const BINGO_TOPICS: Record<BingoTopic, string> = {
  interaction: 'ask them',
  life: 'your life',
  process: 'process',
  craft: 'craft',
  nothing: 'nothing',
};

export const BINGO_SQUARES: BingoSquare[] = [
  { id: 'b01', topic: 'process', text: 'Show the version you scrapped', art: '/assets/bingo/b1.png' },
  { id: 'b02', topic: 'interaction', text: 'Ask which of two you should finish', art: '/assets/bingo/b2.png' },
  { id: 'b03', topic: 'life', text: 'What is actually on your desk right now', art: '/assets/bingo/b3.png' },

  { id: 'b04', topic: 'craft', text: 'The rule you break every single time', art: '/assets/bingo/b4.png' },
  { id: 'b05', topic: 'nothing', text: 'Post nothing. On purpose. Today.', art: '/assets/bingo/b5.png' },
  { id: 'b06', topic: 'interaction', text: 'Answer the question you get most', art: '/assets/bingo/b6.png' },

  { id: 'b07', topic: 'process', text: 'Film 30 seconds of the boring part', art: '/assets/bingo/b7.png' },
  { id: 'b08', topic: 'life', text: 'What you did instead of working', art: '/assets/bingo/b8.png' },
  { id: 'b09', topic: 'craft', text: 'Take apart a piece you admire', art: '/assets/bingo/b9.png' },
];

/** Index of the free square, so the board can render it as already given. */
export const BINGO_FREE_INDEX = 4;
export const BINGO_SIZE = 3;
