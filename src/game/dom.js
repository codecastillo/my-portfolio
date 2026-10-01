import { ledgeAreaTop } from "./layout.js";

// One blueprint per section, in reading order: About at the top, Mello,
// Permit Miner, Before software, then the name wordmark.
export const SECTION_SELECTORS = [
  "#about",
  "#mello",
  "#permit-miner",
  "#before-software",
  ".wordmark",
];
// Text and images the floating ledges try to keep clear of. The faint name
// wordmark is left out: it is decoration, and ledges may float over it.
const BLOCKING_SELECTOR =
  "h1, h2, h3, p:not(.wordmark-name), li, .phones img, .browser, .facts";
// Floating ledges keep this far from the page's left and right edges.
const LEDGE_AREA_MARGIN = 24;
export const FLOOR_ID = "floor";

// Sections fade and slide in as they scroll into view, and a waiting section
// sits lower than where it ends up. Showing every section when the game
// starts keeps each ledge where the player sees it.
export const revealAll = () => {
  for (const section of document.querySelectorAll('[data-reveal="pending"]')) {
    section.dataset.reveal = "shown";
  }
};

const pageRect = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    top: rect.top + window.scrollY,
    bottom: rect.bottom + window.scrollY,
  };
};

export const readSections = () =>
  SECTION_SELECTORS.map((selector) => document.querySelector(selector))
    .filter(Boolean)
    .map(pageRect);

export const readBlocked = () =>
  [...document.querySelectorAll(BLOCKING_SELECTOR)].map(pageRect);

// Floating ledges run from the top of the first section to the footer.
export const readLedgeArea = () => ({
  left: LEDGE_AREA_MARGIN,
  right: document.documentElement.scrollWidth - LEDGE_AREA_MARGIN,
  // offsetHeight ignores the bar's hide-on-scroll transform.
  top: ledgeAreaTop(
    pageRect(document.querySelector(SECTION_SELECTORS[0])).top,
    document.querySelector(".top").offsetHeight,
  ),
  bottom: pageRect(document.querySelector(".footer")).top,
});

// An undrawn floor along the footer, so a duck that misses every ledge lands
// at the bottom of the page instead of falling out of it.
export const readFloor = () => ({
  id: FLOOR_ID,
  left: 0,
  right: document.documentElement.scrollWidth,
  top: pageRect(document.querySelector(".footer")).top,
});
