'use client';
import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from 'react';
const EVENT = 'stayleb-local-change';
function subscribe(callback: () => void) { window.addEventListener('storage', callback); window.addEventListener(EVENT, callback); return () => { window.removeEventListener('storage', callback); window.removeEventListener(EVENT, callback); }; }
export function useLocalState<T>(key: string, initial: T): [T, (value: SetStateAction<T>) => void] {
  const fallback = JSON.stringify(initial);
  const read = useCallback(() => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }, [key, fallback]);
  const raw = useSyncExternalStore(subscribe, read, () => fallback);
  const value = useMemo<T>(() => { try { return JSON.parse(raw); } catch { return JSON.parse(fallback); } }, [raw, fallback]);
  const set = useCallback((update: SetStateAction<T>) => { const current = JSON.parse(read()) as T; const next = typeof update === 'function' ? (update as (v: T) => T)(current) : update; localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new Event(EVENT)); }, [key, read]);
  return [value, set];
}
