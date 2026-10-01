import { useEffect, useRef, useState } from "react";
import { EMAIL } from "../content.js";
import {
  FLOOR_ID,
  SECTION_SELECTORS,
  readBlocked,
  readFloor,
  readLedgeArea,
  readSections,
  revealAll,
} from "./dom.js";
import { generateLedges, placeBlueprints, seededRandom } from "./layout.js";
import {
  DUCK_HEIGHT,
  DUCK_WIDTH,
  createDuck,
  stepDuck,
  stepsFor,
} from "./physics.js";
import {
  BLUEPRINT_PIXELS,
  DUCK_FRAMES,
  PIXEL,
  drawSprite,
} from "./sprites.js";
import {
  BLUEPRINT_LIFT,
  cameraTarget,
  collectTouched,
  reachableBlueprints,
} from "./world.js";

const HINT_MS = 4000;
const WADDLE_MS = 140;
const CAMERA_EASE = 0.15;
const SPARKLE_MS = 400;
const SPARKLE_SPREAD = 18;
// Ledges are drawn as short cyan bars with a dotted underside, so a player
// can see where to land.
const LEDGE_ALPHA = 0.85;
const LEDGE_THICKNESS = 3;
const LEDGE_DOT_ALPHA = 0.35;
const LEDGE_DOT_STEP = 6;
// The duck starts on the first floating ledge, at the top of the page.
const START_LEDGE_ID = "ledge-0-0";
// Landing squashes the duck and rising stretches it, by these fractions.
const SQUASH_MS = 110;
const SQUASH = 0.2;
const STRETCH = 0.12;
const DUST_MS = 320;
const DUST_SPREAD = 14;
const BLUEPRINT_DRAW = BLUEPRINT_PIXELS.length * PIXEL;
// Test hook only: a duck placed this far left of a blueprint already overlaps
// it horizontally, so a running jump touches it on the way up. From farther
// out, the jump rises past the blueprint before reaching it.
const PLACE_OFFSET = 20;
const TOTAL = SECTION_SELECTORS.length;

const KEY_ACTIONS = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
};

const readPalette = () => {
  const style = getComputedStyle(document.documentElement);
  const token = (name) => style.getPropertyValue(name).trim();
  return {
    b: token("--text"),
    e: token("--navy"),
    k: token("--pink"),
    t: token("--cyan"),
    l: token("--navy"),
  };
};

const DuckGame = ({ onExit }) => {
  const canvasRef = useRef(null);
  const dialogRef = useRef(null);
  const emailRef = useRef(null);
  const [count, setCount] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [won, setWon] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (won && !dialogRef.current.open) dialogRef.current.showModal();
  }, [won]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The Konami listener reads this and stands down while the arrows drive
    // the duck.
    root.dataset.game = "on";
    // Space right after clicking the toggle must jump, not press the button.
    document.activeElement?.blur();

    revealAll();
    let platforms = [];
    // One seed per game: a relayout rebuilds the same random layout at the
    // page's new size instead of reshuffling it under the player.
    const seed = Math.floor(Math.random() * 2 ** 32);
    let blueprints = [];
    const build = (collected) => {
      const ledges = generateLedges(
        readLedgeArea(),
        seededRandom(seed),
        readBlocked(),
      );
      platforms = [...ledges, readFloor()];
      blueprints = placeBlueprints(
        ledges,
        readSections(),
        seededRandom(seed + 1),
        collected,
      );
    };
    build([]);
    const startLedge = platforms.find((p) => p.id === START_LEDGE_ID);
    let duck = createDuck((startLedge.left + startLedge.right) / 2, startLedge.top);
    let palette = readPalette();
    let sparkles = [];
    let dust = [];
    let landedAt = -Infinity;
    let carry = 0;
    let last = null;
    let frame = 0;
    const input = { left: false, right: false, jump: false, jumpPressed: false };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
    };

    const relayout = () => {
      // A standing duck rides its ledge to wherever the ledge moved.
      const standingOn =
        duck.onGround &&
        platforms.find(
          (p) =>
            Math.abs(p.top - duck.y) < 1 &&
            duck.x + DUCK_WIDTH / 2 > p.left &&
            duck.x - DUCK_WIDTH / 2 < p.right,
        );
      build(blueprints.map((b) => b.collected));
      const moved = standingOn && platforms.find((p) => p.id === standingOn.id);
      if (moved) {
        duck = {
          ...duck,
          x: duck.x + (moved.left - standingOn.left),
          y: moved.top,
        };
      }
      palette = readPalette();
      resize();
    };

    const draw = (now) => {
      const ratio = window.devicePixelRatio || 1;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.translate(-window.scrollX, -window.scrollY);
      const viewTop = window.scrollY - LEDGE_THICKNESS;
      const viewBottom = window.scrollY + window.innerHeight + LEDGE_THICKNESS;
      ctx.fillStyle = palette.t;
      for (const platform of platforms) {
        if (platform.id === FLOOR_ID) continue;
        if (platform.top < viewTop || platform.top > viewBottom) continue;
        ctx.globalAlpha = LEDGE_ALPHA;
        ctx.fillRect(
          platform.left,
          platform.top - LEDGE_THICKNESS,
          platform.right - platform.left,
          LEDGE_THICKNESS,
        );
        ctx.globalAlpha = LEDGE_DOT_ALPHA;
        for (let x = platform.left; x < platform.right; x += LEDGE_DOT_STEP) {
          ctx.fillRect(x, platform.top + PIXEL, PIXEL, PIXEL);
        }
      }
      ctx.globalAlpha = 1;
      for (const blueprint of blueprints) {
        if (blueprint.collected) continue;
        drawSprite(
          ctx,
          BLUEPRINT_PIXELS,
          blueprint.x - BLUEPRINT_DRAW / 2,
          blueprint.y - BLUEPRINT_DRAW / 2,
          PIXEL,
          palette,
          false,
        );
      }
      const walking = duck.onGround && duck.vx !== 0;
      const pose = walking ? Math.floor(now / WADDLE_MS) % DUCK_FRAMES.length : 0;
      let scaleX = 1;
      let scaleY = 1;
      if (!reducedMotion.matches) {
        const sinceLanding = now - landedAt;
        if (sinceLanding < SQUASH_MS) {
          const amount = SQUASH * (1 - sinceLanding / SQUASH_MS);
          scaleX = 1 + amount;
          scaleY = 1 - amount;
        } else if (!duck.onGround && duck.vy < 0) {
          scaleX = 1 - STRETCH;
          scaleY = 1 + STRETCH;
        }
      }
      // Scale around the feet so a squash stays planted on the ledge.
      ctx.save();
      ctx.translate(duck.x, duck.y);
      ctx.scale(scaleX, scaleY);
      drawSprite(
        ctx,
        DUCK_FRAMES[pose],
        -DUCK_WIDTH / 2,
        -DUCK_HEIGHT,
        PIXEL,
        palette,
        duck.facing < 0,
      );
      ctx.restore();
      dust = dust.filter((puff) => now - puff.start < DUST_MS);
      ctx.fillStyle = palette.b;
      for (const puff of dust) {
        const age = (now - puff.start) / DUST_MS;
        ctx.globalAlpha = 1 - age;
        const spread = age * DUST_SPREAD;
        const lift = PIXEL + age * PIXEL * 2;
        ctx.fillRect(puff.x - DUCK_WIDTH / 2 - spread, puff.y - lift, PIXEL, PIXEL);
        ctx.fillRect(puff.x + DUCK_WIDTH / 2 + spread, puff.y - lift, PIXEL, PIXEL);
      }
      ctx.globalAlpha = 1;
      sparkles = sparkles.filter((sparkle) => now - sparkle.start < SPARKLE_MS);
      ctx.fillStyle = palette.t;
      for (const sparkle of sparkles) {
        const spread = ((now - sparkle.start) / SPARKLE_MS) * SPARKLE_SPREAD;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          ctx.fillRect(sparkle.x + dx * spread, sparkle.y + dy * spread, PIXEL, PIXEL);
        }
      }
    };

    const followDuck = () => {
      const target = cameraTarget(
        duck.y - DUCK_HEIGHT / 2,
        window.scrollY,
        window.innerHeight,
        root.scrollHeight,
      );
      const next = reducedMotion.matches
        ? target
        : window.scrollY + (target - window.scrollY) * CAMERA_EASE;
      // "instant" overrides the page's smooth scrolling for per-frame moves.
      if (Math.abs(next - window.scrollY) >= 0.5) {
        window.scrollTo({ top: next, behavior: "instant" });
      }
    };

    const tick = (now) => {
      const elapsed = last === null ? 0 : (now - last) / 1000;
      last = now;
      const timing = stepsFor(elapsed, carry);
      carry = timing.carry;
      const bounds = { left: 0, right: root.scrollWidth };
      for (let i = 0; i < timing.steps; i++) {
        duck = stepDuck(duck, input, platforms, bounds);
        input.jumpPressed = false;
        if (duck.landed && !reducedMotion.matches) {
          landedAt = now;
          dust.push({ x: duck.x, y: duck.y, start: now });
        }
      }
      const result = collectTouched(blueprints, duck);
      if (result.newly > 0) {
        blueprints = result.blueprints;
        const got = blueprints.filter((b) => b.collected).length;
        setCount(got);
        setAnnouncement(`Blueprint ${got} of ${blueprints.length}`);
        if (!reducedMotion.matches) {
          sparkles.push({ x: duck.x, y: duck.y - DUCK_HEIGHT, start: now });
        }
        if (got === blueprints.length) setWon(true);
      }
      followDuck();
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const onKeyDown = (event) => {
      // With the win card open, keys belong to its buttons.
      if (dialogRef.current?.open) {
        // A Space still held from the last jump auto-repeats onto the card's
        // focused button and would copy the email unasked.
        if (event.repeat) event.preventDefault();
        return;
      }
      if (event.code === "Escape") {
        onExit();
        return;
      }
      const action = KEY_ACTIONS[event.code];
      if (!action || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      if (action === "jump" && !input.jump) input.jumpPressed = true;
      input[action] = true;
    };

    const onKeyUp = (event) => {
      const action = KEY_ACTIONS[event.code];
      if (action) input[action] = false;
    };

    // A key released while another window has focus never fires keyup.
    const onBlur = () => {
      input.left = false;
      input.right = false;
      input.jump = false;
      input.jumpPressed = false;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        last = null;
        frame = requestAnimationFrame(tick);
      }
    };

    const main = document.querySelector("main");
    const observer = new ResizeObserver(relayout);
    observer.observe(main);
    // Sections fade and slide in as they scroll into view, which moves their
    // ledges without resizing anything.
    main.addEventListener("transitionend", relayout);
    window.addEventListener("resize", relayout);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    const hintTimer = setTimeout(() => setShowHint(false), HINT_MS);

    if (import.meta.env.DEV) {
      window.__duckGame = {
        state: () => ({ duck, platforms, blueprints }),
        reachable: () => {
          const startPlatform = platforms.find((p) => p.id === START_LEDGE_ID);
          return reachableBlueprints(platforms, startPlatform, blueprints);
        },
        placeBeside: (index) => {
          const blueprint = blueprints[index];
          const anchorTop = blueprint.y + BLUEPRINT_LIFT;
          duck = createDuck(blueprint.x - PLACE_OFFSET, anchorTop);
        },
      };
    }

    resize();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      main.removeEventListener("transitionend", relayout);
      window.removeEventListener("resize", relayout);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(hintTimer);
      delete root.dataset.game;
      if (import.meta.env.DEV) delete window.__duckGame;
    };
  }, [onExit]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      // Without clipboard access, select the address so a copy shortcut works.
      const range = document.createRange();
      range.selectNodeContents(emailRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />
      <div className="game-hud">
        <p className="game-count">
          {count} / {TOTAL}
        </p>
        {showHint && (
          <p className="game-hint">
            Arrows or A/D to move, Space or W to jump, Esc to exit
          </p>
        )}
        <p className="game-announce" aria-live="polite">
          {announcement}
        </p>
      </div>
      <dialog
        ref={dialogRef}
        className="game-win"
        aria-labelledby="game-win-title"
        onClose={() => setWon(false)}
      >
        <h2 id="game-win-title" className="game-win-title">
          Hired?
        </h2>
        <p ref={emailRef} className="game-win-email">
          {EMAIL}
        </p>
        <div className="game-win-actions">
          <button type="button" className="pill" onClick={copyEmail}>
            {copied ? "Copied" : "Copy email"}
          </button>
          <button
            type="button"
            className="game-win-secondary"
            onClick={() => dialogRef.current.close()}
          >
            Keep playing
          </button>
          <button type="button" className="game-win-secondary" onClick={onExit}>
            Exit
          </button>
        </div>
      </dialog>
    </>
  );
};

export default DuckGame;
