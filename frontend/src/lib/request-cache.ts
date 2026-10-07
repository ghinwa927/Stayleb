// Shared in-flight deduplication plus short-lived success cache for
// GET-like client requests.
//
// Why this exists: the homepage mounts several components that request the
// same endpoints at the same time (property search, public amenities), and
// React Strict Mode intentionally runs effects twice in development. Without
// sharing, identical requests hit the network twice. This module collapses
// concurrent identical requests into one fetch and reuses fresh successful
// responses briefly.
//
// What it is NOT: a replacement for server state. Only successful responses
// are cached, entries expire quickly, and callers must still guard against
// stale responses (see `isAbortError` and per-hook request ids). Never use
// this for availability or checkout validation, which must always be fresh.

export const PROPERTY_SEARCH_TTL_MS = 30_000;
export const AMENITIES_TTL_MS = 10 * 60_000;
export const FAVORITES_TTL_MS = 60_000;

type CacheEntry = { value: unknown; expiresAt: number };

type Inflight = {
  promise: Promise<unknown>;
  controller: AbortController;
  refs: number;
  settled: boolean;
  /** Pending abort when the last caller detached; cancelled if anyone re-attaches. */
  abortTimer: ReturnType<typeof setTimeout> | null;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Inflight>();

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
    && error.name === 'AbortError'
  ) || (
    typeof error === 'object'
    && error !== null
    && 'name' in error
    && (error as { name?: unknown }).name === 'AbortError'
  );
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

/** Read a fresh cached value without triggering a fetch. Returns null on miss/expiry. */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

/** Drop a cached value. In-flight requests are left alone (see dedupedFetch). */
export function invalidate(key: string): void {
  cache.delete(key);
}

function attach<T>(key: string, record: Inflight, signal?: AbortSignal): Promise<T> {
  record.refs += 1;
  // A re-attaching caller (e.g. a Strict Mode effect re-run, or a second
  // component mounting) cancels a pending abort of the shared fetch.
  if (record.abortTimer !== null) {
    clearTimeout(record.abortTimer);
    record.abortTimer = null;
  }
  let done = false;
  const detach = () => {
    if (done) return;
    done = true;
    record.refs -= 1;
    signal?.removeEventListener('abort', onCallerAbort);
    // Only abort the shared fetch when every attached caller is gone, so
    // one component unmounting never cancels another component's request.
    // Deferred by a tick: React Strict Mode runs setup -> cleanup -> setup
    // synchronously, so the re-run re-attaches before the abort fires and
    // the single shared request survives. Genuinely abandoned requests are
    // still cancelled on the next tick.
    if (record.refs <= 0 && !record.settled && record.abortTimer === null) {
      record.abortTimer = setTimeout(() => {
        record.abortTimer = null;
        if (record.refs <= 0 && !record.settled) record.controller.abort();
      }, 0);
    }
  };
  const onCallerAbort = () => {
    detach();
    // Reject this caller only; the shared request continues for the rest.
    rejectAttached(abortError());
  };
  let rejectAttached: (reason: unknown) => void = () => {};
  if (signal?.aborted) {
    detach();
    return Promise.reject<T>(abortError());
  }
  signal?.addEventListener('abort', onCallerAbort, { once: true });
  return new Promise<T>((resolve, reject) => {
    rejectAttached = reject;
    (record.promise as Promise<T>).then(
      (value) => { detach(); resolve(value); },
      (error) => { detach(); reject(error); },
    );
  });
}

export type DedupedFetchOptions = {
  /** How long a successful response stays reusable. */
  ttlMs: number;
  /** Per-caller signal. Aborting detaches only this caller (see attach). */
  signal?: AbortSignal;
  /**
   * Skip the cache read and fetch again. Concurrent callers with the same
   * key still share the single in-flight request, so Strict Mode
   * double-effects and explicit retries never fan out.
   */
  forceRefresh?: boolean;
};

/**
 * Fetch once per key: concurrent callers share the in-flight promise, and
 * successful responses are reused until `ttlMs` elapses. Failures (including
 * aborts) are never cached. Cache keys must fully describe the request
 * (endpoint + every parameter); build them with the endpoint helpers in
 * `@/services/properties` rather than ad-hoc strings.
 */
export function dedupedFetch<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: DedupedFetchOptions,
): Promise<T> {
  const { ttlMs, signal, forceRefresh } = options;
  if (!forceRefresh) {
    const hit = getCached<T>(key);
    if (hit !== null) return Promise.resolve(hit);
  }
  const existing = inflight.get(key);
  if (existing && !existing.settled) return attach<T>(key, existing, signal);

  const controller = new AbortController();
  const record: Inflight = {
    promise: Promise.resolve(),
    controller,
    refs: 0,
    settled: false,
    abortTimer: null,
  };
  const shared = (async (): Promise<T> => {
    try {
      const value = await fetcher(controller.signal);
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } finally {
      record.settled = true;
      if (inflight.get(key) === record) inflight.delete(key);
    }
  })();
  record.promise = shared;
  inflight.set(key, record);
  return attach<T>(key, record, signal);
}
