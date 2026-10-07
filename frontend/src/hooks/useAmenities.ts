"use client";
import { useEffect, useRef, useState } from 'react';
import { getCachedAmenities, getPublicAmenities } from '@/services/properties';
import { isAbortError } from '@/lib/request-cache';
import type { Amenity } from '@/services/owner';

export function useAmenities() {
  const [attempt, setAttempt] = useState(0);
  // Set by retry() so only the retry-triggered fetch bypasses the cache.
  // Read once per effect run and reset immediately; concurrent Strict Mode
  // runs still share one in-flight request via the shared cache.
  const forceNextRef = useRef(false);
  const [state, setState] = useState<{ items: Amenity[]; loading: boolean; error: boolean }>(() => {
    const cached = getCachedAmenities();
    return cached
      ? { items: cached, loading: false, error: false }
      : { items: [], loading: true, error: false };
  });
  useEffect(() => {
    // Already showing fresh cached data and this is not a retry: nothing to do.
    if (!forceNextRef.current && getCachedAmenities() !== null) {
      setState(prev => (prev.loading || prev.error
        ? { items: getCachedAmenities() ?? prev.items, loading: false, error: false }
        : prev));
      return;
    }
    const forceRefresh = forceNextRef.current;
    forceNextRef.current = false;
    let cancelled = false;
    const controller = new AbortController();
    getPublicAmenities({ signal: controller.signal, forceRefresh }).then(items => {
      if (!cancelled) setState({ items, loading: false, error: false });
    }).catch((error: unknown) => {
      if (!cancelled && !isAbortError(error)) setState({ items: [], loading: false, error: true });
    });
    return () => { cancelled = true; controller.abort(); };
  }, [attempt]);
  return { ...state, retry: () => { forceNextRef.current = true; setState({ items: [], loading: true, error: false }); setAttempt(value => value + 1); } };
}
