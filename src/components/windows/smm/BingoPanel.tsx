import { useMemo } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { LabelPill } from '@/components/shared/LabelPill';
import { BINGO_FREE_INDEX, BINGO_SIZE, BINGO_SQUARES, BINGO_TOPICS, TOPIC_TONE } from '@/data/smmBingo';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { blankPost } from './newPost';
import styles from './BingoPanel.module.css';


/** Every winning line on the board: rows, columns, both diagonals. */
const LINES: number[][] = (() => {
  const n = BINGO_SIZE;
  const rows = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));
  const cols = Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => r * n + c));
  const down = Array.from({ length: n }, (_, i) => i * n + i);
  const up = Array.from({ length: n }, (_, i) => i * n + (n - 1 - i));
  return [...rows, ...cols, down, up];
})();

/**
 * The board you open when there is no idea.
 *
 * It lives inside Archive rather than in the rail, because it is not a
 * stage of the pipeline — it is what you do when the first stage is
 * blocked, and a rail item implied a step everyone had to walk through.
 *
 * A square takes two clicks, and they mean two different things. The first
 * sends the prompt to the archive as a draft — you have decided to make
 * it. The second crosses it off — you have made it. Collapsing those into
 * one toggle was the old behaviour, and it let the board fill up with
 * squares marked done that had never been written, which makes the count
 * underneath it a lie.
 *
 * The reward for a line is nothing, stated plainly, because promising
 * points for posting is the exact incentive this desktop exists to make
 * fun of.
 */
export function BingoPanel() {
  const { state, toggleSmmBingo, addSmmPost } = useAppState();
  const crossed = state.smm.bingoCrossed;

  // A square that has already been sent to the archive, matched on the text
  // that was copied into the draft's title.
  const sent = useMemo(() => new Set(state.smm.posts.map((p) => p.title)), [state.smm.posts]);

  const { lines, inLine } = useMemo(() => {
    const done = LINES.filter((line) =>
      line.every((i) => i === BINGO_FREE_INDEX || crossed.includes(BINGO_SQUARES[i].id))
    );
    return { lines: done.length, inLine: new Set(done.flat()) };
  }, [crossed]);

  return (
    <div className={styles.panel}>
      {/* Above the board, not below it: the whole point of sizing the grid
          to the window is that nothing here needs scrolling to reach. */}
      <div className={styles.head}>
        <div className={styles.headText}>
          <h3 className={styles.title}>bingo</h3>
          <p className={styles.sub}>
            {lines > 0 ? (
              <>
                <b>
                  {lines} line{lines > 1 ? 's' : ''}.
                </b>{' '}
                Your prize is nothing. You did get {crossed.length} posts out of it, which was the actual prize.
              </>
            ) : (
              <>Click once to send a square to the archive, again once you have made it. Three in a row wins nothing.</>
            )}
          </p>
        </div>
        <div className={styles.score}>
          <span className={styles.scoreNum}>{crossed.length}</span>
          <span className={styles.scoreLabel}>crossed</span>
        </div>
      </div>

      <div className={styles.board} style={{ ['--n' as string]: BINGO_SIZE }}>
        {BINGO_SQUARES.map((square, i) => {
          const free = i === BINGO_FREE_INDEX;
          const on = free || crossed.includes(square.id);
          const queued = !on && sent.has(square.text);
          return (
            <button
              key={square.id}
              type="button"
              className={cx(
                styles.square,
                on && styles.on,
                queued && styles.queued,
                free && styles.free,
                inLine.has(i) && styles.inLine
              )}
              onClick={() => {
                if (free) return;
                // First click sends it; second (and any later) crosses or
                // un-crosses it.
                if (queued || on) toggleSmmBingo(square.id);
                else addSmmPost(blankPost(square.text, ['bingo', BINGO_TOPICS[square.topic].replace(/\s+/g, '-')]));
              }}
              disabled={free}
              aria-pressed={on}
              title={on ? 'Crossed off' : queued ? 'In the archive — click to cross it off' : 'Send to the archive'}
            >
              {/* Face down until the square is crossed. Revealing the
                  drawing is the whole reward for having made the post —
                  showing it up front would make the board a gallery of
                  pictures with captions instead of a list of jobs. */}
              {on && !free && (
                <img
                  className={styles.art}
                  src={square.art}
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <LabelPill tone={on && !free ? 'paper' : TOPIC_TONE[square.topic]} sticker>
                {BINGO_TOPICS[square.topic]}
              </LabelPill>
              <span className={styles.text}>{square.text}</span>
              {queued && (
                <span className={styles.queuedMark}>
                  <MaterialIcon name="inbox" size={12} />
                  in archive
                </span>
              )}
              {on && !free && <MaterialIcon name="close" size={18} className={styles.cross} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
