// Units are CSS pixels and seconds. y grows downward and marks the duck's
// feet, so landing is a comparison against a platform's top edge.
export const STEP = 1 / 60;
// A hidden tab resumes with a huge gap; clamping stops the duck teleporting.
export const MAX_FRAME = 0.25;
export const GRAVITY = 2000;
export const RUN_SPEED = 260;
// Quick but not instant: the duck eases into a run and skids briefly to a stop.
export const RUN_ACCEL = 2400;
export const RUN_DECEL = 3000;
export const JUMP_VELOCITY = -720;
export const MAX_FALL_SPEED = 900;
// Holding jump while falling caps the fall: the duck flaps.
export const FLAP_FALL_SPEED = 180;
// Letting go of jump while rising pulls the duck down harder, so a tap is a
// short hop and a hold is a full jump.
export const LOW_JUMP_GRAVITY = 3;
// Grace windows that make jumps feel fair: a jump still works just after
// running off an edge, and a press just before landing fires on landing.
export const COYOTE_TIME = 0.1;
export const JUMP_BUFFER = 0.12;
export const DUCK_WIDTH = 28;
export const DUCK_HEIGHT = 24;

export const createDuck = (x, y) => ({
  x,
  y,
  vx: 0,
  vy: 0,
  onGround: true,
  facing: 1,
  // Seconds since the duck last stood on something.
  coyote: 0,
  // Seconds left on a jump pressed before it could happen.
  buffer: 0,
  landed: false,
  jumped: false,
});

const approach = (current, target, change) =>
  current < target
    ? Math.min(current + change, target)
    : Math.max(current - change, target);

export const stepsFor = (elapsed, carry) => {
  const total = Math.min(elapsed, MAX_FRAME) + carry;
  const steps = Math.floor(total / STEP);
  return { steps, carry: total - steps * STEP };
};

const overlaps = (x, platform) =>
  x + DUCK_WIDTH / 2 > platform.left && x - DUCK_WIDTH / 2 < platform.right;

export const stepDuck = (duck, input, platforms, bounds) => {
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const rate = direction === 0 ? RUN_DECEL : RUN_ACCEL;
  let vx = approach(duck.vx, direction * RUN_SPEED, rate * STEP);
  const facing = direction === 0 ? duck.facing : direction;

  let coyote = duck.onGround ? 0 : duck.coyote;
  let buffer = input.jumpPressed ? JUMP_BUFFER : Math.max(duck.buffer - STEP, 0);
  let vy = duck.vy;
  let jumped = false;
  if (buffer > 0 && coyote <= COYOTE_TIME) {
    vy = JUMP_VELOCITY;
    buffer = 0;
    // Spend the grace window so the jump cannot repeat in mid-air.
    coyote = COYOTE_TIME;
    jumped = true;
  }
  const rising = vy < 0;
  vy += GRAVITY * STEP * (rising && !input.jump ? LOW_JUMP_GRAVITY : 1);
  if (input.jump && vy > FLAP_FALL_SPEED) vy = FLAP_FALL_SPEED;
  vy = Math.min(vy, MAX_FALL_SPEED);
  coyote += STEP;

  const half = DUCK_WIDTH / 2;
  const unclamped = duck.x + vx * STEP;
  const x = Math.min(Math.max(unclamped, bounds.left + half), bounds.right - half);
  if (x !== unclamped) vx = 0;
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

  return {
    x,
    y,
    vx,
    vy,
    onGround,
    facing,
    coyote: onGround ? 0 : coyote,
    buffer,
    landed: onGround && !duck.onGround,
    jumped,
  };
};
