/**
 * The cut-out avatars from the links-page builder, reused as stickers on
 * the 404s. Only the ones drawn on a transparent ground — the square
 * portraits would read as photos stuck to the wall, not stickers.
 */
const DIR = '/assets/site/avatars';

export const STICKERS = [
  { src: `${DIR}/ava_duck.png`, label: 'Rubber duck' },
  { src: `${DIR}/ava_fuckalgo.png`, label: 'Fuck the algorithm' },
  { src: `${DIR}/ava_verifyed.png`, label: 'Verified tick' },
  { src: `${DIR}/ava_star.png`, label: 'Star head' },
  { src: `${DIR}/ava_frog.png`, label: 'Frog in a suit' },
  { src: `${DIR}/ava_heart.png`, label: 'Anatomical heart' },
  { src: `${DIR}/ava_brain.png`, label: 'Brain' },
  { src: `${DIR}/ava_clip.png`, label: 'Paperclip' },
  { src: `${DIR}/ava_toy.png`, label: 'Chattering teeth' },
  { src: `${DIR}/ava_wait.png`, label: 'Please wait' },
  { src: `${DIR}/ava_ear.png`, label: 'Ear' },
  { src: `${DIR}/ava_1.png`, label: 'Lime head' },
  { src: `${DIR}/ava_fuckoff.png`, label: 'Middle finger' },
  { src: `${DIR}/ava_failing.png`, label: 'Falling apart' },
] as const;

export type StickerSrc = (typeof STICKERS)[number]['src'];
