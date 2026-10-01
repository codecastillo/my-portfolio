import {
  DUCK_HEIGHT,
  DUCK_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  RUN_SPEED,
} from "./physics.js";

export const BLUEPRINT_SIZE = 20;
// Blueprints float above their anchor so a standing duck has to hop for one.
export const BLUEPRINT_LIFT = 40;
// Slivers narrower than this are too small to land on.
const MIN_PLATFORM_WIDTH = 24;
// Reachability is an estimate, not a simulation. MAX_RISE stays under a full
// jump's peak, JUMP_VELOCITY^2 / (2 * GRAVITY), about 130px. MAX_GAP bounds
// level jumps and drops, where a running jump covers about 190px or more.
export const MAX_RISE =
  Math.floor(JUMP_VELOCITY ** 2 / (2 * GRAVITY)) - 10;
export const MAX_GAP = 200;
// Climbing leaves less airtime to travel sideways: the duck is above a ledge
// `rise` px up only until (v + sqrt(v^2 - 2 * g * rise)) / g seconds into the
// jump. CLIMB_SAFETY keeps the estimate under what a real run-up reaches.
const CLIMB_SAFETY = 0.8;

export const climbReach = (rise) => {
  const speed = -JUMP_VELOCITY;
  const airtime =
    (speed + Math.sqrt(Math.max(speed ** 2 - 2 * GRAVITY * rise, 0))) / GRAVITY;
  return RUN_SPEED * airtime * CLIMB_SAFETY;
};

// Each platform keeps the index of the element it came from, so a re-measure
// after a layout shift can find the ledge the duck was standing on.
export const toPlatforms = (rects, scrollX, scrollY) =>
  rects
    .map((r, id) => ({ r, id }))
    .filter(({ r }) => r.width >= MIN_PLATFORM_WIDTH && r.height > 0)
    .map(({ r, id }) => ({
      id,
      left: r.left + scrollX,
      right: r.right + scrollX,
      top: r.top + scrollY,
    }))
    .sort((a, b) => a.top - b.top);

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

export const reachableFrom = (platforms, start) => {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const from = queue.shift();
    for (const to of platforms) {
      if (seen.has(to)) continue;
      const rise = from.top - to.top;
      const reach = rise > 0 ? climbReach(rise) : MAX_GAP;
      if (rise <= MAX_RISE && horizontalGap(from, to) <= reach) {
        seen.add(to);
        queue.push(to);
      }
    }
  }
  return seen;
};

export const reachableBlueprints = (platforms, start, blueprints) => {
  const seen = reachableFrom(platforms, start);
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
