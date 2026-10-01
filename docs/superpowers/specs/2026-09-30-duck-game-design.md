# Duck game mode

Date: 2026-09-30
Status: awaiting review

## Goal

A small optional game that plays on top of the real portfolio page. It gives
visitors a memorable reason to explore every section and ends by putting the
contact email in front of them. It must cost nothing for visitors who never
start it.

## Decisions the user made

Quoted as stated in the session:

- "can we add a little game to our site like gazi does too" (reference:
  gazijarin.com game mode, a pixel character that platforms across the page
  and collects items with a "0 / 5" counter).
- "do 1 but a small duck character". Option 1 was a character platforming
  across the page, collecting 5 blueprints, ending with a hiring prompt.
- "but the game is on the page it wont lead to a new page".
- "the design as described", approving the design below.

Not decided by the user, so this spec picks defaults: the physics numbers,
the exact platform set, and where each blueprint sits.

## Scope

In:

- A "Game mode" toggle in the top bar, visible only on desktop.
- A pixel-art duck drawn in code, moved by the keyboard, colliding with real
  page elements.
- Five blueprint collectibles, one each in: the About section at the top,
  Mello, Permit Miner, Before software, and the name wordmark.
- A "0 / 5" counter while playing.
- A win card: "Hired? dancastlebiz@gmail.com" with a copy-email button.
- Exit with Esc or the toggle, restoring the page exactly.

Out: enemies, lives, timers, sound, saved scores, touch controls, a separate
route, analytics.

## Who sees it

The toggle renders only when `(pointer: fine) and (hover: hover)` match and
the viewport is at least 64rem wide. It re-checks on media query changes. On
phones and tablets there is no toggle and no game code is downloaded.

## Experience

1. The visitor clicks "Game mode" (a `button` with `aria-pressed`). The duck
   appears standing on the rule above the About tags and icons. The counter shows "0 / 5". A one-line
   hint shows the controls for 4 seconds: "Arrows or A/D to move, Space or W to
   jump, Esc to exit".
2. The duck waddles with Left/Right or A/D and jumps with Space, Up or W.
   Holding jump in the air slows the fall slightly (a flap), which is the
   duck's one trick.
3. Platforms are the top edges of real elements: section headings and
   eyebrows, the About tag and icon row, live tags and buttons, the two
   lines of the name wordmark, product "built" list
   items, skill chips, "Also built" and "Before software" rows, and section
   divider lines. The duck lands on them from above and passes through them
   from below (one-way platforms).
4. The page scrolls to keep the duck in the middle third of the viewport. If
   the duck falls below the bottom of the page it returns to its starting
   spot at the top, keeping every blueprint it has collected, so a missed
   blueprint can always be retried.
5. Touching a blueprint collects it with a short sparkle, increments the
   counter and announces "Blueprint 2 of 5" through a polite live region.
6. At 5 of 5 the win card appears centered over the page: "Hired?", the
   email, a "Copy email" button (clipboard API, with a fallback that selects
   the text), and "Keep playing" / "Exit" buttons. Focus moves into the card
   and Esc closes it.
7. Esc or the toggle ends the game. The overlay and listeners are removed, the
   counter resets, and scrolling returns to normal.

## Technical design

- **Lazy loading.** The game lives in its own module
  (`src/game/DuckGame.jsx` plus small helpers). It is loaded with a dynamic
  `import()` on the first toggle click, so the initial bundle does not grow
  except for the toggle.
- **Rendering.** A single fixed, full-viewport canvas with
  `pointer-events: none` and `aria-hidden="true"` draws the duck, blueprints
  and effects in page coordinates offset by scroll. Colors come from CSS
  custom properties: duck body in `--text` with a `--pink` beak and feet,
  blueprints in `--cyan`.
- **Platforms.** On start and on resize, scroll or layout change
  (ResizeObserver on `main`), the game reads `getBoundingClientRect()` of the
  platform elements, found with one selector list, and stores their top
  edges in page coordinates. It does not modify page elements.
- **Physics.** Fixed timestep of 1/60 s with an accumulator. Gravity, run
  speed, jump velocity and flap drag are named constants tuned by playtesting.
  Collision is one-way against platform top edges only.
- **Input.** While the game runs, the arrow keys, Space, W, A and D call
  `preventDefault` so the page does not scroll by keyboard. Nothing is
  intercepted when the game is off. The Konami listener ignores keys while
  the game is running.
- **Loop.** requestAnimationFrame runs only while the game is active and the
  tab is visible (it pauses on `visibilitychange`).
- **Reduced motion.** The game is user-started, so it still runs, but the
  collect sparkle and landing squash are skipped and camera scrolling jumps
  instead of easing.
- **Cleanup.** Exiting cancels the frame, disconnects observers, removes all
  listeners and the canvas, and restores the previous scroll behavior.

## Accessibility

- The toggle is a real button with a visible focus ring and `aria-pressed`.
- The counter and collection messages use one `aria-live="polite"` region.
- The win card is a `dialog` with a labelled heading. Focus moves in on open
  and returns to the toggle on close.
- The game never traps focus outside the win card, and Esc always exits.

## Verification

- Playwright at 1440x900 against the dev server: start the game, check every
  blueprint is reachable from the start with a movement-envelope search over
  the real platforms, then for each blueprint place the duck beside it through
  a development-only hook (`import.meta.env.DEV`, stripped from production)
  and collect it with real key presses. Assert the counter reaches 5 and the
  win card opens with the email.
- Copy button writes the email to the clipboard (with a permission grant in
  the test).
- Exit restores the page: no overlay canvas, no listeners (checked with a
  keydown count), arrow keys scroll the page again.
- Idle: with the game off, 0 requestAnimationFrame calls and no game module
  loaded (network log). With the game on and the tab hidden, 0 calls.
- No toggle rendered at 390 and 768, or under a coarse pointer.
- No horizontal scroll from 320 to 2560. The hero first screen is unchanged.
- Screenshots of play and the win card at 1440 and 1920, reviewed by eye.
- Code review, then ship to main the same way as the redesign.

## Rollback

The feature is one toggle plus a lazily loaded module. Reverting the commit
removes it. Nothing is stored, so there is no data to clean up.
