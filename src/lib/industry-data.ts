/**
 * Per-industry SEO + content data for `/industries/[slug]` pages.
 *
 * This is the canonical content source for the 5 standalone industry URLs.
 * Each entry drives the page's metadata, hero, intro copy, FAQ, JSON-LD
 * (Service + FAQPage), city crosslinks, and internal linking targets.
 *
 * Keyword strategy: best-judgment Indian B2B search intent. Slugs and copy
 * map to high-volume, high-intent terms — not internal jargon. Manufacturing
 * is positioned first for the Ahmedabad / Gujarat manufacturing pivot;
 * the slug literally targets "manufacturing software India" / "manufacturing
 * ERP" rather than the older "sme-erp" which buried the term.
 *
 * Linking shape:
 *   /industries                       — hub page
 *   /industries/manufacturing         — this file's `manufacturing` entry
 *   /industries/real-estate           — etc.
 *   /cities/ahmedabad ↔ manufacturing — cross-linked via cityFocus
 */

import type { IndustryKey } from "@/lib/country-content";

/** Ordered list of industry slugs — manufacturing first to anchor the Ahmedabad pivot */
export const INDUSTRY_SLUGS: readonly IndustryKey[] = [
  "manufacturing",
  "real-estate",
  "healthcare",
  "ecommerce",
  "edtech",
] as const;

export interface IndustryFaq {
  q: string;
  a: string;
}

export interface IndustryDeliverable {
  /** Short label — shown as the deliverable card title */
  label: string;
  /** 1–2 sentence body for the deliverable */
  description: string;
}

export interface IndustryMetric {
  value: string;
  label: string;
}

export interface IndustrySeoData {
  slug: IndustryKey;
  /** schema.org Service `serviceType` value */
  serviceType: string;

  /* -------------------------------- meta -------------------------------- */
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;

  /* ----------------------------- presentation --------------------------- */
  hero: {
    eyebrow: string;
    h1Lead: string;
    h1Accent: string;
    subtitle: string;
  };
  /** Keyword-dense intro paragraphs rendered above the deliverable grid */
  intro: string[];
  /** Audience qualifier — who this page is for */
  audience: {
    title: string;
    bullets: string[];
  };
  /** Deeper pain-point list for the standalone page (the homepage card uses
   *  the shorter `t.industries.items[].painPoints` array) */
  pains: {
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  /** What we ship */
  build: {
    title: string;
    deliverables: IndustryDeliverable[];
  };
  /** Numeric outcomes */
  outcome: {
    title: string;
    metrics: IndustryMetric[];
    summary: string;
  };
  /** Industry-specific FAQ — drives FAQPage JSON-LD and on-page section */
  faq: IndustryFaq[];
  /** City crosslinking — anchored to the city this industry concentrates in */
  cityFocus: {
    /** Primary city slug for the Ahmedabad-pivot crosslink */
    primaryCitySlug: string;
    /** All city slugs we explicitly serve in this industry (links rendered as a row) */
    cities: string[];
    /** Callout copy shown above the city link grid */
    callout: string;
  };
  /** Case studies (slug match `t.caseStudies.items[].id`) to feature first */
  caseStudyIds: string[];
  /** Service ids (match `t.services.items[].id`) most relevant to this industry */
  serviceIds: string[];
}

/* -------------------------------------------------------------------------- */
/*                              MANUFACTURING                                 */
/* -------------------------------------------------------------------------- */

const manufacturing: IndustrySeoData = {
  slug: "manufacturing",
  serviceType: "Manufacturing ERP & Operations Software Development",

  metaTitle:
    "Manufacturing ERP for Indian SMEs — Tally Alternative, GST E-Invoicing, Production Planning | Savin Group",
  metaDescription:
    "Custom manufacturing ERP for ₹5–100Cr Indian SMEs. Replace Tally + spreadsheets with one cloud system: production planning, inventory across godowns, GST e-invoicing, e-way bills, daily P&L. Built for Ahmedabad textile, Gujarat chemical, Pune engineering.",
  metaKeywords:
    "manufacturing ERP India, ERP for manufacturers, production planning software, GST e-invoicing software, Tally alternative, MSME ERP software, inventory management software, manufacturing software Ahmedabad, textile ERP Gujarat, chemical industry ERP, engineering goods ERP, e-way bill software, cloud ERP for SMEs, Tally to ERP migration, SME manufacturing software",
  ogTitle: "Manufacturing ERP & Operations Software for Indian SMEs",
  ogDescription:
    "Tally → cloud ERP in 6 weeks. Production planning, GST e-invoicing, inventory across godowns, daily P&L. Built for Ahmedabad textile, Gujarat chemical, Pune engineering manufacturers.",

  hero: {
    eyebrow: "Manufacturing ERP · Operations · GST",
    h1Lead: "Manufacturing software for",
    h1Accent: "Indian SMEs that have outgrown Tally",
    subtitle:
      "Custom cloud ERP for ₹5–100Cr Indian manufacturers — textile, chemical, engineering goods, pharma, food. Production planning, raw-material to finished-goods inventory, GST e-invoicing, e-way bills, and daily P&L from one dashboard. Built for the way Indian shop floors actually run.",
  },

  intro: [
    "Most Indian SME manufacturers running ₹5Cr–₹100Cr in turnover are stuck on the same stack: Tally for accounting, three Excel sheets for inventory, a WhatsApp group for production planning, and one supervisor who quietly knows everything. It works at ₹5Cr. It bleeds at ₹50Cr — production runs blind, GST e-invoicing is still cut-and-paste, and the founder reads daily P&L from a chartered accountant who closes the books two weeks late.",
    "We build the cloud ERP that replaces that sprawl with one system. Production planning that knows your BOM, routing, and machine capacity. Inventory across multiple godowns with batch and lot tracking. GST e-invoicing and e-way bill generation built into every sales transaction. Costing per SKU, per order, per machine hour. Daily P&L on the founder's phone. Tally migration runs in parallel for the first 90 days so your CA never loses their books.",
    "We've shipped this stack into Ahmedabad textile mills, Gujarat chemical processors, Pune component manufacturers, and Coimbatore pump SMEs. The build is opinionated: cloud-first, mobile-first, multi-user from day one, GST-native. We don't try to make Tally Prime do more than it should — we replace it with software that fits how Indian factories run in 2026.",
  ],

  audience: {
    title: "Built for Indian manufacturers in this shape",
    bullets: [
      "Turnover ₹5Cr–₹100Cr, 20–500 employees on one or more shop floors",
      "Currently on Tally Prime, Tally ERP 9, BUSY, or homegrown Excel + Access",
      "1–4 godowns / warehouses, possibly across cities",
      "Discrete or process manufacturing — textile, chemical, engineering, pharma, food, plastics, packaging",
      "GST-registered with B2B + occasional export invoicing",
      "Founder or CFO wants daily visibility, not month-end surprises",
    ],
  },

  pains: {
    title: "What is breaking right now",
    items: [
      {
        title: "Tally caps at 2 users — production runs blind",
        body: "Production planning happens on a printed Excel sheet that the supervisor walks to the shop floor. Stores doesn't know what's in WIP. Sales doesn't know what's about to be ready to dispatch.",
      },
      {
        title: "GST e-invoicing & e-way bills are still manual",
        body: "Invoices are typed twice — once into Tally, once into the GST portal. E-way bills get generated 30 minutes before dispatch by an accountant who's also doing 12 other things.",
      },
      {
        title: "Inventory mismatches between godowns and books",
        body: "Physical stock and Tally stock disagree by 3–7% at every audit. Stockouts are discovered when the customer calls, not when the system flags it.",
      },
      {
        title: "No real-time costing — pricing is a gut feel",
        body: "Cost per SKU is a back-of-envelope calculation. When raw material prices shift, finished-goods pricing lags by weeks. Unprofitable orders quietly continue.",
      },
      {
        title: "Single supervisor knows the whole shop floor",
        body: "If your senior production supervisor takes leave, dispatch slips by 4 days. Process knowledge sits in one head, not in software.",
      },
      {
        title: "Founder reads P&L two weeks late",
        body: "Daily working capital decisions are made on instinct because the books close on the 15th of the following month. Every late P&L is a missed pricing or procurement call.",
      },
    ],
  },

  build: {
    title: "What we ship for manufacturing SMEs",
    deliverables: [
      {
        label: "Production planning + BOM",
        description:
          "Multi-level bill of materials, routing, machine + labour capacity, work-order generation, and shop-floor data capture. Planners see WIP and machine load in real time.",
      },
      {
        label: "Inventory & multi-godown",
        description:
          "Raw-material, WIP, and finished-goods stock across N godowns. Batch / lot tracking, FIFO/LIFO costing, automatic reorder triggers, GRN-to-payment workflow.",
      },
      {
        label: "GST e-invoicing + e-way bills",
        description:
          "IRN generation on every B2B invoice, e-way bill auto-creation tied to dispatch, GSTR-1 / GSTR-3B export. NIC and IRP integrations included.",
      },
      {
        label: "Quotation → order → dispatch flow",
        description:
          "Quote versioning, customer-specific pricing, sales-order to production-order linkage, dispatch with packing list and LR copy. WhatsApp + email confirmations to the customer.",
      },
      {
        label: "Daily P&L & costing dashboards",
        description:
          "Cost per SKU, per order, per machine hour. Daily P&L view on mobile for the founder. Variance reports flag underpriced orders before they ship.",
      },
      {
        label: "Tally migration (parallel run)",
        description:
          "We migrate masters, opening balances, and 12 months of transaction history into the new system. Tally and the new ERP run in parallel for 60–90 days so your CA never loses their books.",
      },
      {
        label: "Mobile shop-floor app",
        description:
          "Supervisors log production, downtime, rejection, and material issue from a phone. Works on patchy 2G/3G in the factory back-end.",
      },
    ],
  },

  outcome: {
    title: "What changes after we ship",
    metrics: [
      { value: "6 weeks", label: "Tally → cloud ERP go-live" },
      { value: "−80%", label: "Manual data entry across teams" },
      { value: "Daily", label: "P&L on founder's phone" },
      { value: "−40%", label: "Quote-to-dispatch lead time" },
      { value: "100%", label: "GST e-invoicing automated" },
      { value: "₹0", label: "Tally license cost after Year 1" },
    ],
    summary:
      "Within 90 days of go-live: production runs from one system, every invoice has an IRN, godown stock matches books within 0.5%, and the founder can answer 'what's our gross margin today' from the WhatsApp dashboard.",
  },

  faq: [
    {
      q: "Why not just upgrade to Tally Prime or use a SaaS like Zoho / SAP B1?",
      a: "Tally Prime still caps at 2 concurrent users on Silver and 10 on Gold, and its production module is bolt-on at best. Zoho Inventory and SAP Business One work, but they force your shop floor into their schema — BOM, routing, and costing are pre-fitted to a generic manufacturer. Our builds are custom: we model your specific routing, costing, and dispatch flow, then layer Tally migration on top. You keep your existing books and add the operational layer Tally was never designed to handle.",
    },
    {
      q: "How does GST e-invoicing and e-way bill work in this system?",
      a: "Every B2B invoice above the e-invoicing threshold automatically generates an IRN via the NIC IRP API at the moment of finalization. E-way bills are generated against the IRN at the dispatch step — your stores manager triggers it from the same screen they pack the order. Both run on a queue with retry logic, so a brief NIC outage never blocks dispatch. GSTR-1 and GSTR-3B exports are one-click for your CA.",
    },
    {
      q: "We're a textile manufacturer in Ahmedabad — do you understand textile-specific workflows?",
      a: "Yes. Ahmedabad textile manufacturers we've worked with run on multi-stage process flows — greige → dyeing → printing → finishing → packing — each with its own job card, rejection capture, and costing per metre. We've modeled colour-batch tracking, shade-card matching, and customer-specific quality specs. We're particularly active in the Naroda, Narol, and Vatva clusters.",
    },
    {
      q: "How do you handle the parallel-run with Tally so our books don't break?",
      a: "For the first 60–90 days post go-live, every transaction is recorded in both systems. Your accountant continues filing GST and ITR from Tally exactly as before. We reconcile daily and surface any divergence within 24 hours. Cut-over to the new system as the system of record happens only after three consecutive months of clean reconciliation. CAs who've worked with us before sign off on the cut-over date.",
    },
    {
      q: "What does this cost — capex or subscription?",
      a: "Build is fixed-price scoped during a 1-week paid discovery (typically ₹2.5L–₹4L for the discovery alone). The ERP itself is one-time licensed to your company — we don't lock you into a per-seat SaaS. Hosting and our ongoing operations retainer is monthly (₹40K–₹1.2L/month depending on transaction volume). Most clients break even against their old Tally + accountant overflow inside 12 months.",
    },
    {
      q: "Can it run on the patchy internet at our factory?",
      a: "Yes. The shop-floor mobile app works offline-first — production logs, material issue, and rejection capture queue locally and sync when connectivity returns. The web ERP runs on the office network with a low-bandwidth fallback. We've shipped to factories in Vapi, Bharuch, and Kanpur where 3G is the best you get most days.",
    },
    {
      q: "Do you support batch / lot tracking and expiry for chemical / pharma / food manufacturers?",
      a: "Yes. Batch / lot is a first-class entity in the inventory module — every GRN creates a batch, every issue consumes from a batch (FIFO or specified), and every dispatch carries the batch numbers on the packing list. Expiry tracking with auto-quarantine of expired stock is supported, and we integrate with GS1 barcoding for batch labels.",
    },
    {
      q: "Will the Founder / CFO actually look at this every day?",
      a: "Yes — because the founder dashboard is built for a phone, not a desktop. It shows daily revenue, gross margin, cash position, top 5 SKUs by margin, top 3 stockouts, and the day's dispatch list. Five seconds of glance, every morning. The founders we've shipped to open it before they open WhatsApp.",
    },
  ],

  cityFocus: {
    primaryCitySlug: "ahmedabad",
    cities: ["ahmedabad", "pune", "indore", "jaipur", "bhopal"],
    callout:
      "We're particularly active in Ahmedabad — Naroda, Narol, Vatva textile clusters and the Vatva GIDC chemical belt. Daily on-site visits during go-live weeks, and a Gujarati-speaking implementation lead on every Ahmedabad engagement.",
  },

  caseStudyIds: ["manufacturing-erp", "real-estate-developer", "d2c-skincare"],
  serviceIds: ["operate-os", "growthos-retainer", "autosell-engine"],
};

/* -------------------------------------------------------------------------- */
/*                              REAL ESTATE                                   */
/* -------------------------------------------------------------------------- */

const realEstate: IndustrySeoData = {
  slug: "real-estate",
  serviceType: "Real Estate CRM & Lead Management Software Development",

  metaTitle:
    "Real Estate CRM India — Lead Management for Builders, Brokers, NRI Sales | Savin Group",
  metaDescription:
    "Lead-to-site-visit systems for Indian real estate. CRM that routes 99acres / MagicBricks / Housing.com leads in under 5 minutes, NRI-ready project sites, and local SEO that ranks for '3BHK in {locality}'. 3–5x qualified inbound, 40% lower CPL.",
  metaKeywords:
    "real estate CRM India, real estate lead management software, property website development, real estate website India, NRI property website, lead management for builders, channel partner CRM, 99acres lead automation, MagicBricks integration, real estate marketing automation, property developer website, real estate SEO, lead distribution software India",
  ogTitle: "Real Estate CRM & Lead Systems for Indian Builders, Brokers, NRI Sales",
  ogDescription:
    "Stop losing portal leads in the first 5 minutes. CRM that routes, nurtures, and converts. NRI-ready project sites. Local SEO that ranks for '3BHK in {locality}'.",

  hero: {
    eyebrow: "Real Estate · CRM · Lead Routing",
    h1Lead: "Lead-to-site-visit systems for",
    h1Accent: "Indian developers, brokers, and NRI sales",
    subtitle:
      "Custom CRM and project websites for residential, commercial, plotted, and NRI sales. We route 99acres / MagicBricks / Housing.com leads in under 5 minutes, nurture cold pipelines on WhatsApp, and rank your projects for the queries Indian + NRI buyers actually search.",
  },

  intro: [
    "Real estate in India is the most lead-dense, follow-up-poor industry in the country. Developers and broker teams pay ₹500–₹2,000 per portal lead from 99acres, MagicBricks, and Housing.com — and lose 70% of those leads in the first 5 minutes because nobody calls back fast enough. The agents who do reach out are reading scripts off WhatsApp screenshots. The NRI buyer in the US or UAE bounces off a project site that takes 6 seconds to load. Local SEO is non-existent, so 'flats in Whitefield' or '3BHK in Ulwe' goes to the portals every single time.",
    "We build the system that fixes this end-to-end. Real estate CRM with sub-5-minute round-robin lead routing, missed-call and IVR auto-capture, WhatsApp Business API nurture flows, RERA-compliant project pages, NRI-ready landing pages with USD / GBP / AED toggle, virtual walkthroughs, and local SEO targeting tier-2 / tier-3 city keywords the big aggregators ignore. Every inquiry is tracked from portal to site visit to booking — your CMO sees attribution that actually works.",
    "We've shipped for Bengaluru high-rise developers, Pune plotted-development companies, Mumbai redevelopment players, NCR commercial leasing teams, and channel partner networks running 50–500 brokers across cities. The system scales from a 3-agent boutique brokerage to a 200-broker channel-partner network with sub-account, lead-claim, and commission tracking.",
  ],

  audience: {
    title: "Built for these real estate teams",
    bullets: [
      "Residential developers (apartments, villas, plotted, integrated townships)",
      "Commercial / leasing developers and IPCs",
      "Channel-partner networks and broker franchises (5–500 agents)",
      "NRI-focused sales teams (US, UAE, UK, SG, AU)",
      "RERA-registered projects spanning multiple cities and phases",
      "Sales team of 3–200 with portal lead spend of ₹2L+/month",
    ],
  },

  pains: {
    title: "Where real estate revenue actually leaks",
    items: [
      {
        title: "5-minute window — and you're already losing 70%",
        body: "Studies and our own data show inbound real estate leads cool by 8x after 5 minutes. Most teams reach out in 45 minutes — or never. Sub-5-minute response is a system problem, not an effort problem.",
      },
      {
        title: "Portal CPL is ₹500–₹2,000 and rising",
        body: "99acres, MagicBricks, and Housing.com are pricing channel out of profitability. Builders who don't have an organic + nurture engine are renting visibility from aggregators forever.",
      },
      {
        title: "NRI buyers bounce on slow project sites",
        body: "A 6-second project page in Bengaluru is a 14-second page in Toronto. NRI buyers from US, UK, UAE, and SG are 30–40% of premium residential demand and 60% of them never load the page.",
      },
      {
        title: "Channel partners go dark after registration",
        body: "Broker networks with 50–500 partners can't track which broker brought which lead, who's actively pushing, or who's coasting. Commission disputes are weekly.",
      },
      {
        title: "Local SEO gives every long-tail to the portals",
        body: "'3BHK in Wakad', 'flats in Sector 150 Noida', 'plots in Devanahalli' — every one of these is dominated by aggregators because no developer site is built for that intent.",
      },
      {
        title: "Site-visit-to-booking is unmeasured",
        body: "Most CRMs stop tracking after the site visit happens. Bookings are entered manually two weeks later. The funnel from inquiry to token amount has no visibility.",
      },
    ],
  },

  build: {
    title: "What we ship for real estate",
    deliverables: [
      {
        label: "Lead-routing CRM (sub-5-min)",
        description:
          "Round-robin or skill-based assignment from 99acres, MagicBricks, Housing.com, Sulekha, Facebook Lead Ads, Google Form Submits — all unified. SLA timer per agent, auto-escalation, and re-route after 5 minutes of no response.",
      },
      {
        label: "WhatsApp Business API nurture",
        description:
          "Approved templates for site-visit booking, document collection, payment-plan walk-through. Automated drip across day 1 / day 3 / day 7 for cold leads. Two-way sync into the CRM timeline.",
      },
      {
        label: "RERA-compliant project pages",
        description:
          "RERA registration number, brochure, possession date, configurations, virtual tour, location intelligence — every project page hits the legal bar and the SEO bar.",
      },
      {
        label: "NRI-ready microsites",
        description:
          "Sub-second LCP from US / UAE / UK CDN edges, USD / GBP / AED price toggle, NRI loan calculator, time-zone-aware booking widget, and FATCA / NRO / NRE FAQ block.",
      },
      {
        label: "Local SEO + content engine",
        description:
          "Per-locality landing pages targeting '3BHK in {locality}', 'plots in {phase}', 'flats near {metro}'. Schema-rich content with builder reviews, possession-tracker, and price trend data.",
      },
      {
        label: "Channel-partner sub-accounts",
        description:
          "Per-broker sub-login with lead-claim, attribution, commission accrual, and payout dashboard. Partners log in to a portal that doesn't make them call your manager every time.",
      },
      {
        label: "Site-visit → booking analytics",
        description:
          "End-to-end funnel: portal click → form fill → first response → site-visit booked → site-visit happened → token collected → booking. Marketing sees the whole funnel for the first time.",
      },
    ],
  },

  outcome: {
    title: "What changes after we ship",
    metrics: [
      { value: "3–5x", label: "Qualified inbound leads from organic" },
      { value: "−40%", label: "Cost per qualified lead" },
      { value: "0–5 min", label: "Lead first-response time" },
      { value: "2x", label: "Site-visit → booking conversion" },
      { value: "30–60%", label: "Of NRI traffic now converts on-site" },
      { value: "100%", label: "Channel-partner attribution clarity" },
    ],
    summary:
      "Within 90 days: portal CPL trends down as organic ramps, your top 3 sales managers stop chasing cold WhatsApp threads, NRI traffic converts on-site instead of bouncing, and channel partners stop emailing you about commission disputes.",
  },

  faq: [
    {
      q: "Will this work with our existing 99acres / MagicBricks / Housing.com lead flow?",
      a: "Yes. We integrate at the API level with all three portals plus Sulekha, Facebook Lead Ads, Google Form, and your website forms. Every lead lands in the same inbox with source, campaign, and project tagging — your sales team sees one queue, not five. Existing portal contracts continue unchanged; we sit on top of them.",
    },
    {
      q: "How does this help with NRI buyers from the US, UAE, UK, or Singapore?",
      a: "NRI conversion has three blockers — site speed from non-Indian geographies, currency anchoring, and time-zone-aware booking. We ship a CDN-edged version of every project microsite that loads in under 1.5s from major NRI source markets, a USD/GBP/AED price toggle, an NRI home-loan calculator with FATCA / NRO / NRE flags, and a booking widget that knows the buyer's timezone so they get a slot they'll actually keep.",
    },
    {
      q: "We're a channel-partner network with 200+ brokers — does this support sub-accounts and commission tracking?",
      a: "Yes. Each partner gets a sub-login with lead-claim, real-time attribution, commission accrual on token / agreement / registration milestones, and a payout dashboard. Disputes drop to near-zero because every event is logged. We've shipped this for networks running 50, 200, and 500 brokers — the architecture scales.",
    },
    {
      q: "Are the project pages RERA compliant?",
      a: "Yes. Every project page renders the RERA registration number, registered carpet area, possession date, sanctioned plan, and brochure as required. We run a compliance check on every project page before publish and update RERA renewal status when applicable.",
    },
    {
      q: "Can we keep using our existing CRM (Sell.do, LeadSquared, Salesforce)?",
      a: "Often we replace it; sometimes we sit alongside. If you're on LeadSquared or Sell.do and they're working for your basic lead-distribution use case, we can build the WhatsApp nurture, NRI microsites, and local-SEO content engine on top. If your CRM is the bottleneck (most are), we replace it with a custom build that fits real estate specifically — not a generic SaaS.",
    },
    {
      q: "How fast can we get the lead-routing live?",
      a: "Lead-routing CRM is the fastest module — typical go-live is 4–6 weeks from contract. Project microsites and local SEO content take longer (10–14 weeks for a full build) but the lead-routing change alone usually shows a CPL drop inside the first 30 days.",
    },
    {
      q: "What does this cost?",
      a: "1-week paid discovery (₹2L–₹3.5L) scopes the build. Implementation is fixed-price, typically ₹8L–₹35L for a complete CRM + microsite + local SEO build, depending on number of projects and partner depth. Ongoing nurture + content retainer runs ₹40K–₹1.5L/month.",
    },
    {
      q: "Will Google find our project pages — we have terrible SEO right now?",
      a: "That's most of what we fix. Most developer sites have one project page per project; we ship 30–80 long-tail SEO pages per project covering locality, configuration, possession-month, builder-reputation, and price-trend queries. Combined with structured data, internal linking, and high-quality content, ranking for 'flats in {locality}' or 'plots in {phase}' becomes realistic within 3–4 months.",
    },
  ],

  cityFocus: {
    primaryCitySlug: "mumbai",
    cities: ["mumbai", "bengaluru", "delhi", "pune", "hyderabad", "ahmedabad", "chennai", "jaipur"],
    callout:
      "We've shipped for residential, commercial, and plotted developers across Mumbai (Powai, Ulwe, Thane), Bengaluru (Whitefield, Sarjapur, Hennur), Delhi NCR (Noida Sector 150, Gurugram), Pune (Hinjewadi, Wakad, Wagholi), and Hyderabad (Gachibowli, Kondapur).",
  },

  caseStudyIds: ["real-estate-developer", "manufacturing-erp", "d2c-skincare"],
  serviceIds: ["revsite-pro", "autosell-engine", "localdom-seo"],
};

/* -------------------------------------------------------------------------- */
/*                              HEALTHCARE                                    */
/* -------------------------------------------------------------------------- */

const healthcare: IndustrySeoData = {
  slug: "healthcare",
  serviceType: "Healthcare Clinic Management Software & Patient Booking",

  metaTitle:
    "Clinic Management Software India — Patient Booking, EMR, Google Reviews | Savin Group",
  metaDescription:
    "Patient booking, EMR, and retention software for Indian dental, derma, ortho, fertility, and multispecialty clinics. Stop being held hostage by Practo. Own your booking, WhatsApp reminders, and Google Maps presence. 60% fewer calls, 25% drop in no-shows.",
  metaKeywords:
    "clinic management software India, patient booking system, EMR software for clinics, dental clinic software, dermatology clinic CRM, healthcare CRM India, appointment booking software, doctor appointment app India, clinic SEO, Practo alternative, hospital management system, multispecialty clinic software, fertility clinic software, healthcare WhatsApp automation",
  ogTitle: "Clinic Management Software for Indian Doctors & Multispecialty Clinics",
  ogDescription:
    "Own your booking, WhatsApp reminders, and Google Maps. Stop renting Practo. Stop drowning in reschedule calls. 60% fewer calls, 25% lower no-show rate.",

  hero: {
    eyebrow: "Healthcare · Booking · EMR · Reviews",
    h1Lead: "Patient booking & retention software for",
    h1Accent: "Indian clinics that have outgrown Practo",
    subtitle:
      "Clinic management software for dental, dermatology, orthopaedics, fertility, and multispecialty practices. 1–10 locations, 10–200 daily patients. We replace WhatsApp + Excel + Practo dependency with one system that owns booking, reminders, EMR, and Google reviews.",
  },

  intro: [
    "The Indian clinic stack is a mess of tools nobody's happy with. Practo costs you a percentage and owns your patient relationship. WhatsApp is the actual reschedule channel, but it's untracked. Patient records are split across paper, an Excel sheet at the front desk, and the doctor's iPad. Google Maps shows your clinic with three reviews from 2019 because nobody's ever automated the review-ask. The receptionist spends 4 hours a day on the phone confirming appointments, and 25% of patients still no-show.",
    "We build the clinic management system that makes the front desk smaller, the doctor's day calmer, and the marketing team's job possible. Online + WhatsApp booking that the patient owns end-to-end. Automated reminders 24h, 4h, and 1h before. EMR that the doctor actually wants to use because it's two screens and three taps. Review automation that turns every happy patient into a Google review request inside 24 hours. Local SEO that puts your clinic at the top of 'dentist near me' or 'dermatologist in {locality}' inside 3–4 months.",
    "We've shipped for single-doctor practices, 4–6 location dental chains, 10-location dermatology brands, and multispecialty centres in Bengaluru, Mumbai, Delhi NCR, Hyderabad, and Pune. Engagements are HIPAA-aware where the clinic operates internationally; for India-only practices we build to the DPDP Act 2023 and clinic-specific consent requirements.",
  ],

  audience: {
    title: "Built for these clinics",
    bullets: [
      "Single-specialty: dental, dermatology, orthopaedics, ophthalmology, fertility, ENT",
      "Multispecialty centres with 3–15 doctors",
      "1–10 locations, 10–200 daily patients per location",
      "Currently using Practo + WhatsApp + Excel + paper",
      "Receptionist spending 3+ hours/day on appointment calls",
      "Local presence-driven (Google Maps + word of mouth) — not large hospital chains",
    ],
  },

  pains: {
    title: "What is breaking right now",
    items: [
      {
        title: "Receptionist drowning in reschedule calls",
        body: "3–4 hours a day on the phone confirming, rescheduling, and cancelling. The receptionist becomes the bottleneck for every front-desk task.",
      },
      {
        title: "20–30% no-show rate",
        body: "One in four patients doesn't show up. Chair time is your most expensive inventory and you're losing 25% of it to a problem reminders solve.",
      },
      {
        title: "Invisible on Google Maps for nearby searches",
        body: "'dentist near me', 'dermatologist in {locality}', 'fertility clinic Bangalore' — the first three results are large chains. Your three-doctor practice with 10 years of clinical excellence is on page 2.",
      },
      {
        title: "Patient records scattered across systems",
        body: "Paper file in clinic, scan on the doctor's iPad, prescription on a WhatsApp PDF, payment receipt in Excel. Looking up a patient's history takes 4 minutes.",
      },
      {
        title: "Practo owns your patient relationship",
        body: "Patients book through Practo, message through Practo, review through Practo. You pay a percentage forever and you can't email or WhatsApp them directly without violating the platform.",
      },
      {
        title: "Zero retention loop",
        body: "A patient comes in, gets treatment, leaves, never hears from you again. Recall for 6-month dental check-ups, annual derma reviews, or post-procedure follow-up is entirely manual or non-existent.",
      },
    ],
  },

  build: {
    title: "What we ship for healthcare",
    deliverables: [
      {
        label: "Online + WhatsApp booking",
        description:
          "Patient books a slot from the website, Google Business Profile, or a WhatsApp deep-link. Doctor calendar, room calendar, and procedure-duration logic baked in. No double-bookings.",
      },
      {
        label: "Automated reminders & confirmations",
        description:
          "WhatsApp + SMS reminders at 24h, 4h, and 1h. One-tap confirm or reschedule. No-show rate drops from 25% to 5–8% in the first 60 days.",
      },
      {
        label: "EMR built for Indian practice",
        description:
          "Two-screen, three-tap consult capture. Templated by specialty (dental chart, derma photos, ortho ROM, fertility cycle tracker). Prescription PDF auto-WhatsApped to the patient.",
      },
      {
        label: "Google reviews automation",
        description:
          "Every paying patient gets a review-ask WhatsApp 24 hours after their visit. Happy patients tap a Google review link; unhappy patients route to a private feedback channel. Review velocity 5–10x.",
      },
      {
        label: "Local SEO + GBP optimization",
        description:
          "Per-location pages, schema markup, NAP consistency, GBP posts and Q&A. Targeting 'dentist near me', 'dermatologist {locality}', '{specialty} clinic {city}'. 40–80% more organic Google bookings inside 4 months.",
      },
      {
        label: "Recall & retention engine",
        description:
          "6-month dental recall, annual derma check-up, post-procedure follow-up flows on WhatsApp. Patients come back without anyone phoning them.",
      },
      {
        label: "Multi-location ops dashboard",
        description:
          "If you run 4 locations, each location's calendar, no-show rate, daily revenue, and review velocity is visible to the central team. Underperforming locations get flagged early.",
      },
    ],
  },

  outcome: {
    title: "What changes after we ship",
    metrics: [
      { value: "−60%", label: "Receptionist call volume" },
      { value: "−25%", label: "No-show rate" },
      { value: "+40–80%", label: "Organic Google appointments" },
      { value: "5–10x", label: "Google review velocity" },
      { value: "4 weeks", label: "Booking + EMR live" },
      { value: "100%", label: "Patient relationship owned by you" },
    ],
    summary:
      "Within 90 days: the receptionist isn't the bottleneck, no-shows drop to single digits, your clinic outranks two larger competitors on Google Maps for primary local queries, and patients return for recall without manual outreach.",
  },

  faq: [
    {
      q: "We use Practo today — do we have to leave it?",
      a: "Not immediately. Most clients keep Practo as one of several inbound channels for the first 6 months and gradually shift acquisition to direct + Google. The system we ship works alongside Practo; once direct + organic bookings exceed Practo bookings (typically 3–4 months in), most clinics drop Practo or downgrade to a minimal listing. You own the patient relationship from day one regardless.",
    },
    {
      q: "Is the EMR usable by doctors who don't like software?",
      a: "We design EMR for clinical reality: two screens, three taps. Specialty templates pre-fill 60–70% of fields. Voice-to-text in English / Hindi / Gujarati / Kannada / Tamil. We've onboarded 60-year-old senior consultants who refused every prior EMR — they're using ours daily inside 2 weeks. We'd rather ship something doctors actually use than a feature-rich system they don't.",
    },
    {
      q: "How does the Google review automation actually work?",
      a: "After every paid visit, the patient gets a WhatsApp message 24 hours later with two links: a smiley link goes to your Google review page, a frown link goes to a private feedback form. This NPS-style routing means happy patients write public reviews; unhappy ones reach the practice manager directly. We've consistently moved clinics from 12 reviews/year to 100+ within the first 6 months.",
    },
    {
      q: "Will this rank our clinic for 'dentist near me' kind of searches?",
      a: "Yes — local SEO is the highest-leverage channel for clinics. We optimize Google Business Profile (NAP consistency, hours, services, photos, GBP posts, Q&A), build per-location landing pages with schema markup, and run review velocity. Within 3–4 months most clients reach top-3 in their primary local-pack for their specialty. We'll show you live examples of clinics we've ranked.",
    },
    {
      q: "What about HIPAA / DPDP Act / patient data compliance?",
      a: "For India-only clinics, we build to DPDP Act 2023 with consent capture at registration, purpose-bound storage, and patient-data export-on-demand. For clinics serving NRIs or operating internationally, we operate under a BAA with HIPAA-compliant data handling and audit logging. Indian medical-record retention requirements (8 years) are baked in.",
    },
    {
      q: "We have 6 locations — does this scale?",
      a: "Yes. Multi-location is a first-class part of the architecture. Each location has its own calendar, doctor list, services, and review-ask flow, but central reporting, EMR templates, and patient records are shared. We've shipped to 10-location dermatology and 6-location dental chains. The central ops team sees per-location and roll-up dashboards.",
    },
    {
      q: "How long to go live?",
      a: "Booking + WhatsApp reminders + GBP optimization: 4 weeks. EMR: 6–8 weeks (depends on specialty templates). Local SEO content engine: 10–12 weeks for full ramp. Most clinics see no-show drop and review velocity lift inside 60 days.",
    },
    {
      q: "What does it cost?",
      a: "Discovery: ₹1.5L–₹2.5L (1 week). Build: ₹6L–₹25L depending on specialty depth and number of locations. Retainer (SEO, content, automations): ₹35K–₹90K/month. Most clinics break even on the build inside 6 months from the no-show reduction alone.",
    },
  ],

  cityFocus: {
    primaryCitySlug: "bengaluru",
    cities: ["bengaluru", "mumbai", "delhi", "hyderabad", "pune", "chennai", "ahmedabad", "jaipur"],
    callout:
      "We've shipped for clinics across Bengaluru (Indiranagar, Koramangala, Whitefield), Mumbai (Bandra, Andheri, Powai), Delhi NCR (South Delhi, Gurugram, Noida), Hyderabad (Banjara Hills, Jubilee Hills), and Pune (Koregaon Park, Baner).",
  },

  caseStudyIds: ["d2c-skincare", "real-estate-developer", "manufacturing-erp"],
  serviceIds: ["revsite-pro", "autosell-engine", "localdom-seo"],
};

/* -------------------------------------------------------------------------- */
/*                              ECOMMERCE / D2C                               */
/* -------------------------------------------------------------------------- */

const ecommerce: IndustrySeoData = {
  slug: "ecommerce",
  serviceType: "D2C E-commerce Development & Conversion Optimization",

  metaTitle:
    "Shopify & D2C E-commerce Development India — CRO, WhatsApp, SEO | Savin Group",
  metaDescription:
    "D2C revenue systems for Indian Shopify and WooCommerce brands. Storefront CRO (1%→3% conversion), WhatsApp cart recovery, SEO that beats Meta-ad dependency, retention that 2x's repeat rate. ₹10L–₹2Cr GMV brands stop renting traffic and start owning it.",
  metaKeywords:
    "D2C ecommerce development India, Shopify development India, WooCommerce development India, ecommerce conversion optimization, cart recovery WhatsApp, D2C SEO India, headless commerce India, Shopify Plus India, ecommerce website design India, post-purchase upsell, subscription ecommerce, ecommerce LTV optimization, D2C agency India, Razorpay integration, Klaviyo India",
  ogTitle: "D2C E-commerce Revenue Systems for Indian Shopify & WooCommerce Brands",
  ogDescription:
    "Storefront CRO + WhatsApp cart recovery + SEO that ends Meta-ad dependency. ₹10L–₹2Cr GMV brands break the CAC ceiling and double repeat rate.",

  hero: {
    eyebrow: "D2C · Shopify · WhatsApp · SEO",
    h1Lead: "D2C revenue systems for",
    h1Accent: "Indian Shopify & WooCommerce brands",
    subtitle:
      "₹10L–₹2Cr GMV brands stuck below 1% conversion, with 70% cart abandonment and 100% Meta-ad dependency. We rebuild storefront, WhatsApp recovery, and SEO so you stop renting traffic from Zuck and start owning it.",
  },

  intro: [
    "Most Indian D2C brands at ₹10L–₹2Cr GMV are running the same broken playbook: a Shopify storefront converting at 0.6–0.9%, 70%+ cart abandonment with no WhatsApp recovery, ROAS quietly dropping every quarter on Meta, and zero organic traffic. Marketing's whole job has become 'find more cheap reach' on platforms that are actively pricing you out. The brand owner is one Meta CPM hike away from a margin crisis.",
    "We rebuild the entire revenue stack. A storefront that converts 1.5–3x with India-specific UX (WhatsApp Click-to-Chat from the PDP, COD weight management, returns flow that doesn't kill margin). WhatsApp cart-abandonment recovery on the Business API that fires within 90 seconds and recovers 15–25% of carts. Klaviyo / WebEngage flows for browse-abandon, post-purchase, and replenishment. SEO that takes you from 0% organic to 30–50% inside 6 months by ranking for product + 'buy {product} online India' queries. Subscription / replenishment for repeat-friendly categories so LTV stops being a one-shot game.",
    "We've shipped for skincare, fragrance, supplements, F&B, fashion, and electronics brands on Shopify, Shopify Plus, WooCommerce, and headless setups. Engagements range from ₹40L D2C with one founder doing everything, to ₹5Cr+ brands looking to break the Meta-CAC ceiling.",
  ],

  audience: {
    title: "Built for these D2C brands",
    bullets: [
      "₹10L–₹2Cr monthly GMV on Shopify, Shopify Plus, or WooCommerce",
      "Categories: skincare, beauty, fragrance, wellness, F&B, fashion, electronics, home",
      "Currently 60–100% dependent on Meta ads; ROAS is creeping",
      "Conversion rate below 1.2%, cart abandonment above 65%",
      "Repeat purchase rate below 20% on a re-orderable category",
      "Founder + 1–10 person team, not enterprise retail",
    ],
  },

  pains: {
    title: "Where D2C revenue actually leaks",
    items: [
      {
        title: "Storefront converts under 1% on mobile",
        body: "85%+ of your traffic is mobile, and your Shopify theme was tuned for desktop. PDP load is 4s, the WhatsApp button is a stock app, and Cash-on-Delivery has no weight check.",
      },
      {
        title: "70%+ cart abandonment with no recovery",
        body: "Three-quarters of your add-to-carts walk away. You have no WhatsApp recovery, your email Klaviyo flow goes to inboxes nobody opens, and the CAC you paid for that traffic just evaporated.",
      },
      {
        title: "100% Meta-ad dependency",
        body: "Every rupee of revenue traces back to Meta. CPMs went up 22% YoY. Your CAC has crossed half your AOV. One bad week of ad performance and you're underwater.",
      },
      {
        title: "Zero LTV / repeat-purchase engine",
        body: "Re-orderable categories (skincare, supplements, F&B) are running like one-shot purchases. No subscription, no replenishment WhatsApp, no post-purchase upsell sequence.",
      },
      {
        title: "Invisible for product organic queries",
        body: "'buy {product} online India', '{product} for {use case}', 'best {product} India' — every search goes to Amazon, Nykaa, or a top-of-funnel content site. Your brand has 6 SEO-indexed pages.",
      },
      {
        title: "Returns and COD eat the margin",
        body: "30–40% return rate on COD shipments. Refunds are manual. RTOs go to a forwarding agent who never reconciles. The brand bleeds quietly on the unit-economics side.",
      },
    ],
  },

  build: {
    title: "What we ship for D2C",
    deliverables: [
      {
        label: "Storefront CRO rebuild",
        description:
          "Mobile-first PDP with sub-2s LCP, sticky add-to-cart, dynamic shipping calculator, COD eligibility check, WhatsApp Click-to-Chat from PDP, and a checkout that doesn't lose 15% of users at the OTP step.",
      },
      {
        label: "WhatsApp cart recovery",
        description:
          "Business API recovery firing within 90 seconds of abandonment. 15–25% recovery rate on first-touch. Layered with browse-abandon (3-hour window) and replenishment (category-specific) flows.",
      },
      {
        label: "Klaviyo / WebEngage lifecycle",
        description:
          "Welcome series, browse-abandon, cart-abandon, post-purchase, replenishment, win-back. Behavior-segmented. India-aware send times, festival cadence, and language.",
      },
      {
        label: "Subscription / replenishment",
        description:
          "For re-orderable categories — auto-renew with WhatsApp + email skip / pause / swap. Razorpay subscription rails. Categories where this works (skincare, supplements, F&B) typically 2x repeat rate inside 90 days.",
      },
      {
        label: "Programmatic SEO + content",
        description:
          "Per-product schema, per-collection landing pages, comparison pages, ingredient / use-case content. We build 100–500 long-tail SEO pages for the brand's category-defining keywords.",
      },
      {
        label: "Post-purchase upsell + reviews",
        description:
          "Thank-you page upsell, post-purchase WhatsApp upsell, review-ask 7 days post-delivery (Junip / Loox / native). Review velocity 5–10x within 4 months.",
      },
      {
        label: "Returns + COD ops",
        description:
          "Self-serve returns flow, RTO recovery automation, COD-to-prepaid conversion campaign. Returns rate down 5–10 percentage points, RTO recovery up 10–20%.",
      },
    ],
  },

  outcome: {
    title: "What changes after we ship",
    metrics: [
      { value: "+1.5–3%", label: "Conversion rate lift" },
      { value: "2x", label: "Repeat purchase rate" },
      { value: "15–25%", label: "Cart-abandonment recovery" },
      { value: "30–50%", label: "GMV from organic in 6 months" },
      { value: "−10%", label: "Returns / RTO rate" },
      { value: "−25%", label: "Effective CAC blended" },
    ],
    summary:
      "Within 6 months: organic crosses 30% of GMV, repeat rate doubles, WhatsApp recovers 1 in 5 abandoned carts, and your blended CAC drops enough to fund a whole new acquisition channel.",
  },

  faq: [
    {
      q: "We're on vanilla Shopify — do we need to move to Shopify Plus or headless?",
      a: "Almost never on day one. 90% of the conversion lift comes from CRO + recovery + lifecycle, all of which work on standard Shopify. Plus is worth it once you're past ₹3Cr GMV and need the script editor / checkout customization. Headless is for teams who've outgrown Shopify's templating — we ship headless on Hydrogen + Next.js, but only when the storefront's complexity actually demands it. We'd rather double your revenue on standard Shopify than bill you for a replatform you don't need.",
    },
    {
      q: "What's the realistic conversion rate lift from CRO?",
      a: "From 0.6–0.9% to 1.5–2.5% on mobile within 60–90 days for most brands we work with. The exact number depends on your starting category, AOV, and traffic mix. We don't promise specific numbers up front — we run a paid CRO audit, project an uplift range, and rebuild against that target. We'd rather under-promise and ship.",
    },
    {
      q: "How does WhatsApp Business API cart recovery work?",
      a: "When a user abandons checkout, we trigger a WhatsApp message via the Business API (through Gupshup, AiSensy, WATI, or whichever provider you're already on) within 60–90 seconds. The message is templated per category, includes the cart link, and offers a soft incentive. First-touch recovery is typically 15–25%, with a follow-up at 3 hours and 24 hours pushing total recovery to 22–35%. All flows are CAPI-tracked so attribution is clean.",
    },
    {
      q: "Will this work for our category — supplements / skincare / fragrance / F&B / electronics?",
      a: "Yes for all of those. Our subscription + replenishment work shines in re-orderable categories (skincare, supplements, F&B, pet). For non-replenishment categories (fragrance, electronics, fashion), the LTV play shifts to lifecycle + post-purchase upsell instead. We tune the playbook to the category in the discovery phase.",
    },
    {
      q: "How soon will SEO start contributing to revenue?",
      a: "First indexable wins inside 60 days, meaningful traffic at 4 months, 30–50% GMV contribution at 6 months for most brands. SEO is the slowest channel to start and the cheapest channel to scale. We pair it with CRO + lifecycle so revenue lifts in the first 60 days while SEO compounds in the background.",
    },
    {
      q: "Do you handle Razorpay / Cashfree / PayU integrations?",
      a: "Yes — all three plus the Indian wallet stack (Paytm, PhonePe, Amazon Pay), UPI on intent + collect, and BNPL via Simpl, LazyPay, ZestMoney. COD is configured with weight + pin-code validation so RTO-prone orders get auto-converted to prepaid.",
    },
    {
      q: "Can you work with our existing agency / in-house team?",
      a: "Yes. The most common shape is — we own CRO + lifecycle + SEO; your existing performance agency continues running Meta and Google. We instrument everything via GA4 + server-side CAPI so attribution stays honest across all teams.",
    },
    {
      q: "What does it cost?",
      a: "Discovery: ₹2L–₹3L (1 week). Initial build: ₹8L–₹30L depending on storefront complexity, lifecycle depth, and SEO scope. Ongoing retainer: ₹50K–₹2L/month for active CRO experiments + content + automation maintenance. Most brands break even inside 90–120 days from the conversion lift alone.",
    },
  ],

  cityFocus: {
    primaryCitySlug: "bengaluru",
    cities: ["bengaluru", "mumbai", "delhi", "pune", "hyderabad", "chennai", "ahmedabad", "jaipur"],
    callout:
      "Bengaluru, Mumbai, and Delhi NCR concentrate most of the D2C operations talent and 3PL capacity. We've shipped for brands warehoused in Bhiwandi, Bhiwadi, Bommasandra, and Hosur, with founders running ops from Indiranagar, Bandra, Powai, and DLF Phase 5.",
  },

  caseStudyIds: ["d2c-skincare", "real-estate-developer", "manufacturing-erp"],
  serviceIds: ["revsite-pro", "autosell-engine", "localdom-seo"],
};

/* -------------------------------------------------------------------------- */
/*                              EDTECH / COACHING                             */
/* -------------------------------------------------------------------------- */

const edtech: IndustrySeoData = {
  slug: "edtech",
  serviceType: "EdTech & Coaching Institute Software Development",

  metaTitle:
    "Coaching Institute & EdTech Software India — Enrollment, LMS, Razorpay | Savin Group",
  metaDescription:
    "Enrollment funnels and LMS for Indian coaching — JEE, NEET, UPSC, CA, CAT. 200–5,000 student institutes go offline-to-hybrid with website, fee + EMI flow, attendance, live class, and doubt-clearing in one stack. 3-4x faster enrollment, 30% lower drop-off.",
  metaKeywords:
    "coaching institute software India, LMS for coaching, online learning platform India, JEE coaching software, NEET coaching software, UPSC coaching software, edtech development India, online course platform, coaching institute website, coaching institute CRM, online coaching app, hybrid coaching software, attendance tracking coaching, fee management coaching institute, Razorpay coaching",
  ogTitle: "Enrollment & LMS Stack for Indian Coaching Institutes & EdTech",
  ogDescription:
    "Stop losing 60% of inquiries on phone. Razorpay-integrated fees + EMI, LMS your students actually use, local SEO that ranks for 'NEET coaching near me'. 200–5,000 student institutes go hybrid in 8 weeks.",

  hero: {
    eyebrow: "EdTech · Coaching · LMS",
    h1Lead: "Enrollment & LMS systems for",
    h1Accent: "Indian coaching institutes & online educators",
    subtitle:
      "Custom websites, fee + Razorpay flow, LMS, and attendance for 200–5,000-student JEE / NEET / UPSC / CA / CAT institutes going offline-to-hybrid. Plus enrollment funnels for online creators selling premium cohorts and skill courses.",
  },

  intro: [
    "Indian coaching institutes are stuck in the messiest moment of the offline-to-hybrid transition. The flagship classroom is full. Demand for online + recorded is rising. The website is a brochure built in 2018. Inquiries come on the phone, get scribbled in a register, and 60–70% never convert because nobody followed up. Fees are collected in cash or NEFT — Razorpay is on the to-do list. Live classes happen on Zoom links shared on WhatsApp. Attendance is taken on a printed sheet. The institute is growing, but every additional student adds disproportionate operational drag.",
    "We build the system that fixes this stack-wide. A website that converts inquiry-to-demo-class instead of being a PDF brochure. Razorpay-integrated fees with EMI / installment / sibling discount logic that India actually uses. LMS with live class, recorded library, doubt-clearing, mock tests, and per-batch analytics — usable by a 14-year-old on a 4G phone. Local SEO that ranks for 'NEET coaching in {city}', 'JEE coaching near me', 'UPSC mentor {state}'. Parent-facing dashboard so the parent (who's paying) sees what they're paying for.",
    "We've shipped for offline-first institutes going hybrid (200–5,000 students), pure-online creators running cohorts (₹50K–₹2L per seat), and skill / upskilling academies. Engagements scale from a single-branch JEE coaching in Kota or Indore to a multi-city UPSC institute in Delhi-Mukherjee Nagar.",
  ],

  audience: {
    title: "Built for these institutes",
    bullets: [
      "Offline-first coaching institutes (JEE, NEET, UPSC, CA, CAT, banking) with 200–5,000 students",
      "Going offline-to-hybrid: 50–80% offline, 20–50% online, growing online share",
      "Currently using a brochure website + WhatsApp + Zoom + Excel + cash/NEFT for fees",
      "Online cohort creators: ₹50K–₹2L per seat, 50–500 seats per cohort",
      "Skill / upskilling academies (data, design, code) running 2–4 cohorts/year",
      "Parent / decision-maker is paying — student is consuming",
    ],
  },

  pains: {
    title: "What is breaking right now",
    items: [
      {
        title: "Phone-based admissions losing 60% of inquiries",
        body: "Inquiries scribbled in a register, calls never returned, demo-class scheduling done over WhatsApp threads. By the third missed call the parent has enrolled at the competitor down the road.",
      },
      {
        title: "Fees in cash or NEFT, no EMI structure",
        body: "Razorpay is on the to-do list. Parents who'd happily pay ₹2L over 4 EMIs walk away because you're asking for a single bank transfer. Sibling discount is calculated on a calculator at the front desk.",
      },
      {
        title: "Live class on Zoom + WhatsApp link sharing",
        body: "Students join from a WhatsApp group. Attendance is taken on a printed sheet. Recordings live in a Google Drive folder nobody can navigate. Doubts are answered in 17 different WhatsApp groups.",
      },
      {
        title: "Invisible on Google for coaching searches",
        body: "'NEET coaching in {city}', 'JEE coaching near me', 'UPSC test series' — first 5 results are aggregators or 3 large national chains. Your institute with 200 ranks and 80% selection rate is on page 3.",
      },
      {
        title: "Parent has zero visibility into student progress",
        body: "Parent paid ₹2L. Sees nothing — no attendance, no test scores, no syllabus completion. The parent calls every Friday for an update, and the front desk has no clean answer.",
      },
      {
        title: "Demo-to-paid drop-off is 60%+",
        body: "Demo class happens, student is interested, parent goes home, family discusses, nobody follows up, momentum dies. There's no nurture sequence converting demo attendance to enrollment.",
      },
    ],
  },

  build: {
    title: "What we ship for coaching & EdTech",
    deliverables: [
      {
        label: "Inquiry-to-demo-to-enrollment funnel",
        description:
          "Website with course pages, faculty pages, results pages, demo-class booking widget. Auto-routing of inquiries to counsellors with sub-30-min SLA. WhatsApp + email follow-up sequences for cold leads.",
      },
      {
        label: "Razorpay fees + EMI + sibling discount",
        description:
          "Full payment, EMI 3/6/9/12 months, sibling discount (auto-applied), scholarship code, refund flow. Supports cash receipt entry for offline collections so books stay reconciled.",
      },
      {
        label: "LMS — live, recorded, mock test",
        description:
          "Live class (Zoom / Teams / 100ms / Jitsi), recorded library with playback speed and bookmarks, mock test engine with negative marking and per-question analytics, doubt-clearing forum.",
      },
      {
        label: "Attendance + per-batch analytics",
        description:
          "Attendance via QR / RFID / facial / manual. Per-batch analytics on attendance, test performance, syllabus completion. Faculty sees who's struggling before the parent does.",
      },
      {
        label: "Parent dashboard",
        description:
          "Parent logs in to see attendance, test scores, syllabus completion, fee status, and faculty notes. Reduces 'how is my child doing' calls by 70%.",
      },
      {
        label: "Local SEO + faculty / results content",
        description:
          "Per-city, per-course landing pages targeting 'NEET coaching in {city}', 'JEE coaching {locality}'. Faculty profiles with credentials. Annual results pages with topper interviews. 100+ SEO pages for a multi-course institute.",
      },
      {
        label: "Demo-to-paid nurture",
        description:
          "Post-demo WhatsApp + call sequence over 7–14 days. Parent + student get tailored follow-ups. Demo-to-paid conversion lifts from 30–40% baseline to 55–70%.",
      },
    ],
  },

  outcome: {
    title: "What changes after we ship",
    metrics: [
      { value: "3–4x", label: "Faster enrollment cycle" },
      { value: "+40–60%", label: "Inquiry → enrollment lift" },
      { value: "−30%", label: "Demo-to-paid drop-off" },
      { value: "8 weeks", label: "Offline-to-hybrid go-live" },
      { value: "−70%", label: "Parent-status calls to front desk" },
      { value: "50+", label: "Local SEO landing pages live" },
    ],
    summary:
      "Within 90 days: phone-based admissions become the exception, fees collect themselves on Razorpay, parents stop calling for status because they have a dashboard, and Google starts sending you organic inquiries for the courses you teach.",
  },

  faq: [
    {
      q: "We're a JEE / NEET / UPSC institute with 800 offline students — does this fit us?",
      a: "Squarely. The 200–5,000-student offline-first institute going hybrid is the median case we ship for. Your existing classroom flow continues unchanged; we layer the website + Razorpay + LMS + parent dashboard on top so the online channel scales without disrupting offline. Most clients in this band are at 70:30 offline:online when we engage and 50:50 within 12 months.",
    },
    {
      q: "Do you build a custom LMS or use existing platforms (Teachable, Thinkific, Graphy, Classplus)?",
      a: "Depends on scale. Below 200 students or if you're testing online demand, we'll often start on Graphy / Classplus / Teachmint with a custom website on top — fastest time to market. Above 500 students or if your live + recorded + mock + parent dashboard needs are non-standard, we build custom because the per-seat cost of SaaS LMS becomes prohibitive and the LMS becomes the thing capping your differentiation.",
    },
    {
      q: "How does Razorpay EMI work for a ₹2L coaching fee?",
      a: "Razorpay supports EMI on credit cards (3/6/9/12 months), no-cost EMI on select cards, and BNPL via Simpl / LazyPay. We integrate all three plus a custom installment plan (e.g., 4 cheques over the academic year) tracked in the institute dashboard. Sibling discounts, scholarships, and partial refunds are configured per institute policy. Razorpay reconciliation runs daily into the books.",
    },
    {
      q: "Will this rank our institute on Google for 'NEET coaching in {city}'?",
      a: "Yes — local + course-specific SEO is one of the highest-leverage channels for coaching. We build 30–80 landing pages per institute (per city, per course, per locality, results-focused, faculty-focused) with structured data, internal linking, and content depth. Combined with Google Business Profile and review velocity, top-3 ranking for primary city + course queries is realistic in 4–6 months.",
    },
    {
      q: "What about online creators selling cohorts at ₹50K–₹2L per seat?",
      a: "That's a different shape — fewer students, higher per-seat economics, application-style funnel. We build the application + cohort-launch landing page, payment + scholarship logic, cohort LMS (live + replays + Slack/Discord community + assignment grading), and a graduation / referral flow. Scales from solo creator to 5-cohort academy.",
    },
    {
      q: "Can you integrate with our existing student management system (Tally, Vedantu, Toppr internal)?",
      a: "Usually yes via API or CSV bridges. The pattern that works best is: keep the SMS / accounting system as the system of record for finance + audit, and run the website + LMS + parent dashboard as the student-facing surface, with daily sync. Avoids ripping out core systems your accountant relies on.",
    },
    {
      q: "How fast can we go live?",
      a: "Website + Razorpay + inquiry funnel: 4–6 weeks. LMS (live + recorded + mock test + parent dashboard): 8–12 weeks. Local SEO content engine: 12–16 weeks for full ramp. Most institutes see enrollment-cycle improvement in the first 60 days from inquiry funnel + Razorpay alone.",
    },
    {
      q: "What does it cost?",
      a: "Discovery: ₹1.5L–₹3L. Build: ₹6L–₹35L depending on whether you need custom LMS or SaaS-LMS integration. Retainer: ₹40K–₹1.2L/month for SEO content, automation maintenance, and seasonal admission cycles. Most institutes break even on the build inside 1 admission cycle from the demo-to-paid lift alone.",
    },
  ],

  cityFocus: {
    primaryCitySlug: "delhi",
    cities: ["delhi", "mumbai", "bengaluru", "pune", "hyderabad", "indore", "jaipur", "bhopal"],
    callout:
      "Coaching corridors we know — Delhi (Mukherjee Nagar, Old Rajinder Nagar, Karol Bagh for UPSC), Kota / Indore / Jaipur for JEE-NEET, Mumbai (Andheri, Borivali) for IIT-JEE, Bengaluru and Hyderabad for online-first creators.",
  },

  caseStudyIds: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  serviceIds: ["revsite-pro", "autosell-engine", "localdom-seo"],
};

/* -------------------------------------------------------------------------- */
/*                                 Registry                                   */
/* -------------------------------------------------------------------------- */

export const INDUSTRY_DATA: Record<IndustryKey, IndustrySeoData> = {
  manufacturing,
  "real-estate": realEstate,
  healthcare,
  ecommerce,
  edtech,
};

export function getIndustryData(slug: string): IndustrySeoData | null {
  if (!isIndustrySlug(slug)) return null;
  return INDUSTRY_DATA[slug];
}

export function isIndustrySlug(slug: string): slug is IndustryKey {
  return (INDUSTRY_SLUGS as readonly string[]).includes(slug);
}
