import { useState, type FormEvent } from 'react';
import { addUser, ADMIN_EMAIL } from '@/api/admin';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import styles from './AdminWindow.module.css';

/** Private database-access manager, available only to the configured admin. */
export function AdminWindow() {
  const { state } = useAppState();
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedEmail, setAddedEmail] = useState<string | null>(null);

  // The server makes the authoritative access decision. This also ensures an
  // open window disappears promptly if the local session changes.
  if (state.email?.toLowerCase() !== ADMIN_EMAIL) return <></>;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);
    setAddedEmail(null);
    try {
      const added = await addUser(email);
      setAddedEmail(added.email);
      setEmail('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.window}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <MaterialIcon name="person_add" size={22} />
        </div>
        <div>
          <p className={styles.eyebrow}>ADMIN</p>
          <h1>Add user</h1>
          <p className={styles.description}>
            Grant database access so this email can sign in with a one-time code.
          </p>
        </div>

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="admin-user-email">Email</label>
          <div className={styles.actionRow}>
            <input
              id="admin-user-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              required
              disabled={saving}
            />
            <button type="submit" disabled={saving || !email.trim()}>
              <MaterialIcon name={saving ? 'progress_activity' : 'person_add'} size={17} />
              {saving ? 'Adding…' : 'Add user'}
            </button>
          </div>
        </form>

        <div className={styles.feedback} aria-live="polite">
          {addedEmail && (
            <p className={styles.success}>
              <MaterialIcon name="check_circle" size={17} />
              Access granted to {addedEmail}.
            </p>
          )}
          {error && (
            <p className={styles.error}>
              <MaterialIcon name="error" size={17} />
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
