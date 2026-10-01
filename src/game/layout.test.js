import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GAP_MAX,
  GAP_MIN,
  LEDGE_WIDTH,
  ROW_GAP,
  generateLedges,
  ledgeAreaTop,
  placeBlueprints,
  seededRandom,
} from "./layout.js";
import { BLUEPRINT_LIFT, BLUEPRINT_SIZE, reachableFrom } from "./world.js";
import { DUCK_WIDTH, RUN_SPEED, createDuck, stepDuck } from "./physics.js";

// Plays one simple move with the real physics: stand on the edge of `from`
// nearest `to`, run toward it and jump at once, stopping over its middle. No
// timing tricks, so a pass means an ordinary player makes the jump.
const moveLands = (from, to, jump) => {
  const toCenter = (to.left + to.right) / 2;
  const fromCenter = (from.left + from.right) / 2;
  const dir = toCenter >= fromCenter ? 1 : -1;
  const startX = dir > 0 ? from.right - DUCK_WIDTH / 2 : from.left + DUCK_WIDTH / 2;
  let duck = { ...createDuck(startX, from.top), vx: dir * RUN_SPEED };
  const bounds = { left: -1e6, right: 1e6 };
  for (let i = 0; i < 180; i++) {
    const before = dir > 0 ? duck.x < toCenter : duck.x > toCenter;
    const input = {
      left: dir < 0 && before,
      right: dir > 0 && before,
      jump,
      jumpPressed: jump && i === 0,
    };
    duck = stepDuck(duck, input, [from, to], bounds);
    if (duck.landed) return Math.abs(duck.y - to.top) < 1;
    if (duck.y > Math.max(from.top, to.top) + 400) return false;
  }
  return false;
};
const simpleJumpLands = (from, to) => moveLands(from, to, true);
// Running off the edge without jumping: if this lands, the step needs no jump.
const walkOffLands = (from, to) => to.top > from.top && moveLands(from, to, false);

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

test("ledges stay inside the area, rows apart, one or two per row", () => {
  const ledges = generateLedges(area, seededRandom(1));
  const rows = new Map();
  for (const ledge of ledges) {
    assert.ok(ledge.left >= area.left && ledge.right <= area.right, JSON.stringify(ledge));
    assert.ok(ledge.top >= area.top && ledge.top <= area.bottom);
    assert.equal(ledge.right - ledge.left, LEDGE_WIDTH);
    rows.set(ledge.top, (rows.get(ledge.top) ?? 0) + 1);
  }
  const tops = [...rows.keys()].sort((a, b) => a - b);
  for (let i = 1; i < tops.length; i++) assert.equal(tops[i] - tops[i - 1], ROW_GAP);
  for (const count of rows.values()) assert.ok(count === 1 || count === 2, `count ${count}`);
});

test("most rows have a single ledge, so the page stays sparse", () => {
  for (const seed of [1, 2, 3]) {
    const ledges = generateLedges(area, seededRandom(seed));
    const rows = new Set(ledges.map((l) => l.top)).size;
    assert.ok(ledges.length < rows * 1.5, `seed ${seed}: ${ledges.length} ledges in ${rows} rows`);
  }
});

test("a ledge only crosses content when no clear spot is one jump away", () => {
  const blocked = [
    { left: 500, right: 900, top: 0, bottom: 6000 },
    { left: 100, right: 300, top: 1500, bottom: 2500 },
  ];
  const crosses = (center, top) =>
    blocked.some(
      (b) =>
        center + LEDGE_WIDTH / 2 > b.left - 24 &&
        center - LEDGE_WIDTH / 2 < b.right + 24 &&
        top > b.top - 24 &&
        top < b.bottom + 24,
    );
  const lowest = area.left + LEDGE_WIDTH / 2;
  const highest = area.right - LEDGE_WIDTH / 2;
  for (const seed of [31, 32, 33, 34, 35, 36, 37, 38]) {
    const chain = generateLedges(area, seededRandom(seed), blocked).filter((l) =>
      l.id.endsWith("-0"),
    );
    for (let i = 1; i < chain.length; i++) {
      const center = (chain[i].left + chain[i].right) / 2;
      if (!crosses(center, chain[i].top)) continue;
      const from = (chain[i - 1].left + chain[i - 1].right) / 2;
      for (let gap = GAP_MIN; gap <= GAP_MAX; gap += 1) {
        for (const spot of [from - LEDGE_WIDTH - gap, from + LEDGE_WIDTH + gap]) {
          const usable = spot >= lowest && spot <= highest;
          assert.ok(
            !usable || crosses(spot, chain[i].top),
            `seed ${seed} ${chain[i].id} crosses content though ${spot} was clear`,
          );
        }
      }
    }
  }
});

test("ledges keep out of blocked space once the chain reaches open space", () => {
  const blocked = [{ left: 0, right: 700, top: 0, bottom: 6000 }];
  const inBlocked = (l) => l.left < 700 + 12;
  for (const seed of [21, 22, 23]) {
    const ledges = generateLedges(area, seededRandom(seed), blocked);
    const firstClear = ledges.findIndex((l) => l.id.endsWith("-0") && !inBlocked(l));
    assert.ok(firstClear >= 0 && firstClear < 15, `seed ${seed} escaped at ${firstClear}`);
    const stuck = ledges.slice(firstClear).filter(inBlocked);
    assert.deepEqual(stuck, [], `seed ${seed}`);
  }
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

test("every step between neighbouring ledges needs a jump, and a simple one lands", () => {
  const pages = [
    [],
    [{ left: 0, right: 700, top: 0, bottom: 6000 }],
    [
      { left: 300, right: 900, top: 500, bottom: 1500 },
      { left: 700, right: 1400, top: 2000, bottom: 2600 },
    ],
  ];
  for (const [seed, blocked] of [1, 2, 3, 4, 5, 6, 7, 8].flatMap((seed) =>
    pages.map((page) => [seed, page]),
  )) {
    const ledges = generateLedges(area, seededRandom(seed), blocked);
    const byRow = Map.groupBy(ledges, (l) => l.top);
    const tops = [...byRow.keys()].sort((a, b) => a - b);
    const chainOf = (top) => byRow.get(top).find((l) => l.id.endsWith("-0"));
    for (let i = 1; i < tops.length; i++) {
      const upper = chainOf(tops[i - 1]);
      const lower = chainOf(tops[i]);
      assert.ok(simpleJumpLands(lower, upper), `seed ${seed} climb to row ${i - 1}`);
      assert.ok(simpleJumpLands(upper, lower), `seed ${seed} drop to row ${i}`);
      assert.ok(!walkOffLands(upper, lower), `seed ${seed} row ${i} reached by walking off`);
    }
    for (const row of byRow.values()) {
      const [chain, extra] = row;
      if (!extra) continue;
      assert.ok(simpleJumpLands(chain, extra), `seed ${seed} hop to ${extra.id}`);
      assert.ok(simpleJumpLands(extra, chain), `seed ${seed} hop back from ${extra.id}`);
    }
  }
});
