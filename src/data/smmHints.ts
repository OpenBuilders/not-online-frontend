import type { SmmPlatform } from '@/types';

/**
 * Everything the editor knows about where a post is going.
 *
 * Two different kinds of help live here and they are deliberately not the
 * same thing: `hints` are things that stay true no matter what you write,
 * and `templates` are a starting shape for the body — one tap fills the
 * empty textarea, which is the part people stall on.
 */

export interface PlatformTemplate {
  label: string;
  body: string;
}

export interface PlatformInfo {
  id: SmmPlatform;
  label: string;
  /** Material Symbols glyph. There are no brand marks in this app. */
  icon: string;
  /** The practical ceiling, shown as a soft counter rather than enforced. */
  limit: number;
  hints: string[];
  templates: PlatformTemplate[];
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'instagram',
    label: 'instagram',
    icon: 'photo_camera',
    limit: 2200,
    hints: [
      'Only the first line shows before "more" — put the hook there, not your greeting.',
      'Saves and shares count for more than likes. Ask for the one you actually want.',
      'A carousel earns its keep if slide two is worth a swipe. If it is not, post one image.',
      'Three to five tags that describe the work beat thirty that describe the category.',
    ],
    templates: [
      {
        label: 'Hook → context → ask',
        body: 'ONE LINE THAT STOPS THE SCROLL\n\nWhat this is, in two or three sentences. The part that only you could write.\n\nWhat to do now: save it / tell me yours / link in bio.',
      },
      {
        label: 'Carousel outline',
        body: '1. The claim\n2. Why it is wrong\n3. What to do instead\n4. The example\n5. The ask\n\nCaption: one line that makes slide 1 make sense.',
      },
      {
        label: 'Behind the work',
        body: 'Started with: \nGot stuck on: \nFixed it by: \n\nWhat I would do differently next time.',
      },
    ],
  },
  {
    id: 'x',
    label: 'x',
    icon: 'tag',
    limit: 280,
    hints: [
      'One idea per post. If it needs a second thought, it needs a second post.',
      'Links suppress reach — put yours in the reply, not the first post.',
      'The first post of a thread is the whole thread. Nobody expands a weak one.',
      'No hashtags. They read as advertising here.',
    ],
    templates: [
      { label: 'Single', body: 'The claim, stated flatly. No preamble, no "thread 🧵", no question you answer yourself.' },
      {
        label: 'Thread',
        body: '1/ The claim, complete on its own.\n\n2/ Why the obvious answer is wrong.\n\n3/ What actually works.\n\n4/ The example.\n\n5/ Link, if there is one.',
      },
    ],
  },
  {
    id: 'youtube',
    label: 'youtube',
    icon: 'play_circle',
    limit: 5000,
    hints: [
      'Title and thumbnail do almost all the work. Write the title before you shoot.',
      'The first fifteen seconds decide the rest. Cut the intro you were going to make.',
      'Chapters in the description are the only navigation a long video gets.',
      'Shorts and long videos are two different audiences. Do not cross-post out of habit.',
    ],
    templates: [
      {
        label: 'Video plan',
        body: 'Title: \nThumbnail says: \n\n0:00 The promise — what they get by the end\n0:15 The setup\n…  The work\n…  The result\n…  What to watch next',
      },
      {
        label: 'Description',
        body: 'One paragraph on what this is.\n\nChapters:\n0:00 \n0:00 \n\nMentioned:\n- ',
      },
    ],
  },
  {
    id: 'telegram',
    label: 'telegram',
    icon: 'send',
    limit: 4096,
    hints: [
      'There is no algorithm — everyone subscribed sees it. Posting time is the whole game.',
      'Long text is fine here. This is the one place it is not a mistake.',
      'One post, one notification. Three posts in a row is three interruptions.',
      'Edits are silent, so fix typos rather than posting a correction.',
    ],
    templates: [
      {
        label: 'Note',
        body: 'The thought, written the way you would say it to one person.\n\nWhy it matters, briefly.',
      },
      {
        label: 'Drop / announcement',
        body: 'What: \nWhen: \nWhere: \nHow many: \n\nOne line on why you made it.',
      },
    ],
  },
];

export const PLATFORM_BY_ID = Object.fromEntries(PLATFORMS.map((p) => [p.id, p])) as Record<
  SmmPlatform,
  PlatformInfo
>;

/**
 * The questions for when there is no idea at all yet. Universal on
 * purpose — none mention a platform, because choosing where a post goes
 * is a later and much easier decision than finding something to say.
 *
 * Six, and short. Twelve of these read as a form to work through, which
 * is the wrong feeling for the panel you open when you are already stuck;
 * the point is to skim until one of them catches, and a list you can take
 * in at a glance is the only kind that gets skimmed.
 */
export const BRAINSTORM_QUESTIONS: string[] = [
  'What did you throw away this week?',
  'What do people always ask you about?',
  'What took you years to learn and a minute to explain?',
  'What are you bad at?',
  'What has been unfinished the longest?',
  'What changed your mind recently?',
];

/**
 * When to post. Kept separate from the per-platform `hints` above because
 * this is the only advice that belongs to the calendar rather than to the
 * writing — it answers "which cell", not "what goes in it".
 *
 * Deliberately hedged: every number here moves with the audience, and a
 * tool that states posting times as fact is lying. What does not move is
 * the reasoning, so that is what each line carries.
 */
export interface TimingHint {
  when: string;
  why: string;
}

export const TIMING_HINTS: TimingHint[] = [
  {
    when: 'Tue – Thu, late morning',
    why: 'The reliable middle. Monday is spent catching up and Friday is spent leaving.',
  },
  {
    when: 'An hour before your people are free',
    why: 'A post needs a head start to gather the early engagement that decides its reach.',
  },
  {
    when: 'Sunday evening',
    why: 'The one weekend slot that works — people are home, unhurried, and planning the week.',
  },
  {
    when: 'Never twice in a day',
    why: 'The second post competes with the first, and both lose. Spread them across the week instead.',
  },
  {
    when: 'Same day each week beats seven random ones',
    why: 'A rhythm is something people can notice. Volume without one is just noise.',
  },
  {
    when: 'Check your own numbers after a month',
    why: 'Everything above is an average. Your audience is not an average — the calendar should follow them.',
  },
];
