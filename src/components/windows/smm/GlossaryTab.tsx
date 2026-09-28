import { Fragment, useState, type ReactNode } from 'react';
import { GLOSSARY } from '@/data/smmGlossary';
import { cx } from '@/lib/cx';
import styles from './GlossaryTab.module.css';

/**
 * Renders the one `**bolded**` phrase per definition. A three-line parser
 * beats storing JSX in the data file: the glossary stays a plain list of
 * strings that anyone can rewrite without opening a component.
 */
function renderEmphasis(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <b key={i}>{part.slice(2, -2)}</b>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/**
 * The reference shelf. One section at a time rather than one long scroll —
 * this is looked at when a word in one of the other tabs did not land, so
 * the job is to get to that word in two clicks, not to be readable
 * end to end.
 *
 * Two columns: the term on the left, the definition on the right. Each
 * section carries its own colourway — the tab, the rule under the heading
 * and the emphasis inside the definitions all move together, so which
 * section you are in is legible from the colour alone rather than from
 * reading the tab you last clicked.
 */
export function GlossaryTab() {
  const [active, setActive] = useState(GLOSSARY[0].id);
  const section = GLOSSARY.find((s) => s.id === active) ?? GLOSSARY[0];
  const index = GLOSSARY.findIndex((s) => s.id === section.id);

  return (
    <div className={styles.tab}>
      <header className={styles.masthead}>
        <h2 className={styles.title}>smm glossary</h2>
        <p className={styles.standfirst}>worth knowing before you plan a month of content</p>
      </header>

      <nav className={styles.nav}>
        {GLOSSARY.map((s) => (
          <button
            key={s.id}
            type="button"
            className={cx(styles.navItem, styles[s.tone], s.id === section.id && styles.navOn)}
            onClick={() => setActive(s.id)}
            aria-current={s.id === section.id}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className={cx(styles.sectionHead, styles[section.tone])}>
        <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
        <h3 className={styles.sectionTitle}>{section.label}</h3>
        <span className={styles.kicker}>{section.kicker}</span>
      </div>

      <dl className={cx(styles.terms, styles[section.tone])}>
        {section.terms.map((t) => (
          <div key={t.term} className={styles.row}>
            <dt className={styles.term}>{t.term}</dt>
            <dd className={styles.def}>{renderEmphasis(t.body)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
