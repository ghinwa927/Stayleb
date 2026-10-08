export type SceneRange = [number, number, number, number];
export type Timeline = ReturnType<typeof createTimeline>;

/** Distances are document pixels. Card travel is 0.85px per scroll pixel. */
export function createTimeline(viewportHeight: number, cardTravel: number, aiTravel = 0) {
  const viewport = Math.max(1, viewportHeight);
  const travel = Math.max(0, cardTravel);
  const aiListTravel = Math.max(0, aiTravel);
  const transition = viewport * 0.65;
  const mountainEnd = viewport * 0.65;
  const staysArrival = mountainEnd + transition;
  const browseStart = staysArrival + viewport * 0.35;
  const browseEnd = browseStart + travel / 0.85;
  const staysExit = browseEnd + viewport * 0.45;
  const coastArrival = staysExit + transition;
  const coastExit = coastArrival + viewport * 0.9;
  const searchArrival = coastExit + transition;
  const searchBrowseStart = searchArrival + viewport * 0.35;
  const searchBrowseEnd = searchBrowseStart + aiListTravel / 0.85;
  const searchExit = searchBrowseEnd + viewport * 0.45;
  const planArrival = searchExit + transition;
  const distance = planArrival + viewport * 0.55;
  const p = (pixels: number) => pixels / distance;
  // Foreground panels never overlap: dissolve out, then dissolve in.
  const ranges: SceneRange[] = [
    [-0.01, 0, p(mountainEnd), p(mountainEnd + transition * 0.45)],
    [p(mountainEnd + transition * 0.55), p(staysArrival), p(staysExit), p(staysExit + transition * 0.45)],
    [p(staysExit + transition * 0.55), p(coastArrival), p(coastExit), p(coastExit + transition * 0.45)],
    [p(coastExit + transition * 0.55), p(searchArrival), p(searchExit), p(searchExit + transition * 0.45)],
    [p(searchExit + transition * 0.55), p(planArrival), 1, 1.01],
  ];
  return {
    distance, trackHeight: distance + viewport, travel, ranges,
    browse: [p(browseStart), p(browseEnd)] as [number, number],
    aiTravel: aiListTravel,
    aiBrowse: [p(searchBrowseStart), p(searchBrowseEnd)] as [number, number],
    stops: [0, p(staysArrival + viewport * 0.1), p(coastArrival + viewport * 0.15), p(searchArrival + viewport * 0.15), p(planArrival + viewport * 0.1)],
    switches: [p(mountainEnd + transition * 0.5), p(staysExit + transition * 0.5), p(coastExit + transition * 0.5), p(searchExit + transition * 0.5)],
    mountainTransition: [p(mountainEnd), p(staysArrival)] as [number, number],
    coastTransition: [p(staysExit), p(coastArrival)] as [number, number],
  };
}

export function sceneAt(progress: number, timeline: Timeline) {
  const index = timeline.switches.findIndex(stop => progress < stop);
  return index === -1 ? timeline.switches.length : index;
}
export function documentPosition(trackTop: number, timeline: Timeline, progress: number) {
  return trackTop + timeline.distance * Math.max(0, Math.min(1, progress));
}
export function cardProgress(offset: number, timeline: Timeline) {
  if (timeline.travel === 0) return timeline.stops[1];
  const fraction = Math.max(0, Math.min(1, offset / timeline.travel));
  return timeline.browse[0] + (timeline.browse[1] - timeline.browse[0]) * fraction;
}
export function searchCardProgress(offset: number, timeline: Timeline) {
  if (timeline.aiTravel === 0) return timeline.stops[3];
  const fraction = Math.max(0, Math.min(1, offset / timeline.aiTravel));
  return timeline.aiBrowse[0] + (timeline.aiBrowse[1] - timeline.aiBrowse[0]) * fraction;
}

export type SceneGeometry = { top: number; height: number };

/**
 * Stacked-flow regime for narrow viewports (and anywhere the layout stacks,
 * e.g. reduced-motion): scenes sit in normal document flow, sized by their
 * content, and the camera becomes fades/slides driven by measured geometry
 * instead of a pinned track. Returns the same Timeline shape (zeroed list
 * travel, collapsed browse windows), so navigation, Enter-key flow, focus
 * helpers and the scenery transitions keep working unchanged.
 */
export function createFlowTimeline(
  viewportHeight: number,
  trackHeight: number,
  scenes: SceneGeometry[],
): Timeline {
  const viewport = Math.max(1, viewportHeight);
  const total = Math.max(1, trackHeight);
  const distance = Math.max(1, total - viewport);
  const ranges: SceneRange[] = scenes.map((s) => {
    const a = (s.top - viewport * 0.9) / distance;
    const d = (s.top + s.height - viewport * 0.1) / distance;
    const f = Math.min((d - a) / 2, (viewport * 0.45) / distance);
    let b = a + f;
    let c = d - f;
    if (b > c) {
      const m = (a + d) / 2;
      b = m;
      c = m;
    }
    const range: SceneRange = [a, b, c, d];
    return range;
  });
  ranges[0][0] = -0.01;
  ranges[0][1] = 0;
  const last = ranges.length - 1;
  ranges[last][3] = 1.01;
  if (ranges[last][2] > ranges[last][3]) ranges[last][2] = ranges[last][3];
  const stops = scenes.map((s, i) => (i === 0 ? 0 : Math.min(1, Math.max(0, s.top / distance))));
  const switches = stops.slice(1).map((s, i) => (stops[i] + s) / 2);
  const z = 0;
  return {
    distance,
    trackHeight: total,
    travel: z,
    ranges,
    browse: [z, z] as [number, number],
    aiTravel: z,
    aiBrowse: [z, z] as [number, number],
    stops,
    switches,
    mountainTransition: [ranges[0][2], ranges[1][1]] as [number, number],
    coastTransition: [ranges[1][2], ranges[2][1]] as [number, number],
  };
}
