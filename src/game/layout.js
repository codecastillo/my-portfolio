import { BLUEPRINT_LIFT, BLUEPRINT_SIZE, reachableFrom } from "./world.js";

// Floating ledges come in rows this far apart, under the duck's jump height
// (MAX_RISE in world.js), so every row can be climbed to from the one below.
export const ROW_GAP = 90;
export const LEDGES_PER_ROW = 2;
export const LEDGE_MIN_WIDTH = 70;
export const LEDGE_MAX_WIDTH = 150;
// The first ledge in each row moves at most this far sideways from the first
// ledge in the row above, so that chain runs unbroken from top to bottom.
const CHAIN_STEP = 110;
// Clear space kept between two ledges in the same row.
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

// The open stretches of a row once its existing ledges and their spacing are
// taken out.
const freeSpans = (area, row) => {
  const spans = [];
  let cursor = area.left;
  for (const ledge of [...row].sort((a, b) => a.left - b.left)) {
    spans.push({ left: cursor, right: ledge.left - LEDGE_SPACING });
    cursor = ledge.right + LEDGE_SPACING;
  }
  spans.push({ left: cursor, right: area.right });
  return spans;
};

export const generateLedges = (area, random) => {
  const ledges = [];
  let chainX = between(random, area.left, area.right);
  for (let index = 0, top = area.top; top <= area.bottom; index++, top += ROW_GAP) {
    const width = Math.round(between(random, LEDGE_MIN_WIDTH, LEDGE_MAX_WIDTH));
    chainX = clamp(
      chainX + between(random, -CHAIN_STEP, CHAIN_STEP),
      area.left + width / 2,
      area.right - width / 2,
    );
    const left = Math.round(chainX - width / 2);
    const row = [{ left, right: left + width }];
    while (row.length < LEDGES_PER_ROW) {
      const widest = freeSpans(area, row).reduce((a, b) =>
        b.right - b.left > a.right - a.left ? b : a,
      );
      const room = widest.right - widest.left;
      const extra = Math.round(
        between(random, LEDGE_MIN_WIDTH, Math.min(LEDGE_MAX_WIDTH, room)),
      );
      const extraLeft = Math.round(between(random, widest.left, widest.right - extra));
      row.push({ left: extraLeft, right: extraLeft + extra });
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
