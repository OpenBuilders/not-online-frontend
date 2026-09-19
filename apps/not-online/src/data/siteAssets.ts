const FOLDER_DIR = '/assets/site/folders';

export const FOLDER_COLOR_FILES = ['blue.png', 'green.png', 'grey.png', 'orange.png'];

export interface FolderColor {
  id: string;
  name: string;
  src: string;
}

export const FOLDER_COLORS: FolderColor[] = FOLDER_COLOR_FILES.map((file) => {
  const id = file.replace(/\.[a-z]+$/i, '');
  return { id, name: id, src: `${FOLDER_DIR}/${file}` };
});

export const getFolderColor = (id: string): FolderColor => FOLDER_COLORS.find((color) => color.id === id) ?? FOLDER_COLORS[0];
export const NO_ICON = '';
export const isImageIcon = (icon: string) => icon.startsWith('/');
