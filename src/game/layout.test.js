import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEDGES_PER_ROW,
  LEDGE_MAX_WIDTH,
  LEDGE_MIN_WIDTH,
  ROW_GAP,
  generateLedges,
  ledgeAreaTop,
  placeBlueprints,
  seededRandom,
} from "./layout.js";
import { BLUEPRINT_LIFT, BLUEPRINT_SIZE, reachableFrom } from "./world.js";

const area = { left: 24, right: 1416, top: 100, bottom: 5000 };

test("the same seed gives the same sequence", () => {
  const a = seededRandom(42);
  const b = seededRandom(42);
  const first = [a(), a(), a()];
  assert.deepEqual([b(), b(), b()], first);
  assert.ok(first.every((n) => n >= 0 && n < 1));
});

test("the same seed gives the same ledges, a different seed does not", () => {
  const one = generateLedges(area, seededRandom(7));
  assert.deepEqual(generateLedges(area, seededRandom(7)), one);
  assert.notDeepEqual(generateLedges(area, seededRandom(8)), one);
});

test("ledges stay inside the area, rows apart, with a fixed count per row", () => {
  const ledges = generateLedges(area, seededRandom(1));
  const rows = new Map();
  for (const ledge of ledges) {
    assert.ok(ledge.left >= area.left && ledge.right <= area.right, JSON.stringify(ledge));
    assert.ok(ledge.top >= area.top && ledge.top <= area.bottom);
    const width = ledge.right - ledge.left;
    assert.ok(width >= LEDGE_MIN_WIDTH && width <= LEDGE_MAX_WIDTH, `width ${width}`);
    rows.set(ledge.top, (rows.get(ledge.top) ?? 0) + 1);
  }
  const tops = [...rows.keys()].sort((a, b) => a - b);
  for (let i = 1; i < tops.length; i++) assert.equal(tops[i] - tops[i - 1], ROW_GAP);
  for (const count of rows.values()) assert.equal(count, LEDGES_PER_ROW);
});

test("ledges in the same row never overlap", () => {
  const ledges = generateLedges(area, seededRandom(3));
  const byRow = Map.groupBy(ledges, (l) => l.top);
  for (const row of byRow.values()) {
    const sorted = [...row].sort((a, b) => a.left - b.left);
    for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].left > sorted[i - 1].right);
  }
});

test("every row can be reached from the top row and from the bottom row", () => {
  for (const seed of [1, 2, 3, 99, 2024]) {
    const ledges = generateLedges(area, seededRandom(seed));
    const top = ledges.reduce((a, b) => (b.top < a.top ? b : a));
    const bottom = ledges.reduce((a, b) => (b.top > a.top ? b : a));
    const rows = new Set(ledges.map((l) => l.top));
    const rowsFrom = (start) => new Set([...reachableFrom(ledges, start)].map((l) => l.top));
    assert.equal(rowsFrom(top).size, rows.size, `seed ${seed} downward`);
    assert.equal(rowsFrom(bottom).size, rows.size, `seed ${seed} upward`);
  }
});

test("ledges carry stable ids that cannot clash with page element indexes", () => {
  const ledges = generateLedges(area, seededRandom(5));
  const ids = new Set(ledges.map((l) => l.id));
  assert.equal(ids.size, ledges.length);
  assert.ok(ledges.every((l) => typeof l.id === "string"));
});

test("one blueprint per section, above a ledge inside that section", () => {
  const ledges = generateLedges(area, seededRandom(11));
  const sections = [
    { top: 100, bottom: 900 },
    { top: 900, bottom: 2000 },
    { top: 2000, bottom: 3500 },
  ];
  const blueprints = placeBlueprints(ledges, sections, seededRandom(12), [true]);
  assert.equal(blueprints.length, sections.length);
  blueprints.forEach((blueprint, index) => {
    const ledgeTop = blueprint.y + BLUEPRINT_LIFT;
    const ledge = ledges.find(
      (l) => l.top === ledgeTop && blueprint.x > l.left && blueprint.x < l.right,
    );
    assert.ok(ledge, `blueprint ${index} has no ledge`);
    assert.ok(ledge.top >= sections[index].top && ledge.top < sections[index].bottom);
    assert.ok(reachableFrom(ledges, ledges[0]).has(ledge), `blueprint ${index} unreachable`);
  });
  assert.deepEqual(
    blueprints.map((b) => b.collected),
    [true, false, false],
  );
});

test("a section too short for a row still gets the nearest ledge", () => {
  const ledges = generateLedges(area, seededRandom(4));
  const [blueprint] = placeBlueprints(ledges, [{ top: 130, bottom: 140 }], seededRandom(9));
  const ledgeTop = blueprint.y + BLUEPRINT_LIFT;
  assert.ok(ledges.some((l) => l.top === ledgeTop));
});

test("the ledge area starts low enough that a blueprint clears the top bar", () => {
  const top = ledgeAreaTop(0, 55);
  const ledges = generateLedges({ ...area, top }, seededRandom(6));
  const blueprints = placeBlueprints(ledges, [{ top: 0, bottom: 400 }], seededRandom(7));
  assert.ok(blueprints[0].y - BLUEPRINT_SIZE / 2 >= 55, `blueprint at ${blueprints[0].y}`);
  assert.equal(ledgeAreaTop(300, 55), 300 + BLUEPRINT_LIFT + BLUEPRINT_SIZE);
});
