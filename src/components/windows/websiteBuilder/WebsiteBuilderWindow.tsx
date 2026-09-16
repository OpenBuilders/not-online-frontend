import { useRef, useState } from 'react';
import { FocusTour, type FocusTourStep } from '@/components/shared/FocusTour';
import { blankSite } from '@/data/siteTemplates';
import { useAppState } from '@/state/AppStateContext';
import type { SiteConfig } from '@/types';
import { BuilderPanel, type BuilderTourHooks, type TourTarget } from './BuilderPanel';
import { PagePublished } from './PagePublished';
import { SitePreview, type PreviewDevice } from './SitePreview';
import styles from './WebsiteBuilderWindow.module.css';

/** Which builder control each tour step spotlights, in order. */
const TOUR_ORDER: TourTarget[] = ['handle', 'avatar', 'template', 'palette', 'links'];

/**
 * The links-page builder. One window, two halves: every setting on the
 * left, a real render of the page on the right that updates as you type.
 * Replaces the original's tab-switching between a form and a preview
 * (Tools.html:3349-3593), where you could never see what a choice did
 * without leaving the choice behind.
 *
 * A guest who hasn't built a page yet gets the same guided walkthrough
 * Market uses — FocusTour spotlighting one control at a time — then the
 * publish celebration. Returning and logged-in users go straight to editing.
 */
export function WebsiteBuilderWindow() {
  const { state, setSite, completeTour } = useAppState();
  const windowRef = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<SiteConfig>(() => state.site ?? blankSite());
  const [live, setLive] = useState(() => state.site !== null);
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [celebrating, setCelebrating] = useState(false);

  const isGuest = !state.logged;
  const isFirstRun = isGuest && !state.tours.has('page');
  const [tourIndex, setTourIndex] = useState(0);

  const handleRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const publishRef = useRef<HTMLButtonElement>(null);

  function patch(p: Partial<SiteConfig>) {
    setCfg((c) => ({ ...c, ...p }));
    setDirty(true);
  }

  // The panel calls this from inside its own real handlers rather than
  // FocusTour attaching listeners of its own — same reasoning as the Market
  // form, see FocusTour.tsx.
  function onPicked(what: TourTarget) {
    if (!tourActive) return;
    if (TOUR_ORDER[tourIndex] === what) setTourIndex((i) => i + 1);
  }

  const tourSteps: FocusTourStep[] = [
    {
      ref: handleRef,
      text: 'Claim an address. Short, lowercase, yours.',
      onNext: () => cfg.handle.trim() && onPicked('handle'),
    },
    { ref: avatarRef, text: 'Put a face on it. Borrow one of ours if you have none.' },
    { ref: templateRef, text: 'Pick a look. All four are equally unserious.' },
    { ref: paletteRef, text: "Colours come pre-mixed so you can't make it ugly." },
    { ref: linksRef, text: 'Where should people actually find you?', onNext: () => onPicked('links') },
    { ref: publishRef, text: 'That page on the right is yours. Ship it.' },
  ];
  const tourActive = isFirstRun && tourIndex < tourSteps.length;

  const tour: BuilderTourHooks = { handleRef, avatarRef, templateRef, paletteRef, linksRef, publishRef, onPicked };

  function publish() {
    if (tourActive && tourIndex === TOUR_ORDER.length) setTourIndex((i) => i + 1);
    const published: SiteConfig = {
      ...cfg,
      handle: cfg.handle.trim() || 'yourname',
      name: cfg.name.trim() || cfg.handle.trim() || 'Your Name',
      // A brand-new page has an audience of exactly one so far.
      views: live ? cfg.views : 1,
    };
    setCfg(published);
    setSite(published);
    completeTour('page');
    setDirty(false);
    if (!live) {
      setLive(true);
      setCelebrating(true);
    }
  }

  return (
    <div className={styles.window} ref={windowRef}>
      <div className={styles.left}>
        <BuilderPanel
          cfg={cfg}
          patch={patch}
          live={live}
          dirty={dirty}
          isGuest={isGuest}
          onPublish={publish}
          tour={tour}
        />
      </div>
      <div className={styles.right}>
        <SitePreview cfg={cfg} device={device} onDeviceChange={setDevice} live={live} />
      </div>

      {tourActive && <FocusTour containerRef={windowRef} steps={tourSteps} activeIndex={tourIndex} />}
      {celebrating && (
        <PagePublished handle={cfg.handle} isGuest={isGuest} onDone={() => setCelebrating(false)} />
      )}
    </div>
  );
}
