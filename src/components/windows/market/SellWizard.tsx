import { useRef, useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { MAX_ITEMS } from '@/data/marketItems';
import { useAppState } from '@/state/AppStateContext';
import type { MarketItem } from '@/types';
import { PublishCelebration } from './PublishCelebration';
import styles from './SellWizard.module.css';

type Step = 'photo' | 'details' | 'price' | 'review';
const STEPS: Step[] = ['photo', 'details', 'price', 'review'];

interface SellWizardProps {
  onPublished: () => void;
}

/**
 * List-an-item wizard. Original was a single long form (applyItem(),
 * Tools.html:3256-3298) — split into steps here since "go through each
 * step" is the point of the onboarding, not a shortcut to skip.
 */
export function SellWizard({ onPublished }: SellWizardProps) {
  const { state, addMarketItem, completeTour } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [img, setImg] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('1');
  const [price, setPrice] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const step = STEPS[stepIndex];
  const left = MAX_ITEMS - state.myItems.length;

  if (left <= 0) {
    return (
      <div className={styles.limit}>
        <MaterialIcon name="inventory_2" size={44} />
        <h3>You've listed {MAX_ITEMS} items</h3>
        <p>That's the limit for now. Unlimited listings soon.</p>
      </div>
    );
  }

  function readFile(f: File) {
    const reader = new FileReader();
    reader.onload = () => setImg(reader.result as string);
    reader.readAsDataURL(f);
  }

  function publish() {
    const item: MarketItem = {
      id: `u${Date.now()}`,
      name: title.trim() || 'Untitled nothing',
      price: Number(price) || 0,
      amount: Number(amount) || 1,
      desc: desc.trim(),
      img,
      icon: 'image',
      status: 'queued',
      views: 0,
    };
    addMarketItem(item);
    completeTour('market');
    setCelebrating(true);
  }

  if (celebrating) {
    return <PublishCelebration itemName={title.trim() || 'Untitled nothing'} onDone={onPublished} />;
  }

  const canAdvance =
    (step === 'photo' && true) || // photo is optional — fallback icon covers it
    (step === 'details' && title.trim().length > 0) ||
    (step === 'price' && Number(price) >= 0 && price !== '') ||
    step === 'review';

  return (
    <div className={styles.wizard}>
      <div className={styles.progress}>
        {STEPS.map((s, i) => (
          <div key={s} className={i <= stepIndex ? `${styles.dot} ${styles.dotOn}` : styles.dot} />
        ))}
      </div>

      {step === 'photo' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step 1 · Photo</div>
          <div className={styles.dropWrap}>
            <Sticker text="Try this" color="pink" rotate={-8} className={styles.dropSticker} />
            <div className={styles.drop} onClick={() => fileInputRef.current?.click()}>
              {img ? (
                <img src={img} alt="" />
              ) : (
                <>
                  <MaterialIcon name="add_photo_alternate" size={52} />
                  <div className={styles.dropTitle}>Drop an image here</div>
                  <div className={styles.dropSub}>or click to choose · PNG / JPG</div>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
          />
        </div>
      )}

      {step === 'details' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step 2 · Details</div>
          <label className={styles.formLabel}>Title</label>
          <input className={styles.input} placeholder="What is it?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.textarea}
            placeholder="Materials, size, edition…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      )}

      {step === 'price' && (
        <div className={styles.step}>
          <div className={styles.lbl}>Step 3 · Price & quantity</div>
          <div className={styles.row2}>
            <div>
              <label className={styles.formLabel}>Amount</label>
              <input className={styles.input} type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className={styles.formLabel}>Price (USD)</label>
              <input
                className={styles.input}
                type="number"
                min={0}
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
          <div className={styles.lbl}>Step 4 · Review</div>
          <div className={styles.reviewCard}>
            <div className={styles.reviewImg}>
              {img ? <img src={img} alt="" /> : <MaterialIcon name="image" size={48} />}
            </div>
            <div className={styles.reviewInfo}>
              <div className={styles.reviewName}>{title.trim() || 'Untitled nothing'}</div>
              <div className={styles.reviewPrice}>${Number(price) || 0}</div>
              <div className={styles.reviewMeta}>qty {Number(amount) || 1}</div>
              {desc.trim() && <div className={styles.reviewDesc}>{desc.trim()}</div>}
            </div>
          </div>
        </div>
      )}

      <div className={styles.nav}>
        <AeroButton variant="ghost" size="sm" theme="light" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
          Back
        </AeroButton>
        <div className={styles.navPrimary}>
          {step === 'review' ? (
            <AeroButton variant="lime" wide onClick={publish}>
              Publish
            </AeroButton>
          ) : (
            <AeroButton variant="lime" wide disabled={!canAdvance} onClick={() => setStepIndex((i) => i + 1)}>
              Next
            </AeroButton>
          )}
        </div>
      </div>
      <div className={styles.quota}>
        <MaterialIcon name="inventory_2" size={15} />
        {left} of {MAX_ITEMS} listings left · unlimited soon
      </div>
    </div>
  );
}
