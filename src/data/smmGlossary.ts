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
        term: 'engagement rate',
        body: 'the share of people who **reacted** — liked, commented, saved — out of everyone who saw it. a post with modest reach and high engagement usually beats a viral one nobody acted on.',
      },
      {
        term: 'saves',
        body: 'the most honest signal there is: someone wants to **come back** to this later. weighs more than a like in how Instagram reads a post.',
      },
      {
        term: 'utm tag',
        body: 'the tail on a link that says exactly where a click came from — without it, a click from a story and a click from a bio link look **identical** in your stats.',
      },
      {
        term: 'source / medium / campaign',
        body: 'the three fields that make a utm link readable: **source** — instagram; **medium** — bio / stories / post; **campaign** — the drop or event name. pick one structure and reuse it everywhere, or the numbers never add up.',
      },
      {
        term: 'impressions',
        body: 'every time the post appeared on a screen, **including repeats**. always higher than reach. useful only next to reach — the gap between them is how often people came back.',
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
        body: 'the only clickable link most platforms give a normal account. treat it as **one decision**, not a list — a page with seven equal links sends people nowhere.',
      },
      {
        term: 'handle',
        body: 'the @name. it is your address, so it should be **typeable from memory** after hearing it once. changing it later breaks every link anyone ever saved.',
      },
      {
        term: 'bio',
        body: 'roughly 150 characters to answer "what is this and why should I stay". name what you **make**, not what you are — "posters, weekly" reads better than "creative soul".',
      },
      {
        term: 'highlights',
        body: 'stories pinned under the bio. the only part of an account you fully control the order of — so it works as a **menu**: prices, process, past work, how to reach you.',
      },
      {
        term: 'pinned posts',
        body: 'the top three slots on the grid, frozen. use them for the posts that **explain you** to a stranger, not the most recent ones.',
      },
      {
        term: 'close friends',
        body: 'a second, smaller audience inside the same account. the honest use is **work in progress** — the stuff not finished enough for everyone.',
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
        body: 'one post published to **two profiles at once**, with both sets of followers seeing it and one shared counter. the cheapest reach there is, and it costs nothing but asking.',
      },
      {
        term: 'brief',
        body: 'the written version of what was agreed: deliverables, dates, who approves. if it was only ever said out loud, **it was not agreed** — it was discussed.',
      },
      {
        term: 'deliverables',
        body: 'the countable list — "3 photos, 1 reel, 2 stories". vague scope is where collaborations die, because **everyone remembers it differently** a month later.',
      },
      {
        term: 'barter',
        body: 'paid in product instead of money. fine when you wanted the product anyway. worth pricing out loud regardless, so **both sides know** what the trade was worth.',
      },
      {
        term: 'ugc',
        body: 'content made for a brand to post on its own channels, not on yours. different job, different price — you are selling **the files**, not your audience.',
      },
      {
        term: 'rate card',
        body: 'your prices, written down before anyone asks. its real function is to stop you **inventing a number** in a DM at midnight.',
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
        body: 'the first line or first second. it has one job — **buy the next three seconds**. everything you planned to say depends on it and it is usually written last.',
      },
      {
        term: 'carousel',
        body: 'a multi-slide post. swipes count as engagement, so a carousel that earns its second slide **outperforms** the same idea as one image.',
      },
      {
        term: 'cta',
        body: 'the sentence that says what to do now. one per post. "save this" and "tell me yours" are **different asks** — pick the one you actually want.',
      },
      {
        term: 'batching',
        body: 'making a month of content in one sitting instead of one post a day. the point is not speed, it is **not deciding** what to post every morning.',
      },
      {
        term: 'shadowban',
        body: 'the folk name for a sudden reach collapse. usually **not a ban** — more often a format the feed stopped favouring, or a post that read as spam. worth checking before panicking.',
      },
      {
        term: 'evergreen',
        body: 'a post that still makes sense in six months. worth keeping a handful, because they are what a **new follower** scrolls back into.',
      },
    ],
  },
];
