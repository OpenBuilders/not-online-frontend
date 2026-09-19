import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { NO_ICON, isImageIcon, normalizeSiteAssetUrl } from '@/data/siteAssets';

interface LinkIconProps {
  icon: string;
  /** Size for a symbol. An illustration renders at twice this — it carries its own detail. */
  size: number;
  className?: string;
}

/**
 * A link's mark: a built-in symbol, one of the illustrations in
 * public/assets/site/icons, or nothing. Returns null for "none" so a
 * template can simply not render the slot — `{icon && <LinkIcon …>}` in
 * the caller would still leave its wrapper behind.
 *
 * Illustrations come back at double the symbol size and tagged
 * `data-image`, which is how each template knows to drop the chip border
 * and fill it would otherwise draw behind a symbol.
 */
export function LinkIcon({ icon, size, className }: LinkIconProps) {
  if (!icon || icon === NO_ICON) return null;

  if (isImageIcon(icon)) {
    const source = normalizeSiteAssetUrl(icon);

    return (
      <img
        className={className}
        data-image="true"
        src={source}
        alt=""
        width={size * 2}
        height={size * 2}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  return <MaterialIcon name={icon} size={size} className={className} />;
}

export const hasIcon = (icon: string) => Boolean(icon) && icon !== NO_ICON;
