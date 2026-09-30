import { useEffect, useRef, useState } from "react";
import {
  APP_STORE_URL,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MELLO_URL,
  PERMIT_MINER_URL,
  beforeSoftware,
  beforeSoftwareIntro,
  melloBuilt,
  melloInProgress,
  melloScreens,
  otherProjects,
  permitBuilt,
  stack,
} from "./content.js";
import "./App.css";

const ExternalLink = ({ href, className, children }) => (
  <a
    href={href}
    className={className}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

// Mello figures come from the App Store listing; Permit Miner figures come
// from its live pricing and homepage.
const melloFacts = [
  { value: "Jul '26", label: "launched" },
  { value: "v1.0.4", label: "on the App Store" },
  { value: "iOS", label: "Android next" },
];

const permitFacts = [
  { value: "$49", label: "a month to start" },
  { value: "14 days", label: "free trial" },
  { value: "12 hrs", label: "between source checks" },
];

const Arrow = () => (
  <svg
    className="arrow"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path
      d="M4.5 11.5l7-7M5.5 4.5h6v6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Facts = ({ items }) => (
  <dl className="facts">
    {items.map((item) => (
      <div key={item.label}>
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </div>
    ))}
  </dl>
);

const BuiltList = ({ items }) => (
  <ul className="built">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

// Work that has not shipped yet, kept visually below the shipped list
const InProgress = ({ id, title, summary, items }) => (
  <div className="in-progress">
    <h3 id={id} className="in-progress-title">
      <span className="status">In progress</span> {title}
    </h3>
    <p>{summary}</p>
    <ul aria-labelledby={id}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

// public/portrait.png is the GitHub avatar with the background masked out,
// shrunk to one pixel per dot and stored as grayscale plus alpha.
const PORTRAIT_SRC = "/portrait.png";
const PORTRAIT_COLS = 88;
const PORTRAIT_ROWS = 75;
// Below this alpha a pixel is leftover edge from the background mask
const PORTRAIT_ALPHA_CUTOFF = 32;
// Dots are drawn in this many brightness steps so each step is one path
const PORTRAIT_LEVELS = 10;
// Radius and opacity per step, as a fraction of the grid spacing. The floor
// keeps dark hair, beard and shirt visible as a faint silhouette.
const PORTRAIT_RADIUS_MIN = 0.14;
const PORTRAIT_RADIUS_MAX = 0.46;
const PORTRAIT_OPACITY_MIN = 0.2;
// Brightness is stretched between these percentiles of the subject itself,
// then eased so mid tones on the face separate from the hair
const PORTRAIT_LOW_PERCENTILE = 0.03;
const PORTRAIT_HIGH_PERCENTILE = 0.995;
const PORTRAIT_GAMMA = 1.8;
// Pointer push, in CSS pixels, and the spring that brings dots home
const PUSH_RADIUS = 70;
const PUSH_STRENGTH = 2.2;
const SPRING = 0.07;
const DAMPING = 0.8;
// A dot slower than REST_SPEED (px per frame) and within REST_DISTANCE of
// home snaps home. A dot the pointer is holding off counts as settled once it
// is slow, wherever it is; every other dot must also be home.
const REST_SPEED = 0.05;
const REST_DISTANCE = 0.5;

const percentile = (sorted, fraction) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];

// Reads the small portrait into dot positions and brightness steps, sorted by
// step so drawing needs one fill per step
const readPortrait = (imageData) => {
  const { data } = imageData;
  const cells = [];
  for (let row = 0; row < PORTRAIT_ROWS; row += 1) {
    for (let col = 0; col < PORTRAIT_COLS; col += 1) {
      const i = (row * PORTRAIT_COLS + col) * 4;
      if (data[i + 3] > PORTRAIT_ALPHA_CUTOFF) {
        cells.push({ col, row, lum: data[i] / 255 });
      }
    }
  }
  const sorted = cells.map((cell) => cell.lum).sort((a, b) => a - b);
  const low = percentile(sorted, PORTRAIT_LOW_PERCENTILE);
  const high = percentile(sorted, PORTRAIT_HIGH_PERCENTILE);
  const range = Math.max(high - low, 1e-3);
  cells.forEach((cell) => {
    const t = Math.min(1, Math.max(0, (cell.lum - low) / range));
    cell.level = Math.round(t ** PORTRAIT_GAMMA * (PORTRAIT_LEVELS - 1));
  });
  cells.sort((a, b) => a.level - b.level);

  const count = cells.length;
  const dots = {
    count,
    col: new Uint8Array(count),
    row: new Uint8Array(count),
    levelEnd: new Uint32Array(PORTRAIT_LEVELS),
    homeX: new Float32Array(count),
    homeY: new Float32Array(count),
    x: new Float32Array(count),
    y: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
  };
  cells.forEach((cell, i) => {
    dots.col[i] = cell.col;
    dots.row[i] = cell.row;
    dots.levelEnd[cell.level] = i + 1;
  });
  // Empty steps end where the previous one did
  for (let level = 1; level < PORTRAIT_LEVELS; level += 1) {
    dots.levelEnd[level] = Math.max(
      dots.levelEnd[level],
      dots.levelEnd[level - 1],
    );
  }
  return dots;
};

const DotPortrait = ({ className }) => {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) {
      return undefined;
    }

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hasObserver = "IntersectionObserver" in window;
    // Read on every use, so turning reduced motion on after load takes effect
    const isInteractive = () =>
      hasObserver && finePointer.matches && !reducedMotion.matches;

    let dots = null;
    let width = 0;
    let height = 0;
    let spacing = 0;
    let color = "";
    let frame = 0;
    let visible = true;
    let settled = true;
    let pointer = null;
    let disposed = false;

    const sendHome = () => {
      for (let i = 0; i < dots.count; i += 1) {
        dots.x[i] = dots.homeX[i];
        dots.y[i] = dots.homeY[i];
        dots.vx[i] = 0;
        dots.vy[i] = 0;
      }
      settled = true;
    };

    const layout = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      spacing = width / PORTRAIT_COLS;
      height = spacing * PORTRAIT_ROWS;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (let i = 0; i < dots.count; i += 1) {
        dots.homeX[i] = (dots.col[i] + 0.5) * spacing;
        dots.homeY[i] = (dots.row[i] + 0.5) * spacing;
      }
      sendHome();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      let start = 0;
      for (let level = 0; level < PORTRAIT_LEVELS; level += 1) {
        const end = dots.levelEnd[level];
        if (end > start) {
          const t = level / (PORTRAIT_LEVELS - 1);
          const radius =
            spacing *
            (PORTRAIT_RADIUS_MIN +
              (PORTRAIT_RADIUS_MAX - PORTRAIT_RADIUS_MIN) * t);
          context.globalAlpha =
            PORTRAIT_OPACITY_MIN + (1 - PORTRAIT_OPACITY_MIN) * t;
          context.beginPath();
          for (let i = start; i < end; i += 1) {
            context.moveTo(dots.x[i] + radius, dots.y[i]);
            context.arc(dots.x[i], dots.y[i], radius, 0, Math.PI * 2);
          }
          context.fill();
        }
        start = end;
      }
      context.globalAlpha = 1;
    };

    // One physics step per frame. The loop ends itself as soon as every dot
    // is slow, including dots held off by a pointer that has stopped, so a
    // resting or absent pointer costs nothing.
    const step = () => {
      frame = 0;
      let moving = false;
      for (let i = 0; i < dots.count; i += 1) {
        let held = false;
        if (pointer) {
          const dx = dots.x[i] - pointer.x;
          const dy = dots.y[i] - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < PUSH_RADIUS && distance > 0) {
            held = true;
            const push = (1 - distance / PUSH_RADIUS) * PUSH_STRENGTH;
            dots.vx[i] += (dx / distance) * push;
            dots.vy[i] += (dy / distance) * push;
          }
        }
        dots.vx[i] =
          (dots.vx[i] + (dots.homeX[i] - dots.x[i]) * SPRING) * DAMPING;
        dots.vy[i] =
          (dots.vy[i] + (dots.homeY[i] - dots.y[i]) * SPRING) * DAMPING;
        dots.x[i] += dots.vx[i];
        dots.y[i] += dots.vy[i];
        const slow =
          Math.abs(dots.vx[i]) < REST_SPEED &&
          Math.abs(dots.vy[i]) < REST_SPEED;
        const home =
          Math.abs(dots.x[i] - dots.homeX[i]) < REST_DISTANCE &&
          Math.abs(dots.y[i] - dots.homeY[i]) < REST_DISTANCE;
        if (slow && home) {
          dots.x[i] = dots.homeX[i];
          dots.y[i] = dots.homeY[i];
          dots.vx[i] = 0;
          dots.vy[i] = 0;
        } else if (!slow || !held) {
          moving = true;
        }
      }
      draw();
      settled = !moving;
      if (moving && visible) {
        frame = window.requestAnimationFrame(step);
      }
    };

    const start = () => {
      if (!frame && visible && dots && isInteractive()) {
        frame = window.requestAnimationFrame(step);
      }
    };

    const stop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onPointerMove = (event) => {
      if (event.pointerType === "touch" || !isInteractive()) {
        return;
      }
      const box = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      settled = false;
      start();
    };

    const onPointerLeave = () => {
      pointer = null;
      settled = false;
      start();
    };

    const refresh = () => {
      if (!dots) {
        return;
      }
      stop();
      layout();
      // Read once here: the canvas takes its color from CSS
      color = getComputedStyle(canvas).color;
      draw();
    };

    // Reduced motion switched on, or the pointer became coarse: freeze on a
    // static frame with every dot at home
    const onPreferenceChange = () => {
      if (!dots || isInteractive()) {
        return;
      }
      stop();
      pointer = null;
      sendHome();
      draw();
    };

    const image = new Image();
    image.onload = () => {
      if (disposed) {
        return;
      }
      const source = document.createElement("canvas");
      source.width = PORTRAIT_COLS;
      source.height = PORTRAIT_ROWS;
      const sourceContext = source.getContext("2d", {
        willReadFrequently: true,
      });
      sourceContext.drawImage(image, 0, 0, PORTRAIT_COLS, PORTRAIT_ROWS);
      dots = readPortrait(
        sourceContext.getImageData(0, 0, PORTRAIT_COLS, PORTRAIT_ROWS),
      );
      refresh();
    };
    // Without the image there is nothing to describe, so the portrait and
    // its role="img" leave the page
    image.onerror = () => {
      if (!disposed) {
        setFailed(true);
      }
    };
    image.src = PORTRAIT_SRC;

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(refresh) : null;
    if (resizeObserver) {
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", refresh);
    }

    let visibilityObserver = null;
    if (hasObserver) {
      visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          stop();
        } else if (!settled) {
          start();
        }
      });
      visibilityObserver.observe(canvas);
    }
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    finePointer.addEventListener("change", onPreferenceChange);
    reducedMotion.addEventListener("change", onPreferenceChange);

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      stop();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refresh);
      visibilityObserver?.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      finePointer.removeEventListener("change", onPreferenceChange);
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  if (failed) {
    return null;
  }

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="portrait"
        role="img"
        aria-label="Portrait of Daniel Castillo"
      />
    </div>
  );
};

// Sections start visible and are only hidden once an observer exists to
// reveal them, so a missing or failing observer can never leave the page
// blank. Reduced motion skips the effect entirely.
const useRevealOnScroll = (rootRef) => {
  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!root || reduceMotion || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const sections = root.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.reveal = "shown";
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    sections.forEach((section) => {
      section.dataset.reveal = "pending";
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.dataset.reveal = "shown";
      });
    };
  }, [rootRef]);
};

const Portfolio = () => {
  const mainRef = useRef(null);
  useRevealOnScroll(mainRef);

  return (
    <>
      <header className="top">
        <nav aria-label="Primary">
          <a href="#mello">Mello</a>
          <a href="#permit-miner">Permit Miner</a>
          <a href="#before-software">Before software</a>
          <a href="#about">About</a>
          <a href={`mailto:${EMAIL}`}>Email</a>
        </nav>
      </header>

      <main ref={mainRef}>
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="display hero-name">
            <span className="line">
              <span>Daniel</span>
            </span>
            <span className="line">
              <span>Castillo</span>
            </span>
          </h1>
          <div className="hero-foot">
            <p className="hero-line">
              Software engineer in Utah. I build products and ship them to real
              people.
            </p>
            <div>
              <p className="live-tags">
                <a href="#mello" className="live-tag is-mello">
                  <span className="live-dot" aria-hidden="true" />
                  Mello, live on iOS
                </a>
                <a href="#permit-miner" className="live-tag is-permit">
                  <span className="live-dot" aria-hidden="true" />
                  Permit Miner, live in Utah
                </a>
              </p>
              <div className="hero-actions">
                <a href="#mello" className="pill">
                  See the work
                </a>
                <p className="hero-links">
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>
                  <ExternalLink href={LINKEDIN_URL}>LinkedIn</ExternalLink>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="band band-mello"
          id="mello"
          data-reveal=""
          aria-labelledby="mello-title"
        >
          <div className="band-copy">
            <p className="band-label">
              <img src="/work/mello-icon.png" alt="" width="40" height="40" />
              01 of 02, live on the App Store
            </p>
            <h2 id="mello-title" className="display">
              Mello
            </h2>
            <p className="band-lede">
              Make friends by showing up. An events-first app where you find a
              local activity, RSVP, and meet people in person instead of
              swiping.
            </p>
            <Facts items={melloFacts} />
            <BuiltList items={melloBuilt} />
            <InProgress id="mello-next-title" {...melloInProgress} />
            <p className="band-links">
              <ExternalLink href={APP_STORE_URL} className="pill">
                Get it on the App Store
              </ExternalLink>
              <ExternalLink href={MELLO_URL}>mellomeet.com</ExternalLink>
            </p>
          </div>
          {/* Focusable so the row can be scrolled from the keyboard where it
              becomes a swipe row on phones; on wider screens it is only an
              extra tab stop */}
          <div
            className="phones"
            role="region"
            aria-label="Mello screenshots"
            tabIndex={0}
          >
            {melloScreens.map((screen) => (
              <img
                key={screen.src}
                src={screen.src}
                alt={screen.alt}
                width="600"
                height="1300"
                loading="lazy"
              />
            ))}
          </div>
        </section>

        <section
          className="band band-permit"
          id="permit-miner"
          data-reveal=""
          aria-labelledby="permit-title"
        >
          <div className="band-copy">
            <p className="band-label">
              <img
                src="/work/permitminer-icon.png"
                alt=""
                width="40"
                height="40"
              />
              02 of 02, live with paid plans
            </p>
            <h2 id="permit-title" className="display">
              Permit
              <br />
              Miner
            </h2>
            <p className="band-lede">
              Utah building permits with the contractor contact attached, so
              subcontractors can bid on new work the day it is filed.
            </p>
            <Facts items={permitFacts} />
            <BuiltList items={permitBuilt} />
            <p className="band-links">
              <ExternalLink href={PERMIT_MINER_URL} className="pill">
                Visit permitminer.com
              </ExternalLink>
            </p>
          </div>
          <ExternalLink href={PERMIT_MINER_URL} className="browser">
            <span className="browser-bar" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <img
              src="/work/permitminer.jpg"
              alt="The Permit Miner homepage, headlined The permit is filed. You need a contact that answers."
              width="1600"
              height="950"
              loading="lazy"
            />
          </ExternalLink>
        </section>

        <section className="more" data-reveal="" aria-labelledby="more-title">
          <h2 id="more-title" className="eyebrow">
            Also built
          </h2>
          <ul>
            {otherProjects.map((project) => (
              <li key={project.name}>
                <ExternalLink href={project.href} className="more-row">
                  <span className="more-name">{project.name}</span>
                  <span className="more-description">
                    {project.description}
                  </span>
                  <span className="more-link">
                    {project.linkLabel}
                    <Arrow />
                  </span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="before"
          id="before-software"
          data-reveal=""
          aria-labelledby="before-title"
        >
          <h2 id="before-title" className="eyebrow">
            Before software
          </h2>
          <p className="before-intro">{beforeSoftwareIntro}</p>
          <ul>
            {beforeSoftware.map((venture) => (
              <li key={venture.name} className="before-row">
                <h3 className="before-name">{venture.name}</h3>
                <p className="before-meta">
                  <span>{venture.role}</span>
                  <span>{venture.dates}</span>
                </p>
                <p className="before-description">{venture.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="about"
          id="about"
          data-reveal=""
          aria-labelledby="about-title"
        >
          <p className="eyebrow">About</p>
          <div className="about-grid">
            <h2 id="about-title" className="about-title">
              From the database schema to the App Store listing, I do the whole
              thing.
            </h2>
            <DotPortrait className="about-portrait" />
            <div className="about-copy">
              <p>
                I'm finishing a Software Development certificate at Dixie
                Technical College and running two products of my own. Both are
                closed source and built solo.
              </p>
              <p>
                I speak English, Spanish, and Italian. When I'm not shipping, I
                bake.
              </p>
            </div>
          </div>
          <ul className="stack" aria-label="Stack">
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section
          className="contact"
          data-reveal=""
          aria-labelledby="contact-title"
        >
          <h2 id="contact-title" className="eyebrow">
            Say hi
          </h2>
          <a className="contact-email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Daniel Castillo</p>
        <p>
          <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>
          <ExternalLink href={LINKEDIN_URL}>LinkedIn</ExternalLink>
        </p>
      </footer>
    </>
  );
};

export default Portfolio;
