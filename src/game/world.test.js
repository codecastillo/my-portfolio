import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLUEPRINT_LIFT,
  MAX_GAP,
  MAX_RISE,
  cameraTarget,
  collectTouched,
  reachableBlueprints,
  toBlueprints,
  toPlatforms,
} from "./world.js";

const rect = (left, top, width, height = 20) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

test("platforms move into page coordinates, drop slivers and sort by top", () => {
  const platforms = toPlatforms(
    [rect(10, 300, 100), rect(0, 50, 10), rect(20, 100, 80), rect(5, 5, 50, 0)],
    7,
    1000,
  );
  assert.deepEqual(platforms, [
    { left: 27, right: 107, top: 1100 },
    { left: 17, right: 117, top: 1300 },
  ]);
});

test("blueprints float above their anchor and keep collected flags", () => {
  const blueprints = toBlueprints(
    [rect(100, 200, 60), rect(0, 400, 40)],
    0,
    50,
    [true],
  );
  assert.deepEqual(blueprints, [
    { x: 130, y: 250 - BLUEPRINT_LIFT, collected: true },
    { x: 20, y: 450 - BLUEPRINT_LIFT, collected: false },
  ]);
});

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
