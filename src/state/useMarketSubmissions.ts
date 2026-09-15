import { useQuery } from '@tanstack/react-query';
import {
  getGuestMarketSubmissions,
  getMyMarketSubmissions,
  MARKET_SUBMISSIONS_QUERY_KEY,
} from '@/api/marketSubmissions';
import { useAppState } from '@/state/AppStateContext';

export function useMyMarketSubmissions() {
  const { state } = useAppState();
  const ownerKey = state.logged ? state.email : 'guest';

  return useQuery({
    queryKey: [...MARKET_SUBMISSIONS_QUERY_KEY, ownerKey],
    queryFn: () =>
      state.logged
        ? getMyMarketSubmissions()
        : Promise.resolve(getGuestMarketSubmissions()),
  });
}
