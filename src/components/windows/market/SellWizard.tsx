import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/auth';
import {
  createMarketSubmission,
  getGuestMarketSubmissions,
  MARKET_SUBMISSIONS_QUERY_KEY,
  saveGuestMarketSubmission,
} from '@/api/marketSubmissions';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import { PublishCelebration } from './PublishCelebration';
import styles from './SellWizard.module.css';

type Step = 'contact' | 'photo' | 'details' | 'price' | 'review';
const GUEST_STEPS: Step[] = ['contact', 'photo', 'details', 'price', 'review'];
const AUTHENTICATED_STEPS: Step[] = ['photo', 'details', 'price', 'review'];

interface SellWizardProps {
  onSubmitted: () => void;
}

const MAX_IMAGE_BYTES = 1_000_000;
const MAX_GUEST_SUBMISSIONS = 1;
const MAX_AUTHENTICATED_SUBMISSIONS = 3;
const SUPPORTED_IMAGE_TYPES = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);

/**
 * List-an-item wizard. Original was a single long form (applyItem(),
 * Tools.html:3256-3298) — split into steps here since "go through each
 * step" is the point of the onboarding, not a shortcut to skip.
 */
export function SellWizard({ onSubmitted }: SellWizardProps) {
  const { state, completeTour } = useAppState();
  const queryClient = useQueryClient();
  const mySubmissions = useMyMarketSubmissions();
  const [selectedStep, setSelectedStep] = useState<Step>(() => (state.logged ? 'photo' : 'contact'));
  const [contact, setContact] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('1');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = state.logged ? AUTHENTICATED_STEPS : GUEST_STEPS;
  const step = steps.includes(selectedStep) ? selectedStep : steps[0];
  const stepIndex = steps.indexOf(step);
  const reviewContact = state.logged ? state.email : contact.trim();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function selectImage(file: File) {
    setSubmitError(null);
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

  async function submit() {
    if (!image || submitting) return;

    const currentCount = state.logged
      ? (mySubmissions.data?.filter((item) => item.status === 'PENDING_REVIEW').length ?? 0)
      : getGuestMarketSubmissions().filter((item) => item.status === 'PENDING_REVIEW').length;
    const limit = state.logged
      ? MAX_AUTHENTICATED_SUBMISSIONS
      : MAX_GUEST_SUBMISSIONS;
    if (currentCount >= limit) {
      setSubmitError(`You can have at most ${limit} market application${limit === 1 ? '' : 's'} under review.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createMarketSubmission({
        ...(state.logged ? {} : { contact }),
        title,
        description: desc,
        quantity: amount,
        price,
        image,
      });
      if (!state.logged) saveGuestMarketSubmission(created);
      void queryClient.invalidateQueries({
        queryKey: MARKET_SUBMISSIONS_QUERY_KEY,
      });
      completeTour('market');
      setCelebrating(true);
    } catch (error) {
      setSubmitError(error instanceof ApiError || error instanceof Error ? error.message : 'Could not submit the item.');
    } finally {
      setSubmitting(false);
    }
  }

  if (celebrating) {
    return <PublishCelebration itemName={title.trim() || 'Untitled nothing'} onDone={onSubmitted} />;
  }

  const submissionLimit = state.logged
    ? MAX_AUTHENTICATED_SUBMISSIONS
    : MAX_GUEST_SUBMISSIONS;
  const submissionCount =
    mySubmissions.data?.filter((item) => item.status === 'PENDING_REVIEW').length ?? 0;
  if (submissionCount >= submissionLimit) {
    return (
      <div className={styles.limitState}>
        <div className={styles.limitIcon}>
          <MaterialIcon name="inventory_2" size={34} />
        </div>
        <div className={styles.limitCount}>
          {submissionCount}/{submissionLimit}
        </div>
        <h3>Application limit reached</h3>
        <p>
          {state.logged
            ? 'You can have up to three market applications under review.'
            : 'A guest can have one market application under review in this browser.'}
        </p>
      </div>
    );
  }

  const canAdvance =
    step === 'contact' || // intentionally optional and format-agnostic for now
    (step === 'photo' && image !== null) ||
    (step === 'details' && title.trim().length > 0) ||
    (step === 'price' && /^[1-9]\d*$/.test(amount) && /^\d{1,8}(?:\.\d{1,2})?$/.test(price)) ||
    step === 'review';

  return (
    <div className={styles.wizard}>
      <div className={styles.progress}>
        {steps.map((s, i) => (
          <div key={s} className={i <= stepIndex ? `${styles.dot} ${styles.dotOn}` : styles.dot} />
        ))}
      </div>

      {step === 'contact' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step {stepIndex + 1} · Contact</div>
          <label className={styles.formLabel}>How can people contact you?</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Email, @username, link…"
            maxLength={1000}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {step === 'photo' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step {stepIndex + 1} · Photo</div>
          <div className={styles.dropWrap}>
            <Sticker text="Try this" color="pink" rotate={-8} className={styles.dropSticker} />
            <div className={styles.drop} onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Selected item" />
              ) : (
                <>
                  <MaterialIcon name="add_photo_alternate" size={52} />
                  <div className={styles.dropTitle}>Drop an image here</div>
                  <div className={styles.dropSub}>or click to choose · AVIF / WebP / JPEG / PNG · max 1 MB</div>
                </>
              )}
            </div>
          </div>
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
          {imageError && <div className={styles.formError}>{imageError}</div>}
        </div>
      )}

      {step === 'details' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step {stepIndex + 1} · Details</div>
          <label className={styles.formLabel}>Title</label>
          <input
            className={styles.input}
            placeholder="What is it?"
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Materials, size, edition…"
            maxLength={10000}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      )}

      {step === 'price' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step {stepIndex + 1} · Price & quantity</div>
          <div className={styles.row2}>
            <div>
              <label className={styles.formLabel}>Amount</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={1000000}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.formLabel}>Price (USD)</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                max={99999999.99}
                step="0.01"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className={styles.subtotal}>
            <div className={styles.subtotalLabel}>Listing value</div>
            <div className={styles.subtotalValue}>${((Number(amount) || 0) * (Number(price) || 0)).toFixed(0)}</div>
            <div className={styles.subtotalMeta}>
              {Number(amount) || 0} × ${Number(price) || 0}
            </div>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step {stepIndex + 1} · Review</div>
          <div className={styles.reviewCard}>
            <div className={styles.reviewImg}>
              {imagePreview ? <img src={imagePreview} alt="Selected item" /> : <MaterialIcon name="image" size={48} />}
            </div>
            <div className={styles.reviewInfo}>
              <div className={styles.reviewName}>{title.trim() || 'Untitled nothing'}</div>
              <div className={styles.reviewPrice}>${Number(price) || 0}</div>
              <div className={styles.reviewMeta}>qty {Number(amount) || 1}</div>
              {reviewContact && <div className={styles.reviewContact}>Contact: {reviewContact}</div>}
              {desc.trim() && <div className={styles.reviewDesc}>{desc.trim()}</div>}
            </div>
          </div>
        </div>
      )}

      <div className={styles.nav}>
        <AeroButton
          variant="ghost"
          size="sm"
          theme="light"
          disabled={stepIndex === 0}
          onClick={() => setSelectedStep(steps[stepIndex - 1] ?? step)}
        >
          Back
        </AeroButton>
        <div className={styles.navPrimary}>
          {step === 'review' ? (
            <AeroButton variant="lime" wide disabled={submitting} onClick={() => void submit()}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </AeroButton>
          ) : (
            <AeroButton
              variant="lime"
              wide
              disabled={!canAdvance}
              onClick={() => setSelectedStep(steps[stepIndex + 1] ?? step)}
            >
              Next
            </AeroButton>
          )}
        </div>
      </div>
      {submitError && <div className={styles.submitError}>{submitError}</div>}
    </div>
  );
}
