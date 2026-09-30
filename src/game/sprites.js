// Pixel art as strings keeps the sprites in source, with no image requests.
// Keys: "." transparent, "b" body, "e" eye, "k" beak and feet,
// "t" blueprint paper, "l" blueprint lines.
export const PIXEL = 2;
export const SPRITE_KEYS = ["b", "e", "k", "t", "l"];

const DUCK_BODY = [
  "......bbbb....",
  ".....bbbbbb...",
  ".....bbbbebb..",
  ".....bbbbbbkkk",
  "......bbbbbkk.",
  "b.....bbbb....",
  "bb..bbbbbbb...",
  "bbbbbbbbbbbb..",
  ".bbbbbbbbbbb..",
  "..bbbbbbbbb...",
];

export const DUCK_FRAMES = [
  [...DUCK_BODY, ".....k..k.....", "....kk.kk....."],
  [...DUCK_BODY, "......k..k....", ".....kk.kk...."],
];

export const BLUEPRINT_PIXELS = [
  ".tttttt.",
  "tttttttt",
  "tllllllt",
  "tttttttt",
  "tllltttt",
  "tttttttt",
  ".tttttt.",
  "........",
];

export const drawSprite = (ctx, rows, x, y, scale, palette, flip) => {
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column++) {
      const key = row[column];
      if (key === ".") continue;
      const color = palette[key];
      if (!color) throw new Error(`No color for pixel "${key}"`);
      const drawColumn = flip ? row.length - 1 - column : column;
      ctx.fillStyle = color;
      ctx.fillRect(x + drawColumn * scale, y + rowIndex * scale, scale, scale);
    }
  });
};
