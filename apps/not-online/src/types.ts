export type SiteTemplateId = 'poster' | 'stickers' | 'web1' | 'button' | 'bold' | 'folders';

export interface SiteLink {
  id: string;
  icon: string;
  title: string;
  url: string;
}

export interface SiteConfig {
  handle: string;
  name: string;
  bio: string;
  avatar: string | null;
  template: SiteTemplateId;
  palette: string;
  backdrop: string;
  backdropImage: string | null;
  buttonStyle: string;
  buttonColor: string;
  folderColor: string;
  links: SiteLink[];
  seed: number;
}
