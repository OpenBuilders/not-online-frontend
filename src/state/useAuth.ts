import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, getCurrentUser, logout as apiLogout, requestOtp, verifyOtp, type AuthUser } from '@/api/auth';
import { useAppState } from '@/state/AppStateContext';

const CURRENT_USER_KEY = ['auth', 'current-user'] as const;

/**
 * Bridges the real backend session (cookie + `/auth/me`, via React Query)
 * into AppStateContext's `logged`/`email` — those stay the single source of
 * truth every other component already reads (AuthPill, useGuestGating,
 * etc.); this hook is just what keeps them in sync with the actual session
 * instead of the mock local-only login this app shipped with before.
 * Call it once, high up (Desktop.tsx) — not per-consumer.
 */
export function useSessionSync() {
  const { state, login } = useAppState();
  const sessionQuery = useQuery({ queryKey: CURRENT_USER_KEY, queryFn: getCurrentUser });

  useEffect(() => {
    if (sessionQuery.data && !state.logged) login(sessionQuery.data.email);
  }, [sessionQuery.data, state.logged, login]);

  return { checkingSession: sessionQuery.isPending };
}

/** Step 1 of LoginScreen: send the OTP email. */
export function useRequestOtp() {
  return useMutation({ mutationFn: requestOtp });
}

/** Step 2: verify the code, which is what actually establishes the session cookie. */
export function useVerifyOtp() {
  const { login } = useAppState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyOtp(email, code),
    onSuccess: (user) => {
      login(user.email);
      queryClient.setQueryData<AuthUser>(CURRENT_USER_KEY, user);
    },
  });
}

/** AuthPill's "Log out" — clears the real session, then the local belief about it. */
export function useLogout() {
  const { logout } = useAppState();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      logout();
      queryClient.setQueryData<AuthUser | null>(CURRENT_USER_KEY, null);
    },
  });
}

export { ApiError };
