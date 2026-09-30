// Units are CSS pixels and seconds. y grows downward and marks the duck's
// feet, so landing is a comparison against a platform's top edge.
export const STEP = 1 / 60;
// A hidden tab resumes with a huge gap; clamping stops the duck teleporting.
export const MAX_FRAME = 0.25;
export const GRAVITY = 2000;
export const RUN_SPEED = 260;
export const JUMP_VELOCITY = -720;
export const MAX_FALL_SPEED = 900;
// Holding jump while falling caps the fall: the duck flaps.
export const FLAP_FALL_SPEED = 180;
export const DUCK_WIDTH = 28;
export const DUCK_HEIGHT = 24;

export const createDuck = (x, y) => ({
  x,
  y,
  vx: 0,
  vy: 0,
  onGround: true,
  facing: 1,
});

export const stepsFor = (elapsed, carry) => {
  const total = Math.min(elapsed, MAX_FRAME) + carry;
  const steps = Math.floor(total / STEP);
  return { steps, carry: total - steps * STEP };
};

const overlaps = (x, platform) =>
  x + DUCK_WIDTH / 2 > platform.left && x - DUCK_WIDTH / 2 < platform.right;

export const stepDuck = (duck, input, platforms, bounds) => {
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const vx = direction * RUN_SPEED;
  const facing = direction === 0 ? duck.facing : direction;

  let vy = duck.vy;
  if (input.jumpPressed && duck.onGround) vy = JUMP_VELOCITY;
  vy += GRAVITY * STEP;
  if (input.jump && vy > FLAP_FALL_SPEED) vy = FLAP_FALL_SPEED;
  vy = Math.min(vy, MAX_FALL_SPEED);

  const half = DUCK_WIDTH / 2;
  const x = Math.min(
    Math.max(duck.x + vx * STEP, bounds.left + half),
    bounds.right - half,
  );
  let y = duck.y + vy * STEP;
  let onGround = false;

  // One-way platforms: only a downward move that crosses a top edge lands.
  if (vy >= 0) {
    let landing = null;
    for (const platform of platforms) {
      const crosses = duck.y <= platform.top && y >= platform.top;
      if (crosses && overlaps(x, platform)) {
        if (!landing || platform.top < landing.top) landing = platform;
      }
    }
    if (landing) {
      y = landing.top;
      vy = 0;
      onGround = true;
    }
  }

  return { x, y, vx, vy, onGround, facing };
};
