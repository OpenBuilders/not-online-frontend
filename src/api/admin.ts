import { ApiError } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const ADMIN_EMAILS = [
  'michael@tonstarter.com',
  'maxi@probablynothing.xyz',
  'chakzefir@hotmail.com',
] as const;

export function isAdministratorEmail(email: string | null | undefined): boolean {
  return (
    typeof email === 'string' &&
    ADMIN_EMAILS.includes(
      email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number],
    )
  );
}

interface AddUserResponse {
  email: string;
}

export interface AdminUser {
  email: string;
  isAdministrator: boolean;
}

interface AdminUserListResponse {
  users?: unknown;
}

interface ErrorResponse {
  message?: string | string[];
}

export async function addUser(email: string): Promise<AddUserResponse> {
  const response = await fetch(`${API_URL}/add-user`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  const body = (await response.json()) as Partial<AddUserResponse>;
  if (typeof body.email !== 'string') {
    throw new ApiError('The server returned an invalid response.', response.status);
  }
  return { email: body.email };
}

export async function listUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/users`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  const body = (await response.json()) as AdminUserListResponse;
  if (
    !Array.isArray(body.users) ||
    !body.users.every(
      (user): user is AdminUser =>
        typeof user === 'object' &&
        user !== null &&
        typeof user.email === 'string' &&
        typeof user.isAdministrator === 'boolean',
    )
  ) {
    throw new ApiError('The server returned an invalid response.', response.status);
  }
  return body.users;
}

export async function removeUser(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }
}
