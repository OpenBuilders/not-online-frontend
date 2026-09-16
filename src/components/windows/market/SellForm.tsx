import { useEffect, useRef, useState, type RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/auth';
import { createMarketSubmission, MARKET_SUBMISSIONS_QUERY_KEY, saveGuestMarketSubmission } from '@/api/marketSubmissions';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { GUEST_MAX_ITEMS, MAX_ITEMS } from '@/data/marketItems';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import { FocusTour, type FocusTourStep } from './FocusTour';
import { PublishCelebration } from './PublishCelebration';
import styles from './SellForm.module.css';

const MAX_IMAGE_BYTES = 1_000_000;
const SUPPORTED_IMAGE_TYPES = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_PRICE = 99_999;
const PRICE_PATTERN = /^\d{1,5}(?:\.\d{1,2})?$/;

function isValidPrice(rawPrice: string): boolean {
  const normalized = rawPrice.trim();
  return PRICE_PATTERN.test(normalized) && Number(normalized) <= MAX_PRICE;
}
// Stand-in for "I have nothing to photograph yet" — this is a mock, not a real listing, so it
// never touches the backend (see `submit()`): nobody needs a human moderator reviewing a joke
// placeholder built from a stock clip.
const DEMO_VIDEO = '/assets/market/seed-3.webm';

interface SellFormProps {
  onSubmitted: () => void;
  /** MarketWindow's own root — FocusTour portals its darken-overlay into this so it can cover the
   *  whole window (the tab rail included), not just this tab's own content area. */
  windowRef: RefObject<HTMLDivElement | null>;
}

/**
 * List-an-item form. One page — photo, title, description, price, contact,
 * Submit — instead of the earlier multi-step wizard. A real submission (a
 * genuine uploaded photo) goes to the real moderation queue
 * (src/api/marketSubmissions.ts): a guest's own submissions are cached in
 * localStorage, a logged-in seller's come back from
 * `/market/submissions/mine`, and either way the item only appears in the
 * public Browse grid once a human approves it — this form itself never
 * writes into that grid. A guest's fake "we'll fake it for you" demo photo
 * is the one exception — see `submit()` — that never touches the backend
 * at all, so a first-run guest can complete the whole onboarding flow
 * without a human ever reviewing a joke placeholder.
 *
 * A guest going through this for the first time still gets a guided
 * FocusTour on top of it, walking field-by-field down this one page:
 * darkens everything but the current field, funny bubble, advances the
 * instant they do the thing (Enter in the field, or the bubble's own Next
 * button). Returning guests and logged-in sellers never see it.
 */
export function SellForm({ onSubmitted, windowRef }: SellFormProps) {
  const { state, completeTour } = useAppState();
  const queryClient = useQueryClient();
  const mySubmissions = useMyMarketSubmissions();

  const [contact, setContact] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [demoVideo, setDemoVideo] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [celebratingIsDemo, setCelebratingIsDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFirstRun = !state.logged && !state.tours.has('market');
  const [tourIndex, setTourIndex] = useState(0);

  const dropRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const publishRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // The form advances the tour itself, from inside its own real onClick/
  // onChange handlers, rather than FocusTour attaching a second native
  // listener to the same element — see FocusTour.tsx's comment for why
  // that raced with React's own handler and could silently eat the click.
  function advanceTour(atIndex: number) {
    if (tourActive && tourIndex === atIndex) setTourIndex((i) => i + 1);
  }
  function completeTitle() {
    if (title.trim()) advanceTour(1);
  }
  function completeDesc() {
    advanceTour(2);
  }
  function completePrice() {
    if (isValidPrice(price)) advanceTour(3);
  }
  function completeContact() {
    if (contact.trim()) advanceTour(4);
  }

  const tourSteps: FocusTourStep[] = [
    { ref: dropRef, text: "Nothing to sell yet? Click here — we'll fake it for you." },
    { ref: titleRef, text: "Naming is important, bro, don't screw this up.", onNext: completeTitle },
    { ref: descRef, text: 'Tell people how much sweat and blood went into this.', onNext: completeDesc },
    { ref: priceRef, text: 'I know this item is priceless, but... a number, please.', onNext: completePrice },
    { ref: contactRef, text: 'How should a buyer actually reach you?', onNext: completeContact },
    { ref: publishRef, text: 'Smash that Submit button.' },
  ];
  const tourActive = isFirstRun && tourIndex < tourSteps.length;

  function selectImage(file: File) {
    setSubmitError(null);
    setDemoVideo(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImage(null);
      setImagePreview(null);
      setImageError('Image must be 1 MB or smaller.');
      return;
    }
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setImage(null);
      setImagePreview(null);
      setImageError('Choose an AVIF, WebP, JPEG, or PNG image.');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError(null);
  }

  function handleDropClick() {
    if (!image && !demoVideo && isFirstRun) {
      // First-run guest demo only — fake it instead of opening the file picker. This is a
      // mock item, never a real listing (see `submit()`), so there's no need to satisfy the
      // backend's real image validation here. Gated to isFirstRun (not just "is a guest")
      // so this is a one-time onboarding aid, not a repeatable way to dodge a real photo —
      // once the tour's done, even a returning guest has to pick a real one.
      setImageError(null);
      setDemoVideo(DEMO_VIDEO);
      advanceTour(0);
      return;
    }
    fileInputRef.current?.click();
  }

  const submissionLimit = state.logged ? MAX_ITEMS : GUEST_MAX_ITEMS;
  const submissionCount = mySubmissions.data?.filter((item) => item.status === 'PENDING_REVIEW').length ?? 0;

  async function submit() {
    if ((!image && !demoVideo) || submitting || submissionCount >= submissionLimit) return;

    advanceTour(5);
    setSubmitError(null);

    if (demoVideo) {
      // Mock only: this is the guest's fake demo item, not a real listing — it's just for
      // trying the tool out, so it never touches the backend and never gets saved anywhere
      // (not even the guest's local "My applications" cache) — nothing to show for it once the
      // celebration screen closes.
      completeTour('market');
      setCelebratingIsDemo(true);
      setCelebrating(true);
      return;
    }

    if (!image) return;
    setSubmitting(true);
    try {
      const created = await createMarketSubmission({
        ...(state.logged ? {} : { contact: contact.trim() }),
        title,
        description: desc,
        price,
        image,
      });
      if (!state.logged) saveGuestMarketSubmission(created);
      void queryClient.invalidateQueries({ queryKey: MARKET_SUBMISSIONS_QUERY_KEY });
      completeTour('market');
      setCelebratingIsDemo(false);
      setCelebrating(true);
    } catch (error) {
      setSubmitError(error instanceof ApiError || error instanceof Error ? error.message : 'Could not submit the item.');
    } finally {
      setSubmitting(false);
    }
  }

  // After the demo celebration, drop the guest right back into a fresh form instead of
  // navigating away — the whole point of the demo was to lead into a real listing, and their
  // real 1-item quota is still untouched (the demo never counted against it).
  function resetForRealListing() {
    setCelebrating(false);
    setCelebratingIsDemo(false);
    setDemoVideo(null);
    setImage(null);
    setImagePreview(null);
    setImageError(null);
    setTitle('');
    setDesc('');
    setPrice('');
    setContact('');
    setSubmitError(null);
  }

  if (celebrating) {
    return (
      <PublishCelebration
        itemName={title.trim() || 'Untitled nothing'}
        isDemo={celebratingIsDemo}
        onDone={celebratingIsDemo ? resetForRealListing : onSubmitted}
      />
    );
  }

  if (submissionCount >= submissionLimit) {
    return (
      <div className={styles.limit}>
        <MaterialIcon name="inventory_2" size={44} />
        <div className={styles.limitCount}>
          {submissionCount}/{submissionLimit}
        </div>
        <h3>Application limit reached</h3>
        <p>
          {state.logged
            ? `You can have up to ${MAX_ITEMS} market applications under review.`
            : `A guest can have ${GUEST_MAX_ITEMS} real market application${GUEST_MAX_ITEMS === 1 ? '' : 's'} under review in this browser.`}
        </p>
      </div>
    );
  }

  const canPublish =
    (image !== null || demoVideo !== null) &&
    title.trim().length > 0 &&
    isValidPrice(price) &&
    (state.logged || contact.trim().length > 0);

  return (
    <div className={styles.form}>
      <div ref={dropRef} className={styles.drop} onClick={handleDropClick}>
        {demoVideo ? (
          <video src={demoVideo} autoPlay loop muted playsInline />
        ) : imagePreview ? (
          <img src={imagePreview} alt="Selected item" />
        ) : (
          <>
            <MaterialIcon name="add_photo_alternate" size={44} />
            <div className={styles.dropTitle}>Add a photo</div>
            <div className={styles.dropSub}>
              {isFirstRun
                ? "Nothing to show yet? We'll fake one"
                : 'Click to choose · AVIF / WebP / JPEG / PNG · max 1 MB'}
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/avif,image/webp,image/jpeg,image/png"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) selectImage(file);
            event.target.value = '';
          }}
        />
      </div>

      <div className={styles.fields}>
        {imageError && <div className={styles.formError}>{imageError}</div>}

        <label className={styles.formLabel}>Title</label>
        <input
          ref={titleRef}
          className={styles.input}
          placeholder="What is it?"
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') completeTitle();
          }}
        />

        <label className={styles.formLabel}>Description</label>
        <textarea
          ref={descRef}
          className={styles.textarea}
          placeholder="Materials, size, edition…"
          maxLength={255}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          // No Enter-to-advance here on purpose — Enter in a textarea should still just add a
          // line break; the bubble's own Next button is the way forward for this one field.
        />

        <div className={styles.row2}>
          <div>
            <label className={styles.formLabel}>Price (USD)</label>
            <div className={styles.priceWrap}>
              <span className={styles.priceSign}>$</span>
              <input
                ref={priceRef}
                className={styles.priceInput}
                type="number"
                min={0}
                max={MAX_PRICE}
                step="0.01"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') completePrice();
                }}
              />
            </div>
          </div>
          <div>
            <label className={styles.formLabel}>Contact</label>
            <input
              ref={contactRef}
              className={styles.input}
              placeholder={state.logged ? undefined : 'email, @username, link…'}
              maxLength={1000}
              value={state.logged ? (state.email ?? '') : contact}
              disabled={state.logged}
              onChange={(e) => setContact(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') completeContact();
              }}
            />
          </div>
        </div>

        <AeroButton
          ref={publishRef}
          variant="lime"
          wide
          disabled={!canPublish || submitting}
          onClick={() => void submit()}
          className={styles.publishButton}
        >
          {submitting ? 'Submitting…' : 'Submit for review'}
        </AeroButton>
        {submitError && <div className={styles.submitError}>{submitError}</div>}
        <div className={styles.quota}>
          <MaterialIcon name="inventory_2" size={15} />
          {submissionLimit - submissionCount} of {submissionLimit} real application{submissionLimit === 1 ? '' : 's'} left
          {state.logged ? '' : ' · guest'}
        </div>
      </div>

      {tourActive && <FocusTour containerRef={windowRef} steps={tourSteps} activeIndex={tourIndex} />}
    </div>
  );
}
