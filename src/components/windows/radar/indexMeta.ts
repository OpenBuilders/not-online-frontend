import type { Door, IndexCategory } from '@/data/artIndex';

export const CATEGORY_LABEL: Record<IndexCategory, string> = {
  opencall: 'Open calls and residencies',
  school: 'Schools and residencies',
  foundation: 'Foundations and funders',
  prize: 'Prizes',
  biennial: 'Biennials and big shows',
  kunsthalle: 'Contemporary art centres',
  museum: 'Museums',
  private: 'Private museums',
  gallery: 'Galleries',
  fair: 'Fairs',
  state: 'State agencies',
  auction: 'Auction houses',
  media: 'Media',
  data: 'Data and platforms',
  infra: 'Market infrastructure',
};

/**
 * How open the door is, from the side of an artist with no gallery and no
 * known name. The same four steps the research uses, worded for the person
 * standing outside it.
 */
export const DOORS: Record<Door, { label: string; short: string; hint: string }> = {
  4: { label: 'Open to anyone', short: 'Open', hint: 'Anyone can apply: an open call, open show or competition, sometimes with a fee.' },
  3: { label: 'Apply', short: 'Apply', hint: 'An open application with conditions: age, country, years of practice. Usually competitive.' },
  2: { label: 'Through someone', short: 'Via someone', hint: "Needs a gallery, a curator, a nomination or your country's arts fund." },
  1: { label: 'Invitation only', short: 'Invite', hint: 'They choose, usually artists with an established career.' },
  0: { label: 'Not for artists', short: 'No door', hint: 'Does not work with artists directly.' },
};
