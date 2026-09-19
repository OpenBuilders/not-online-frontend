const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface AuthUser {
  email: string
}

interface UserResponse {
  user: AuthUser
}

interface MessageResponse {
  message: string
  expiresAt: string
}

interface ErrorResponse {
  message?: string | string[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.text()
  if (!body) {
    throw new ApiError('The server returned an empty response.', response.status)
  }
  try {
    return JSON.parse(body) as T
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status)
  }
}

export function requestOtp(email: string): Promise<MessageResponse> {
  return apiRequest('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<UserResponse>('/auth/me')
    return response.user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<AuthUser> {
  const response = await apiRequest<UserResponse>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
  return response.user
}

export function logout(): Promise<void> {
  return apiRequest('/auth/logout', { method: 'POST' })
}
