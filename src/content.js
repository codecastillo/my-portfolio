export const EMAIL = "dancastlebiz@gmail.com";
export const GITHUB_URL = "https://github.com/codecastillo";
export const LINKEDIN_URL = "https://www.linkedin.com/in/dancsatle/";
export const APP_STORE_URL = "https://apps.apple.com/app/id6784100629";
export const MELLO_URL = "https://mellomeet.com";
export const PERMIT_MINER_URL = "https://permitminer.com";

export const melloScreens = [
  {
    src: "/work/mello-home.jpg",
    alt: "Mello home screen with curated events.",
  },
  {
    src: "/work/mello-discover.jpg",
    alt: "Mello discover screen titled This week near you.",
  },
  {
    src: "/work/mello-event.jpg",
    alt: "Mello event page with the exact venue hidden until the event.",
  },
];

export const melloBuilt = [
  "iOS app in React Native and Expo",
  "Supabase backend with 168 version-controlled Postgres migrations",
  "30 Deno Edge Functions",
  "Row-level security, with access and business rules in the database so every client gets the same checks",
  "Realtime chats and push notifications",
  "Hidden venues and identity verification",
];

export const melloInProgress = {
  title: "Ticketing on Stripe Connect",
  summary:
    "Vetted organizers sell tiered tickets in the app and get paid out directly.",
  items: [
    "QR check-in that works offline at the door",
    "Secret-location events, with the address shown only to ticket holders",
    "Ticket transfers",
    "Admin tools for refunds, disputes and alerts",
  ],
};

// The 12-hour cadence lives in the facts row above this list, so the
// ingestion item names the sources only.
export const permitBuilt = [
  "Permits from the state construction registry, EPA stormwater notices and county open data",
  "Each permit matched to the Utah DOPL contractor registry",
  "Every contact tagged with its source and a confidence score",
  "Funnel-stage classification, so pre-permit signals surface before the issued record",
  "In-app outreach and a sales CRM with reply routing, bounce suppression and per-rep access in the database",
  "Scout, Pro and Outreach tiers on Next.js, Supabase, Stripe and Vercel",
];

export const otherProjects = [
  {
    name: "Esticount",
    description:
      "Material estimating and order management for stucco, stone, drywall and painting contractors. Enter a job's square footage and pick the phases, and it works out the materials, compares supplier prices and prints order sheets.",
    stack: "Node.js, Express, Supabase, JavaScript",
    image: "/work/esticount.jpg",
    imageAlt:
      "The Esticount homepage, headlined Order exactly what you need, with a sample order for a 2,400 sq ft drywall and stucco job.",
    links: [
      { label: "Source", href: "https://github.com/codecastillo/esticount" },
    ],
  },
  {
    name: "Orbit Social",
    description:
      "A full social network with a ranked feed, stories, short video clips, real-time direct messages with video calls, communities, events, a marketplace and live streaming.",
    stack: "Next.js, TypeScript, Supabase, Mux, Vercel",
    image: "/work/orbit-social.jpg",
    imageAlt: "The Orbit landing page, headlined The internet, but smaller.",
    links: [
      { label: "Live demo", href: "https://orbit-social-three.vercel.app" },
      {
        label: "Source",
        href: "https://github.com/codecastillo/orbit-social",
      },
    ],
  },
  {
    name: "AI Tools",
    description:
      "A reference site that helps students learn the AI tools developers ship with: install guides, usage tips, cheat sheets, side-by-side comparisons and curated stacks. Anyone can submit a tool, and a curator reviews it before it is published.",
    stack: "Next.js, TypeScript, PostgreSQL, Railway",
    image: "/work/ai-tools.jpg",
    imageAlt:
      "The ai.tools homepage, headlined Compare them, with counts of 33 tools and 10 stacks.",
    links: [
      { label: "Source", href: "https://github.com/codecastillo/ai-tools" },
    ],
  },
];

export const beforeSoftwareIntro =
  "This is where the working habits came from: scope the problem before touching it, name the tradeoff, and get it shipped.";

export const beforeSoftware = [
  {
    name: "Casteca Homes",
    role: "Founder",
    dates: "May 2024 to present",
    description:
      "Run residential construction projects end to end, coordinating permits, vendors, subcontractors and clients.",
  },
  {
    name: "Elm Eyewear",
    role: "Founder",
    dates: "2025 to present",
    description:
      "Building a direct-to-consumer eyewear brand and owning the Shopify storefront, third-party integrations and e-commerce architecture end to end.",
  },
  {
    name: "D&D Plastering",
    role: "Operations coordinator",
    dates: "July 2018 to March 2024",
    description:
      "Coordinated 200+ projects and a crew of 10+ field workers. Redesigned intake and follow-up to cut customer complaints by 40%, and cut operating costs by about $12K a year.",
  },
];

// Only skills in the languages, dependencies or config files of my GitHub
// repositories, or services I run in production (Cloudflare handles DNS).
export const stack = [
  "TypeScript",
  "Python",
  "SQL",
  "React",
  "React Native",
  "Expo",
  "Next.js",
  "Node.js",
  "Postgres",
  "Supabase",
  "Stripe",
  "Vercel",
  "Cloudflare",
  "Railway",
  "Sentry",
  "GitHub Actions",
];
