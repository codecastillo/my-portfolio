import { test } from "node:test";
import assert from "node:assert/strict";
import { DUCK_HEIGHT, DUCK_WIDTH } from "./physics.js";
import {
  BLUEPRINT_PIXELS,
  DUCK_FRAMES,
  PIXEL,
  SPRITE_KEYS,
  drawSprite,
} from "./sprites.js";

// Enforces the Canvas 2D contract drawSprite relies on: a real color is set
// before every fill, and every rectangle is finite and positive.
const recordingContext = () => {
  const fills = [];
  let fillStyle = "";
  return {
    fills,
    get fillStyle() {
      return fillStyle;
    },
    set fillStyle(value) {
      if (typeof value !== "string" || value === "") {
        throw new TypeError(`invalid fillStyle ${value}`);
      }
      fillStyle = value;
    },
    fillRect(x, y, w, h) {
      if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
        throw new RangeError(`invalid rect ${x},${y},${w},${h}`);
      }
      if (fillStyle === "") throw new Error("fillRect before fillStyle");
      fills.push({ x, y, w, h, color: fillStyle });
    },
  };
};

const palette = { b: "#fff", e: "#000", k: "#f00", t: "#0ff", l: "#00f" };
const inked = (rows) =>
  rows.join("").split("").filter((c) => c !== ".").length;

test("duck frames match the duck's hitbox at pixel scale", () => {
  for (const frame of DUCK_FRAMES) {
    assert.equal(frame.length * PIXEL, DUCK_HEIGHT);
    for (const row of frame) assert.equal(row.length * PIXEL, DUCK_WIDTH);
  }
});

test("the blueprint sprite is square", () => {
  assert.equal(BLUEPRINT_PIXELS.length, 8);
  for (const row of BLUEPRINT_PIXELS) assert.equal(row.length, 8);
});

test("every sprite pixel has a palette key", () => {
  const used = new Set(
    [...DUCK_FRAMES.flat(), ...BLUEPRINT_PIXELS].join("").replaceAll(".", ""),
  );
  for (const key of used) assert.ok(SPRITE_KEYS.includes(key), key);
});

test("drawSprite fills one rect per inked pixel", () => {
  const ctx = recordingContext();
  drawSprite(ctx, DUCK_FRAMES[0], 10, 20, PIXEL, palette, false);
  assert.equal(ctx.fills.length, inked(DUCK_FRAMES[0]));
  assert.ok(ctx.fills.every((f) => f.x >= 10 && f.y >= 20));
});

test("drawSprite mirrors horizontally when flipped", () => {
  const rows = ["b.."];
  const plain = recordingContext();
  drawSprite(plain, rows, 0, 0, 2, palette, false);
  const flipped = recordingContext();
  drawSprite(flipped, rows, 0, 0, 2, palette, true);
  assert.equal(plain.fills[0].x, 0);
  assert.equal(flipped.fills[0].x, 4);
});

test("drawSprite refuses a pixel with no color", () => {
  assert.throws(
    () => drawSprite(recordingContext(), ["z"], 0, 0, 2, palette, false),
    /No color for pixel "z"/,
  );
});
