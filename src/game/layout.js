import { BLUEPRINT_LIFT, BLUEPRINT_SIZE, reachableFrom } from "./world.js";

// Floating ledges come in rows this far apart, well under the duck's jump
// height (about 130px), so climbing a row never needs a perfect jump.
export const ROW_GAP = 80;
// Edge-to-edge gap from one ledge to the next, in the row below or beside it.
// Running off an edge carries the duck about 100px sideways while it falls a
// row, so 105px or more cannot be walked; a running jump clears about 135px
// even when climbing a row, so 120px or less never needs a perfect jump.
export const GAP_MIN = 105;
export const GAP_MAX = 120;
// Short, even ledges read as platforms, not as page rules.
export const LEDGE_WIDTH = 110;
// Most rows hold one ledge; this share also get a second, to keep it sparse.
const EXTRA_LEDGE_CHANCE = 0.25;
// Clear space kept around blocked page content and between two ledges.
const LEDGE_SPACING = 24;

// Ledges start below the fixed top bar with room for a blueprint above them,
// so the first blueprint is never off the page or hidden behind the bar.
export const ledgeAreaTop = (sectionTop, headerBottom) =>
  Math.max(sectionTop, headerBottom) + BLUEPRINT_LIFT + BLUEPRINT_SIZE;

// mulberry32: tiny and seedable, so a relayout can rebuild the same layout.
export const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const between = (random, min, max) => min + random() * (max - min);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const overlaps = (span, top, boxes) =>
  boxes.some(
    (box) =>
      span.left < box.right + LEDGE_SPACING &&
      span.right > box.left - LEDGE_SPACING &&
      top > box.top - LEDGE_SPACING &&
      top < box.bottom + LEDGE_SPACING,
  );

// Positions checked when looking for open space in a row.
const OPEN_SCAN_STEP = 10;

const openCenterNearest = (x, top, blocked, lowest, highest) => {
  let best = null;
  for (let center = lowest; center <= highest; center += OPEN_SCAN_STEP) {
    if (overlaps(spanAt(center), top, blocked)) continue;
    if (best === null || Math.abs(center - x) < Math.abs(best - x)) best = center;
  }
  return best;
};

// Every center between `near` and `far` away from x, on both sides, that keeps
// a ledge inside the area.
const centersAround = (x, near, far, lowest, highest) => {
  const centers = [];
  for (let distance = near; distance <= far; distance += OPEN_SCAN_STEP) {
    for (const center of [x - distance, x + distance]) {
      if (center >= lowest && center <= highest) centers.push(center);
    }
  }
  return centers;
};

const pick = (random, items) => items[Math.floor(random() * items.length)];

const spanAt = (center) => {
  const left = Math.round(center - LEDGE_WIDTH / 2);
  return { left, right: left + LEDGE_WIDTH };
};

// Ledges try to sit in empty space, so they float beside the content rather
// than over it. `blocked` holds the page's text and images in page coordinates.
export const generateLedges = (area, random, blocked = []) => {
  const ledges = [];
  const lowest = area.left + LEDGE_WIDTH / 2;
  const highest = area.right - LEDGE_WIDTH / 2;
  let chainX = between(random, lowest, highest);
  for (let index = 0, top = area.top; top <= area.bottom; index++, top += ROW_GAP) {
    // Inside blocked space, every step heads for the nearest open spot in the
    // row, so the chain walks out instead of wandering.
    const open = openCenterNearest(chainX, top, blocked, lowest, highest);
    const towardOpen =
      open === null || !overlaps(spanAt(chainX), top, blocked)
        ? null
        : Math.sign(open - chainX) || 1;
    // Check every spot one step away, so a clear one is never missed; a ledge
    // only crosses content when nothing in reach is clear.
    const clearAt = (x, rowTop) =>
      centersAround(x, LEDGE_WIDTH + GAP_MIN, LEDGE_WIDTH + GAP_MAX, lowest, highest)
        .filter((center) => !overlaps(spanAt(center), rowTop, blocked));
    const clearInReach = clearAt(chainX, top);
    // Look one row ahead: a clear spot with no clear spot after it would force
    // the next ledge over content, so prefer one that keeps a way on.
    const withWayOn = clearInReach.filter(
      (center) => clearAt(center, top + ROW_GAP).length > 0,
    );
    let center;
    if (clearInReach.length > 0) {
      center = pick(random, withWayOn.length > 0 ? withWayOn : clearInReach);
    } else {
      const step = LEDGE_WIDTH + between(random, GAP_MIN, GAP_MAX);
      const side = towardOpen ?? (random() < 0.5 ? -1 : 1);
      // Near a page edge, step the other way rather than squash the step.
      center = clamp(
        chainX + side * step >= lowest && chainX + side * step <= highest
          ? chainX + side * step
          : chainX - side * step,
        lowest,
        highest,
      );
    }
    const chain = spanAt(center);
    chainX = (chain.left + chain.right) / 2;
    const row = [chain];
    if (random() < EXTRA_LEDGE_CHANCE) {
      const clearBeside = centersAround(
        chainX,
        LEDGE_WIDTH + GAP_MIN,
        LEDGE_WIDTH + GAP_MAX,
        lowest,
        highest,
      ).filter((spot) => !overlaps(spanAt(spot), top, blocked));
      if (clearBeside.length > 0) row.push(spanAt(pick(random, clearBeside)));
    }
    row.forEach((ledge, slot) => {
      ledges.push({ id: `ledge-${index}-${slot}`, ...ledge, top });
    });
  }
  return ledges;
};

// One blueprint per section, on a random ledge in that section that the duck
// can reach from the top of the chain.
export const placeBlueprints = (ledges, sections, random, collected = []) => {
  const reachable = [...reachableFrom(ledges, ledges[0])];
  return sections.map((section, index) => {
    const inside = reachable.filter(
      (l) => l.top >= section.top && l.top < section.bottom,
    );
    const ledge =
      inside.length > 0
        ? inside[Math.floor(random() * inside.length)]
        : reachable.reduce((a, b) =>
            Math.abs(b.top - section.top) < Math.abs(a.top - section.top) ? b : a,
          );
    return {
      x: (ledge.left + ledge.right) / 2,
      y: ledge.top - BLUEPRINT_LIFT,
      collected: Boolean(collected[index]),
    };
  });
};
