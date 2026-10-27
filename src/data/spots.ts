/**
 * Spots: places recommended by people we trust — where artists actually
 * go between openings. Not sponsored, not ranked.
 *
 * SAMPLE DATA. The places are real and public; the people recommending
 * them are made-up placeholders (no real person's name or words), and the
 * quotes are written for this prototype. Real recommenders and our
 * "checked by NOT" validation come later — the tab says so.
 */

export type SpotType = 'coffee' | 'food' | 'bar' | 'books' | 'records' | 'cinema' | 'outdoors' | 'odd' | 'market';

export const SPOT_TYPES: Record<SpotType, { label: string; icon: string }> = {
  coffee: { label: 'Coffee', icon: 'local_cafe' },
  food: { label: 'Food', icon: 'restaurant' },
  bar: { label: 'Bar', icon: 'local_bar' },
  books: { label: 'Books', icon: 'menu_book' },
  records: { label: 'Records', icon: 'album' },
  cinema: { label: 'Cinema', icon: 'movie' },
  outdoors: { label: 'Outside', icon: 'park' },
  odd: { label: 'Odd spot', icon: 'explore' },
  market: { label: 'Market', icon: 'storefront' },
};

export interface Recommender {
  id: string;
  name: string;
  /** What they do — why their taste is worth something. */
  role: string;
  city: string;
  avatar: string;
}

const AV = '/assets/site/avatars';

export const RECOMMENDERS: Recommender[] = [
  { id: 'ira', name: 'Ira K.', role: 'painter', city: 'London', avatar: `${AV}/ava_1.png` },
  { id: 'mo', name: 'Mo A.', role: 'set designer', city: 'London', avatar: `${AV}/ava_cool.png` },
  { id: 'dana', name: 'Dana R.', role: 'photographer', city: 'New York', avatar: `${AV}/ava_portrait.png` },
  { id: 'lu', name: 'Lu P.', role: 'gallery assistant', city: 'New York', avatar: `${AV}/ava_singer.png` },
  { id: 'theo', name: 'Theo M.', role: 'curator', city: 'Paris', avatar: `${AV}/ava_crazy.png` },
  { id: 'jules', name: 'Jules F.', role: 'writer', city: 'Paris', avatar: `${AV}/ava_kid.png` },
  { id: 'sol', name: 'Sol B.', role: 'sound artist', city: 'Berlin', avatar: `${AV}/ava_pull.png` },
  { id: 'kai', name: 'Kai N.', role: 'DJ', city: 'Berlin', avatar: `${AV}/ava_whitecol.png` },
];
export const RECOMMENDER_BY_ID: Record<string, Recommender> = Object.fromEntries(RECOMMENDERS.map((r) => [r.id, r]));

export interface Spot {
  id: string;
  name: string;
  type: SpotType;
  /** One of the cities with a drawn map. */
  cityId: string;
  area: string;
  lat: number;
  lng: number;
  /** Who recommends it, first one is the one quoted. */
  by: string[];
  quote: string;
  /** What it is good for, in two or three words each. */
  goodFor: string[];
  /** Checked by us in person. */
  checked: boolean;
}

export const SPOTS: Spot[] = [
  // ---- London --------------------------------------------------------------
  { id: 'daunt-marylebone', name: 'Daunt Books', type: 'books', cityId: 'london', area: 'Marylebone', lat: 51.5205, lng: -0.1518, by: ['ira', 'mo'], quote: 'The long back room with the skylight. Sorted by country, so you leave with something you never meant to buy.', goodFor: ['a slow hour', 'gifts'], checked: true },
  { id: 'prince-charles', name: 'Prince Charles Cinema', type: 'cinema', cityId: 'london', area: 'Leicester Square', lat: 51.5113, lng: -0.1305, by: ['mo'], quote: 'Cheap seats, strange double bills, a crowd that claps at the credits.', goodFor: ['after an opening', 'cheap'], checked: true },
  { id: 'bar-italia', name: 'Bar Italia', type: 'coffee', cityId: 'london', area: 'Soho', lat: 51.5136, lng: -0.1317, by: ['ira'], quote: 'Open half the night. The espresso is fine, the people watching is the point.', goodFor: ['late', 'meeting someone'], checked: false },
  { id: 'soane', name: "Sir John Soane's Museum", type: 'odd', cityId: 'london', area: 'Holborn', lat: 51.517, lng: -0.1174, by: ['mo', 'ira'], quote: 'An architect who never threw anything away. Go on a weekday and look up.', goodFor: ['free', 'ideas'], checked: true },
  { id: 'columbia-road', name: 'Columbia Road Flower Market', type: 'market', cityId: 'london', area: 'Bethnal Green', lat: 51.5292, lng: -0.07, by: ['ira'], quote: 'Sunday morning only. Go at closing time when they start shouting prices down.', goodFor: ['Sunday', 'colour'], checked: false },
  { id: 'rough-trade-east', name: 'Rough Trade East', type: 'records', cityId: 'london', area: 'Brick Lane', lat: 51.5216, lng: -0.0718, by: ['mo'], quote: 'The in-store shows are free and better than half the paid ones.', goodFor: ['free gigs', 'digging'], checked: true },
  { id: 'barbican-conservatory', name: 'Barbican Conservatory', type: 'odd', cityId: 'london', area: 'Barbican', lat: 51.5203, lng: -0.0937, by: ['ira', 'mo'], quote: 'A jungle on top of a concrete fortress. Check the opening days first, it keeps odd hours.', goodFor: ['drawing', 'rainy days'], checked: true },
  { id: 'primrose-hill', name: 'Primrose Hill', type: 'outdoors', cityId: 'london', area: 'Primrose Hill', lat: 51.5394, lng: -0.1608, by: ['ira'], quote: 'Bring a sketchbook for the skyline, stay for the dogs.', goodFor: ['sunset', 'free'], checked: false },
  { id: 'french-house', name: 'The French House', type: 'bar', cityId: 'london', area: 'Soho', lat: 51.513, lng: -0.132, by: ['mo'], quote: 'Half pints only, no music, no phones. Painters have drunk here for eighty years.', goodFor: ['after an opening', 'talking'], checked: true },
  { id: 'beigel-bake', name: 'Beigel Bake', type: 'food', cityId: 'london', area: 'Brick Lane', lat: 51.5245, lng: -0.0717, by: ['mo', 'ira'], quote: 'Salt beef at three in the morning, for the price of a coffee anywhere else.', goodFor: ['late', 'cheap'], checked: true },

  // ---- New York ------------------------------------------------------------
  { id: 'strand', name: 'Strand Book Store', type: 'books', cityId: 'new-york', area: 'Union Square', lat: 40.7333, lng: -73.9908, by: ['dana'], quote: 'Start at the dollar carts outside, end up in the art books on the third floor.', goodFor: ['cheap', 'a slow hour'], checked: true },
  { id: 'film-forum', name: 'Film Forum', type: 'cinema', cityId: 'new-york', area: 'West Village', lat: 40.7285, lng: -74.0045, by: ['lu', 'dana'], quote: 'Repertory programme that reads like a syllabus. The popcorn is a lot better than it needs to be.', goodFor: ['a weeknight', 'learning'], checked: true },
  { id: 'katz', name: "Katz's Delicatessen", type: 'food', cityId: 'new-york', area: 'Lower East Side', lat: 40.7223, lng: -73.9874, by: ['lu'], quote: 'Between the LES galleries. Split a pastrami, you will not finish one.', goodFor: ['gallery crawl', 'sharing'], checked: false },
  { id: 'elevated-acre', name: 'The Elevated Acre', type: 'odd', cityId: 'new-york', area: 'Financial District', lat: 40.7036, lng: -74.0089, by: ['dana'], quote: 'A lawn up an escalator in the middle of the banks. Nobody is ever there.', goodFor: ['quiet', 'free'], checked: false },
  { id: 'old-town-bar', name: 'Old Town Bar', type: 'bar', cityId: 'new-york', area: 'Flatiron', lat: 40.7375, lng: -73.9894, by: ['lu'], quote: 'Wooden booths, dumbwaiter, no scene at all. That is the scene.', goodFor: ['talking', 'cheap'], checked: true },
  { id: 'domino-park', name: 'Domino Park', type: 'outdoors', cityId: 'new-york', area: 'Williamsburg', lat: 40.7146, lng: -73.968, by: ['dana', 'lu'], quote: 'The old sugar factory cranes, and the whole of Manhattan across the water.', goodFor: ['sunset', 'free'], checked: true },
  { id: 'academy-records', name: 'Academy Records', type: 'records', cityId: 'new-york', area: 'Flatiron', lat: 40.7389, lng: -73.9935, by: ['lu'], quote: 'Used classical and jazz, priced by people who know exactly what they have.', goodFor: ['digging'], checked: false },
  { id: 'high-line', name: 'The High Line', type: 'outdoors', cityId: 'new-york', area: 'Chelsea', lat: 40.7398, lng: -74.008, by: ['dana'], quote: 'Walk it north at eight in the morning, before it turns into a queue, then do the Chelsea galleries.', goodFor: ['gallery crawl', 'early'], checked: true },
  { id: 'dream-house', name: 'Dream House', type: 'odd', cityId: 'new-york', area: 'Tribeca', lat: 40.7186, lng: -74.005, by: ['dana', 'lu'], quote: 'A sound and light installation that has been running for decades. Shoes off, lie down, lose an hour.', goodFor: ['ideas', 'quiet'], checked: true },
  { id: 'printed-matter', name: 'Printed Matter', type: 'books', cityId: 'new-york', area: 'Chelsea', lat: 40.7505, lng: -74.0058, by: ['lu'], quote: 'Artists books and zines you will not find anywhere else. Ask about the consignment.', goodFor: ['zines', 'gallery crawl'], checked: true },

  // ---- Paris ---------------------------------------------------------------
  { id: 'shakespeare-co', name: 'Shakespeare and Company', type: 'books', cityId: 'paris', area: 'Latin Quarter', lat: 48.8526, lng: 2.3471, by: ['jules'], quote: 'Touristy, yes. Go upstairs to the reading room anyway, early on a weekday.', goodFor: ['early', 'a slow hour'], checked: true },
  { id: 'le-champo', name: 'Le Champo', type: 'cinema', cityId: 'paris', area: 'Latin Quarter', lat: 48.8505, lng: 2.3434, by: ['theo', 'jules'], quote: 'Old films on a periscope projector. A whole education for a few euros.', goodFor: ['a weeknight', 'cheap'], checked: true },
  { id: 'cafe-mairie', name: 'Café de la Mairie', type: 'coffee', cityId: 'paris', area: 'Saint-Sulpice', lat: 48.8513, lng: 2.3347, by: ['jules'], quote: 'The terrace on the square, a coffee, two hours. Nobody will move you on.', goodFor: ['writing', 'meeting someone'], checked: false },
  { id: 'coulee-verte', name: 'Coulée verte René-Dumont', type: 'outdoors', cityId: 'paris', area: 'Bastille', lat: 48.8483, lng: 2.373, by: ['theo'], quote: 'The original raised park. Quieter than the one in New York and older.', goodFor: ['walking', 'free'], checked: true },
  { id: 'chasse-nature', name: 'Musée de la Chasse et de la Nature', type: 'odd', cityId: 'paris', area: 'Marais', lat: 48.8614, lng: 2.3577, by: ['theo', 'jules'], quote: 'Taxidermy next to contemporary commissions. The strangest good museum in the city.', goodFor: ['ideas', 'gallery crawl'], checked: true },
  { id: 'canal-saint-martin', name: 'Canal Saint-Martin', type: 'outdoors', cityId: 'paris', area: 'Canal Saint-Martin', lat: 48.8713, lng: 2.3651, by: ['jules'], quote: 'Sit on the edge with a bottle when the evening comes. Everyone else does.', goodFor: ['sunset', 'cheap'], checked: false },
  { id: 'baron-rouge', name: 'Le Baron Rouge', type: 'bar', cityId: 'paris', area: 'Aligre', lat: 48.8492, lng: 2.3786, by: ['theo'], quote: 'Wine from the barrel, standing room only, oysters on market days.', goodFor: ['Sunday', 'cheap'], checked: true },
  { id: 'enfants-rouges', name: 'Marché des Enfants Rouges', type: 'market', cityId: 'paris', area: 'Marais', lat: 48.8628, lng: 2.3618, by: ['jules', 'theo'], quote: 'Lunch between the Marais galleries. The oldest covered market in Paris.', goodFor: ['gallery crawl', 'lunch'], checked: true },
  { id: 'buttes-chaumont', name: 'Parc des Buttes-Chaumont', type: 'outdoors', cityId: 'paris', area: 'Belleville', lat: 48.8809, lng: 2.3828, by: ['theo'], quote: 'A fake mountain with a temple on top. Climb it, then go to the Belleville project spaces.', goodFor: ['sunset', 'free'], checked: false },

  // ---- Berlin --------------------------------------------------------------
  { id: 'tempelhof', name: 'Tempelhofer Feld', type: 'outdoors', cityId: 'berlin', area: 'Neukölln', lat: 52.475, lng: 13.4, by: ['sol', 'kai'], quote: 'An airport runway that became the sky. The best free thing in Berlin.', goodFor: ['free', 'sunset'], checked: true },
  { id: 'do-you-read-me', name: 'Do You Read Me?!', type: 'books', cityId: 'berlin', area: 'Mitte', lat: 52.527, lng: 13.399, by: ['sol'], quote: 'Magazines from everywhere, chosen by people with taste. Half the Auguststrasse galleries are next door.', goodFor: ['gallery crawl', 'zines'], checked: true },
  { id: 'hard-wax', name: 'Hard Wax', type: 'records', cityId: 'berlin', area: 'Kreuzberg', lat: 52.496, lng: 13.4225, by: ['kai'], quote: 'Up the stairs in a courtyard by the canal. Ask, and they will play you anything.', goodFor: ['digging'], checked: true },
  { id: 'kino-international', name: 'Kino International', type: 'cinema', cityId: 'berlin', area: 'Karl-Marx-Allee', lat: 52.5205, lng: 13.423, by: ['sol', 'kai'], quote: 'A sixties East German cinema with a bar upstairs that looks over the boulevard.', goodFor: ['architecture', 'a weeknight'], checked: false },
  { id: 'prinzessinnengarten', name: 'Prinzessinnengarten', type: 'odd', cityId: 'berlin', area: 'Kreuzberg', lat: 52.5035, lng: 13.41, by: ['sol'], quote: 'A community garden on a wasteland, run by whoever turns up. Bring your hands.', goodFor: ['quiet', 'free'], checked: false },
  { id: 'einstein-stammhaus', name: 'Café Einstein Stammhaus', type: 'coffee', cityId: 'berlin', area: 'Schöneberg', lat: 52.5025, lng: 13.3533, by: ['sol'], quote: 'A Viennese coffee house in an old villa. Slow, a little formal, perfect for reading.', goodFor: ['writing', 'a slow hour'], checked: true },
  { id: 'mustafas', name: "Mustafa's Gemüse Kebap", type: 'food', cityId: 'berlin', area: 'Kreuzberg', lat: 52.4937, lng: 13.388, by: ['kai'], quote: 'The queue is the price. Go before eleven at night or not at all.', goodFor: ['late', 'cheap'], checked: false },
  { id: 'claerchens', name: 'Clärchens Ballhaus', type: 'bar', cityId: 'berlin', area: 'Mitte', lat: 52.5265, lng: 13.3965, by: ['kai', 'sol'], quote: 'A dance hall that has been going since 1913. The mirror room upstairs is the thing.', goodFor: ['dancing', 'after an opening'], checked: true },
];

/** The cities with spots, busiest first. */
export const SPOT_CITIES = (() => {
  const n = new Map<string, number>();
  SPOTS.forEach((s) => n.set(s.cityId, (n.get(s.cityId) ?? 0) + 1));
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count }));
})();
