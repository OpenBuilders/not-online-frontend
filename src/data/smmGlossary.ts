/**
 * The glossary's whole content. Deliberately short: this is the shortlist
 * of words that change what someone posts, not a dictionary — a creator
 * who has to scroll past forty entries to find "reach" stops opening it.
 *
 * `body` carries `**bold**` for the one phrase in each definition that is
 * the actual answer; GlossaryTab renders it (see `renderEmphasis`). Keeping
 * the markup in the data rather than in JSX means a section can be
 * reordered or rewritten without touching a component.
 */

export interface GlossaryTerm {
  term: string;
  body: string;
}

export interface GlossarySection {
  id: string;
  label: string;
  /** The line set against the section heading — what this group is for. */
  kicker: string;
  /** Which colourway the section's tab and rule wear when it is selected. */
  tone: 'lime' | 'pink' | 'ink';
  terms: GlossaryTerm[];
}

export const GLOSSARY: GlossarySection[] = [
  {
    id: 'analytics',
    tone: 'lime',
    label: 'analytics',
    kicker: 'what the numbers under a post actually mean',
    terms: [
      {
        term: 'reach',
        body: 'how many **different people** saw the post — not views, not impressions. one person scrolling past it three times still counts once.',
      },
      {
        term: 'impressions',
        body: 'how many times your post was seen, **repeats included**. if it’s much higher than reach, people came back to it',
      },
      {
        term: 'engagement rate',
        body: 'how many **reactions** your post got (likes, comments, saves, shares) compared to how many people saw it. a small post people react to beats a big one nobody touches',
      },
      {
        term: 'saves',
        body: 'someone wants to **come back** to your post later. a save counts for more than a like',
      },
      {
        term: 'utm tag',
        body: 'a tag added to a link that shows where a **click** came from, like your bio or a story',
      },
      {
        term: 'source / medium / campaign',
        body: 'the three parts of a utm tag. source is where **instagram**, medium is how **bio, story, post**, campaign is what **your drop or event**. name them the same way every time',
      },
    ],
  },
  {
    id: 'bio',
    tone: 'pink',
    label: 'link in bio & account',
    kicker: 'the one screen everybody lands on first',
    terms: [
      {
        term: 'link in bio',
        body: 'the link on your profile. pick one main place to send people. a page with seven equal links sends them nowhere',
      },
      {
        term: 'handle',
        body: 'your @name. it’s your address, so make it easy to type after hearing it once. change it later and every saved link breaks',
      },
      {
        term: 'bio',
        body: 'the short text under your name. say what you make in a few words, so a stranger knows why to follow',
      },
      {
        term: 'highlights',
        body: 'saved stories that stay under your bio. use them like a menu, so people find what they need without scrolling',
      },
      {
        term: 'pinned posts',
        body: 'posts fixed at the top of your profile. use them for the ones that explain you to a stranger, not the newest ones',
      },
      {
        term: 'close friends',
        body: 'stories only a chosen few can see. a good place for drafts and things you’re still figuring out',
      },
    ],
  },
  {
    id: 'collab',
    tone: 'ink',
    label: 'collaborations',
    kicker: 'working with other people without getting burned',
    terms: [
      {
        term: 'collab post',
        body: 'one post shared by two accounts at once. both audiences see it, so you reach twice as many people for free',
      },
      {
        term: 'brief',
        body: 'a short doc with everything you need to know before you start: what’s needed, who it’s for and by when',
      },
      {
        term: 'deliverables',
        body: 'what you’ll actually deliver, counted out: "3 photos, 1 reel, 2 stories". clear numbers mean no arguments later',
      },
      {
        term: 'barter',
        body: 'getting paid in product instead of money. fine if you wanted the thing anyway, but still say what it’s worth, so both sides know the deal',
      },
      {
        term: 'ugc',
        body: 'posts and clips made by regular people, not by you or a brand. brands also pay creators to make this kind of content for their own channels',
      },
      {
        term: 'rate card',
        body: 'your prices, written down before anyone asks. it stops you from making up a number in a DM at midnight',
      },
    ],
  },
  {
    id: 'worth',
    tone: 'ink',
    label: 'worth knowing too',
    kicker: 'the rest of the vocabulary, briefly',
    terms: [
      {
        term: 'hook',
        body: 'the first line of a post or the first second of a video. it has one job: make people stop scrolling',
      },
      {
        term: 'carousel',
        body: 'a post with several images people swipe through. good for steps, before and after, or a story in parts',
      },
      {
        term: 'cta',
        body: 'call to action: the line that tells people what to do next. ask for one thing per post.',
      },
      {
        term: 'batching',
        body: 'making several posts at once instead of one every day, so you don’t have to think about what to post each morning',
      },
      {
        term: 'shadowban',
        body: 'when your posts suddenly get far fewer views and it feels like you’ve been hidden. usually it’s not a real ban, just a format that stopped working',
      },
      {
        term: 'evergreen',
        body: 'a post that still makes sense months later. keep a few, because new followers scroll back and find them',
      },
    ],
  },
];
