import type { Locale } from "@/lib/i18n";

/** Slugs match `t.caseStudies.items[].id` — they are also the page anchors. */
export type CaseId = "d2c-skincare" | "real-estate-developer" | "manufacturing-erp";

/** Page framing for one project. The facts and numbers stay in the locale JSON. */
export interface CaseCopy {
  headline: [string, string];
  before: [string, string, string];
  system: string;
  components: [string, string, string];
}

export interface CaseStudiesCopy {
  meta: string;
  hero: [string, string, string];
  lead: string;
  intro: string;
  explore: string;
  heroNote: string;
  figure: string;
  legend: [string, string, string];
  readingLabel: [string, string];
  reading: [string, string, string, string];
  facts: [string, string, string, string];
  before: string;
  after: string;
  columns: [string, string, string, string];
  reported: string;
  cases: Record<CaseId, CaseCopy>;
  methodChapter: string;
  methodTitle: [string, string];
  methodIntro: string;
  method: { title: string; body: string }[];
  disclaimer: string;
  locations: string;
  closingChapter: string;
  closingLead: string;
  closingTitle: [string, string];
  servicesLink: string;
  audit: string;
  nextCase: string;
  backToTop: string;
  pause: string;
  resume: string;
  reduced: string;
}

export const CASE_STUDIES_EN: CaseStudiesCopy = {
  meta: "Three anonymised client projects in D2C retail, real estate and manufacturing: the starting point, the system we built and the outcomes measured against a baseline.",
  hero: ["Real businesses.", "Real systems.", "Measured results."],
  lead: "Proof, not promises.",
  intro: "Three client projects, each told the same way: where the business started, the system we built and what changed when the same numbers were measured again.",
  explore: "Explore the projects",
  heroNote: "Anonymised client projects. Reported outcomes.",
  figure: "Three projects. One method.",
  legend: ["Baseline", "Connected system", "Measured outcome"],
  readingLabel: ["Every project,", "read the same way."],
  reading: ["The starting point", "The system we built", "The measured outcome", "In their words"],
  facts: ["Industry", "Location", "Duration", "Measures tracked"],
  before: "Before",
  after: "Connected",
  columns: ["Measure", "Before", "After", "Change"],
  reported: "Reported project outcome",
  cases: {
    "d2c-skincare": {
      headline: ["Same ad budget.", "More than double the revenue."],
      before: ["Paid traffic", "Leaky storefront", "Abandoned carts"],
      system: "Conversion system",
      components: ["Rebuilt storefront", "WhatsApp cart recovery", "SEO foundation"],
    },
    "real-estate-developer": {
      headline: ["Off the portals.", "Into direct, qualified demand."],
      before: ["Listing portals", "Low-intent leads", "Hard-to-reach NRI buyers"],
      system: "Direct lead system",
      components: ["Direct-lead website", "Automated WhatsApp nurturing", "Virtual tours for NRI buyers"],
    },
    "manufacturing-erp": {
      headline: ["From five spreadsheets", "to one source of truth."],
      before: ["Excel sheets", "WhatsApp updates", "Tribal knowledge"],
      system: "Custom ERP",
      components: ["Inventory and orders", "GST invoicing", "Vendor portal"],
    },
  },
  methodChapter: "The common thread",
  methodTitle: ["Different industries.", "The same discipline."],
  methodIntro: "Each project began with the numbers the business already watched, and ended by measuring the same ones again.",
  method: [
    { title: "Baseline", body: "Record the numbers that matter before anything is built." },
    { title: "Constraint", body: "Find the step where time, money or orders leak away." },
    { title: "System", body: "Connect the tools and workflows around that step." },
    { title: "Measure", body: "Compare the same numbers after rollout, not new ones." },
  ],
  disclaimer: "Results describe these engagements. They are not a forecast for every business.",
  locations: "Case studies from cities across India",
  closingChapter: "Your project",
  closingLead: "Have a process that is costing you time or revenue?",
  closingTitle: ["Start with a baseline.", "Build what moves it."],
  servicesLink: "Explore our services",
  audit: "Free {minutes}-minute audit. A written diagnosis. A clear next step.",
  nextCase: "Case {n} / yours",
  backToTop: "Back to top",
  pause: "Pause motion",
  resume: "Resume motion",
  reduced: "Reduced motion",
};

export function resolveCaseStudiesLocale(value: string): Locale {
  return ["en", "es", "fr", "de", "ar", "hi", "gu", "zh"].includes(value) ? value as Locale : "en";
}
