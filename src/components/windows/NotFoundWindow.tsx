import { useState } from 'react';
import styles from './NotFoundWindow.module.css';

/** Ported in full from Tools.html:2460-2468 (openNotFound()) — small enough to not need a placeholder stage. */
export function NotFoundWindow() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className={styles.nf}>
      <div className={styles.code}>
        4<b>0</b>4
      </div>
      <h3>not found</h3>
      <p>This app went looking and came back with nothing, which is, on reflection, exactly what it was built to find.</p>
      <button type="button" className={styles.retry} onClick={() => setClicked(true)}>
        {clicked ? 'still nothing' : 'Search again'}
      </button>
    </div>
  );
}
