import { ApiError } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const ADMIN_EMAIL = 'michael@tonstarter.com';

interface AddUserResponse {
  email: string;
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
