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
  return timeline.switches.findIndex(stop => progress < stop) === -1
    ? 3 : timeline.switches.findIndex(stop => progress < stop);
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
