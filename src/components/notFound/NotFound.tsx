import { useState } from 'react';
import { cx } from '@/lib/cx';
import { DoNothing } from './DoNothing';
import { ErrorCascade } from './ErrorCascade';
import { LostAndFound } from './LostAndFound';
import { NothingPage } from './NothingPage';
import styles from './NotFound.module.css';
import { PageYourWay } from './PageYourWay';
import { Silence } from './Silence';
import { SprayWall } from './SprayWall';

const SharedWall = () => <SprayWall shared />;

const VERSIONS = [
  { id: 'yours', label: 'Make it yours', Component: PageYourWay },
  { id: 'spray', label: 'Spray the wall', Component: SprayWall },
  { id: 'nothing', label: 'Nothing on this page', Component: NothingPage },
  { id: 'lost', label: 'Lost and found', Component: LostAndFound },
  { id: 'idle', label: 'Do nothing', Component: DoNothing },
  { id: 'silence', label: '404 seconds', Component: Silence },
  { id: 'errors', label: 'Errors', Component: ErrorCascade },
  { id: 'shared', label: 'Shared wall', Component: SharedWall },
] as const;
type VersionId = (typeof VERSIONS)[number]['id'];

const fromUrl = (): VersionId => {
  const v = new URLSearchParams(window.location.search).get('404');
  return VERSIONS.find((x) => x.id === v)?.id ?? 'nothing';
};

/**
 * The 404, in three versions to choose between. The switcher in the corner
 * is for comparing them in the sandbox — the one that ships gets no
 * switcher. The choice lives in the URL (`?404=spray`), so a version can
 * be linked to directly.
 */
export function NotFound() {
  const [version, setVersion] = useState<VersionId>(fromUrl);
  const { Component } = VERSIONS.find((v) => v.id === version)!;

  const pick = (id: VersionId) => {
    setVersion(id);
    const url = new URL(window.location.href);
    url.searchParams.set('404', id);
    window.history.replaceState(null, '', url);
  };

  return (
    <div className={styles.root}>
      <Component key={version} />
      <nav className={styles.switcher} aria-label="404 versions">
        <span className={styles.switchLabel}>404 ·</span>
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={cx(styles.switchBtn, version === v.id && styles.switchOn)}
            aria-pressed={version === v.id}
            onClick={() => pick(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
