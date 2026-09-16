import { ApiError } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface CreateMarketSubmissionInput {
  contact?: string;
  title: string;
  description: string;
  price: string;
  image: File;
}

export interface CreatedMarketSubmission {
  id: string;
  title: string;
  description: string;
  price: string;
  status: MarketSubmissionStatus;
  imageUrl: string;
}

export type MarketSubmissionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type MarketSubmission = CreatedMarketSubmission;

export const MARKET_SUBMISSIONS_QUERY_KEY = ['market-submissions', 'mine'] as const;
const GUEST_SUBMISSIONS_STORAGE_KEY = 'notportal:guest-market-submissions:v1';

interface ErrorResponse {
  message?: string | string[];
}

export async function createMarketSubmission(
  input: CreateMarketSubmissionInput,
): Promise<CreatedMarketSubmission> {
  const body = new FormData();
  if (input.contact !== undefined) body.set('contact', input.contact);
  body.set('title', input.title);
  body.set('description', input.description);
  body.set('price', input.price);
  body.set('image', input.image);

  const response = await fetch(`${API_URL}/market/submissions`, {
    method: 'POST',
    credentials: 'include',
    body,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as CreatedMarketSubmission;
}

export async function getMyMarketSubmissions(): Promise<MarketSubmission[]> {
  const response = await fetch(`${API_URL}/market/submissions/mine`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ErrorResponse | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as MarketSubmission[];
}

export function getGuestMarketSubmissions(): MarketSubmission[] {
  try {
    const stored = localStorage.getItem(GUEST_SUBMISSIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMarketSubmission);
  } catch {
    return [];
  }
}

export function saveGuestMarketSubmission(submission: MarketSubmission): void {
  try {
    const submissions = getGuestMarketSubmissions().filter(
      (current) => current.id !== submission.id,
    );
    localStorage.setItem(
      GUEST_SUBMISSIONS_STORAGE_KEY,
      JSON.stringify([submission, ...submissions]),
    );
  } catch {
    // The backend request has already succeeded; unavailable browser storage
    // must not turn that success into a misleading submission error.
  }
}

function isMarketSubmission(value: unknown): value is MarketSubmission {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'string' &&
    (item.status === 'PENDING_REVIEW' || item.status === 'APPROVED' || item.status === 'REJECTED') &&
    typeof item.imageUrl === 'string'
  );
}
