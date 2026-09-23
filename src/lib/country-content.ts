/**
 * Per-country content for the 12 target markets.
 *
 * This is the data layer that makes each country variant GENUINELY different —
 * not just title/meta personalization. Google's near-duplicate detector looks
 * at the visible body text; when >60% of that text is identical across URLs,
 * it consolidates the variants and only indexes one. The fields here feed
 * into section components so that `/us/en` and `/de/en` render materially
 * different copy, stats, case-study selection, FAQ, and CTAs.
 *
 * Content tiers:
 *   T1 — fully hand-written (in, us, gb, ae)
 *   T2 — templated core + country-specific bullets (ca, au, sg, de)
 *   T3 — lighter localization, still unique hero + trust block (fr, es, nl, sa)
 *
 * Add new markets by adding a new `CountryContent` entry and the country code
 * to `TARGET_COUNTRIES` in `constants.ts`.
 *
 * Industry keys match `t.industries.items[].id` in translations:
 *   manufacturing, real-estate, ecommerce, healthcare, edtech
 * Case-study slugs match `t.caseStudies.items[].id`:
 *   d2c-skincare, real-estate-developer, manufacturing-erp
 */

import type { TargetCountry } from "@/lib/constants";

export type IndustryKey =
  | "manufacturing"
  | "real-estate"
  | "ecommerce"
  | "healthcare"
  | "edtech";

export type CaseStudySlug =
  | "d2c-skincare"
  | "real-estate-developer"
  | "manufacturing-erp";

export interface CountryStat {
  value: string;
  label: string;
}

export interface CountryFaq {
  q: string;
  a: string;
}

export interface CountryBusinessAddress {
  /** City/region we list in LocalBusiness JSON-LD — pins local relevance */
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  /** Named cities we explicitly serve — used in trust block + JSON-LD areaServed */
  areaServed: string[];
}

export interface CountryContent {
  /** ISO-3166 alpha-2 (lowercase) — matches URL slug */
  code: TargetCountry;
  /** Human-readable country name used in visible copy */
  countryName: string;
  /** Demonym, used in phrases like "{demonym} D2C brands". Falls back to countryName. */
  demonym: string;

  /** Timezone we ship calls in — surfaces in CTAs */
  timezone: { label: string; callWindow: string };
  currencyLine: string;

  /**
   * Hero overrides — only these three strings swap per country. Section layout
   * stays the same so we don't lose the validated homepage structure.
   */
  hero: {
    subheadline: string;
    /** Small stat shown under the hero CTAs. Country-specific. */
    stat: CountryStat;
  };

  /**
   * Trust block — ~80–140 words, 100% unique per country. Rendered as its
   * own section. This is the single biggest duplicate-content breaker.
   */
  trustBlock: {
    title: string;
    body: string[];
  };

  /**
   * Industry order + per-industry tagline. `order` is a permutation of the
   * 5 translation industry IDs. `angle` provides a country-specific supporting
   * line rendered under each industry card.
   */
  industries: {
    order: IndustryKey[];
    angle: Partial<Record<IndustryKey, string>>;
  };

  /** 1-paragraph country-specific intro that we render above the Services grid */
  servicesAngle: string;

  /** Which case study slugs to feature first on this country's page */
  caseStudiesFeatured: CaseStudySlug[];

  /** Country-specific stat line for the BigNumbers section */
  bigNumbers: CountryStat[];

  /**
   * IDs or name-substrings of testimonials to lift to the top of the list.
   * Empty array = use global ordering.
   */
  testimonialsPriority: string[];

  /** 2–4 questions appended to the FAQ section. Local regulatory/practical fit. */
  faqAdditions: CountryFaq[];

  /**
   * Country-appropriate CTA copy.
   *
   * NOTE: only `supportLine` is still rendered. `primary` used to supply the
   * button label per market and said "Book a discovery call" in ten of the
   * eleven — which named the PAID second step on a button offering the free
   * audit, and promised a booking the contact form does not perform. The
   * button now uses one accurate label sitewide (CTA_LABEL, lib/offer.ts).
   * `primary` is kept so these market files stay a complete record; if it is
   * ever rendered again, fix the copy first.
   */
  cta: {
    primary: string;
    supportLine: string;
  };

  /** LocalBusiness JSON-LD address + service area */
  business: CountryBusinessAddress;

  /** Short regulatory / compliance note. Surfaces in KnowMore or footer. */
  regulatoryNote?: string;
}

/* -------------------------------------------------------------------------- */
/*                         Country content entries                            */
/* -------------------------------------------------------------------------- */

const IN: CountryContent = {
  code: "in",
  countryName: "India",
  demonym: "Indian",
  timezone: { label: "IST (UTC+5:30)", callWindow: "10am–7pm IST, Mon–Sat" },
  currencyLine: "Proposals in INR (₹). GST-compliant invoicing.",
  hero: {
    subheadline:
      "Indian D2C brands, real estate developers, and clinics lose ₹10–40 lakh a month to broken funnels, cold leads, and manual ops. We rebuild the whole revenue stack — website, automation, SEO, WhatsApp — as one unified system.",
    stat: { value: "₹40Cr+", label: "Client revenue impacted across 50+ Indian businesses" },
  },
  trustBlock: {
    title: "Built for the Indian growth stack",
    body: [
      "We know what moves Indian businesses forward because we've worked inside them. WhatsApp is the real CRM. Razorpay and Cashfree handle your checkout. GST compliance sits on every invoice. Paid ads burn ₹200–800 CPL while competitors quietly rank for the same keywords organically.",
      "Our revenue systems are wired for how India actually buys. WhatsApp automation follows up on abandoned carts within 90 seconds. Lead scoring surfaces hot real estate buyers to sales inside minutes, not days. SEO targets the tier-2/tier-3 queries big agencies ignore — Indore, Jaipur, Kochi, Bhubaneswar — where competition is thin and intent is high.",
      "Based in India. Pricing in INR. Call windows in IST. We speak the language of founders shipping from Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad, and Ahmedabad.",
    ],
  },
  industries: {
    order: ["real-estate", "manufacturing", "ecommerce", "healthcare", "edtech"],
    angle: {
      "real-estate":
        "From Gurugram high-rise launches to Pune villas — automated lead routing, virtual walkthroughs, and WhatsApp nurture that closes site visits, not just inquiries.",
      "manufacturing":
        "MSMEs and manufacturers across Pune, Coimbatore, and Faridabad — we digitize order workflows, tie GST filings to sales pipeline, and cut quote-to-dispatch time by 40%.",
      ecommerce:
        "₹5Cr–₹50Cr D2C brands on Shopify and WooCommerce — we fix cart abandonment, scale paid-organic balance, and build LTV through WhatsApp retention loops.",
      healthcare:
        "Multi-location clinics in metros — Practo-independent booking, missed-call-to-WhatsApp conversion, and Google reviews automation that compounds local ranking.",
      edtech:
        "Coaching institutes and edtech — funnel from Instagram reel to demo class to enrollment, all automated. Works even when your counselors are offline.",
    },
  },
  servicesAngle:
    "Every service is priced and scoped for Indian SME unit economics. We don't sell six-figure retainers — we ship systems that pay for themselves inside 90 days, then compound.",
  caseStudiesFeatured: ["d2c-skincare", "real-estate-developer", "manufacturing-erp"],
  bigNumbers: [
    { value: "₹40Cr+", label: "Revenue impacted across Indian clients" },
    { value: "50+", label: "Indian businesses scaled" },
    { value: "90 days", label: "Average payback on engagement cost" },
    { value: "200%", label: "Year-1 ROI on revenue systems built" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you handle GST-compliant invoicing and TDS?",
      a: "Yes. All engagements are billed from our Indian entity with GST, and we support TDS deduction on services as per Section 194J. Your CA gets everything they need.",
    },
    {
      q: "Can you work with Razorpay, Cashfree, PayU, and WhatsApp Business API?",
      a: "Every one of our commerce and automation builds integrates natively with Razorpay or Cashfree on the payments side, and Gupshup, WATI, or AiSensy on the WhatsApp side. You don't pay us to learn your stack.",
    },
    {
      q: "Which cities do you primarily serve?",
      a: "We've shipped for clients in Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad, Ahmedabad, Chennai, Jaipur, Indore, and Kochi. All work is remote-first so location is not a constraint.",
    },
  ],
  cta: {
    primary: "Book a free revenue audit (IST)",
    supportLine: "Free 45-minute audit. No pitch. Delivered in IST — weekdays or Saturday.",
  },
  business: {
    addressLocality: "Bengaluru",
    addressRegion: "KA",
    areaServed: ["Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Ahmedabad", "Chennai", "Jaipur"],
  },
  regulatoryNote:
    "GST-compliant invoicing. DPDP Act 2023 compliant data handling. SOC2 workflows on request.",
};

const US: CountryContent = {
  code: "us",
  countryName: "United States",
  demonym: "US",
  timezone: { label: "US Eastern & Pacific", callWindow: "9am–6pm ET / 9am–5pm PT" },
  currencyLine: "Proposals in USD. W-9 available on request.",
  hero: {
    subheadline:
      "US D2C brands and SaaS teams leave an estimated $3.2B on the table every year in broken checkout funnels, stalled lead-to-demo pipelines, and one-size-fits-all marketing sites. We rebuild the revenue engine — fast, measurable, and shipped in under 90 days.",
    stat: { value: "$4M+", label: "Revenue recovered across US D2C and SaaS clients" },
  },
  trustBlock: {
    title: "Revenue engineering for US growth-stage teams",
    body: [
      "If you run a US D2C brand doing $2M–$50M, or a SaaS team between $500K–$10M ARR, you already have the traffic. What you don't have is a website, CRM, and lifecycle stack that actually converts it. Heatmaps show where visitors drop. Your HubSpot or Pipedrive data shows where demos die. Your Shopify funnel shows where cart becomes ghost. We wire all three into one diagnosis, ship the fixes, and measure uplift in live revenue — not vanity metrics.",
      "Our engagements work across US time zones with Slack-first communication, weekly Looms, and deliverables on a public Linear board. Contracts run through Stripe Atlas-friendly entities. We sign your MSA, your DPA, and your SOC2 vendor questionnaire. Most US clients ship their first revenue lift inside 45 days.",
      "Trusted by founders in New York, San Francisco, Austin, Miami, Los Angeles, Chicago, Denver, and Seattle.",
    ],
  },
  industries: {
    order: ["ecommerce", "manufacturing", "healthcare", "real-estate", "edtech"],
    angle: {
      ecommerce:
        "Shopify Plus and headless stacks — Klaviyo lifecycle, post-purchase upsells, subscription rescue, and a checkout that doesn't hemorrhage mobile revenue.",
      "manufacturing":
        "Product-led SaaS and US service businesses $1M–$50M — we fix the pricing page, the self-serve onboarding, and the ops dashboards founders quietly dread.",
      healthcare:
        "Medical, dental, and med-spa practices — HIPAA-aware intake flows, no-show recovery, and Google Business Profile plays that dominate 5-mile-radius search.",
      "real-estate":
        "US brokerages and real estate teams — IDX-integrated sites, lead routing with sub-5-minute response, and seller farming landing pages that rank locally.",
      edtech:
        "US coaches, course creators, and cohort-based programs — high-ticket application funnels, webinar-to-call flows, and retention loops that 3x LTV.",
    },
  },
  servicesAngle:
    "Priced in USD. Delivered on Slack + Linear. SOC2 questionnaire returned inside 48 hours. We work like your in-house engineering team, not a vendor you chase.",
  caseStudiesFeatured: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  bigNumbers: [
    { value: "$4M+", label: "Revenue recovered for US clients" },
    { value: "45 days", label: "Average time to first measurable revenue lift" },
    { value: "3.2x", label: "Average ROI across 12-month US engagements" },
    { value: "SOC2", label: "Vendor questionnaire returned in 48 hours" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you have a US entity and can you invoice in USD?",
      a: "Yes. We invoice in USD through our international entity, accept ACH and wire, and provide a W-9 for US tax purposes. Payment terms are Net 15 or milestone-based.",
    },
    {
      q: "How do you handle SOC2, HIPAA, and data-processing agreements?",
      a: "We sign MSAs, DPAs, and SOC2 vendor questionnaires inside 48 hours. For HIPAA-regulated clinics we operate under a BAA with scoped PHI access and audit logs.",
    },
    {
      q: "Do you work in US time zones?",
      a: "Yes — we run Slack-overlapping hours for Eastern (9am–12pm ET live) and Pacific (9am–12pm PT live), with async handoffs for the remainder of the day. Weekly Loom updates keep you out of meetings.",
    },
    {
      q: "Can you integrate with our existing stack (HubSpot, Salesforce, Klaviyo, Stripe)?",
      a: "All of those and more. We don't replace tools you already pay for — we wire them together and fix the handoffs where deals leak.",
    },
  ],
  cta: {
    primary: "Book a discovery call (ET/PT)",
    supportLine: "45-minute working session. We diagnose the revenue leak live. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "US",
    areaServed: ["New York", "San Francisco", "Austin", "Miami", "Los Angeles", "Chicago", "Denver", "Seattle"],
  },
  regulatoryNote:
    "SOC2 Type II workflows. HIPAA-compliant engagements available under BAA. W-9 on request.",
};

const GB: CountryContent = {
  code: "gb",
  countryName: "United Kingdom",
  demonym: "UK",
  timezone: { label: "London (GMT/BST)", callWindow: "9am–6pm GMT, Mon–Fri" },
  currencyLine: "Proposals in GBP (£). UK VAT handled for registered entities.",
  hero: {
    subheadline:
      "UK e-commerce and B2B operators face the tightest CPA market in Europe — and the slowest-converting marketing stacks. We rebuild your revenue system for the UK buyer: shorter funnels, faster follow-up, and SEO that actually beats the aggregators.",
    stat: { value: "£1.8M+", label: "Pipeline unlocked across UK clients" },
  },
  trustBlock: {
    title: "Revenue systems for UK operators",
    body: [
      "UK e-commerce has the most expensive Meta CPMs in Europe and the most mature organic search competition. That means paid is pricing you out and SEO is out-waiting you. The operators who win are the ones wiring fast, first-party-data-rich funnels — consent-first, GDPR-clean, and instrumented for attribution beyond cookies.",
      "Our work for UK clients spans London fintech, Manchester D2C, Edinburgh SaaS, and Bristol services firms. We sign DPAs under UK GDPR, handle ICO requirements, and work with Stripe GB entities. Engagements are quoted in GBP with UK VAT.",
      "If your Shopify is on Plus or you're on HubSpot Enterprise, we plug in without a rebuild. We fix the leaks first, ship revenue, then scale.",
    ],
  },
  industries: {
    order: ["ecommerce", "manufacturing", "real-estate", "healthcare", "edtech"],
    angle: {
      ecommerce:
        "UK Shopify and Magento stacks — post-purchase, subscription, and SMS flows that work under GDPR consent rules without killing conversion.",
      "manufacturing":
        "UK B2B SaaS and service firms £1M–£20M — ABM-friendly websites, webinar funnels, and the internal dashboards directors actually use.",
      "real-estate":
        "UK estate agents and property developers — Rightmove/Zoopla-adjacent lead capture, valuation funnels, and post-viewing nurture.",
      healthcare:
        "Private clinics and med-spas across London, Manchester, and Birmingham — GDPR-aware intake, Google Reviews automation, and local SEO.",
      edtech:
        "UK coaches and course creators — low-CAC webinar funnels, long-form nurture, and retention sequences for premium programs.",
    },
  },
  servicesAngle:
    "Quoted in GBP with UK VAT. DPAs under UK GDPR. ICO-compliant data flows from day one. We integrate with HubSpot, Salesforce, Pipedrive, Klaviyo, Omnisend, and Stripe GB out of the box.",
  caseStudiesFeatured: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  bigNumbers: [
    { value: "£1.8M+", label: "Pipeline unlocked for UK clients" },
    { value: "GDPR", label: "Consent-first data flows on every build" },
    { value: "60 days", label: "Typical time to measurable revenue lift" },
    { value: "2.9x", label: "Average ROAS improvement Y1" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Are you UK GDPR and ICO compliant?",
      a: "Yes. We sign DPAs under UK GDPR, handle data minimization by default, and document processing activities per ICO guidance. We do not store PII outside the UK/EU unless explicitly agreed.",
    },
    {
      q: "Do you invoice in GBP and handle VAT?",
      a: "Yes. For UK VAT-registered clients we apply reverse charge where applicable, otherwise VAT is added and itemized.",
    },
    {
      q: "Can you work with UK-based stacks (HubSpot, Pipedrive, Shopify Plus GB, Klaviyo)?",
      a: "All of those and more. We ship to whichever CRM/ESP you already run — no migration required.",
    },
  ],
  cta: {
    primary: "Book a discovery call (GMT)",
    supportLine: "45-minute working session, London hours. No sales deck.",
  },
  business: {
    addressLocality: "London",
    addressRegion: "ENG",
    areaServed: ["London", "Manchester", "Edinburgh", "Bristol", "Birmingham", "Leeds", "Glasgow"],
  },
  regulatoryNote:
    "UK GDPR + ICO compliant data handling. DPAs on request. UK VAT supported.",
};

const AE: CountryContent = {
  code: "ae",
  countryName: "United Arab Emirates",
  demonym: "UAE",
  timezone: { label: "GST (UTC+4)", callWindow: "9am–6pm GST, Sun–Thu" },
  currencyLine: "Proposals in AED (د.إ). UAE 5% VAT handled.",
  hero: {
    subheadline:
      "UAE real estate, retail, and clinic brands spend aggressively on paid and get flat organic reach. We rebuild the revenue system for the Gulf buyer — Arabic-first where it matters, WhatsApp-heavy everywhere, and tuned for Dubai and Abu Dhabi search behavior.",
    stat: { value: "AED 6M+", label: "Pipeline generated for UAE clients" },
  },
  trustBlock: {
    title: "Built for the Gulf growth playbook",
    body: [
      "In the UAE, WhatsApp is the primary channel, Arabic SEO is massively under-indexed, and buying decisions move fast once trust is established. The playbook that works in the US or India doesn't land here — you need bilingual funnels, Gulf-timezone response, and proof points that resonate with a Dubai or Abu Dhabi buyer.",
      "We've shipped for UAE-based real estate agencies in Downtown Dubai, Business Bay, and Abu Dhabi Corniche; premium clinics in Jumeirah and Al Barsha; and retail brands across Dubai Mall and Mall of the Emirates. Our builds are bilingual by default, GDPR + UAE PDPL compliant, and integrate with Tabby, Tamara, and Mamo for local payment rails.",
      "Sun–Thu working week. Arabic + English bilingual delivery. 5% VAT-compliant invoicing.",
    ],
  },
  industries: {
    order: ["real-estate", "ecommerce", "healthcare", "manufacturing", "edtech"],
    angle: {
      "real-estate":
        "Dubai and Abu Dhabi developers + brokerages — bilingual property pages, WhatsApp lead routing, and off-plan launch funnels that convert in both Arabic and English.",
      ecommerce:
        "UAE retail and D2C — Shopify + Zid builds with Tabby/Tamara BNPL integration and Arabic-first product discovery.",
      healthcare:
        "Jumeirah, Al Barsha, and DIFC clinics — WhatsApp-first booking, Google Reviews automation, and bilingual SEO.",
      "manufacturing":
        "UAE SMEs scaling beyond founder-led sales — bilingual CRM, automation, and dashboards in English + Arabic.",
      edtech:
        "Gulf-region coaches and course creators — Arabic webinar funnels and WhatsApp-led nurture.",
    },
  },
  servicesAngle:
    "Bilingual (Arabic + English) delivery by default. 5% UAE VAT handled. Tabby, Tamara, Mamo, Stripe UAE, and Network International integrations out of the box.",
  caseStudiesFeatured: ["real-estate-developer", "d2c-skincare", "manufacturing-erp"],
  bigNumbers: [
    { value: "AED 6M+", label: "Pipeline generated for UAE clients" },
    { value: "Bilingual", label: "Arabic + English on every build" },
    { value: "Sun–Thu", label: "Gulf working week aligned" },
    { value: "5% VAT", label: "UAE VAT-compliant invoicing" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you build bilingual Arabic + English sites?",
      a: "Yes. Every UAE engagement ships bilingual by default, with native RTL layouts, Arabic-first keyword research, and culturally calibrated copy — not just translated.",
    },
    {
      q: "Can you handle UAE VAT invoicing?",
      a: "Yes. We invoice in AED with UAE 5% VAT, compliant with FTA requirements. We also accept USD for clients preferring hard-currency settlement.",
    },
    {
      q: "Do you integrate with Tabby, Tamara, and Mamo?",
      a: "Yes — all three are native integrations for our commerce builds, alongside Stripe UAE and Network International for card processing.",
    },
  ],
  cta: {
    primary: "Book a discovery call (GST)",
    supportLine: "45-minute working session in GST, Sun–Thu. Bilingual if you prefer.",
  },
  business: {
    addressLocality: "Dubai",
    addressRegion: "DU",
    areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"],
  },
  regulatoryNote:
    "UAE PDPL compliant data handling. 5% VAT supported. Bilingual Arabic + English delivery.",
};

/* -------------------------------------------------------------------------- */
/*                       T2 entries — templated + specific                    */
/* -------------------------------------------------------------------------- */

const CA: CountryContent = {
  code: "ca",
  countryName: "Canada",
  demonym: "Canadian",
  timezone: { label: "Eastern/Pacific", callWindow: "9am–6pm ET / PT" },
  currencyLine: "Proposals in CAD. GST/HST/QST handled.",
  hero: {
    subheadline:
      "Canadian D2C and service businesses compete with US brands on the same ad platforms at 40% higher CPMs. We rebuild your revenue system to win the organic and lifecycle channels that US competitors ignore north of the border.",
    stat: { value: "C$2.4M+", label: "Pipeline generated for Canadian clients" },
  },
  trustBlock: {
    title: "Revenue systems tuned for the Canadian market",
    body: [
      "Canadian buyers research longer, convert slower, and reward brands that show up consistently in organic search and lifecycle email. We rebuild funnels optimized for that reality — Klaviyo flows tuned for longer consideration windows, bilingual (EN/FR) landing pages where relevant, and SEO that targets city-level queries in Toronto, Vancouver, Montreal, and Calgary.",
      "Invoiced in CAD with appropriate GST/HST/QST handling. PIPEDA-compliant data flows. We work in Eastern and Pacific time overlap hours.",
    ],
  },
  industries: {
    order: ["ecommerce", "manufacturing", "real-estate", "healthcare", "edtech"],
    angle: {
      ecommerce: "Canadian Shopify and Shopify Plus merchants — lifecycle + SEO heavy, paid-efficient.",
      "manufacturing": "Canadian B2B SaaS and service firms — ABM and self-serve funnels with EN/FR support.",
      "real-estate": "Canadian brokerages across GTA, Vancouver, Montreal — IDX-integrated lead systems.",
      healthcare: "Canadian clinics and med-spas — Jane App-friendly intake and review automation.",
      edtech: "Canadian coaches and course creators — long-nurture funnels for higher-LTV programs.",
    },
  },
  servicesAngle:
    "Priced in CAD. GST/HST/QST handled. PIPEDA-compliant. Bilingual EN/FR delivery available for Quebec-based clients.",
  caseStudiesFeatured: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  bigNumbers: [
    { value: "C$2.4M+", label: "Pipeline generated for Canadian clients" },
    { value: "EN + FR", label: "Bilingual delivery available" },
    { value: "PIPEDA", label: "Compliant data handling" },
    { value: "45 days", label: "Average time to first revenue lift" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you handle GST/HST/QST invoicing?",
      a: "Yes. We apply the correct sales tax based on your province and issue compliant invoices in CAD.",
    },
    {
      q: "Do you offer bilingual English/French delivery for Quebec clients?",
      a: "Yes — for Quebec-based clients we ship bilingual landing pages and French-language support flows.",
    },
  ],
  cta: {
    primary: "Book a discovery call",
    supportLine: "45-minute working session. ET or PT. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "CA",
    areaServed: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  },
  regulatoryNote: "PIPEDA-compliant data handling. GST/HST/QST handled.",
};

const AU: CountryContent = {
  code: "au",
  countryName: "Australia",
  demonym: "Australian",
  timezone: { label: "AEDT/AEST (UTC+10/11)", callWindow: "9am–5pm AEST, Mon–Fri" },
  currencyLine: "Proposals in AUD. GST handled for registered entities.",
  hero: {
    subheadline:
      "Australian e-commerce and service businesses face the highest CPMs in the English-speaking world. The teams winning aren't outspending — they're out-systemizing. We rebuild your revenue stack for the Australian buyer: faster lead response, tighter SEO, and lifecycle that compounds.",
    stat: { value: "A$2.1M+", label: "Pipeline unlocked for Australian clients" },
  },
  trustBlock: {
    title: "Revenue systems for Australian operators",
    body: [
      "Australian Meta CPMs are 2–3x US rates, and organic search is dominated by a handful of aggregators. Our work for AU clients focuses on wringing more from each visitor — 0–5 second lead response, post-purchase flows that 2x repeat rate, and local SEO that targets city-level intent in Sydney, Melbourne, Brisbane, and Perth.",
      "Invoiced in AUD with GST. Australian Privacy Principles-compliant data handling. We run on AEST overlap hours, with async handoffs for deep work.",
    ],
  },
  industries: {
    order: ["ecommerce", "real-estate", "manufacturing", "healthcare", "edtech"],
    angle: {
      ecommerce: "Australian Shopify merchants — post-purchase, subscription, and SMS flows that beat local CPM pressure.",
      "real-estate": "Australian real estate — realestate.com.au-adjacent lead capture and appraisal funnels.",
      "manufacturing": "Australian B2B SaaS and service firms — APAC-to-US pipeline with async US overlap.",
      healthcare: "Australian clinics — HealthEngine-friendly intake, review automation, local SEO.",
      edtech: "Australian coaches and course creators — long-nurture for premium pricing.",
    },
  },
  servicesAngle:
    "Priced in AUD. GST handled. Australian Privacy Principles compliant. AEST hours with async US overlap where needed.",
  caseStudiesFeatured: ["d2c-skincare", "real-estate-developer", "manufacturing-erp"],
  bigNumbers: [
    { value: "A$2.1M+", label: "Pipeline unlocked for AU clients" },
    { value: "AEST", label: "Aligned time zone hours" },
    { value: "APP", label: "Privacy Principles compliant" },
    { value: "60 days", label: "Average time to first lift" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you invoice in AUD with GST?",
      a: "Yes. We issue GST-inclusive invoices in AUD and can provide statements for BAS reporting.",
    },
    {
      q: "Are you compliant with Australian Privacy Principles?",
      a: "Yes. We follow APP 1–13 on all data handling, documented in our DPA.",
    },
  ],
  cta: {
    primary: "Book a discovery call (AEST)",
    supportLine: "45-minute working session. AEST hours. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "AU",
    areaServed: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
  regulatoryNote: "Australian Privacy Principles compliant. GST supported.",
};

const SG: CountryContent = {
  code: "sg",
  countryName: "Singapore",
  demonym: "Singaporean",
  timezone: { label: "SGT (UTC+8)", callWindow: "9am–6pm SGT, Mon–Fri" },
  currencyLine: "Proposals in SGD. GST handled for registered entities.",
  hero: {
    subheadline:
      "Singapore businesses sell into the tightest APAC market — sophisticated buyers, high trust bars, multi-language funnels. We rebuild your revenue system for the Singapore reality: fast, credible, and tuned to convert the APAC hub buyer.",
    stat: { value: "S$1.6M+", label: "Pipeline unlocked for Singapore clients" },
  },
  trustBlock: {
    title: "Revenue systems for Singapore and APAC",
    body: [
      "Singapore buyers — both consumer and B2B — are among the most research-driven and trust-conscious in APAC. Sites that win here are credible, reviewed, and integrated with local payment rails like PayNow, GrabPay, and DBS PayLah. Our Singapore work combines CBD-grade brand polish with ruthless conversion engineering underneath.",
      "Invoiced in SGD with GST. PDPA-compliant data handling. We ship SGT-aligned, often with Hong Kong / KL / Bangkok ripple-through for regional clients.",
    ],
  },
  industries: {
    order: ["manufacturing", "ecommerce", "edtech", "healthcare", "real-estate"],
    angle: {
      "manufacturing": "Singapore B2B SaaS and services selling across APAC — ABM, enterprise proof, multi-currency checkout.",
      ecommerce: "Singapore D2C — Shopify with PayNow, GrabPay, and Atome integrations.",
      edtech: "Singapore coaches and course creators — premium-tier funnels and retention.",
      healthcare: "Singapore clinics and med-spas — PDPA-aware intake and review automation.",
      "real-estate": "Singapore property — PropertyGuru-adjacent landing pages and lead routing.",
    },
  },
  servicesAngle:
    "Priced in SGD. GST handled. PDPA-compliant. SGT aligned. PayNow, GrabPay, Atome, DBS PayLah integrations supported.",
  caseStudiesFeatured: ["manufacturing-erp", "d2c-skincare", "real-estate-developer"],
  bigNumbers: [
    { value: "S$1.6M+", label: "Pipeline unlocked for Singapore clients" },
    { value: "PDPA", label: "Compliant data handling" },
    { value: "APAC", label: "Multi-country funnel expertise" },
    { value: "SGT", label: "Aligned working hours" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Are you PDPA compliant?",
      a: "Yes. All Singapore engagements follow Singapore PDPA requirements for consent, storage, and disclosure.",
    },
    {
      q: "Can you integrate with PayNow, GrabPay, and DBS PayLah?",
      a: "Yes — all three are native integrations for our Singapore commerce builds.",
    },
  ],
  cta: {
    primary: "Book a discovery call (SGT)",
    supportLine: "45-minute working session. SGT hours. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "SG",
    areaServed: ["Singapore", "Jurong", "Tampines", "Woodlands"],
  },
  regulatoryNote: "Singapore PDPA compliant. GST handled.",
};

const DE: CountryContent = {
  code: "de",
  countryName: "Germany",
  demonym: "German",
  timezone: { label: "CET/CEST", callWindow: "9am–6pm CET, Mon–Fri" },
  currencyLine: "Proposals in EUR. German VAT (MwSt) handled.",
  hero: {
    subheadline:
      "German B2B and D2C buyers are the most research-driven in Europe — and the most unforgiving of consent-violating funnels. We rebuild your revenue system for the German reality: DSGVO-clean, conversion-tight, and credible enough to convert the cautious Mittelstand buyer.",
    stat: { value: "€1.9M+", label: "Pipeline unlocked for German clients" },
  },
  trustBlock: {
    title: "DSGVO-clean revenue systems for the German market",
    body: [
      "Germany has the strictest consent regime in Europe and the most trust-conscious buyers in any major market. Your funnel works only if your cookie banner is compliant, your forms are minimal, and your content is substantive. We rebuild sites that pass DSGVO on day one, load in under 1.5s on the legacy mobile networks German B2B runs on, and convert the Mittelstand buyer who reads every bullet.",
      "Invoiced in EUR with German VAT (MwSt) where applicable. DSGVO + TTDSG-compliant data flows. We can deliver in English; German-language adaptation is available for public-facing copy.",
    ],
  },
  industries: {
    order: ["manufacturing", "ecommerce", "real-estate", "healthcare", "edtech"],
    angle: {
      "manufacturing": "German B2B SaaS and Mittelstand manufacturers — long-cycle ABM, B2B lead systems, DSGVO-clean forms.",
      ecommerce: "German D2C on Shopify and Shopware — DSGVO-clean lifecycle, Klarna and Sofort integrations.",
      "real-estate": "German real estate — ImmoScout24-adjacent landing pages and lead systems.",
      healthcare: "German clinics and practices — DSGVO-aware intake and review flows.",
      edtech: "German coaches and trainers — direct-style funnels that respect local working culture.",
    },
  },
  servicesAngle:
    "Priced in EUR with German VAT handled. DSGVO + TTDSG compliant. Klarna, Sofort, Stripe DE integrations. English delivery with German adaptation available.",
  caseStudiesFeatured: ["manufacturing-erp", "d2c-skincare", "real-estate-developer"],
  bigNumbers: [
    { value: "€1.9M+", label: "Pipeline unlocked for German clients" },
    { value: "DSGVO", label: "Compliant on day one" },
    { value: "< 1.5s", label: "Target LCP on all builds" },
    { value: "CET", label: "Aligned working hours" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Are your builds DSGVO/GDPR compliant?",
      a: "Yes. Consent-first, data minimization, documented processing. TTDSG compliant for cookie banners.",
    },
    {
      q: "Do you invoice in EUR with German VAT?",
      a: "Yes — we handle reverse charge for German VAT-registered entities and standard VAT otherwise.",
    },
  ],
  cta: {
    primary: "Book a discovery call (CET)",
    supportLine: "45-minute working session. CET hours. Free. No sales deck.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "DE",
    areaServed: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
  },
  regulatoryNote: "DSGVO + TTDSG compliant. German VAT (MwSt) handled.",
};

/* -------------------------------------------------------------------------- */
/*                        T3 entries — lighter touch                          */
/* -------------------------------------------------------------------------- */

const FR: CountryContent = {
  code: "fr",
  countryName: "France",
  demonym: "French",
  timezone: { label: "CET/CEST", callWindow: "9am–6pm CET, Mon–Fri" },
  currencyLine: "Proposals in EUR. French VAT (TVA) handled.",
  hero: {
    subheadline:
      "French e-commerce and B2B buyers reward local credibility and punish generic funnels. We rebuild your revenue stack to convert the French buyer — RGPD-clean, in French where it matters, and tuned for local payment rails.",
    stat: { value: "€1.2M+", label: "Pipeline generated for French clients" },
  },
  trustBlock: {
    title: "Revenue systems for the French market",
    body: [
      "French buyers favor brands that show local presence — French-language copy, French support, and French payment rails (Cartes Bancaires, Alma, Lydia). Our work adapts proven revenue-system patterns for the French market without flattening into generic translation.",
      "Invoiced in EUR with French VAT (TVA). RGPD + CNIL-compliant data flows.",
    ],
  },
  industries: {
    order: ["ecommerce", "manufacturing", "real-estate", "edtech", "healthcare"],
    angle: {
      ecommerce: "French D2C — Shopify + PrestaShop, with Cartes Bancaires and Alma integrations.",
      "manufacturing": "French B2B SaaS — French-language funnels, EU-to-US sales motion support.",
      "real-estate": "French real estate — SeLoger-adjacent lead capture and valuation funnels.",
      edtech: "French coaches and formateurs — long-nurture, premium-tier funnels.",
      healthcare: "French clinics — Doctolib-friendly intake, RGPD-aware.",
    },
  },
  servicesAngle:
    "Priced in EUR with French VAT (TVA). RGPD + CNIL compliant. Cartes Bancaires, Alma, Stripe FR integrations. English with French adaptation.",
  caseStudiesFeatured: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  bigNumbers: [
    { value: "€1.2M+", label: "Pipeline generated for French clients" },
    { value: "RGPD", label: "Compliant data handling" },
    { value: "CET", label: "Aligned working hours" },
    { value: "EN + FR", label: "Bilingual delivery available" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Are you RGPD/GDPR compliant?",
      a: "Yes. RGPD + CNIL-compliant data flows on every build. DPAs signed.",
    },
    {
      q: "Do you deliver in French?",
      a: "Yes — bilingual English/French delivery is available, with native French copy for public-facing content.",
    },
  ],
  cta: {
    primary: "Book a discovery call (CET)",
    supportLine: "45-minute working session. CET hours. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "FR",
    areaServed: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"],
  },
  regulatoryNote: "RGPD + CNIL compliant. French VAT (TVA) handled.",
};

const ES: CountryContent = {
  code: "es",
  countryName: "Spain",
  demonym: "Spanish",
  timezone: { label: "CET/CEST", callWindow: "9am–6pm CET, Mon–Fri" },
  currencyLine: "Proposals in EUR. Spanish VAT (IVA) handled.",
  hero: {
    subheadline:
      "Spanish e-commerce and service businesses face rising CPMs and a hypercompetitive organic landscape dominated by large aggregators. We rebuild your revenue stack for Spain — Spanish-language, local payment rails, and SEO that targets city-level intent big agencies ignore.",
    stat: { value: "€900K+", label: "Pipeline unlocked for Spanish clients" },
  },
  trustBlock: {
    title: "Revenue systems tuned for Spain and LATAM",
    body: [
      "Spanish buyers convert on brands that show Spanish-language presence and integrate with local rails (Bizum, Stripe ES, Redsys). Our builds adapt proven systems for Spain without flattening into template-translation.",
      "Invoiced in EUR with Spanish VAT (IVA). RGPD + AEPD-compliant data flows.",
    ],
  },
  industries: {
    order: ["ecommerce", "real-estate", "edtech", "healthcare", "manufacturing"],
    angle: {
      ecommerce: "Spanish D2C — Shopify with Bizum and Redsys integrations, Spanish-first lifecycle.",
      "real-estate": "Spanish real estate — Idealista-adjacent lead capture and valuation funnels.",
      edtech: "Spanish coaches and formadores — Spanish-first funnels and retention.",
      healthcare: "Spanish clinics and dental practices — Spanish-language intake and review flows.",
      "manufacturing": "Spanish B2B SaaS and SMEs selling into LATAM — multi-country Spanish funnels.",
    },
  },
  servicesAngle:
    "Priced in EUR with Spanish VAT (IVA). RGPD + AEPD compliant. Bizum, Redsys, Stripe ES integrations. English with Spanish delivery.",
  caseStudiesFeatured: ["d2c-skincare", "real-estate-developer", "manufacturing-erp"],
  bigNumbers: [
    { value: "€900K+", label: "Pipeline unlocked for Spanish clients" },
    { value: "EN + ES", label: "Bilingual delivery" },
    { value: "RGPD", label: "Compliant data handling" },
    { value: "LATAM", label: "Spanish funnels tested into LATAM markets" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you deliver in Spanish?",
      a: "Yes — bilingual English/Spanish delivery is standard for Spanish engagements.",
    },
    {
      q: "Are you RGPD/AEPD compliant?",
      a: "Yes. RGPD + AEPD-compliant data flows on every build.",
    },
  ],
  cta: {
    primary: "Book a discovery call (CET)",
    supportLine: "45-minute working session. CET hours. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "ES",
    areaServed: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  },
  regulatoryNote: "RGPD + AEPD compliant. Spanish VAT (IVA) handled.",
};

const NL: CountryContent = {
  code: "nl",
  countryName: "Netherlands",
  demonym: "Dutch",
  timezone: { label: "CET/CEST", callWindow: "9am–6pm CET, Mon–Fri" },
  currencyLine: "Proposals in EUR. Dutch VAT (BTW) handled.",
  hero: {
    subheadline:
      "Dutch buyers are direct, research-driven, and reward functional design over marketing polish. We rebuild your revenue stack for the Dutch reality: iDEAL-first checkout, AVG-clean data, and funnels that respect the buyer's intelligence.",
    stat: { value: "€850K+", label: "Pipeline unlocked for Dutch clients" },
  },
  trustBlock: {
    title: "Revenue systems for the Dutch market",
    body: [
      "Dutch buyers convert on clarity and function — iDEAL must be the primary checkout, copy must be direct, and site speed must be uncompromising. Our Dutch builds target LCP under 1.2s, ship with iDEAL/Klarna as defaults, and pass AVG on day one.",
      "Invoiced in EUR with Dutch VAT (BTW). AVG + AP-compliant data flows.",
    ],
  },
  industries: {
    order: ["ecommerce", "manufacturing", "real-estate", "healthcare", "edtech"],
    angle: {
      ecommerce: "Dutch D2C — Shopify with iDEAL, Klarna, and Mollie integrations.",
      "manufacturing": "Dutch B2B SaaS — direct-copy funnels, EU-wide ABM motion.",
      "real-estate": "Dutch real estate — Funda-adjacent lead capture and valuation funnels.",
      healthcare: "Dutch clinics — AVG-compliant intake and review flows.",
      edtech: "Dutch coaches and trainers — direct-style funnels.",
    },
  },
  servicesAngle:
    "Priced in EUR with Dutch VAT (BTW). AVG + AP compliant. iDEAL, Klarna, Mollie, Stripe NL integrations.",
  caseStudiesFeatured: ["d2c-skincare", "manufacturing-erp", "real-estate-developer"],
  bigNumbers: [
    { value: "€850K+", label: "Pipeline unlocked for Dutch clients" },
    { value: "< 1.2s", label: "Target LCP on all builds" },
    { value: "AVG", label: "Compliant data handling" },
    { value: "iDEAL", label: "Primary checkout integration" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you integrate with iDEAL, Mollie, and Klarna?",
      a: "Yes — all three are native integrations for our Dutch commerce builds.",
    },
    {
      q: "Are you AVG/GDPR compliant?",
      a: "Yes. AVG + AP-compliant data flows. DPAs signed.",
    },
  ],
  cta: {
    primary: "Book a discovery call (CET)",
    supportLine: "45-minute working session. CET hours. Free.",
  },
  business: {
    addressLocality: "Remote",
    addressRegion: "NL",
    areaServed: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  },
  regulatoryNote: "AVG + AP compliant. Dutch VAT (BTW) handled.",
};

const SA: CountryContent = {
  code: "sa",
  countryName: "Saudi Arabia",
  demonym: "Saudi",
  timezone: { label: "AST (UTC+3)", callWindow: "9am–6pm AST, Sun–Thu" },
  currencyLine: "Proposals in SAR (﷼). Saudi VAT (15%) handled.",
  hero: {
    subheadline:
      "Saudi D2C, retail, and real estate brands are in the middle of a Vision 2030 digital transformation — but most funnels are still built on imported US/EU templates that don't convert the Saudi buyer. We rebuild for the Kingdom — Arabic-first, WhatsApp-central, and tuned to local payment rails.",
    stat: { value: "SAR 4M+", label: "Pipeline generated for Saudi clients" },
  },
  trustBlock: {
    title: "Revenue systems for the Kingdom",
    body: [
      "Saudi Arabia's digital market is scaling faster than any in the Gulf, driven by Vision 2030. The buyers are Arabic-first, WhatsApp-native, and payment-preference-conscious (Mada, STC Pay, Tabby, Tamara). Funnels built in English and ported in bypass the buyer's actual research behavior. We rebuild for Arabic-first UX with English as a deliberate secondary layer.",
      "Invoiced in SAR with 15% VAT (ZATCA-compliant e-invoicing). Arabic + English bilingual delivery. Sun–Thu working week.",
    ],
  },
  industries: {
    order: ["real-estate", "ecommerce", "healthcare", "manufacturing", "edtech"],
    angle: {
      "real-estate": "Saudi real estate across Riyadh, Jeddah, Dammam — Arabic-first property pages and WhatsApp-led lead routing.",
      ecommerce: "Saudi D2C on Shopify and Zid — Mada, STC Pay, Tabby, Tamara integrations.",
      healthcare: "Saudi clinics in Riyadh and Jeddah — Arabic intake flows and review automation.",
      "manufacturing": "Saudi SMEs and regional SaaS — Arabic-first CRM, automation, and dashboards.",
      edtech: "Saudi coaches and trainers — Arabic funnels and WhatsApp nurture.",
    },
  },
  servicesAngle:
    "Priced in SAR with 15% VAT (ZATCA-compliant). Arabic-first delivery. Mada, STC Pay, Tabby, Tamara integrations.",
  caseStudiesFeatured: ["real-estate-developer", "d2c-skincare", "manufacturing-erp"],
  bigNumbers: [
    { value: "SAR 4M+", label: "Pipeline generated for Saudi clients" },
    { value: "Arabic-first", label: "Native RTL delivery" },
    { value: "Sun–Thu", label: "Aligned working week" },
    { value: "ZATCA", label: "E-invoicing compliant" },
  ],
  testimonialsPriority: [],
  faqAdditions: [
    {
      q: "Do you build Arabic-first (not just translated) sites?",
      a: "Yes. RTL-native builds, Arabic-first keyword research, and culturally calibrated copy. Arabic is the primary language on every Saudi engagement.",
    },
    {
      q: "Are you ZATCA-compliant for e-invoicing?",
      a: "Yes. All SAR invoices are issued ZATCA-compliant with 15% VAT itemized.",
    },
    {
      q: "Do you integrate with Mada, STC Pay, Tabby, and Tamara?",
      a: "All four are native integrations for our Saudi commerce builds.",
    },
  ],
  cta: {
    primary: "Book a discovery call (AST)",
    supportLine: "45-minute working session. AST, Sun–Thu. Bilingual if preferred.",
  },
  business: {
    addressLocality: "Riyadh",
    addressRegion: "01",
    areaServed: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
  },
  regulatoryNote: "ZATCA-compliant e-invoicing. 15% Saudi VAT handled. Arabic-first delivery.",
};

/* -------------------------------------------------------------------------- */
/*                                 Registry                                   */
/* -------------------------------------------------------------------------- */

const COUNTRY_CONTENT: Record<TargetCountry, CountryContent> = {
  in: IN,
  us: US,
  gb: GB,
  ae: AE,
  ca: CA,
  au: AU,
  sg: SG,
  de: DE,
  fr: FR,
  es: ES,
  nl: NL,
  sa: SA,
};

/**
 * Return country-specific content for the given URL country slug. Unknown
 * slugs fall back to the India entry — callers should also add noindex via
 * `isTargetCountry()` since they shouldn't be indexed at all.
 */
export function getCountryContent(country: string): CountryContent {
  const key = country.toLowerCase() as TargetCountry;
  return COUNTRY_CONTENT[key] ?? IN;
}
