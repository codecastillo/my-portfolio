import { toBlueprints, toPlatforms } from "./world.js";

// Top edges a visitor would read as ledges: text blocks, icons, list
// items, rows, chips and the two lines of the name wordmark. Images are left
// out so the duck falls past the phone and browser shots.
export const PLATFORM_SELECTOR = [
  ".hero-foot",
  ".icon-link",
  ".band-label",
  ".band .display",
  ".band-lede",
  ".built li",
  ".in-progress",
  ".band-links .pill",
  ".eyebrow",
  ".more-row",
  ".before-intro",
  ".before-row",
  ".about-title",
  ".about-copy p",
  ".stack li",
  ".wordmark .line",
  ".contact-email",
].join(", ");

// One blueprint per section, in reading order: About at the top, Mello,
// Permit Miner, Before software, then the name wordmark.
export const BLUEPRINT_ANCHORS = [
  "#about .icon-link:last-child",
  "#mello .built li:last-child",
  "#permit-miner .built li:last-child",
  "#before-software .before-row:last-child",
  ".wordmark .line:last-child",
];

const rectsOf = (elements) =>
  elements.map((element) => element.getBoundingClientRect());

export const readPlatforms = () =>
  toPlatforms(
    rectsOf([...document.querySelectorAll(PLATFORM_SELECTOR)]),
    window.scrollX,
    window.scrollY,
  );

export const readBlueprints = (collected) =>
  toBlueprints(
    rectsOf(
      BLUEPRINT_ANCHORS.map((selector) => document.querySelector(selector)).filter(
        Boolean,
      ),
    ),
    window.scrollX,
    window.scrollY,
    collected,
  );

// The duck starts on the rule above the icon links, left of the first
// blueprint, so the first thing a player does is walk over and hop for it.
const START_OFFSET = 40;

export const readStart = () => {
  const rect = document.querySelector("#about .hero-foot").getBoundingClientRect();
  return {
    x: rect.left + window.scrollX + START_OFFSET,
    y: rect.top + window.scrollY,
  };
};
