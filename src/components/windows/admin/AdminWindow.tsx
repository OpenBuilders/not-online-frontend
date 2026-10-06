import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  ADMIN_USERS_QUERY_KEY,
  addUser,
  isAdministratorEmail,
  listUsers,
  removeUser,
} from '@/api/admin';
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
  const [removedEmail, setRemovedEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const isAdmin = isAdministratorEmail(state.email);
  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: listUsers,
    enabled: isAdmin,
  });
  const users = usersQuery.data ?? [];
  const usersError =
    usersQuery.error instanceof Error
      ? usersQuery.error.message
      : 'Could not load users.';

  // The server makes the authoritative access decision. This also ensures an
  // open window disappears promptly if the local session changes.
  if (!isAdmin) return <></>;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);
    setAddedEmail(null);
    setRemovedEmail(null);
    try {
      const added = await addUser(email);
      setAddedEmail(added.email);
      void usersQuery.refetch();
      setEmail('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(user: (typeof users)[number]) {
    if (user.isAdministrator || removingEmail) return;

    setRemovingEmail(user.email);
    setError(null);
    setAddedEmail(null);
    setRemovedEmail(null);
    try {
      await removeUser(user.email);
      void usersQuery.refetch();
      setRemovedEmail(user.email);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not remove user.');
    } finally {
      setRemovingEmail(null);
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
          {removedEmail && (
            <p className={styles.success}>
              <MaterialIcon name="check_circle" size={17} />
              Access removed from {removedEmail}.
            </p>
          )}
          {error && (
            <p className={styles.error}>
              <MaterialIcon name="error" size={17} />
              {error}
            </p>
          )}
        </div>

        <section className={styles.userSection} aria-labelledby="admin-users-heading">
          <div className={styles.userSectionHeading}>
            <h2 id="admin-users-heading">Users with database access</h2>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={() => void usersQuery.refetch()}
              disabled={usersQuery.isFetching}
              aria-label="Refresh users"
            >
              <MaterialIcon name="refresh" size={17} />
            </button>
          </div>

          {usersQuery.isLoading ? (
            <p className={styles.userListMessage}>Loading users…</p>
          ) : usersQuery.isError ? (
            <p className={styles.userListError}>{usersError}</p>
          ) : users.length === 0 ? (
            <p className={styles.userListMessage}>No users have database access yet.</p>
          ) : (
            <ul className={styles.userList}>
              {users.map((user) => (
                <li key={user.email} className={styles.userRow}>
                  <span className={styles.userEmail} title={user.email}>
                    {user.email}
                  </span>
                  {user.isAdministrator ? (
                    <span className={styles.adminBadge}>Admin</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => void handleRemove(user)}
                      disabled={removingEmail !== null}
                      aria-label={`Remove access for ${user.email}`}
                      title="Remove database access"
                    >
                      <MaterialIcon
                        name={removingEmail === user.email ? 'progress_activity' : 'person_remove'}
                        size={17}
                      />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
