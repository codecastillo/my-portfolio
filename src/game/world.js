import { DUCK_HEIGHT, DUCK_WIDTH, GRAVITY, JUMP_VELOCITY } from "./physics.js";

export const BLUEPRINT_SIZE = 20;
// Blueprints float above their anchor so a standing duck has to hop for one.
export const BLUEPRINT_LIFT = 40;
// Narrow slivers (icons, rules) make platforms nobody can see.
const MIN_PLATFORM_WIDTH = 24;
// Reachability uses a conservative envelope under the real physics: peak rise
// is JUMP_VELOCITY^2 / (2 * GRAVITY), about 130px, and a jump covers well over
// MAX_GAP horizontally.
export const MAX_RISE =
  Math.floor(JUMP_VELOCITY ** 2 / (2 * GRAVITY)) - 10;
export const MAX_GAP = 200;

export const toPlatforms = (rects, scrollX, scrollY) =>
  rects
    .filter((r) => r.width >= MIN_PLATFORM_WIDTH && r.height > 0)
    .map((r) => ({
      left: r.left + scrollX,
      right: r.right + scrollX,
      top: r.top + scrollY,
    }))
    .sort((a, b) => a.top - b.top);

export const toBlueprints = (rects, scrollX, scrollY, collected = []) =>
  rects.map((r, index) => ({
    x: r.left + scrollX + r.width / 2,
    y: r.top + scrollY - BLUEPRINT_LIFT,
    collected: Boolean(collected[index]),
  }));

const touches = (blueprint, duck) => {
  const half = BLUEPRINT_SIZE / 2;
  return (
    duck.x + DUCK_WIDTH / 2 > blueprint.x - half &&
    duck.x - DUCK_WIDTH / 2 < blueprint.x + half &&
    duck.y > blueprint.y - half &&
    duck.y - DUCK_HEIGHT < blueprint.y + half
  );
};

export const collectTouched = (blueprints, duck) => {
  let newly = 0;
  const next = blueprints.map((blueprint) => {
    if (blueprint.collected || !touches(blueprint, duck)) return blueprint;
    newly += 1;
    return { ...blueprint, collected: true };
  });
  return { blueprints: next, newly };
};

export const cameraTarget = (duckY, scrollY, viewportHeight, documentHeight) => {
  const third = viewportHeight / 3;
  let target = scrollY;
  if (duckY < scrollY + third) target = duckY - third;
  else if (duckY > scrollY + 2 * third) target = duckY - 2 * third;
  return Math.min(Math.max(target, 0), Math.max(documentHeight - viewportHeight, 0));
};

const horizontalGap = (a, b) =>
  Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));

export const reachableBlueprints = (platforms, start, blueprints) => {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const from = queue.shift();
    for (const to of platforms) {
      if (seen.has(to)) continue;
      if (to.top >= from.top - MAX_RISE && horizontalGap(from, to) <= MAX_GAP) {
        seen.add(to);
        queue.push(to);
      }
    }
  }
  const reach = DUCK_WIDTH / 2 + BLUEPRINT_SIZE / 2;
  return blueprints.map((blueprint) =>
    [...seen].some(
      (platform) =>
        blueprint.x >= platform.left - reach &&
        blueprint.x <= platform.right + reach &&
        blueprint.y >= platform.top - MAX_RISE &&
        blueprint.y <= platform.top,
    ),
  );
};
