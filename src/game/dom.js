import { ledgeAreaTop } from "./layout.js";
import { toPlatforms } from "./world.js";

// Only things that look solid are ledges: icon circles and the rule above
// them, skill chips, the phone shots and browser frame, the in-progress box,
// buttons, list rows, the name wordmark and the footer rule. Text blocks are
// left out, so the duck never stands on a paragraph or in thin air.
export const PLATFORM_SELECTOR = [
  ".hero-foot",
  ".icon-link",
  ".stack li",
  ".phones img",
  ".in-progress",
  ".band-links .pill",
  ".browser",
  ".more-row",
  ".before-row",
  ".wordmark .line",
  ".footer",
].join(", ");

// One blueprint per section, in reading order: About at the top, Mello,
// Permit Miner, Before software, then the name wordmark.
export const SECTION_SELECTORS = [
  "#about",
  "#mello",
  "#permit-miner",
  "#before-software",
  ".wordmark",
];
// Floating ledges keep this far from the page's left and right edges.
const LEDGE_AREA_MARGIN = 24;

// Sections fade and slide in as they scroll into view, and a waiting section
// sits lower than where it ends up. Showing every section when the game
// starts keeps each ledge where the player sees it.
export const revealAll = () => {
  for (const section of document.querySelectorAll('[data-reveal="pending"]')) {
    section.dataset.reveal = "shown";
  }
};

// The wordmark lines use a line box tighter than the font, which leaves the
// cap tops this far below each box's top edge. The ledge sits on the letters.
const WORDMARK_CAP_OFFSET_EM = 0.04;

const ledgeRect = (element) => {
  const rect = element.getBoundingClientRect();
  if (!element.matches(".wordmark .line")) return rect;
  const offset =
    parseFloat(getComputedStyle(element).fontSize) * WORDMARK_CAP_OFFSET_EM;
  return {
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height - offset,
    top: rect.top + offset,
  };
};

const rectsOf = (elements) => elements.map(ledgeRect);

export const readPlatforms = () =>
  toPlatforms(
    rectsOf([...document.querySelectorAll(PLATFORM_SELECTOR)]),
    window.scrollX,
    window.scrollY,
  );

const pageRange = (element) => {
  const rect = element.getBoundingClientRect();
  return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
};

export const readSections = () =>
  SECTION_SELECTORS.map((selector) => document.querySelector(selector))
    .filter(Boolean)
    .map(pageRange);

// Floating ledges run from the top of the first section to the footer.
export const readLedgeArea = () => ({
  left: LEDGE_AREA_MARGIN,
  right: document.documentElement.scrollWidth - LEDGE_AREA_MARGIN,
  // offsetHeight ignores the bar's hide-on-scroll transform.
  top: ledgeAreaTop(
    pageRange(document.querySelector(SECTION_SELECTORS[0])).top,
    document.querySelector(".top").offsetHeight,
  ),
  bottom: pageRange(document.querySelector(".footer")).top,
});

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
