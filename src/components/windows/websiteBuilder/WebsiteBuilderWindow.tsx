import { useEffect, useRef, useState } from 'react';
import { FocusTour, type FocusTourStep } from '@/components/shared/FocusTour';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { getMyLinkPage, saveLinkPage, toSiteConfig } from '@/api/linkPages';
import { blankSite } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import type { SiteConfig } from '@/types';
import { BuilderPanel, type BuilderTourHooks, type TourTarget } from './BuilderPanel';
import { PagePublished } from './PagePublished';
import { SitePreview, type PreviewDevice } from './SitePreview';
import styles from './WebsiteBuilderWindow.module.css';

/** Which builder control each tour step spotlights, in order. */
const TOUR_ORDER: TourTarget[] = ['handle', 'avatar', 'template', 'palette', 'links'];

/** Below this the two halves can't sit side by side — see the note on `narrow`. */
const SPLIT_MIN_WIDTH = 860;

type MobileView = 'setup' | 'preview';

/**
 * The links-page builder. One window, two halves: every setting on the
 * left, a real render of the page on the right that updates as you type.
 * Replaces the original's tab-switching between a form and a preview
 * (Tools.html:3349-3593), where you could never see what a choice did
 * without leaving the choice behind.
 *
 * On a phone the two halves become two views behind a switch instead of a
 * split. Stacking them gave the preview under half the window, scaled to
 * roughly a third — small enough that you couldn't read your own page,
 * which is the one thing the preview exists for.
 *
 * A guest who hasn't built a page yet gets the same guided walkthrough
 * Market uses — FocusTour spotlighting one control at a time — then the
 * publish celebration. Returning and logged-in users go straight to editing.
 */
export function WebsiteBuilderWindow() {
  const { state, setSite, completeTour } = useAppState();
  const windowRef = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<SiteConfig>(() => state.site ?? blankSite());
  const presentationRef = useRef({
    views: state.site?.views ?? 0,
    clicks: state.site?.clicks ?? 0,
  });
  const [live, setLive] = useState(() => state.site !== null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [celebrating, setCelebrating] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('setup');
  const [narrow, setNarrow] = useState(() => window.innerWidth < SPLIT_MIN_WIDTH);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < SPLIT_MIN_WIDTH);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // A phone is small enough that the desktop frame would scale to nothing;
  // default that preview to the phone viewport instead.
  useEffect(() => {
    if (narrow) setDevice('phone');
  }, [narrow]);

  useEffect(() => {
    if (!state.logged) return;
    let cancelled = false;

    void getMyLinkPage()
      .then((page) => {
        if (cancelled) return;
        if (!page) {
          setLive(false);
          setDirty(true);
          return;
        }
        const saved = toSiteConfig(page, presentationRef.current);
        setCfg(saved);
        setSite(saved);
        setLive(true);
        setDirty(false);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSaveError(error instanceof Error ? error.message : 'Could not load your saved page.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.logged, setSite]);

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
    // "Just a button" shows only the first link — both the editor and the
    // template slice it themselves. The others stay in state untouched, so
    // trying that template out and switching back doesn't cost you the
    // links you had already typed.
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
    { ref: avatarRef, text: 'Put a face on it. Borrow ours if you have none.' },
    { ref: templateRef, text: 'Pick a look. All six are equally unserious.' },
    { ref: paletteRef, text: "Colours come pre-mixed so you can't make it ugly." },
    { ref: linksRef, text: 'Where should people actually find you?', onNext: () => onPicked('links') },
    { ref: publishRef, text: 'That page is yours. Ship it.' },
  ];
  const tourActive = isFirstRun && tourIndex < tourSteps.length;

  const tour: BuilderTourHooks = { handleRef, avatarRef, templateRef, paletteRef, linksRef, publishRef, onPicked };

  // The tour spotlights controls in the setup column, so it can't run while
  // the preview is the visible view.
  useEffect(() => {
    if (tourActive && narrow) setMobileView('setup');
  }, [tourActive, narrow, tourIndex]);

  async function publish() {
    if (tourActive && tourIndex === TOUR_ORDER.length) setTourIndex((i) => i + 1);
    const published: SiteConfig = {
      ...cfg,
      handle: cfg.handle.trim() || 'yourname',
      name: cfg.name.trim() || cfg.handle.trim() || 'Your Name',
    };
    setSaveError(null);

    if (isGuest) {
      presentationRef.current = { views: published.views, clicks: published.clicks };
      setCfg(published);
      setSite(published);
      completeTour('page');
      setDirty(false);
      if (!live) {
        setLive(true);
        setCelebrating(true);
      }
      return;
    }

    setSaving(true);
    try {
      const response = await saveLinkPage(published);
      const saved = toSiteConfig(response, published);
      presentationRef.current = { views: saved.views, clicks: saved.clicks };
      setCfg(saved);
      setSite(saved);
      completeTour('page');
      setDirty(false);
      if (!live) {
        setLive(true);
        setCelebrating(true);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your page.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cx(styles.window, narrow && styles.narrow)} ref={windowRef} data-view={mobileView}>
      {narrow && (
        <div className={styles.viewSwitch}>
          <button
            type="button"
            className={cx(styles.viewBtn, mobileView === 'setup' && styles.on)}
            onClick={() => setMobileView('setup')}
            aria-pressed={mobileView === 'setup'}
          >
            <MaterialIcon name="tune" size={16} />
            Edit
          </button>
          <button
            type="button"
            className={cx(styles.viewBtn, mobileView === 'preview' && styles.on)}
            onClick={() => setMobileView('preview')}
            aria-pressed={mobileView === 'preview'}
            disabled={tourActive}
          >
            <MaterialIcon name="visibility" size={16} />
            Preview
          </button>
        </div>
      )}

      <div className={styles.left}>
        <BuilderPanel
          cfg={cfg}
          patch={patch}
          live={live}
          dirty={dirty}
          isGuest={isGuest}
          saving={saving}
          saveError={saveError}
          onPublish={publish}
          tour={tour}
        />
      </div>
      <div className={styles.right}>
        <SitePreview cfg={cfg} device={device} onDeviceChange={setDevice} live={live} />
      </div>

      {tourActive && <FocusTour containerRef={windowRef} steps={tourSteps} activeIndex={tourIndex} />}
      {celebrating && <PagePublished handle={cfg.handle} isGuest={isGuest} onDone={() => setCelebrating(false)} />}
    </div>
  );
}
