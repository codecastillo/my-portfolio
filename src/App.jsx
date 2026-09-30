import { useEffect, useRef } from "react";
import {
  APP_STORE_URL,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MELLO_URL,
  PERMIT_MINER_URL,
  melloBuilt,
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
