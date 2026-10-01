import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLUEPRINT_LIFT,
  MAX_GAP,
  MAX_RISE,
  cameraTarget,
  collectTouched,
  reachableBlueprints,
} from "./world.js";

test("touching a blueprint collects it once", () => {
  const blueprints = [
    { x: 100, y: 90, collected: false },
    { x: 400, y: 90, collected: false },
  ];
  const duck = { x: 100, y: 100 };
  const first = collectTouched(blueprints, duck);
  assert.equal(first.newly, 1);
  assert.equal(first.blueprints[0].collected, true);
  assert.equal(first.blueprints[1].collected, false);
  const again = collectTouched(first.blueprints, duck);
  assert.equal(again.newly, 0);
});

test("a blueprint out of reach is not collected", () => {
  const result = collectTouched([{ x: 100, y: 10, collected: false }], {
    x: 100,
    y: 100,
  });
  assert.equal(result.newly, 0);
});

test("the camera holds still while the duck is in the middle third", () => {
  assert.equal(cameraTarget(500, 200, 900, 5000), 200);
});

test("the camera follows the duck above and below the middle third", () => {
  assert.equal(cameraTarget(1000, 900, 900, 5000), 700);
  assert.equal(cameraTarget(1400, 200, 900, 5000), 800);
});

test("the camera never scrolls past the document", () => {
  assert.equal(cameraTarget(4990, 3000, 900, 5000), 4100);
  assert.equal(cameraTarget(10, 0, 900, 5000), 0);
});

test("platforms within a jump chain upward", () => {
  const start = { left: 0, right: 100, top: 1000 };
  const step = { left: 150, right: 250, top: 1000 - MAX_RISE };
  const blueprints = [{ x: 200, y: step.top - BLUEPRINT_LIFT, collected: false }];
  assert.deepEqual(reachableBlueprints([start, step], start, blueprints), [true]);
});

test("a platform too high to jump to is unreachable", () => {
  const start = { left: 0, right: 100, top: 1000 };
  const high = { left: 0, right: 100, top: 1000 - MAX_RISE - 1 };
  const blueprints = [{ x: 50, y: high.top - BLUEPRINT_LIFT, collected: false }];
  assert.deepEqual(reachableBlueprints([start, high], start, blueprints), [false]);
});

test("a gap wider than a jump is unreachable", () => {
  const start = { left: 0, right: 100, top: 1000 };
  const far = { left: 100 + MAX_GAP + 1, right: 400 + MAX_GAP, top: 1000 };
  const blueprints = [{ x: far.left + 50, y: far.top - BLUEPRINT_LIFT, collected: false }];
  assert.deepEqual(reachableBlueprints([start, far], start, blueprints), [false]);
});

test("falling reaches platforms far below", () => {
  const start = { left: 0, right: 100, top: 100 };
  const below = { left: 50, right: 300, top: 3000 };
  const blueprints = [{ x: 200, y: below.top - BLUEPRINT_LIFT, collected: false }];
  assert.deepEqual(reachableBlueprints([start, below], start, blueprints), [true]);
});

test("a high climb allows less sideways distance than a level jump", () => {
  const start = { left: 0, right: 100, top: 1000 };
  const level = { left: 220, right: 320, top: 1000 };
  const high = { left: 220, right: 320, top: 1000 - 100 };
  const blueprint = (p) => ({ x: p.left + 50, y: p.top - BLUEPRINT_LIFT, collected: false });
  assert.deepEqual(reachableBlueprints([start, level], start, [blueprint(level)]), [true]);
  assert.deepEqual(reachableBlueprints([start, high], start, [blueprint(high)]), [false]);
});
