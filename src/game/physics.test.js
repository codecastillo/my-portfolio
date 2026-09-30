import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DUCK_WIDTH,
  FLAP_FALL_SPEED,
  GRAVITY,
  JUMP_VELOCITY,
  MAX_FRAME,
  STEP,
  createDuck,
  stepDuck,
  stepsFor,
} from "./physics.js";

const idle = { left: false, right: false, jump: false, jumpPressed: false };
const wide = { left: 0, right: 10000 };
const airborne = (overrides) => ({
  ...createDuck(100, 50),
  onGround: false,
  ...overrides,
});

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
