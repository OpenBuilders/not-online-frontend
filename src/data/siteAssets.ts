/**
 * Customization images that live as real files rather than code.
 *
 * Drop new files into `public/assets/site/avatars`, `.../icons` or
 * `.../folders` and add the filename to the matching list below — that's
 * the whole job, nothing else needs touching.
 */

const AVATAR_DIR = '/assets/site/avatars';
const ICON_DIR = '/assets/site/icons';
const FOLDER_DIR = '/assets/site/folders';

/** Square images offered as ready-made avatars. */
export const AVATAR_FILES = [
  'ava_1.png',
  'ava_portrait.png',
  'ava_cool.png',
  'ava_crazy.png',
  'ava_smart.png',
  'ava_star.png',
  'ava_heart.png',
  'ava_brain.png',
  'ava_clown.png',
  'ava_clip.png',
  'ava_drinking.png',
  'ava_duck.png',
  'ava_ear.png',
  'ava_failing.png',
  'ava_frog.png',
  'ava_fuckalgo.png',
  'ava_fuckoff.png',
  'ava_kid.png',
  'ava_pull.png',
  'ava_singer.png',
  'ava_toy.png',
  'ava_verifyed.png',
  'ava_wait.png',
  'ava_whitecol.png',
];

/** The house illustration set, offered as link icons alongside the plain symbols. */
export const ICON_FILES = [
  'icon_!!!.png',
  'icon_90%.png',
  'icon_alarm.png',
  'icon_archive.png',
  'icon_buttondelete.png',
  'icon_buttonfuck.png',
  'icon_buttonlike.png',
  'icon_club.png',
  'icon_dollar.png',
  'icon_dynamite.png',
  'icon_eggs.png',
  'icon_flashcard.png',
  'icon_flashcard_2.png',
  'icon_flower.png',
  'icon_flowers.png',
  'icon_gameboy.png',
  'icon_globe.png',
  'icon_handdisk.png',
  'icon_hands.png',
  'icon_like.png',
  'icon_lovehands.png',
  'icon_mac.png',
  'icon_money.png',
  'icon_nail.png',
  'icon_palm.png',
  'icon_paperclip.png',
  'icon_piggy.png',
  'icon_plate.png',
  'icon_point.png',
  'icon_saw.png',
  'icon_scotch.png',
  'icon_something.png',
  'icon_spike.png',
  'icon_trash.png',
  'icon_tumblers.png',
  'icon_tv.png',
  'icon_verif.png',
  'icon_wall.png',
];

/**
 * The Folders template's colourway — one file per colour, named after it.
 * The swatch in the builder IS the folder the page draws, so the picker
 * can't drift from the render.
 */
export const FOLDER_COLOR_FILES = ['blue.png', 'green.png', 'grey.png', 'orange.png'];

export const AVATAR_PRESETS = AVATAR_FILES.map((f) => `${AVATAR_DIR}/${f}`);
export const ICON_PRESETS = ICON_FILES.map((f) => `${ICON_DIR}/${f}`);

export interface FolderColor {
  id: string;
  name: string;
  src: string;
}

export const FOLDER_COLORS: FolderColor[] = FOLDER_COLOR_FILES.map((f) => {
  const id = f.replace(/\.[a-z]+$/i, '');
  return { id, name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '), src: `${FOLDER_DIR}/${f}` };
});

export const getFolderColor = (id: string): FolderColor => FOLDER_COLORS.find((c) => c.id === id) ?? FOLDER_COLORS[0];

/** A link's mark: a built-in symbol name, a path to one of the images above, or nothing at all. */
export const NO_ICON = '';
export const isImageIcon = (icon: string) => icon.startsWith('/');

/** "icon_paperclip.png" -> "paperclip", for the picker's labels. */
export const iconLabel = (src: string) =>
  src
    .split('/')
    .pop()!
    .replace(/\.[a-z]+$/i, '')
    .replace(/^icon_/, '')
    .replace(/_/g, ' ');
