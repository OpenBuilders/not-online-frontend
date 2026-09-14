import { useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { MarketItem } from '@/types';

interface ItemMediaProps {
  item: Pick<MarketItem, 'video' | 'img' | 'icon'>;
  iconSize?: number;
}

/**
 * One item's preview media, shared by ItemCard/ItemDetail/CartTab: a
 * looping muted clip when `video` is set (the two seed items ship as short
 * .webm previews rather than static photos), else a static `img`, else the
 * `icon` fallback — same onError-to-icon pattern as DesktopIcon.tsx.
 */
export function ItemMedia({ item, iconSize = 38 }: ItemMediaProps) {
  const [failed, setFailed] = useState(false);

  if (!failed && item.video) {
    return (
      <video
        src={item.video}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  if (!failed && item.img) {
    return <img src={item.img} alt="" onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return <MaterialIcon name={item.icon || 'image'} size={iconSize} />;
}
