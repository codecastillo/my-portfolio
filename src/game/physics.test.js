import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COYOTE_TIME,
  DUCK_WIDTH,
  FLAP_FALL_SPEED,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_VELOCITY,
  MAX_FRAME,
  RUN_ACCEL,
  RUN_DECEL,
  RUN_SPEED,
  STEP,
  createDuck,
  stepDuck,
  stepsFor,
} from "./physics.js";

const idle = { left: false, right: false, jump: false, jumpPressed: false };
const wide = { left: 0, right: 10000 };
// Airborne for long enough that the coyote window has closed.
const airborne = (overrides) => ({
  ...createDuck(100, 50),
  onGround: false,
  coyote: 1,
  ...overrides,
});
const run = (duck, input, platforms, steps) => {
  let next = duck;
  for (let i = 0; i < steps; i++) next = stepDuck(next, input, platforms, wide);
  return next;
};

test("an airborne duck accelerates downward", () => {
  const next = stepDuck(airborne({ vy: 0 }), idle, [], wide);
  assert.equal(next.vy, GRAVITY * STEP);
  assert.ok(next.y > 50);
  assert.equal(next.onGround, false);
});

test("a falling duck lands on a platform it crosses from above", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const next = stepDuck(airborne({ y: 95, vy: 600 }), idle, [platform], wide);
  assert.equal(next.y, 100);
  assert.equal(next.vy, 0);
  assert.equal(next.onGround, true);
});

test("a rising duck passes through a platform from below", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const next = stepDuck(airborne({ y: 110, vy: -300 }), idle, [platform], wide);
  assert.ok(next.y < 110);
  assert.equal(next.onGround, false);
});

test("a standing duck stays on its platform", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const next = stepDuck(createDuck(100, 100), idle, [platform], wide);
  assert.equal(next.y, 100);
  assert.equal(next.onGround, true);
});

test("walking off the edge starts a fall", () => {
  const platform = { left: 0, right: 50, top: 100 };
  const right = { ...idle, right: true };
  let duck = createDuck(40, 100);
  for (let i = 0; i < 20; i++) duck = stepDuck(duck, right, [platform], wide);
  assert.equal(duck.onGround, false);
  assert.ok(duck.y > 100);
});

test("jump only starts from the ground", () => {
  const press = { ...idle, jump: true, jumpPressed: true };
  const grounded = stepDuck(createDuck(100, 100), press, [], wide);
  assert.equal(grounded.vy, JUMP_VELOCITY + GRAVITY * STEP);
  const inAir = stepDuck(airborne({ vy: 0 }), press, [], wide);
  assert.equal(inAir.vy, GRAVITY * STEP);
});

test("holding jump while falling caps the fall speed", () => {
  const hold = { ...idle, jump: true };
  const next = stepDuck(airborne({ vy: 500 }), hold, [], wide);
  assert.equal(next.vy, FLAP_FALL_SPEED);
});

test("the duck stays inside the horizontal bounds", () => {
  const left = { ...idle, left: true };
  const next = stepDuck(airborne({ x: 5 }), left, [], { left: 0, right: 500 });
  assert.equal(next.x, DUCK_WIDTH / 2);
  assert.equal(next.facing, -1);
});

test("crossing two platforms in one step lands on the higher one", () => {
  const upper = { left: 50, right: 150, top: 95 };
  const lower = { left: 50, right: 150, top: 100 };
  const next = stepDuck(airborne({ y: 90, vy: 900 }), idle, [lower, upper], wide);
  assert.equal(next.y, 95);
});

test("a long frame is clamped so a hidden tab cannot fast-forward", () => {
  const { steps } = stepsFor(5, 0);
  assert.equal(steps, Math.floor(MAX_FRAME / STEP));
});

test("leftover time carries into the next frame", () => {
  const first = stepsFor(STEP * 1.5, 0);
  assert.equal(first.steps, 1);
  // 0.6 rather than 0.5 keeps the sum clear of a floating-point boundary.
  const second = stepsFor(STEP * 0.6, first.carry);
  assert.equal(second.steps, 1);
});

test("running speeds up toward run speed instead of starting at full speed", () => {
  const right = { ...idle, right: true };
  const first = stepDuck(createDuck(100, 100), right, [], wide);
  assert.equal(first.vx, RUN_ACCEL * STEP);
  const later = run(createDuck(100, 100), right, [], 60);
  assert.equal(later.vx, RUN_SPEED);
});

test("letting go slows the duck down instead of stopping dead", () => {
  const moving = { ...createDuck(100, 100), vx: RUN_SPEED };
  const next = stepDuck(moving, idle, [], wide);
  assert.equal(next.vx, RUN_SPEED - RUN_DECEL * STEP);
});

test("a jump just after running off an edge still works", () => {
  const press = { ...idle, jump: true, jumpPressed: true };
  const justLeft = airborne({ coyote: COYOTE_TIME / 2, vy: 50 });
  const next = stepDuck(justLeft, press, [], wide);
  assert.ok(next.vy < 0);
  assert.equal(next.jumped, true);
});

test("a jump long after leaving the edge does nothing", () => {
  const press = { ...idle, jump: true, jumpPressed: true };
  const next = stepDuck(airborne({ coyote: COYOTE_TIME * 2, vy: 50 }), press, [], wide);
  assert.ok(next.vy > 0);
  assert.equal(next.jumped, false);
});

test("a jump pressed just before landing fires on landing", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const press = { ...idle, jump: true, jumpPressed: true };
  const hold = { ...idle, jump: true };
  let duck = stepDuck(airborne({ y: 96, vy: 100 }), press, [platform], wide);
  duck = run(duck, hold, [platform], 3);
  assert.ok(duck.vy < 0, `expected a jump, vy ${duck.vy}`);
});

test("a jump pressed too early before landing is dropped", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const press = { ...idle, jump: true, jumpPressed: true };
  const late = Math.ceil(JUMP_BUFFER / STEP) + 5;
  let duck = stepDuck(airborne({ y: 0, vy: 0 }), press, [platform], wide);
  duck = run(duck, idle, [platform], late + 30);
  assert.equal(duck.onGround, true);
  assert.equal(duck.y, 100);
});

test("tapping jump makes a lower hop than holding it", () => {
  const press = { ...idle, jump: true, jumpPressed: true };
  const hold = { ...idle, jump: true };
  const peak = (input) => {
    let duck = stepDuck(createDuck(100, 1000), press, [], wide);
    let highest = duck.y;
    for (let i = 0; i < 60; i++) {
      duck = stepDuck(duck, input, [], wide);
      highest = Math.min(highest, duck.y);
    }
    return 1000 - highest;
  };
  const tapped = peak(idle);
  const held = peak(hold);
  assert.ok(tapped < held * 0.6, `tap ${tapped} vs hold ${held}`);
});

test("the duck cannot jump again in mid-air", () => {
  const press = { ...idle, jump: true, jumpPressed: true };
  let duck = stepDuck(createDuck(100, 1000), press, [], wide);
  duck = run(duck, { ...idle, jump: true }, [], 20);
  const again = stepDuck(duck, press, [], wide);
  assert.equal(again.jumped, false);
  assert.ok(again.vy > duck.vy);
});

test("landed is true only on the step that touches down", () => {
  const platform = { left: 50, right: 150, top: 100 };
  const touch = stepDuck(airborne({ y: 95, vy: 600 }), idle, [platform], wide);
  assert.equal(touch.landed, true);
  const after = stepDuck(touch, idle, [platform], wide);
  assert.equal(after.landed, false);
});
