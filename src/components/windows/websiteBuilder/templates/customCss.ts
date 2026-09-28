/** Hard cap on what a page may carry — enough for a real restyle, not a framework. */
export const MAX_CUSTOM_CSS = 10_000;

/** The attribute every rendered page root carries; custom CSS is nested under it. */
const PAGE_SCOPE_ATTR = 'data-site-page';

/**
 * `:not(#_)` matches every element (nothing has that id) but counts as an
 * id for specificity, so owner rules outrank the templates' class-based
 * ones — `a { color: red }` has to beat `.list a` or it looks broken.
 */
const SCOPE = `[${PAGE_SCOPE_ATTR}]:not(#_)`;

/**
 * `html`, `body` and `:root` at the start of a selector. Nested under the
 * page they'd look for a <body> inside it and match nothing, yet they're what
 * everyone reaches for first — so they're rewritten to `&`, the page root,
 * which is the whole viewport on the published page anyway. The lookahead
 * only accepts a selector that reaches a `{` before any `;` or `}`, so a
 * value like `font-family: x, body;` is left alone.
 */
const DOCUMENT_ROOT = /(^|[{};,])(\s*)(?:(?:html|:root)(?:\s+body)?|body)(?![\w-])(?=[^;{}]*\{)/g;

export type ScopedCss = { css: string; error: null } | { css: null; error: string };

/**
 * Turns a page owner's CSS into something safe to drop in a `<style>` tag.
 *
 * The rules are nested under the page root, so bare selectors (`a`, `h1`)
 * only reach the page and top-level declarations land on the root itself —
 * `--pg-accent: hotpink;` just works. Nesting is only a fence if the braces
 * balance, though: one stray `}` would close the wrapper and let everything
 * after it style the whole builder. So unbalanced input is refused outright
 * rather than guessed at.
 *
 * `<` is escaped because the result is written raw into HTML on the public
 * page, where `</style>` would end the tag and start markup. `\3c ` is the
 * same character to CSS, so strings and selectors keep their meaning.
 */
export function scopeCustomCss(input: string | null | undefined): ScopedCss {
  const source = (input ?? '').slice(0, MAX_CUSTOM_CSS).replace(/\/\*[\s\S]*?(\*\/|$)/g, '');
  if (!source.trim()) return { css: '', error: null };

  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth < 0) return { css: null, error: 'There is a “}” without a matching “{”.' };
    }
  }
  if (quote) return { css: null, error: 'A quoted string is never closed.' };
  if (depth > 0) return { css: null, error: 'A “{” is never closed.' };

  const rooted = source.replace(DOCUMENT_ROOT, '$1$2&');
  return { css: `${SCOPE}{${rooted.replace(/</g, '\\3c ')}}`, error: null };
}
