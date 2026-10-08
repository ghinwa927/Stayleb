"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type FocusEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  MapPin,
  CalendarDays,
  Users,
  Search,
  Mountain,
  Waves,
  Castle,
  Trees,
  ChevronDown,
} from "lucide-react";
import {
  createTimeline,
  createFlowTimeline,
  sceneAt,
  documentPosition,
  cardProgress,
  searchCardProgress,
} from "./timeline";
import { Scene, Scenery } from "./Cinema";
import { CinemaNav, CinemaFooter } from "./CinemaChrome";
import { cinemaFontVariables } from "./fonts";
import { toStayCard } from "./adapters";
import {
  getCachedSearch,
  searchProperties,
  type PropertySearchResponse,
} from "@/services/properties";
import { isAbortError } from "@/lib/request-cache";
import {
  propertySearchQuery,
  searchValidation,
} from "@/lib/property-search";
import { useAmenities } from "@/hooks/useAmenities";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { LocalImage } from "@/components/ui/LocalImage";
import { AiSearchPanel } from "./AiSearchPanel";

const destinations = [
  { location: 'Batroun', title: 'Batroun', eyebrow: 'Coast & Souks', description: 'Old souks and Mediterranean coastal walks.', image: '/images/stayleb-12.jpg', icon: Waves },
  { location: 'Faraya', title: 'Faraya & Mzaar', eyebrow: 'Slopes & Peaks', description: 'Mountain scenery and snowy winter escapes.', image: '/images/stayleb-13.jpg', icon: Mountain },
  { location: 'Jbeil', title: 'Jbeil / Byblos', eyebrow: 'Historic Port', description: 'Explore the old port and historic streets.', image: '/images/stayleb-14.jpg', icon: Castle },
  { location: 'Chouf', title: 'Chouf & Barouk', eyebrow: 'Cedar Country', description: 'Cedar forest walks and mountain villages.', image: '/images/stayleb-15.jpg', icon: Trees },
];

function StayCardImage({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  if (!imageUrl) {
    return <div className="card-photo-fallback" role="img" aria-label={`${title} (photo unavailable)`}>Photo unavailable</div>;
  }
  return (
    <LocalImage
      src={imageUrl}
      alt={title}
      loading="lazy"
    />
  );
}

// Shared one-panel stepping for Enter-key navigation through the tall,
// internally-browsed scenes (featured stays, AI results): advance about one
// panel per press, then hand off to the following scene. Extracted so both
// browse regions behave identically.
function stepListProgress(
  p: number,
  browse: readonly [number, number],
  travel: number,
  panel: number,
  distance: number,
  stayScene: number,
  exitScene: number,
  exitProgress: number,
): { scene: number; progress: number } {
  const EPS = 4 / Math.max(1, distance);
  const [browseStart, browseEnd] = browse;
  const overlap = Math.min(64, Math.max(16, panel * 0.12));
  const step = Math.max(24, panel - overlap);
  const clamped = Math.max(
    0,
    Math.min(1, (p - browseStart) / (browseEnd - browseStart)),
  );
  const currentOffset = travel * clamped;
  const targetOffset = Math.min(currentOffset + step, travel);
  let target: number;
  if (travel - targetOffset <= 0.5) {
    target = browseEnd;
  } else {
    target =
      browseStart +
      (targetOffset / travel) * (browseEnd - browseStart);
    if (target <= p + EPS * 0.5) {
      target = Math.min(
        p + step / 0.85 / distance,
        browseEnd,
      );
    }
  }
  if (target <= p + 1e-6) {
    return { scene: exitScene, progress: exitProgress };
  }
  return { scene: stayScene, progress: target };
}

// Shared page-stepping for Enter-key navigation through tall static-mode
// sections: page down within the section, then hand off to the next one.
function stepTallSection(
  y: number,
  vh: number,
  bottom: number,
  stayScene: number,
  exitScene: number,
): { scene: number; top?: number } {
  const step = Math.max(120, vh * 0.9);
  const remaining = bottom - (y + vh);
  if (remaining <= step) {
    const target = bottom - vh + 16;
    if (target <= y + 8) {
      return { scene: exitScene };
    }
    return { scene: stayScene, top: target };
  }
  return { scene: stayScene, top: y + step };
}

export function CinematicHome() {
  const router = useRouter();
  const track = useRef<HTMLElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  const cardWindow = useRef<HTMLDivElement>(null);
  const aiCards = useRef<HTMLDivElement>(null);
  const aiWindow = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Mount gate (NOT a viewport gate): server and first client render are
  // identically static, so hydration can never diverge. After mount the full
  // cinematic experience enables on every screen size; only an explicit
  // reduced-motion preference keeps the static fallback.
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [viewport, setViewport] = useState(800);
  const [travel, setTravel] = useState(0);
  const [aiTravel, setAiTravel] = useState(0);
  const [flowGeom, setFlowGeom] = useState<{
    total: number;
    scenes: { top: number; height: number }[];
  } | null>(null);
  const [navigation, setNavigation] = useState<{
    scene: number;
    progress?: number;
    top?: number;
    request: number;
  } | null>(null);
  const enterBusy = useRef(false);
  const enterTimer = useRef<number | null>(null);
  const animated = mounted && !reduced;
  // Auth resolves after mount ("loading" on server and first client render,
  // so gated UI never diverges during hydration).
  const authStatus = useAuthStatus();

  // Featured stays: same backend request the old homepage issued
  // (newest first page of eight), with the same cache, dedup and retry.
  const [region, setRegion] = useState('');
  const params = { location: region || undefined, page: 1, page_size: 8, sort: 'newest' as const };
  const [result, setResult] = useState<PropertySearchResponse | null>(() => getCachedSearch(params));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Monotonic id so a slow earlier response can never overwrite newer results.
  const requestId = useRef(0);
  // Set by retry() so only the retry-triggered fetch bypasses the cache.
  const forceNextRef = useRef(false);
  // Latest result for the effect below (kept outside deps to avoid refetch loops).
  const resultRef = useRef(result);
  useEffect(() => {
    resultRef.current = result;
  });
  useEffect(() => {
    const id = ++requestId.current;
    // Strict Mode runs this effect twice in development; both runs share one
    // network request through the cached fetcher, and only the latest
    // request id may write state. Scrolling never touches this effect.
    const forceRefresh = forceNextRef.current;
    forceNextRef.current = false;
    let cancelled = false;
    const controller = new AbortController();
    const hadData = resultRef.current !== null;
    if (hadData) {
      setRefreshing(true);
      setRefreshFailed(false);
      setError(false);
    }
    searchProperties(params, { signal: controller.signal, forceRefresh }).then(data => {
      if (!cancelled && id === requestId.current) {
        resultRef.current = data;
        setResult(data);
        setRefreshing(false);
        setRefreshFailed(false);
        setError(false);
      }
    }).catch((fetchError: unknown) => {
      if (cancelled || isAbortError(fetchError)) return;
      if (id !== requestId.current) return;
      if (resultRef.current) {
        setRefreshing(false);
        setRefreshFailed(true);
      } else {
        setError(true);
      }
    });
    return () => { cancelled = true; controller.abort(); };
    // params is a fresh object each render; compare by serialized identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, attempt]);
  const retry = () => {
    forceNextRef.current = true;
    setError(false);
    setRefreshFailed(false);
    if (!resultRef.current) setResult(null);
    setAttempt(value => value + 1);
  };

  // Stacked-flow layout on narrow viewports (normal document flow,
  // content-sized scenes) vs pinned track on wide screens. Independent of
  // animation: reduced-motion keeps the static stacking everywhere.
  const [narrow, setNarrow] = useState(false);
  // Measured-geometry math whenever the layout stacks (narrow screens, or
  // reduced-motion static mode) — this also corrects navigation math there.
  const useFlowTimeline = narrow || !animated;
  const timeline = useMemo(
    () =>
      useFlowTimeline && flowGeom
        ? createFlowTimeline(viewport, flowGeom.total, flowGeom.scenes)
        : createTimeline(viewport, travel, aiTravel),
    [viewport, travel, aiTravel, useFlowTimeline, flowGeom],
  );
  // Viewport height drives every timeline distance, so it tracks the visual
  // viewport (mobile address-bar show/hide), window resizes, and explicit
  // orientation changes. Same values feed both modes; static mode ignores
  // them for motion but they cost nothing to keep fresh.
  const viewportHeight = () =>
    Math.max(1, Math.round(window.visualViewport?.height ?? window.innerHeight));
  useEffect(() => {
    const sync = () => {
      setMounted(true);
      setViewport(viewportHeight());
    };
    const syncNarrow = () => setNarrow(matchMedia("(max-width: 859px)").matches);
    sync();
    syncNarrow();
    const narrowQuery = matchMedia("(max-width: 859px)");
    const onNarrowChange = () => setNarrow(narrowQuery.matches);
    narrowQuery.addEventListener("change", onNarrowChange);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    return () => {
      narrowQuery.removeEventListener("change", onNarrowChange);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      vv?.removeEventListener("resize", sync);
    };
  }, []);
  // Flow geometry is measured from the real stacked layout (scene tops and
  // heights relative to the track) whenever it is in use, so fades, stops
  // and navigation always match visible content — after API results, image
  // and font loads, rotation, or viewport changes. Observing the track
  // covers all of those without extra dependencies.
  useEffect(() => {
    if (!useFlowTimeline) return;
    const order = ["hero", "stays", "destinations", "search", "plan"];
    const measure = () => {
      const trackEl = track.current;
      if (!trackEl) return;
      const trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
      const scenes: { top: number; height: number }[] = [];
      for (const id of order) {
        const el = document.getElementById(id);
        if (!(el instanceof HTMLElement) || !trackEl.contains(el)) return;
        const rect = el.getBoundingClientRect();
        scenes.push({
          top: rect.top + window.scrollY - trackTop,
          height: rect.height,
        });
      }
      setFlowGeom({ total: trackEl.scrollHeight, scenes });
    };
    measure();
    const trackEl = track.current;
    if (!trackEl) return;
    const observer = new ResizeObserver(measure);
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [useFlowTimeline, viewport]);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 36,
    mass: 0.65,
  });
  useMotionValueEvent(progress, "change", (value) => {
    const scene = sceneAt(value, timeline);
    if (scene !== activeRef.current) {
      activeRef.current = scene;
      setActive(scene);
    }
  });
  const listY = useTransform(progress, (value) => {
    const [start, end] = timeline.browse;
    return end === start
      ? 0
      : -travel * Math.max(0, Math.min(1, (value - start) / (end - start)));
  });
  const aiY = useTransform(progress, (value) => {
    const [start, end] = timeline.aiBrowse;
    return end === start
      ? 0
      : -aiTravel * Math.max(0, Math.min(1, (value - start) / (end - start)));
  });
  function navigate(scene: number, progress?: number, top?: number) {
    setNavigation((previous) => ({
      scene,
      progress,
      top,
      request: (previous?.request || 0) + 1,
    }));
  }
  useEffect(
    () => () => {
      if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
    },
    [],
  );
  // Real amenity catalog (id-backed chips bound to the search request).
  const amenities = useAmenities();
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  function search(event: FormEvent<HTMLFormElement>) {
    // Same contract as the existing search form: backend-validated params
    // pushed to /search, where server-side filtering runs.
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {
      location: String(form.get('location') || '').trim() || undefined,
      check_in: String(form.get('check_in') || '') || undefined,
      check_out: String(form.get('check_out') || '') || undefined,
      guests: form.get('guests') ? Number(form.get('guests')) : undefined,
    };
    const message = searchValidation(next);
    setSearchError(message);
    if (message) return;
    router.push(`/search?${propertySearchQuery({ ...next, amenity_ids: selectedAmenities })}`);
  }
  // Timeline travel follows actually rendered content: recalculated when API
  // results, loading/error/empty states, or the viewport change, so every
  // displayed property stays reachable before the coastal transition.
  const contentKey = result
    ? `items-${result.items.length}${refreshing ? "-refreshing" : ""}`
    : error ? "error" : "loading";
  useEffect(() => {
    const measure = () =>
      setTravel(
        Math.max(
          0,
          (cards.current?.scrollHeight || 0) -
            (cardWindow.current?.clientHeight || 0),
        ),
      );
    const observer = new ResizeObserver(measure);
    if (cards.current) observer.observe(cards.current);
    if (cardWindow.current) observer.observe(cardWindow.current);
    measure();
    return () => observer.disconnect();
  }, [contentKey, animated]);
  useEffect(() => {
    // AI results arrive through explicit user search and change size with
    // loading/error/results states and image loads: the resize observer
    // below recalculates travel continuously, so no content key is needed.
    const measureAi = () =>
      setAiTravel(
        Math.max(
          0,
          (aiCards.current?.scrollHeight || 0) -
            (aiWindow.current?.clientHeight || 0),
        ),
      );
    const observer = new ResizeObserver(measureAi);
    if (aiCards.current) observer.observe(aiCards.current);
    if (aiWindow.current) observer.observe(aiWindow.current);
    measureAi();
    return () => observer.disconnect();
  }, [animated]);
  useEffect(() => {
    if (!navigation) return;
    // Run after filtering/layout measurement so destinations never use the old track length.
    const frame = requestAnimationFrame(() => {
      const ids = ["hero", "stays", "destinations", "plan"];
      const current = navigation;
      setNavigation(null);
      if (current.scene === 5) {
        document
          .getElementById("about")
          ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
        return;
      }
      const element = track.current;
      if (!element) return;
      if (!animated) {
        if (current.top !== undefined) {
          window.scrollTo({
            top: current.top,
            behavior: reduced ? "instant" : "smooth",
          });
          return;
        }
        document
          .getElementById(ids[current.scene])
          ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
        return;
      }
      const top = element.getBoundingClientRect().top + window.scrollY;
      const target = current.progress ?? timeline.stops[current.scene];
      window.scrollTo({
        top: documentPosition(top, timeline, target),
        behavior: reduced ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [navigation, timeline, animated, reduced]);
  useEffect(() => {
    function currentProgress(): number | null {
      const element = track.current;
      if (!element || timeline.distance <= 0) return null;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const raw = (window.scrollY - top) / timeline.distance;
      return Math.max(0, Math.min(1, raw));
    }
    function armLock() {
      enterBusy.current = true;
      if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
      enterTimer.current = window.setTimeout(
        () => {
          enterBusy.current = false;
          enterTimer.current = null;
        },
        reduced ? 250 : 950,
      );
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat) return;
      if (enterBusy.current) {
        event.preventDefault();
        return;
      }
      const candidates: Array<HTMLElement | null> = [
        event.target as HTMLElement | null,
        document.activeElement as HTMLElement | null,
      ];
      for (const candidate of candidates) {
        if (
          candidate instanceof HTMLElement &&
          (candidate.closest(
            "input, select, textarea, button, a, [contenteditable]",
          ) ||
            candidate.isContentEditable)
        ) {
          return;
        }
      }
      if (document.querySelector("dialog[open]")) return;
      const footerEl = document.getElementById("about");
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) return;
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        if (
          rect.top < window.innerHeight * 0.55 &&
          rect.bottom > window.innerHeight * 0.4
        ) {
          return;
        }
      }
      if (animated) {
        const p = currentProgress();
        if (p === null) return;
        const EPS = 4 / Math.max(1, timeline.distance);
        const [browseStart, browseEnd] = timeline.browse;
        const [aiBrowseStart, aiBrowseEnd] = timeline.aiBrowse;
        const stops = timeline.stops;
        let nextScene: number | null = null;
        let nextProgress: number | undefined;
        const hasBrowse =
          timeline.travel > 1 && browseEnd > browseStart + EPS;
        const hasAiBrowse =
          timeline.aiTravel > 1 && aiBrowseEnd > aiBrowseStart + EPS;
        if (p < stops[1] - EPS) {
          nextScene = 1;
          nextProgress = stops[1];
        } else if (hasBrowse && p < browseEnd - EPS) {
          const stepped = stepListProgress(
            p,
            [browseStart, browseEnd],
            timeline.travel,
            cardWindow.current?.clientHeight || window.innerHeight * 0.5,
            timeline.distance,
            1,
            2,
            stops[2],
          );
          nextScene = stepped.scene;
          nextProgress = stepped.progress;
        } else if (p < stops[2] - EPS) {
          nextScene = 2;
          nextProgress = stops[2];
        } else if (hasAiBrowse && p < aiBrowseEnd - EPS) {
          const stepped = stepListProgress(
            p,
            [aiBrowseStart, aiBrowseEnd],
            timeline.aiTravel,
            aiWindow.current?.clientHeight || window.innerHeight * 0.5,
            timeline.distance,
            3,
            4,
            stops[4],
          );
          nextScene = stepped.scene;
          nextProgress = stepped.progress;
        } else if (p < stops[3] - EPS) {
          nextScene = 3;
          nextProgress = stops[3];
        } else if (p < stops[4] - EPS) {
          nextScene = 4;
          nextProgress = stops[4];
        } else {
          nextScene = 5;
          nextProgress = undefined;
        }
        if (nextScene === null) return;
        event.preventDefault();
        armLock();
        setNavigation((previous) => ({
          scene: nextScene as number,
          progress: nextProgress,
          request: (previous?.request || 0) + 1,
        }));
      } else {
        const staysEl = document.getElementById("stays");
        const destEl = document.getElementById("destinations");
        const searchEl = document.getElementById("search");
        const planEl = document.getElementById("plan");
        if (!staysEl || !destEl || !searchEl || !planEl || !footerEl) return;
        const y = window.scrollY;
        const vh = window.innerHeight;
        const topOf = (el: HTMLElement) =>
          el.getBoundingClientRect().top + y;
        const staysTop = topOf(staysEl);
        const staysBottom = staysTop + staysEl.offsetHeight;
        const destTop = topOf(destEl);
        const searchTop = topOf(searchEl);
        const searchBottom = searchTop + searchEl.offsetHeight;
        const planTop = topOf(planEl);
        const footerTop = topOf(footerEl);
        let nextScene: number | null = null;
        let nextTop: number | undefined;
        const stepTo = (stepped: { scene: number; top?: number }) => {
          nextScene = stepped.scene;
          nextTop = stepped.top;
        };
        if (y < staysTop - 8) {
          nextScene = 1;
        } else if (y + vh < staysBottom - 8) {
          stepTo(stepTallSection(y, vh, staysBottom, 1, 2));
        } else if (y < destTop - 8) {
          nextScene = 2;
        } else if (y < searchTop - 8) {
          nextScene = 3;
        } else if (y + vh < searchBottom - 8) {
          stepTo(stepTallSection(y, vh, searchBottom, 3, 4));
        } else if (y < planTop - 8) {
          nextScene = 4;
        } else if (y < footerTop - 8) {
          nextScene = 5;
        } else {
          return;
        }
        if (nextScene === null) return;
        event.preventDefault();
        armLock();
        setNavigation((previous) => ({
          scene: nextScene as number,
          top: nextTop,
          request: (previous?.request || 0) + 1,
        }));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timeline, animated, reduced]);
  function focusStay(event: FocusEvent<HTMLElement>) {
    if (!animated || !cards.current || !cardWindow.current || !track.current)
      return;
    const card = event.currentTarget;
    const windowRect = cardWindow.current.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    cardWindow.current.scrollTop = 0;
    if (rect.top >= windowRect.top && rect.bottom <= windowRect.bottom) return;
    const top = track.current.getBoundingClientRect().top + window.scrollY;
    const target = cardProgress(card.offsetTop, timeline);
    // Keyboard focus must never land on a clipped card or wait for a camera spring.
    progress.jump(target);
    window.scrollTo({
      top: documentPosition(top, timeline, target),
      behavior: "instant",
    });
  }
  function focusAiResult(event: FocusEvent<HTMLElement>) {
    if (!animated || !aiCards.current || !aiWindow.current || !track.current)
      return;
    // Result cards render inside the reused search component: resolve the
    // focused card from the bubbled event instead of per-card handlers.
    const target = event.target instanceof HTMLElement
      ? event.target.closest("article")
      : null;
    if (!(target instanceof HTMLElement) || !aiCards.current.contains(target)) return;
    const card = target;
    const windowRect = aiWindow.current.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    aiWindow.current.scrollTop = 0;
    if (rect.top >= windowRect.top && rect.bottom <= windowRect.bottom) return;
    const top = track.current.getBoundingClientRect().top + window.scrollY;
    const progressTarget = searchCardProgress(card.offsetTop, timeline);
    // Keyboard focus must never land on a clipped result or wait for a camera spring.
    progress.jump(progressTarget);
    window.scrollTo({
      top: documentPosition(top, timeline, progressTarget),
      behavior: "instant",
    });
  }
  const goToStays = () => navigate(1);
  function filterRegion(value: string) {
    setRegion(value);
    goToStays();
  }
  const today = new Date().toLocaleDateString("en-CA");
  const stays = result?.items ?? [];
  // Narrow + animated viewports stack scenes in normal flow (cinema-flow);
  // reduced motion keeps the static stacking. The pinned inline track height
  // only applies to the wide animated regime.
  const rootClass = !animated
    ? "cinema-home cinema-static"
    : narrow
      ? "cinema-home cinema-mode cinema-flow"
      : "cinema-home cinema-mode";
  return (
    <div className={`${rootClass} ${cinemaFontVariables}`}>
      <CinemaNav onNavigate={navigate} />
      <main
        ref={track}
        className="film-track"
        style={animated && !narrow ? { height: timeline.trackHeight } : undefined}
      >
        <div className="film-viewport">
          <Scenery
            progress={progress}
            animated={animated}
            timeline={timeline}
          />
          <Scene
            id="hero"
            className="hero"
            progress={progress}
            range={timeline.ranges[0]}
            active={active === 0}
            animated={animated}
          >
            <div className="hero-content">
              <motion.p
                className="eyebrow hero-eyebrow"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span />
                LEBANESE CHALET ESCAPES <b>—</b> From Mountain Peaks to the
                Coast
              </motion.p>
              <motion.h1
                id="hero-title"
                initial={reduced ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
              >
                Authentic Lebanese <br />
                Chalets &{" "}
                <em>
                  Mountain
                  <br className="desktop-break" /> Getaways.
                </em>
              </motion.h1>
              <motion.p
                className="hero-description"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.25 }}
              >
                Find your next escape, from snowy Faraya peaks
                <br className="desktop-break" /> to sunlit Batroun shores.
              </motion.p>
            </div>
            <div className="scene-caption">
              <span className="scene-line" />
              <span>01 / THE MOUNTAINS</span>
              <small>Faraya, Lebanon</small>
            </div>
            <a
              href="#stays"
              className="scroll-cue"
              onClick={(e) => {
                e.preventDefault();
                navigate(1);
              }}
            >
              <span>SCROLL TO EXPLORE</span>
              <span className="enter-hint">Scroll or press Enter to explore</span>
              <ArrowDown size={17} />
            </a>
            <form className="search-panel" onSubmit={search}>
              <div className="search-topline">
                <span>Find your stay</span>
                <span>Somewhere you’ll want to stay a little longer.</span>
              </div>
              <div className="search-fields">
                <label className="search-field">
                  <MapPin />
                  <span>
                    Destination
                    <input
                      aria-label="Destination"
                      name="location"
                      placeholder="Anywhere in Lebanon"
                      defaultValue=""
                    />
                  </span>
                  <ChevronDown size={14} />
                </label>
                <label className="search-field">
                  <CalendarDays />
                  <span>
                    Check-in
                    <input
                      aria-label="Check-in"
                      name="check_in"
                      type="date"
                      min={today}
                      defaultValue=""
                    />
                  </span>
                </label>
                <label className="search-field">
                  <CalendarDays />
                  <span>
                    Check-out
                    <input
                      aria-label="Check-out"
                      name="check_out"
                      type="date"
                      min={today}
                      defaultValue=""
                    />
                  </span>
                </label>
                <label className="search-field guests">
                  <Users />
                  <span>
                    Guests
                    <input
                      aria-label="Guests"
                      name="guests"
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Any"
                      defaultValue=""
                    />
                  </span>
                </label>
                <button className="search-button" type="submit">
                  <Search size={17} />
                  Search stays
                  <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="amenity-row">
                <span>AMENITIES</span>
                {amenities.loading ? (
                  <span role="status" className="amenity-status">Loading amenities…</span>
                ) : amenities.error ? (
                  <span role="alert" className="amenity-status">Amenities unavailable. <button type="button" onClick={amenities.retry}>Try again</button></span>
                ) : amenities.items.length === 0 ? (
                  <span className="amenity-status">No amenities to filter by yet.</span>
                ) : (
                  amenities.items.slice(0, 8).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={selectedAmenities.includes(item.id) ? "chip selected" : "chip"}
                      aria-pressed={selectedAmenities.includes(item.id)}
                      onClick={() =>
                        setSelectedAmenities((current) =>
                          current.includes(item.id)
                            ? current.filter((id) => id !== item.id)
                            : [...current, item.id],
                        )
                      }
                    >
                      {item.name}
                    </button>
                  ))
                )}
              </div>
              {searchError && (
                <p className="form-error" role="alert">
                  {searchError}
                </p>
              )}
            </form>
          </Scene>
          <Scene
            id="stays"
            className="stays section-shell"
            progress={progress}
            range={timeline.ranges[1]}
            active={active === 1}
            animated={animated}
          >
            <div className="stays-glass">
              <div className="section-heading">
                <div>
                  <p className="eyebrow teal">01 / EXPLORE STAYS</p>
                  <h2>
                    Find Your <em>Lebanese Getaway</em>
                  </h2>
                </div>
                <div
                  className="region-tabs"
                  aria-label="Filter stays by region"
                >
                  {([["Faraya", "Faraya"], ["Batroun", "Batroun"], ["", "All regions"]] as const).map(([value, label]) => (
                    <button
                      className={region === value ? "active" : ""}
                      aria-pressed={region === value}
                      onClick={() => filterRegion(value)}
                      key={value || "all"}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {(region !== "" ) && result && (
                <p className="results-note" role="status">
                  {result.total} {result.total === 1 ? "stay" : "stays"}{" "}
                  in {region}{" "}
                  <button onClick={() => filterRegion("")}>
                    Reset filters
                  </button>
                </p>
              )}
              <div className="stay-window" ref={cardWindow}>
                <motion.div
                  className="stay-grid"
                  ref={cards}
                  style={animated ? { y: listY } : undefined}
                >
                  {error ? (
                    <div role="alert" className="stay-message">
                      <p>We couldn’t load stays right now.</p>
                      <button className="outline-button" onClick={retry}>Try again</button>
                    </div>
                  ) : !result ? (
                    <div role="status" aria-label="Loading stays" className="stay-loading">
                      {[0, 1, 2, 3].map((id) => (
                        <div key={id} className="stay-card stay-skeleton" aria-hidden="true">
                          <div className="card-image skeleton-block" />
                          <div className="card-content">
                            <div className="skeleton-line" />
                            <div className="skeleton-line short" />
                            <div className="skeleton-line" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stays.length === 0 && !refreshing ? (
                    <div className="empty-state">
                      <Mountain />
                      <h3>No stays to show here yet</h3>
                      <p>Explore another region or browse all stays.</p>
                      <Link className="outline-button" href="/search">Browse stays</Link>
                    </div>
                  ) : (
                    <>
                      {refreshing && (
                        <p role="status" className="refresh-note">Updating stays…</p>
                      )}
                      {refreshFailed && !refreshing && (
                        <p role="alert" className="refresh-note">
                          Couldn’t refresh stays.{" "}
                          <button onClick={retry}>Try again</button>
                        </p>
                      )}
                      {stays.map((property) => {
                        const stay = toStayCard(property);
                        return (
                          <article
                            className="stay-card"
                            key={stay.id}
                            onFocusCapture={focusStay}
                          >
                            <div className="card-image">
                              <Link
                                className="card-link"
                                href={stay.href}
                                aria-label={`View ${stay.title}`}
                              >
                                <StayCardImage imageUrl={stay.imageUrl} title={stay.title} />
                              </Link>
                              <span className="photo-label">
                                <MapPin size={11} />
                                {stay.region}
                              </span>
                            </div>
                            <div className="card-content">
                              <p className="property-type">{stay.typeLabel}</p>
                              <h3>
                                <Link href={stay.href}>{stay.title}</Link>
                              </h3>
                              <p className="capacity">{stay.capacityLine}</p>
                              <div className="card-amenities">
                                {stay.amenityNames.map((name) => (
                                  <span key={name}>{name}</span>
                                ))}
                              </div>
                              <div className="card-bottom">
                                <div>
                                  <p>
                                    <strong>{stay.priceLabel}</strong>
                                    <span> / night</span>
                                  </p>
                                  <small>{stay.priceNote}</small>
                                </div>
                                <Link
                                  className="card-arrow"
                                  aria-label={`Explore ${stay.title}`}
                                  href={stay.href}
                                >
                                  <ArrowUpRight size={20} />
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              </div>
              {!error && result && stays.length > 0 && (
                <div className="center">
                  <Link
                    className="outline-button"
                    href={`/search?${propertySearchQuery({ location: region || undefined, sort: 'newest' })}`}
                  >
                    Explore all stays <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
            <div className="stays-scene-caption">
              <span>02 / DISCOVER YOUR STAY</span>
              <p>
                A little closer
                <br />
                to <em>somewhere else.</em>
              </p>
            </div>
          </Scene>
          <Scene
            id="destinations"
            className="destinations"
            progress={progress}
            range={timeline.ranges[2]}
            active={active === 2}
            animated={animated}
          >
            <div className="destination-inner section-shell">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">02 / DESTINATIONS</p>
                  <h2>
                    Explore <em>Lebanese Regions</em>
                  </h2>
                  <p className="section-description">
                    From the Mediterranean coastline to mountain villages.
                  </p>
                </div>
                <span className="destination-coordinate">
                  34°15′ N &nbsp; 35°39′ E<br />
                  <small>THE MEDITERRANEAN COAST</small>
                </span>
              </div>
              <div className="destination-grid">
                {destinations.map(({ icon: DestinationIcon, ...destination }) => (
                  <Link
                    className="destination-card"
                    key={destination.location}
                    href={`/search?${propertySearchQuery({ location: destination.location })}`}
                  >
                    <LocalImage
                      src={destination.image}
                      alt={`${destination.title} landscape in Lebanon`}
                      loading="lazy"
                    />
                    <div className="destination-text">
                      <span className="region-label">
                        <DestinationIcon size={15} /> {destination.eyebrow}
                      </span>
                      <h3>{destination.title}</h3>
                      <p>{destination.description}</p>
                      <span className="destination-link">
                        Explore stays <ArrowUpRight size={19} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Scene>
          <Scene
            id="search"
            className="ai-search section-shell"
            progress={progress}
            range={timeline.ranges[3]}
            active={active === 3}
            animated={animated}
          >
            <div className="ai-glass">
              <div className="section-heading">
                <div>
                  <p className="eyebrow teal">03 / AI SEARCH</p>
                  <h2>
                    Describe it, <em>we&apos;ll find it</em>
                  </h2>
                  <p className="section-description">
                    Tell us the vibe, area and group size — StayLeb AI matches
                    you with verified properties only.
                  </p>
                </div>
              </div>
              <div className="ai-window" ref={aiWindow}>
                <motion.div
                  className="ai-results"
                  ref={aiCards}
                  style={animated ? { y: aiY } : undefined}
                  onFocusCapture={focusAiResult}
                >
                  {authStatus === "loading" ? (
                    <div className="ai-auth-loading" role="status" aria-label="Loading AI search">
                      <div className="ai-auth-pulse" aria-hidden="true" />
                      <p>Loading AI search…</p>
                    </div>
                  ) : authStatus === "authenticated" ? (
                    <AiSearchPanel />
                  ) : (
                    <div className="ai-login-prompt">
                      <p>
                        Sign in to describe your ideal stay in your own words —
                        “chalet in Faraya with fireplace for 4 guests” — and let
                        AI find the perfect match.
                      </p>
                      <Link className="solid-button" href="/auth/login">
                        Log in to use AI search <ArrowRight size={17} />
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="ai-scene-caption">
              <span>03 / ASK STAYLEB AI</span>
              <p>
                Say the trip,
                <br />
                we&apos;ll find <em>the stay.</em>
              </p>
            </div>
          </Scene>
          <Scene
            id="plan"
            className="plan section-shell"
            progress={progress}
            range={timeline.ranges[4]}
            active={active === 4}
            animated={animated}
          >
            <span id="guarantee" className="cinema-anchor" aria-hidden="true" />
            <div className="plan-copy">
              <p className="eyebrow teal">Plan Your Stay with StayLeb</p>
              <h2>
                Coastal weekends.
                <br />
                <em>Mountain mornings.</em>
              </h2>
              <p>
                Choose a destination, compare properties and find the stay that
                suits your plans. Review the amenities, house rules and seasonal
                prices before booking.
              </p>
              <div className="plan-icons">
                <span>
                  <Waves size={18} />
                  The coast is calling.
                </span>
                <span>
                  <Mountain size={18} />
                  So are the mountains.
                </span>
              </div>
            </div>
            <div className="plan-card">
              <span className="plan-card-icon">
                <ArrowUpRight size={30} />
              </span>
              <h3>
                Your next getaway
                <br />
                starts here
              </h3>
              <p>
                Search with your dates and guest count to explore stays for your
                trip.
              </p>
              <Link href="/search" className="solid-button">
                Explore stays <ArrowRight size={17} />
              </Link>
            </div>
          </Scene>
          <nav className="film-navigation" aria-label="Scene navigation">
            {["Mountains", "Stays", "Coast", "AI Search", "Your escape"].map((label, i) => (
              <button
                key={label}
                aria-current={active === i ? "step" : undefined}
                onClick={() => navigate(i)}
              >
                <span /> <small>0{i + 1}</small> {label}
              </button>
            ))}
          </nav>
          <motion.div className="film-progress" style={{ scaleX: progress }} />
        </div>
      </main>
      <CinemaFooter onNavigate={navigate} />
    </div>
  );
}
