/** Joins truthy class names. A tiny local stand-in for `clsx` — this project
 *  has no other use for a full class-merging library (no Tailwind to dedupe
 *  against), so it isn't worth the dependency. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
