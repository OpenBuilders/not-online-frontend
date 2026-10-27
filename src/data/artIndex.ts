/**
 * The Radar index: 49 real art-world institutions you can apply to — who they are,
 * where, how much weight they carry in their field, and how open their door
 * is to an artist without a gallery or a known name.
 *
 * GENERATED from the "Art institutions catalogue" research (October 2026)
 * by scratchpad build.py, translated to English. Do not hand-edit rows;
 * fix the source and regenerate.
 *
 * Tier and door are editorial estimates, not official rankings, and open
 * calls change cycle to cycle — the UI says so wherever it shows them.
 *
 * Only the places an artist can get into without being invited or put
 * forward are kept: door 4 (open to anyone) and door 3 (apply). The
 * invitation-only and through-someone rest of the research was dropped.
 */

export type IndexCategory =
  | 'auction' | 'gallery' | 'fair' | 'museum' | 'kunsthalle' | 'private' | 'foundation' | 'state'
  | 'biennial' | 'prize' | 'school' | 'media' | 'data' | 'infra' | 'opencall';

/** 0: does not deal with artists directly. 1-4: invitation only, through someone, apply, open. */
export type Door = 0 | 1 | 2 | 3 | 4;

export interface IndexEntry {
  name: string;
  cat: IndexCategory;
  city: string;
  country: string;
  region: string;
  /** A: the reference in its field. B: international. C: regional or niche leader. */
  tier: 'A' | 'B' | 'C';
  door: Door;
  note: string;
  /** How an artist actually gets in. */
  route: string;
  /** Without the protocol. */
  url: string;
}

export const INDEX: IndexEntry[] = [
  {"name": "Calouste Gulbenkian Foundation", "cat": "foundation", "city": "Lisbon", "country": "Portugal", "region": "Europe", "tier": "B", "door": 3, "note": "Museum and international cultural programmes", "route": "Periodic open calls, mainly for Portuguese artists and projects", "url": "gulbenkian.pt"},
  {"name": "Pollock-Krasner Foundation", "cat": "foundation", "city": "New York", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "Grants to artists worldwide", "route": "You can apply year-round from any country. A professional practice and demonstrated financial need are required", "url": "pkf.org"},
  {"name": "Sharjah Art Foundation", "cat": "foundation", "city": "Sharjah", "country": "UAE", "region": "Middle East", "tier": "B", "door": 3, "note": "Sharjah Biennial, Hoor Al Qasimi", "route": "Periodic open calls for residencies and production grants", "url": "sharjahart.org"},
  {"name": "Foundation for Contemporary Arts", "cat": "foundation", "city": "New York", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Grants to artists, founded by Cage and Johns", "route": "Emergency Grants are an open application for those living in the US. The main grants are by nomination only", "url": "foundationforcontemporaryarts.org"},
  {"name": "Creative Capital", "cat": "foundation", "city": "New York", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Grants for experimental projects", "route": "Open call for projects, mainly for artists from the US", "url": "creative-capital.org"},
  {"name": "PinchukArtCentre", "cat": "foundation", "city": "Kyiv", "country": "Ukraine", "region": "Europe", "tier": "C", "door": 3, "note": "Future Generation Art Prize", "route": "Through the Future Generation Art Prize: an open competition for artists under 35", "url": "pinchukartcentre.org"},
  {"name": "Arts Council England", "cat": "state", "city": "London", "country": "UK", "region": "Europe", "tier": "B", "door": 3, "note": "Public funding for culture in the UK", "route": "For those living in England: Developing Your Creative Practice and Project Grants, through an open application", "url": "artscouncil.org.uk"},
  {"name": "Dak'Art", "cat": "biennial", "city": "Dakar", "country": "Senegal", "region": "Africa", "tier": "C", "door": 3, "note": "Africa's main biennial", "route": "In some editions the international exhibition was formed through an open call for artists from Africa and the diaspora. Check the terms for each edition", "url": "biennaledakar.org"},
  {"name": "Future Generation Art Prize", "cat": "prize", "city": "Kyiv", "country": "Ukraine", "region": "Europe", "tier": "C", "door": 3, "note": "For artists under 35, PinchukArtCentre", "route": "Open online competition for artists under 35 from any country", "url": "futuregenerationartprize.org"},
  {"name": "Artes Mundi", "cat": "prize", "city": "Cardiff", "country": "UK", "region": "Europe", "tier": "C", "door": 3, "note": "The largest UK contemporary art prize", "route": "In recent cycles nominations have been open, including self-nomination. Check the terms of the cycle", "url": "artesmundi.org"},
  {"name": "Royal College of Art", "cat": "school", "city": "London", "country": "UK", "region": "Europe", "tier": "A", "door": 3, "note": "No. 1 master's programme in the world for art and design", "route": "Portfolio and interview. High tuition fees for international students", "url": "rca.ac.uk"},
  {"name": "Yale School of Art", "cat": "school", "city": "New Haven", "country": "USA", "region": "North America", "tier": "A", "door": 3, "note": "Most influential MFA programme in the US", "route": "Portfolio; only a few percent of applicants are accepted. The strongest network of contacts in the US", "url": "art.yale.edu"},
  {"name": "Kunstakademie Düsseldorf", "cat": "school", "city": "Düsseldorf", "country": "Germany", "region": "Europe", "tier": "A", "door": 3, "note": "Beuys, Richter, Gursky", "route": "Portfolio exam. Tuition is almost free; you study in a specific professor's class", "url": "kunstakademie-duesseldorf.de"},
  {"name": "Goldsmiths", "cat": "school", "city": "London", "country": "UK", "region": "Europe", "tier": "B", "door": 3, "note": "Cradle of the Young British Artists", "route": "Admission by portfolio and exams", "url": "gold.ac.uk"},
  {"name": "Slade School of Fine Art", "cat": "school", "city": "London", "country": "UK", "region": "Europe", "tier": "B", "door": 3, "note": "Department of UCL", "route": "Admission by portfolio and exams", "url": "ucl.ac.uk/slade"},
  {"name": "Central Saint Martins", "cat": "school", "city": "London", "country": "UK", "region": "Europe", "tier": "B", "door": 3, "note": "Art and fashion", "route": "Admission by portfolio and exams", "url": "arts.ac.uk/csm"},
  {"name": "Columbia University School of the Arts", "cat": "school", "city": "New York", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "MFA", "route": "Admission by portfolio and exams", "url": "arts.columbia.edu"},
  {"name": "CalArts", "cat": "school", "city": "Los Angeles", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "West Coast conceptual tradition", "route": "Admission by portfolio and exams", "url": "calarts.edu"},
  {"name": "School of the Art Institute of Chicago", "cat": "school", "city": "Chicago", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "Part of the Art Institute of Chicago", "route": "Admission by portfolio and exams", "url": "saic.edu"},
  {"name": "Rhode Island School of Design", "cat": "school", "city": "Providence", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "Art and design", "route": "Admission by portfolio and exams", "url": "risd.edu"},
  {"name": "Städelschule", "cat": "school", "city": "Frankfurt", "country": "Germany", "region": "Europe", "tier": "B", "door": 3, "note": "Small elite academy", "route": "Portfolio, small intake. Tuition is almost free", "url": "staedelschule.de"},
  {"name": "UdK Berlin", "cat": "school", "city": "Berlin", "country": "Germany", "region": "Europe", "tier": "B", "door": 3, "note": "University of the Arts", "route": "Portfolio exam. Tuition is almost free", "url": "udk-berlin.de"},
  {"name": "Beaux-Arts de Paris", "cat": "school", "city": "Paris", "country": "France", "region": "Europe", "tier": "B", "door": 3, "note": "National Higher School of Fine Arts", "route": "Entrance competition. Tuition is cheap", "url": "beauxartsparis.fr"},
  {"name": "Rijksakademie", "cat": "school", "city": "Amsterdam", "country": "Netherlands", "region": "Europe", "tier": "B", "door": 3, "note": "Two-year residency for young artists", "route": "Open call once a year. The residency is free, with a stipend; about 1-2% of applications are accepted", "url": "rijksakademie.nl"},
  {"name": "Central Academy of Fine Arts (CAFA)", "cat": "school", "city": "Beijing", "country": "China", "region": "East Asia", "tier": "B", "door": 3, "note": "China's main academy", "route": "Admission by portfolio and exams", "url": "cafa.edu.cn"},
  {"name": "Tokyo University of the Arts", "cat": "school", "city": "Tokyo", "country": "Japan", "region": "East Asia", "tier": "B", "door": 3, "note": "Geidai", "route": "Admission by portfolio and exams", "url": "geidai.ac.jp"},
  {"name": "Glasgow School of Art", "cat": "school", "city": "Glasgow", "country": "UK", "region": "Europe", "tier": "C", "door": 3, "note": "Many Turner Prize winners", "route": "Admission by portfolio and exams", "url": "gsa.ac.uk"},
  {"name": "Skowhegan School", "cat": "school", "city": "Skowhegan", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Summer residency", "route": "Application with a fee; the programme is paid, but scholarships are available", "url": "skowheganart.org"},
  {"name": "Royal Academy Summer Exhibition", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "A", "door": 4, "note": "The largest open exhibition in the world, held since 1769", "route": "Any artist can submit: an online application with a paid fee for each work, selected by a jury. It is hard to get in, but the door is formally open", "url": "royalacademy.org.uk"},
  {"name": "Cité internationale des arts", "cat": "opencall", "city": "Paris", "country": "France", "region": "Europe", "tier": "B", "door": 3, "note": "Largest residency in Europe, about 300 studios", "route": "Apply through open calls or via partner organisations and foundations in your country", "url": "citedesartsparis.fr"},
  {"name": "ISCP", "cat": "opencall", "city": "New York", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "International studio residency programme in Brooklyn", "route": "The place is usually paid for by a foundation or your country's embassy, plus periodic fully funded open calls", "url": "iscp-nyc.org"},
  {"name": "Akademie Schloss Solitude", "cat": "opencall", "city": "Stuttgart", "country": "Germany", "region": "Europe", "tier": "B", "door": 3, "note": "Residency fellowships for artists up to a certain age", "route": "Open call roughly every 2 years, with age limits", "url": "akademie-solitude.de"},
  {"name": "MacDowell", "cat": "opencall", "city": "Peterborough", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "The oldest residency in the USA (1907), free", "route": "Open application twice a year, free for accepted artists, highly competitive", "url": "macdowell.org"},
  {"name": "Yaddo", "cat": "opencall", "city": "Saratoga Springs", "country": "USA", "region": "North America", "tier": "B", "door": 3, "note": "Free residency for artists and writers", "route": "Open application, paid submission fee, high competition", "url": "yaddo.org"},
  {"name": "Villa Medici", "cat": "opencall", "city": "Rome", "country": "Italy", "region": "Europe", "tier": "B", "door": 3, "note": "French Academy in Rome, residency with a stipend", "route": "Annual competition for French-speaking artists or those connected to France", "url": "villamedici.it"},
  {"name": "Bloomberg New Contemporaries", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "B", "door": 3, "note": "The UK's main exhibition for emerging artists", "route": "Open call for students, recent graduates and self-taught artists living in the UK", "url": "newcontemporaries.org.uk"},
  {"name": "Headlands Center for the Arts", "cat": "opencall", "city": "Sausalito", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Residencies in the San Francisco area", "route": "Some programmes have an open call, others are only for residents of California and certain states", "url": "headlands.org"},
  {"name": "Fogo Island Arts", "cat": "opencall", "city": "Fogo Island", "country": "Canada", "region": "North America", "tier": "C", "door": 3, "note": "Residency on an island off Newfoundland", "route": "Apply for a residency; selection by curators", "url": "fogoislandarts.ca"},
  {"name": "Gasworks", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "C", "door": 3, "note": "Studios and international residencies", "route": "Open calls for particular countries and programmes, some places through partner foundations", "url": "gasworks.org.uk"},
  {"name": "Triangle Network", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "C", "door": 3, "note": "A network of independent residencies and studios around the world", "route": "Each residency in the network announces its own open calls", "url": "trianglenetwork.org"},
  {"name": "Aesthetica Art Prize", "cat": "opencall", "city": "York", "country": "UK", "region": "Europe", "tier": "C", "door": 4, "note": "International prize with an exhibition at York Art Gallery", "route": "Open to artists from any country, submission with a fee", "url": "aestheticamagazine.com"},
  {"name": "Lumen Prize", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "C", "door": 4, "note": "Digital art award", "route": "Open to any artist working with digital media, submission with a fee", "url": "lumenprize.com"},
  {"name": "Adolph and Esther Gottlieb Foundation", "cat": "opencall", "city": "New York", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Grants for mature artists", "route": "Open call for artists with 20 or more years of practice and financial need", "url": "gottliebfoundation.org"},
  {"name": "NYFA", "cat": "opencall", "city": "New York", "country": "USA", "region": "North America", "tier": "C", "door": 3, "note": "Fellowships and the largest open-call database in the US (NYFA Source)", "route": "Fellowships only for residents of New York State. The NYFA Source database is open to everyone", "url": "nyfa.org"},
  {"name": "TransArtists", "cat": "opencall", "city": "Amsterdam", "country": "Netherlands", "region": "Europe", "tier": "B", "door": 4, "note": "Database of 1,500+ residencies worldwide with filters", "route": "An open database: search for a residency by country, duration and terms, and apply directly to the organisers", "url": "transartists.org"},
  {"name": "Res Artis", "cat": "opencall", "city": "Amsterdam", "country": "Netherlands", "region": "Europe", "tier": "C", "door": 4, "note": "Worldwide association of residencies, directory of programmes", "route": "An open directory of residencies around the world. Applications go to the residencies themselves", "url": "resartis.org"},
  {"name": "CaFÉ (CallForEntry)", "cat": "opencall", "city": "Denver", "country": "USA", "region": "North America", "tier": "C", "door": 4, "note": "Aggregator of open calls in the US: exhibitions, public art", "route": "Registration is free, applications to calls go through the platform. Most calls are for those living in the US", "url": "callforentry.org"},
  {"name": "ArtConnect", "cat": "opencall", "city": "Berlin", "country": "Germany", "region": "Europe", "tier": "C", "door": 4, "note": "International feed of open calls, residencies and awards", "route": "Open feed of calls, free basic access. You apply directly through the site", "url": "artconnect.com"},
  {"name": "CuratorSpace", "cat": "opencall", "city": "London", "country": "UK", "region": "Europe", "tier": "C", "door": 4, "note": "Open calls and exhibitions in the UK", "route": "Open calls, mainly for the UK, often with a small fee", "url": "curatorspace.com"}
];
