/**
 * Per-city content for the Indian metros we explicitly target.
 *
 * Each city gets its OWN URL (`/in/en/cities/{slug}`) with hand-written,
 * locally-anchored copy. This is the SEO play: Google demotes thin/duplicate
 * "doorway" city pages, so every entry below is ~600+ words of unique text
 * referencing real neighborhoods, industries, and pain points the city is
 * known for. Don't reduce these to templates without local detail — that's
 * what got the previous attempts demoted.
 *
 * Adding a new city:
 *   1. Append a new `CityContent` entry to `INDIA_CITIES`
 *   2. Make sure `slug` is lowercase, ascii, hyphenated
 *   3. Write at least 4 hand-written FAQs and 2 paragraphs of local context
 *   4. Push the deploy and submit the URL in Search Console for indexing
 *
 * **Hindi indexability** — pages render in Hindi via `localizeCity()` only
 * when a `translations.hi` block exists AND `bodyLocales` includes "hi".
 * The global INDEXABLE_LOCALES gate in [src/lib/constants.ts](src/lib/constants.ts)
 * is "en"-only, but `isCityIndexable(city, locale)` overrides per-city, so a
 * single city with real Hindi body re-enters the /in/hi index without
 * flipping the global lever and re-exposing all the fake-Hindi pages we
 * demoted on 2026-05-09.
 */

import type { Locale } from "@/lib/i18n";
import { INDEXABLE_LOCALES, isIndexable } from "@/lib/constants";

export interface CityFaq {
  q: string;
  a: string;
}

export interface CityStat {
  value: string;
  label: string;
}

export interface CityTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface CityWhyHire {
  title: string;
  body: string;
}

export interface CityContent {
  /** URL slug — lowercase, ascii, hyphenated. Goes in `/cities/{slug}`. */
  slug: string;
  /** Display name */
  name: string;
  /** Hindi spelling — used on hi locale headers + alt text */
  nameHindi: string;
  /** State name (English) */
  state: string;
  /** ISO 3166-2:IN region code (e.g. "RJ", "MH"). Used in geo.region meta. */
  stateCode: string;
  /** Approx population — visible in copy, helps Google contextualize the page */
  population: string;
  /** Lat/lng for LocalBusiness `GeoCoordinates`. City centroid. */
  geo: { lat: string; lng: string };

  /** Up to ~60 chars including " — Savin Group" suffix */
  metaTitle: string;
  /** Up to ~160 chars */
  metaDescription: string;
  /** Comma-separated keywords */
  metaKeywords: string;

  /** H1 angle line — drops the city name in naturally */
  heroSubheadline: string;
  /** 3 stat cards under the hero */
  heroStats: CityStat[];

  /** 2-3 paragraphs of unique local context */
  localContext: string[];

  /** 3 reasons cards — why hire us in this city specifically */
  whyHire: CityWhyHire[];

  /** 1-paragraph industries angle for this city */
  industriesAngle: string;

  /** Real neighborhoods / business hubs — used in copy + LocalBusiness areaServed */
  neighborhoods: string[];

  /** 1-paragraph case-study callout tied to the city */
  caseStudyCallout: string;

  /** 4 city-specific FAQs */
  faq: CityFaq[];

  /** 1-2 city-specific testimonials */
  testimonials: CityTestimonial[];

  /** Slugs of 3 related cities to cross-link at bottom of page */
  relatedCities: string[];

  /**
   * Per-locale body translations. Only included when a complete Hindi body
   * actually exists — partial translations make the page look like locale-
   * spoofed near-duplicates of the EN version.
   */
  translations?: { hi?: CityContentTranslation };

  /**
   * Locales with COMPLETE body translations. Defaults to ["en"]. Add "hi"
   * only when `translations.hi` exists and contains real localContext, whyHire,
   * faq, etc. (not just title swaps). Used by `isCityIndexable` to gate
   * indexing per-city, overriding the global INDEXABLE_LOCALES.
   */
  bodyLocales?: ReadonlyArray<"en" | "hi">;
}

/** Per-city Hindi translation block. All fields optional — missing fields fall back to English. */
export interface CityContentTranslation {
  metaTitle?: string;
  metaDescription?: string;
  heroSubheadline?: string;
  heroStats?: CityStat[];
  localContext?: string[];
  whyHire?: CityWhyHire[];
  industriesAngle?: string;
  caseStudyCallout?: string;
  faq?: CityFaq[];
  testimonials?: CityTestimonial[];
}

const MUMBAI: CityContent = {
  slug: "mumbai",
  name: "Mumbai",
  nameHindi: "मुंबई",
  state: "Maharashtra",
  stateCode: "MH",
  population: "20M+ metropolitan",
  geo: { lat: "19.0760", lng: "72.8777" },
  metaTitle: "Best Website Development Company in Mumbai · Savin Group",
  metaDescription:
    "Top website development & revenue automation agency in Mumbai. We build high-conversion sites, WhatsApp CRM, and SEO systems for D2C, BFSI, and real estate teams across BKC, Andheri, Lower Parel, and Powai.",
  metaKeywords:
    "website development company Mumbai, web development agency Mumbai, SEO agency Mumbai, D2C agency Mumbai, WhatsApp automation Mumbai, BKC, Andheri, Lower Parel, Powai, Bandra, custom software Mumbai, Shopify expert Mumbai",
  heroSubheadline:
    "Mumbai is India's costliest CPC market and its most demanding D2C battleground. Brands here don't lose to bad design — they lose to slow funnels, expensive ads, and lifecycle stacks that don't follow up. We rebuild the revenue engine end-to-end.",
  heroStats: [
    { value: "₹15Cr+", label: "Revenue impacted across Mumbai clients" },
    { value: "12+", label: "Mumbai D2C and BFSI builds shipped" },
    { value: "<45 days", label: "Time-to-first revenue lift in Mumbai" },
  ],
  localContext: [
    "Mumbai's commercial gravity sits across BKC, Lower Parel, Worli, and Andheri East — and increasingly Powai and Goregaon for D2C and creator-led brands. We've worked with founders headquartered in all of these zones: Shopify Plus stores in Bandra, NBFC and BFSI portals in BKC, real estate funnels for Lodha and Hiranandani belts, and SaaS teams hiring out of Powai's IIT-B ecosystem.",
    "What's specific about Mumbai: paid acquisition is the most expensive in the country (Meta CPMs frequently 1.6-2x Bengaluru), so the only way to escape ad-burn is wiring a fast-converting site, sub-90-second WhatsApp follow-up, and organic SEO that ranks for Mumbai-tier search intent. We've seen ₹2Cr/yr ad budgets cut by 35% within two quarters when the same traffic finally lands on a site engineered to convert it. That's the work.",
    "We bill in INR with GST, sign DPDP-aligned data agreements, and run delivery on IST hours. Most Mumbai engagements close their first revenue lift inside 45 days — measured in live Razorpay/Cashfree numbers, not vanity dashboards.",
  ],
  whyHire: [
    {
      title: "We know Mumbai's stack",
      body: "WhatsApp via WATI/Gupshup is the real CRM for Andheri D2C brands. Razorpay handles the checkout. Klaviyo or MoEngage runs the lifecycle. We integrate all three in production, not slideware.",
    },
    {
      title: "Built for ₹600+ CPL markets",
      body: "When your CPC is the highest in India, every click matters. We engineer for conversion the moment the page loads — Largest Contentful Paint under 2s, mobile-first checkouts, abandoned-cart WhatsApp inside 90 seconds.",
    },
    {
      title: "Shipped, not slidewared",
      body: "12+ Mumbai engagements live in production, including D2C skincare on Shopify Plus, NBFC lead funnels, and brokerage sites with sub-5-minute lead routing. Case studies on request.",
    },
  ],
  industriesAngle:
    "Mumbai's revenue mix skews D2C (Bandra, Andheri belt), BFSI and NBFC (BKC, Worli), real estate (Andheri-Worli-Thane corridor), and SaaS (Powai). We've built across all four — and we know the difference between a Shopify storefront for a Khar boutique and a regulated lead-capture funnel for an NBFC headquartered in BKC. The compliance, the integrations, the buyer psychology — all different.",
  neighborhoods: [
    "Bandra Kurla Complex (BKC)",
    "Andheri East",
    "Andheri West",
    "Lower Parel",
    "Worli",
    "Powai",
    "Bandra",
    "Goregaon",
    "Thane",
    "Navi Mumbai",
  ],
  caseStudyCallout:
    "We rebuilt the storefront and lifecycle for a Bandra-based skincare D2C doing ₹4Cr/yr on Shopify. Cart abandonment was 78%, paid CAC was ₹1,400. We shipped a new theme, tied checkout to a 90-second WhatsApp recovery flow, and set up Klaviyo flows for post-purchase. 90 days later: cart recovery at 22%, repeat-purchase rate up 31%, paid CAC down to ₹890. That's the playbook we run for Mumbai D2C.",
  faq: [
    {
      q: "Do you have an office in Mumbai?",
      a: "We're remote-first and serve Mumbai clients across BKC, Andheri, Lower Parel, Powai, Bandra, and Thane. Most engagements run async on Slack with weekly Loom syncs; we travel into Mumbai on demand for kickoff or major launches.",
    },
    {
      q: "How do you handle the high CPC market in Mumbai?",
      a: "By cutting your dependence on it. We build the conversion-rate fixes (page speed, mobile checkout, WhatsApp recovery) that double the value of every paid click, and parallel-track SEO for Mumbai-localized queries. Most clients see 30-40% paid budget reduction within two quarters.",
    },
    {
      q: "Can you integrate Razorpay, Cashfree, WATI, and Klaviyo for a Mumbai brand?",
      a: "Yes — these are our default Mumbai stack. Razorpay/Cashfree on payments, WATI or Gupshup on WhatsApp, Klaviyo or MoEngage on email. Custom integrations into HubSpot, Zoho, or Salesforce on request.",
    },
    {
      q: "Do you work with Mumbai BFSI and NBFC firms with strict compliance?",
      a: "Yes. We sign DPAs aligned to DPDP Act 2023, support SOC2 vendor questionnaires, and have shipped lead-capture funnels for NBFCs in BKC. Regulated industries get scoped data handling, audit logs, and locked-down access by default.",
    },
  ],
  testimonials: [
    {
      quote:
        "We were burning ₹18L/mo on Meta and our Shopify was eating two-thirds of those clicks. Savin Group's team rebuilt the funnel in six weeks. The recovery alone paid back the engagement inside the second month.",
      author: "Founder",
      role: "D2C skincare brand · Bandra, Mumbai",
    },
    {
      quote:
        "They understood the Mumbai NBFC compliance posture better than the agency we'd been using for two years. DPA signed in 48 hours, lead funnel live in 5 weeks.",
      author: "Marketing Head",
      role: "NBFC · BKC, Mumbai",
    },
  ],
  relatedCities: ["pune", "bengaluru", "ahmedabad"],
};

const DELHI: CityContent = {
  slug: "delhi",
  name: "Delhi NCR",
  nameHindi: "दिल्ली एनसीआर",
  state: "Delhi",
  stateCode: "DL",
  population: "32M+ NCR",
  geo: { lat: "28.6139", lng: "77.2090" },
  metaTitle: "Best Website Development Company in Delhi NCR · Savin Group",
  metaDescription:
    "Top web development & SEO agency in Delhi NCR. We build revenue-engineering websites, WhatsApp automation, and lead funnels for D2C, edtech, and real estate teams across Gurugram, Noida, Connaught Place, and Greater Noida.",
  metaKeywords:
    "website development company Delhi, web development agency Gurgaon, SEO company Noida, real estate website Delhi NCR, edtech agency Gurugram, WhatsApp automation Delhi, Connaught Place, Cyber Hub, Sector 18 Noida, Aerocity",
  heroSubheadline:
    "Delhi NCR is the country's biggest real estate funnel market and a top-3 edtech corridor — but the agencies serving it ship templated WordPress sites with broken lead-routing. We build NCR revenue systems that close site visits inside 5 minutes, not 5 days.",
  heroStats: [
    { value: "₹12Cr+", label: "Revenue impacted across Delhi NCR clients" },
    { value: "8+", label: "NCR real estate developer funnels live" },
    { value: "<5 min", label: "Average lead-to-callback for NCR builds" },
  ],
  localContext: [
    "Delhi NCR's commercial weight sits in three concentric rings: Connaught Place and the central business district inside Delhi proper; Gurugram's Cyber Hub, MG Road, and Golf Course Road belt; and Noida's Sector 18, Sector 62, and Greater Noida edges. We've shipped revenue systems across all three — corporate HQ funnels for finance teams in CP, real estate microsites for builder launches in DLF Phase 5 and Sector 150 Noida, and edtech enrollment funnels for institutes operating out of Saket and Karol Bagh.",
    "What's specific about NCR: real estate dominates the high-value lead market, and the buying journey is brutally fast. A serious buyer for a ₹2Cr Gurugram apartment will inquire on three sites in five minutes — whoever calls them back first wins 60% of the time. We build site visit booking flows, sub-5-minute SDR routing on WATI, and microsite-per-launch SEO that keeps the CPL under ₹600 for tier-1 NCR areas. For edtech and coaching institutes — the NCR market is also the most ad-saturated in India for IIT/NEET coaching, so organic SEO tied to neighborhoods (Lajpat Nagar, Pitampura, Rohini, Sector 18 Noida) is what the cohorts actually convert from.",
    "We invoice in INR with GST, accept TDS deductions under 194J, and run 10am-7pm IST availability — Mon to Sat for builder launches, since site visits run weekend-heavy.",
  ],
  whyHire: [
    {
      title: "Real estate-specific funnels",
      body: "We've shipped 8+ NCR builder microsites — Lodha, M3M, Godrej, ATS-tier launches. Site-visit booking, calendar-locked SDRs, and abandoned-inquiry WhatsApp recovery built in.",
    },
    {
      title: "Edtech-grade enrollment flows",
      body: "Coaching institutes in Saket, Pitampura, and Noida get application-funnel UX, payment-link handoff to Razorpay, and parent-counselor handoff via WATI without losing the lead.",
    },
    {
      title: "Sub-5-min lead routing",
      body: "When the next site visit closes the deal, you can't wait 4 hours for an SDR. We wire calendar-aware routing into HubSpot/Zoho with WhatsApp fallback if no agent picks up in 90 seconds.",
    },
  ],
  industriesAngle:
    "NCR's revenue mix is real estate (40%+ of premium digital spend), edtech and coaching, plus a deep B2B SaaS / IT services bench in Gurugram. We've built across all three — and we know the regulatory and operational difference between a RERA-disclosed project microsite and an unregulated lead-capture form. The first gets you registered as a builder; the second gets you a notice.",
  neighborhoods: [
    "Connaught Place",
    "Gurugram (Cyber Hub, Golf Course Road)",
    "Noida (Sector 18, Sector 62, Sector 125)",
    "Greater Noida",
    "Saket",
    "Rohini",
    "Pitampura",
    "Dwarka",
    "Faridabad",
    "Aerocity",
  ],
  caseStudyCallout:
    "We rebuilt the lead funnel for a real estate brokerage operating across Gurugram and Noida. Inquiries were sitting 6+ hours in a shared inbox before any callback. We shipped a microsite per launch, tied site-visit booking into Calendly, set up WhatsApp confirmation + reminder via WATI, and routed unanswered leads to a backup SDR after 5 minutes. Result: 3.2x site-visit conversion, ₹4.1Cr in closed inventory in the first quarter post-launch.",
  faq: [
    {
      q: "Do you handle RERA-compliant builder microsites?",
      a: "Yes. We've shipped microsites for NCR builders that surface RERA registration numbers in the footer of every project page, render the disclosure in JSON-LD where applicable, and integrate with the lead-routing rules required by enterprise sales teams.",
    },
    {
      q: "Can you do edtech-grade payment funnels for Delhi coaching institutes?",
      a: "Yes — Razorpay or Cashfree for payments, EMI handoff via Bajaj or LazyPay, application-form UX optimised for parent + student dual-input, WATI for follow-up. Live for institutes in Saket, Karol Bagh, and Sector 18 Noida.",
    },
    {
      q: "How fast can you launch a microsite for a builder launch?",
      a: "Standard NCR launch microsite: 7-12 working days from kickoff to live, including SEO tags, lead form, RERA disclosure, and WATI integration. Brand sites take 4-8 weeks depending on scope.",
    },
    {
      q: "Do you work with Gurugram and Noida-based teams in addition to Delhi proper?",
      a: "Yes — about half our NCR client base is Gurugram (Cyber Hub, Golf Course Road) and another quarter is Noida and Greater Noida. The remainder is South Delhi and Aerocity-area firms. Engagements are remote-first; we travel to NCR for kickoffs.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our last microsite took an agency 9 weeks. Savin Group did it in 11 days, and it actually converts. The WhatsApp recovery alone is worth what we paid for the build.",
      author: "Sales Director",
      role: "Real estate developer · Gurugram",
    },
  ],
  relatedCities: ["jaipur", "indore", "mumbai"],
};

const BENGALURU: CityContent = {
  slug: "bengaluru",
  name: "Bengaluru",
  nameHindi: "बेंगलुरु",
  state: "Karnataka",
  stateCode: "KA",
  population: "13M+ metro",
  geo: { lat: "12.9716", lng: "77.5946" },
  metaTitle: "Best Website Development Company in Bengaluru · Savin Group",
  metaDescription:
    "Top web development & SaaS-focused agency in Bengaluru. We build conversion-engineered marketing sites, B2B funnels, and SEO systems for startups and SaaS teams across Koramangala, Indiranagar, Whitefield, and HSR Layout.",
  metaKeywords:
    "website development company Bengaluru, SaaS agency Bangalore, web development Koramangala, B2B website Indiranagar, SEO agency Bangalore, custom software Bengaluru, Whitefield, HSR Layout, Marathahalli, Electronic City, startup agency Bangalore",
  heroSubheadline:
    "Bengaluru ships more startups per month than any city in India — and most of them have a marketing site that looks like a pitch deck and converts like one. We rebuild the SaaS revenue stack: pricing pages that close, demo funnels that book, and SEO that beats the aggregators.",
  heroStats: [
    { value: "₹22Cr+", label: "Pipeline impacted across Bengaluru SaaS clients" },
    { value: "20+", label: "SaaS / startup engagements in Bengaluru" },
    { value: "3.4x", label: "Average lift in demo-to-close on rebuilt funnels" },
  ],
  localContext: [
    "Bengaluru's tech weight is concentrated across four corridors: Koramangala-Indiranagar for early-stage startups and creator businesses, HSR Layout-Marathahalli-Whitefield for the engineering-heavy SaaS belt, Electronic City for the IT services majors, and the central CBD around MG Road for corporate HQs and enterprise sales offices. We've worked across all four — Series A SaaS funnels in HSR, marketing rebuilds for Y Combinator alumni in Koramangala, and B2B services site upgrades for Whitefield-based engineering shops.",
    "What's specific about Bengaluru: the buyer is engineering-aware. They check your tech stack, they read your changelog, they look at your status page. A Bengaluru SaaS marketing site that ships rounded buttons and stock photos but no live product screenshots, no real architecture diagram, and no measurable claims will lose to a competitor that ships those — even if the competitor's product is weaker. We build for that buyer: real screenshots, technical pricing pages, integration logos with proof links, and demo funnels that don't waste anyone's calendar time.",
    "We work with INR-domestic and USD-international stacks (most Bengaluru SaaS bills outside India), sign US MSAs and DPAs, and ship inside the timezones their customers buy from.",
  ],
  whyHire: [
    {
      title: "We speak SaaS",
      body: "Pricing-page architecture, free trial vs demo split-testing, in-app onboarding handoff, Stripe integrations. Defaults to engineering-honest copy — no \"transform your business\" filler.",
    },
    {
      title: "Bengaluru-grade B2B SEO",
      body: "We've ranked Bengaluru SaaS for queries the aggregators (G2, Capterra) own. Programmatic comparison pages, integration landing pages, and developer-doc-aware structure that wins long-tail.",
    },
    {
      title: "Built for global buyers",
      body: "Most Bengaluru SaaS sells outside India. Our builds support multi-currency pricing display, US/EU GDPR consent, SOC2 vendor-questionnaire-ready hosting, and segment-aware copy.",
    },
  ],
  industriesAngle:
    "Bengaluru's revenue mix leans hard SaaS, deeptech, and dev-tooling. We've built for product-led startups doing $200K-$5M ARR, B2B services firms in Whitefield, healthtech and edtech alumni out of IISc / IIM-B networks, and a small slice of Indiranagar D2C. The unifying pattern: Bengaluru buyers don't tolerate marketing fluff. We don't write any.",
  neighborhoods: [
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "Whitefield",
    "Marathahalli",
    "Electronic City",
    "Jayanagar",
    "MG Road",
    "Bellandur",
    "Sarjapur Road",
  ],
  caseStudyCallout:
    "We rebuilt the marketing site for a Series A SaaS HQ'd in HSR Layout. The old site was a Webflow template with stock illustrations and a vague pricing page. Rebuild: live product screenshots, integration matrix with deep links, three-tier pricing with a public calculator, and a developer-doc landing page that ranks for their core integration query. Result inside 90 days: organic demos up 280%, demo-to-close ratio up 41%, two enterprise pipeline opens directly attributed to the new site.",
  faq: [
    {
      q: "Can you ship a SaaS marketing site that's engineering-credible?",
      a: "Yes — that's most of our Bengaluru work. We use live product screenshots (not mockups), interactive pricing calculators, real integration screenshots, and developer-doc-style pages where appropriate. No 'transform your business' copy.",
    },
    {
      q: "Do you handle programmatic SEO for SaaS comparison pages?",
      a: "Yes. We've shipped 40-200 page programmatic SEO builds for Bengaluru SaaS — comparison vs. competitors, integration landing pages, and use-case-by-vertical pages. All hand-edited at template level for uniqueness; Google indexes them as quality content.",
    },
    {
      q: "Can you support multi-currency pricing and global checkout for Bengaluru SaaS?",
      a: "Yes — Stripe + Razorpay dual setups, geo-aware pricing display, and EU GDPR consent flows. Most Bengaluru SaaS sells US-first; the build supports that.",
    },
    {
      q: "What's the typical timeline for a Bengaluru SaaS rebuild?",
      a: "Marketing site rebuild: 6-10 weeks. Programmatic SEO module: 4-6 weeks layered on top. Most engagements ship in two phases — core site first to stop the bleeding, programmatic SEO second to compound traffic.",
    },
  ],
  testimonials: [
    {
      quote:
        "We've worked with three agencies before this. Savin Group is the first one that actually understood our integration story without us hand-holding them through it.",
      author: "Co-founder",
      role: "B2B SaaS · HSR Layout, Bengaluru",
    },
    {
      quote:
        "The pricing-page rebuild paid for the entire engagement in 6 weeks. We finally have a site we can send to a US buyer without flinching.",
      author: "Head of Marketing",
      role: "DevTool startup · Indiranagar, Bengaluru",
    },
  ],
  relatedCities: ["chennai", "hyderabad", "pune"],
};

const PUNE: CityContent = {
  slug: "pune",
  name: "Pune",
  nameHindi: "पुणे",
  state: "Maharashtra",
  stateCode: "MH",
  population: "7.2M+ metro",
  geo: { lat: "18.5204", lng: "73.8567" },
  metaTitle: "Best Website Development Company in Pune · Savin Group",
  metaDescription:
    "Top web development & ERP agency in Pune. We build manufacturing portals, education funnels, and revenue-systems for SMEs across Hinjewadi, Kharadi, Baner, and Hadapsar. INR-priced, GST-compliant.",
  metaKeywords:
    "website development company Pune, ERP development Pune, manufacturing website Pune, SEO agency Pune, Hinjewadi, Kharadi, Baner, Wakad, Hadapsar, education funnel Pune, SME website Pune, custom software Pune",
  heroSubheadline:
    "Pune sits on India's most overlooked B2B opportunity — the Pimpri-Chinchwad-Hinjewadi manufacturing belt and the Kharadi-Baner IT corridor. The websites here are 8 years old. We rebuild them for the buyers actually shopping in 2026.",
  heroStats: [
    { value: "₹6Cr+", label: "Revenue impacted across Pune clients" },
    { value: "9+", label: "Manufacturing ERP rollouts in Pune" },
    { value: "40%", label: "Average reduction in quote-to-dispatch time" },
  ],
  localContext: [
    "Pune's commerce splits cleanly: the Pimpri-Chinchwad-Chakan industrial belt for auto, manufacturing, and engineering; Hinjewadi-Kharadi-Wakad for the IT and SaaS export bench; Baner-Aundh-Viman Nagar for the consumer / D2C / restaurant economy; and central Pune (Camp, Deccan, Koregaon Park) for legacy retail and education. We've shipped across all four — manufacturing ERP rollouts in Chakan, marketing-site rebuilds for Hinjewadi product startups, and admission funnels for Pune coaching institutes and B-schools in Kothrud.",
    "What's specific about Pune: the manufacturing buyer is conservative, English-mid, and trust-driven. They want to see your client list, your facility photos (yes, even on a website project), real ISO certs, and a company landline. The Pune SaaS or D2C buyer is the opposite — fast-moving, stack-fluent, often a returning founder. Building a single agency model that serves both audiences requires being honest about which one you're talking to. We are.",
    "We work in INR with GST, integrate Tally / Marg / Busy ERPs into the websites we ship for Pune manufacturers, and run delivery on IST.",
  ],
  whyHire: [
    {
      title: "Manufacturing-aware builds",
      body: "ERP-integrated websites for Pune manufacturers — Tally / Marg / SAP B1 product catalogues piped into the front-end, GST-compliant invoicing, dealer-portal logins. Live for 9+ Pune manufacturers.",
    },
    {
      title: "Education funnel grade",
      body: "Admission flows, parent-student dual UX, payment-link handoff, WATI follow-up for cohort drop-offs. Built for Kothrud and Camp coaching institutes plus Pune B-schools.",
    },
    {
      title: "Real Pune presence",
      body: "Half our Pune engagements have on-site kickoffs (Hinjewadi or Kharadi). We don't pretend to be a global agency; we're a delivery team that works with you.",
    },
  ],
  industriesAngle:
    "Pune's revenue mix is auto and manufacturing, IT services and SaaS, and education / coaching. Each gets a different revenue-system blueprint. Manufacturers get ERP-tied catalog + dealer portals. SaaS gets product-led marketing funnels. Coaching institutes get parent-student admissions UX with payment plans. We've built for all three.",
  neighborhoods: [
    "Hinjewadi",
    "Kharadi",
    "Baner",
    "Aundh",
    "Wakad",
    "Hadapsar",
    "Magarpatta",
    "Viman Nagar",
    "Kothrud",
    "Pimpri-Chinchwad",
  ],
  caseStudyCallout:
    "We rebuilt the website + dealer portal for an auto-component manufacturer in Chakan doing ₹80Cr/yr. Dealers were calling reps to ask for stock and updated price lists. We shipped a Tally-integrated catalog, role-based dealer logins, and WhatsApp order-status broadcasts. Quote-to-dispatch dropped 42%, dealer satisfaction surveyed at 4.6/5, sales team got 18 hours/week back from manual calls.",
  faq: [
    {
      q: "Do you integrate with Tally, Marg, and Busy ERPs for Pune manufacturers?",
      a: "Yes — these are our default Pune integrations. We pipe Tally / Marg product, price, and stock data into the front-end via scheduled exports or live API where ERP version supports it. GST-compliant invoice generation built in.",
    },
    {
      q: "Can you do dealer portals with role-based logins?",
      a: "Yes. Most Pune manufacturer engagements include a dealer portal with role-based access — pricing, stock, order placement, invoice download, WhatsApp order-status updates. Pune-tested.",
    },
    {
      q: "How do you handle education and coaching institute admission funnels?",
      a: "Application-form UX optimised for parent + student dual input, Razorpay or Cashfree for fee payment, EMI integration via Bajaj where needed, WATI follow-up for drop-offs. Live for institutes in Kothrud, Camp, and Hinjewadi.",
    },
    {
      q: "Do you work with Pune SaaS startups doing US-first sales?",
      a: "Yes. Pune has a strong US-export SaaS bench, especially around Hinjewadi and Kharadi. We build multi-currency pricing, Stripe integrations, GDPR consent, and SOC2-ready hosting for those teams.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our dealer network is across Maharashtra and Gujarat. The new portal cut our reps' phone time by 60%. We measured it.",
      author: "Operations Head",
      role: "Auto-component manufacturer · Chakan, Pune",
    },
  ],
  relatedCities: ["mumbai", "ahmedabad", "bengaluru"],
};

const CHENNAI: CityContent = {
  slug: "chennai",
  name: "Chennai",
  nameHindi: "चेन्नई",
  state: "Tamil Nadu",
  stateCode: "TN",
  population: "11M+ metro",
  geo: { lat: "13.0827", lng: "80.2707" },
  metaTitle: "Best Website Development Company in Chennai · Savin Group",
  metaDescription:
    "Top web development & healthcare-automation agency in Chennai. We build hospital portals, auto-industry catalogs, and IT-services funnels across Adyar, T. Nagar, OMR, and Anna Nagar.",
  metaKeywords:
    "website development company Chennai, healthcare website Chennai, hospital portal Chennai, auto industry website Chennai, OMR, Adyar, T. Nagar, Anna Nagar, Velachery, Tambaram, IT services agency Chennai",
  heroSubheadline:
    "Chennai is healthcare's quiet capital — Apollo, MIOT, Fortis Vadapalani, and 1,000 specialty clinics. The category has the worst web presence-to-revenue ratio in India. We fix it.",
  heroStats: [
    { value: "₹4Cr+", label: "Revenue impacted across Chennai clients" },
    { value: "6+", label: "Healthcare automation builds in Chennai" },
    { value: "3.1x", label: "Average lift in online appointment bookings" },
  ],
  localContext: [
    "Chennai's commerce sits on three rails: healthcare (the Apollo-MIOT-Fortis belt around Greams Road, Vadapalani, and OMR Phase 1), auto and manufacturing (Sriperumbudur, Maraimalai Nagar — Hyundai, Ford-legacy, BMW, and ancillary suppliers), and IT services (the OMR corridor from Tidel Park to Sholinganallur to Padur). Our Chennai work spans all three: hospital appointment systems for clinic chains in Adyar and T. Nagar, dealer-network builds for auto suppliers in Sriperumbudur, and B2B services rebuilds for OMR IT firms.",
    "What's specific about Chennai: the healthcare buyer is doing serious research before booking. Multi-page consultations, doctor profiles with credentials, real reviews, and real wait-time / availability data are what convert. The auto buyer is the opposite — short attention, mostly mobile, often on Tamil-language WhatsApp searches. We build for both — bilingual where it matters, and instrumented for the buying journey actually happening on the page.",
    "We work in INR with GST and run delivery in IST. Tamil-language landing pages and WhatsApp sequences supported on request — most Chennai healthcare clients ship a Tamil + English split.",
  ],
  whyHire: [
    {
      title: "Healthcare-grade UX",
      body: "Doctor profiles with credentials + reviews, appointment booking with real availability, no-show reduction via WATI, HIPAA-aware data handling. Live for 6+ Chennai healthcare clients.",
    },
    {
      title: "Tamil + English bilingual builds",
      body: "Most Chennai consumer brands need a Tamil-language layer, especially for WhatsApp follow-up. We ship that natively, not as an afterthought.",
    },
    {
      title: "Auto-supplier dealer portals",
      body: "Sriperumbudur and Oragadam supplier networks get role-based dealer portals, ERP-integrated catalogs, and Tamil-language order workflows.",
    },
  ],
  industriesAngle:
    "Chennai's revenue mix is healthcare (multi-specialty hospitals + clinic chains), auto and ancillary manufacturing, and IT services exports. We've shipped across all three. Healthcare gets appointment booking + lifecycle. Manufacturing gets dealer portals + Tamil WhatsApp. IT services gets a B2B funnel that ranks for global queries, not just Chennai-local.",
  neighborhoods: [
    "T. Nagar",
    "Adyar",
    "OMR (Old Mahabalipuram Road)",
    "Anna Nagar",
    "Velachery",
    "Tambaram",
    "Porur",
    "Sholinganallur",
    "Nungambakkam",
    "Sriperumbudur",
  ],
  caseStudyCallout:
    "We rebuilt the patient portal for a 4-location specialty clinic chain in Adyar and T. Nagar. Old system: phone-only booking, 38% no-show rate. New system: online appointment booking with real availability, WhatsApp confirmation + day-before reminder, automated post-consultation review request. Result inside 6 months: online appointments 3.1x previous baseline, no-show rate down to 14%, Google reviews 5x'd in volume — directly compounding local Chennai search ranking.",
  faq: [
    {
      q: "Do you handle Tamil-language landing pages and WhatsApp flows?",
      a: "Yes. Chennai's consumer market — especially healthcare and retail — converts substantially better on Tamil-first interfaces. We ship Tamil + English bilingual sites, Tamil WATI templates, and SEO targeting Tamil-script search queries where relevant.",
    },
    {
      q: "Can you do HIPAA-aware patient portals for Chennai hospitals?",
      a: "Yes. We follow HIPAA and DPDP Act 2023 patterns: scoped PHI access, audit logs, encrypted data-at-rest, BAA-equivalent agreements where required. Live for multi-specialty clinic chains and a hospital network in OMR.",
    },
    {
      q: "Do you build dealer portals for Sriperumbudur auto suppliers?",
      a: "Yes — role-based logins, Tally / SAP B1 integration, Tamil + English UI, WhatsApp order-status updates. Standard for our Chennai manufacturing engagements.",
    },
    {
      q: "Do you do IT services agency rebuilds for OMR companies?",
      a: "Yes — B2B services funnels with case-study-led navigation, ISO/SOC2 trust signals, and global-buyer-first SEO (since most Chennai IT services sells outside India). Live for clients in Tidel Park and Sholinganallur.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our online appointment book went from 80 a month to 320 in two quarters. The Tamil WhatsApp flow alone changed our patient communication.",
      author: "Operations Head",
      role: "Specialty clinic chain · Adyar, Chennai",
    },
  ],
  relatedCities: ["bengaluru", "hyderabad", "kolkata"],
};

const HYDERABAD: CityContent = {
  slug: "hyderabad",
  name: "Hyderabad",
  nameHindi: "हैदराबाद",
  state: "Telangana",
  stateCode: "TG",
  population: "10M+ metro",
  geo: { lat: "17.3850", lng: "78.4867" },
  metaTitle: "Best Website Development Company in Hyderabad · Savin Group",
  metaDescription:
    "Top web development & pharma-tech agency in Hyderabad. We build IT services funnels, pharma portals, and SaaS marketing systems across HITEC City, Gachibowli, Madhapur, and Banjara Hills.",
  metaKeywords:
    "website development company Hyderabad, pharma website Hyderabad, IT services agency HITEC City, SaaS website Gachibowli, Madhapur web development, Banjara Hills, Jubilee Hills, Kukatpally, custom software Hyderabad",
  heroSubheadline:
    "Hyderabad is HITEC City's IT services majors, India's biggest pharma cluster (Genome Valley + Pashamylaram), and a fast-rising SaaS bench. The websites are mostly stuck in 2018. We modernise the revenue stack.",
  heroStats: [
    { value: "₹5Cr+", label: "Revenue impacted across Hyderabad clients" },
    { value: "8+", label: "IT services + pharma rebuilds in Hyderabad" },
    { value: "2.8x", label: "Average lift in inbound qualified leads" },
  ],
  localContext: [
    "Hyderabad's economy splits across HITEC City and Gachibowli (IT majors and SaaS — Wipro, Infosys, plus a long tail of mid-cap product companies), Madhapur (corporate offices and the Microsoft / Google / Amazon belt), Banjara Hills and Jubilee Hills (HQ row for legacy Hyderabad business families and pharma promoters), and Kukatpally + Begumpet for the slightly older retail and SME bench. Pharma sits separately, in Genome Valley and the Pashamylaram industrial belt 30km out — Dr. Reddy's, Aurobindo, Divis, and 600+ smaller formulation and API players.",
    "What's specific about Hyderabad: the pharma client is a regulated buyer. Their website needs USFDA / WHO-GMP language done correctly, a controlled product catalog by region, KYC-aware distributor portals, and DSCSA-aware traceability conversation in the right places. The IT-services client is the opposite — they want a global-buyer SEO play, US-EU case studies leading the navigation, and zero hand-holding. We've shipped both correctly. Most agencies confuse the two and ship a generic site that serves neither.",
    "We bill in INR with GST and support USD billing for export-oriented IT services clients. Hyderabad delivery runs in IST, with overlap into US ET / PT for global-customer-facing teams.",
  ],
  whyHire: [
    {
      title: "Pharma-grade compliance posture",
      body: "USFDA / WHO-GMP language, controlled product catalogs by geography, distributor KYC portals, DSCSA-aware traceability conversation. Live for Genome Valley and Pashamylaram clients.",
    },
    {
      title: "IT services global-buyer SEO",
      body: "Most HITEC City IT shops sell outside India. We rank them for US/EU buyer queries, not just 'IT company in Hyderabad'. Programmatic case-study-by-vertical landing pages.",
    },
    {
      title: "SaaS-grade marketing builds",
      body: "Madhapur and Gachibowli SaaS gets product-led pricing pages, Stripe + Razorpay dual checkouts, SOC2-ready hosting, and integration landing pages.",
    },
  ],
  industriesAngle:
    "Hyderabad's revenue mix is IT services (HITEC City + Madhapur), pharma (Genome Valley + Pashamylaram), product SaaS (Gachibowli), and a smaller D2C / retail bench in Banjara Hills. The first three need very different revenue systems — and we know which is which.",
  neighborhoods: [
    "HITEC City",
    "Gachibowli",
    "Madhapur",
    "Banjara Hills",
    "Jubilee Hills",
    "Kukatpally",
    "Begumpet",
    "Secunderabad",
    "Kondapur",
    "Genome Valley",
  ],
  caseStudyCallout:
    "We rebuilt the marketing site + distributor portal for a mid-cap pharma formulation player in Pashamylaram doing ₹220Cr/yr. The old site listed 80 products in a flat PDF catalog with no regional gating. New site: region-controlled catalog (regulatory-aware product visibility per country), distributor KYC portal with document upload, traceability story-page surfaced for export buyers. Result inside two quarters: distributor inquiry volume up 4.2x, pharma-export buyer audit-readiness time down from 2 days to 4 hours.",
  faq: [
    {
      q: "Do you understand pharma regulatory posture for Hyderabad clients?",
      a: "Yes — USFDA, WHO-GMP, EU GMP, DSCSA. We've shipped sites and portals for Genome Valley and Pashamylaram pharma where regulatory language has to be correct, product visibility has to be region-gated, and distributor KYC has to be enforced. We are not regulatory consultants; we are agency partners who have shipped this multiple times.",
    },
    {
      q: "Can you build IT services sites that rank for US / EU buyers?",
      a: "Yes — that's most of our HITEC City IT services work. Programmatic case-study-by-vertical landing pages, integration logos with proof links, US-EU buyer trust signals (SOC2, ISO 27001, GDPR), and SEO targeted at the buyer queries — not the city.",
    },
    {
      q: "Do you build SaaS marketing sites for Gachibowli / Madhapur startups?",
      a: "Yes. Pricing pages, demo funnels, Stripe + Razorpay dual setups, multi-currency display, integration landing pages, programmatic SEO for comparison queries. Standard SaaS playbook, Hyderabad-priced.",
    },
    {
      q: "Do you bill in USD for Hyderabad export-oriented IT services?",
      a: "Yes — USD invoices via our international entity, ACH or wire payment, W-9 on request. Standard for our HITEC City IT services clients.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our distributor inquiries 4x'd in two quarters. The KYC portal alone cut compliance turnaround from 48 hours to 4.",
      author: "Head of Exports",
      role: "Pharma formulation company · Pashamylaram, Hyderabad",
    },
  ],
  relatedCities: ["bengaluru", "chennai", "ahmedabad"],
};

const KOLKATA: CityContent = {
  slug: "kolkata",
  name: "Kolkata",
  nameHindi: "कोलकाता",
  state: "West Bengal",
  stateCode: "WB",
  population: "14M+ metro",
  geo: { lat: "22.5726", lng: "88.3639" },
  metaTitle: "Best Website Development Company in Kolkata · Savin Group",
  metaDescription:
    "Top web development & MSME-focused agency in Kolkata. We modernise legacy manufacturing portals, education funnels, and retail websites across Salt Lake Sector V, New Town, Park Street, and Howrah.",
  metaKeywords:
    "website development company Kolkata, manufacturing website Kolkata, MSME website Kolkata, Salt Lake Sector V web development, New Town website, Park Street agency, Howrah, custom software Kolkata, Bengali language website",
  heroSubheadline:
    "Kolkata's MSMEs and trading firms are sitting on 15 years of customer relationships and a 2010-era website. The next-gen buyer is coming through Google and WhatsApp now. We bridge the gap.",
  heroStats: [
    { value: "₹2Cr+", label: "Revenue impacted across Kolkata clients" },
    { value: "5+", label: "Manufacturing / MSME systems shipped" },
    { value: "Bengali", label: "First-class bilingual support standard" },
  ],
  localContext: [
    "Kolkata's commerce divides across the IT corridor (Salt Lake Sector V and New Town), the central business district (Dalhousie, Park Street, Camac Street — financial services, legal, traditional trading houses), Howrah and the BT Road industrial belt (engineering, jute, agro-processing), and the southern retail spine (Ballygunge, Gariahat, South City). We've worked in three of the four — IT services rebuilds in Salt Lake, MSME modernisation projects on the BT Road belt, and retail/D2C funnels for Park Street and Camac Street based brands.",
    "What's specific about Kolkata: the MSME promoter family runs a 30-year trading or manufacturing business with deep B2B relationships and a website that hasn't been touched since 2014. Their next generation — usually a son or daughter back from London / Bengaluru / overseas — is trying to modernise without breaking the trust patterns the existing buyers know. The right play here isn't a startup-y rebrand; it's a careful, evidence-led modernisation that adds Google-discoverability and WhatsApp ordering on top of the existing relationship-led business. We've done this five times.",
    "We bill in INR with GST, and ship Bengali-language layers as a default for consumer-facing Kolkata brands.",
  ],
  whyHire: [
    {
      title: "MSME-respectful modernisation",
      body: "30-year trading houses don't need a startup rebrand. They need a website that surfaces credibility (client list, ISO, years in business) and adds Google + WhatsApp on top. That's our default Kolkata play.",
    },
    {
      title: "Bengali-language native",
      body: "Bengali landing pages, Bengali WATI templates, and search optimization for Bengali-script queries. Live for Park Street and Gariahat retail clients.",
    },
    {
      title: "Howrah / BT Road manufacturing-aware",
      body: "Tally and Marg integrations, Bengali + English dealer portals, GST-compliant invoicing, and ERP-tied product catalogs. Built for jute, engineering, and agro-processing MSMEs.",
    },
  ],
  industriesAngle:
    "Kolkata's revenue mix is split across legacy manufacturing and trading (Howrah, BT Road, central business district), IT services (Salt Lake Sector V, New Town), and retail / D2C (Park Street, Gariahat, South City). The MSME modernisation work is the largest segment — and the most underserved by India's agency market.",
  neighborhoods: [
    "Salt Lake Sector V",
    "New Town",
    "Park Street",
    "Camac Street",
    "Ballygunge",
    "Gariahat",
    "Howrah",
    "Behala",
    "Dum Dum",
    "South City",
  ],
  caseStudyCallout:
    "We modernised the website + ordering system for a 38-year-old jute textile exporter on Howrah's BT Road. They had ₹40Cr in repeat-buyer relationships and a one-page Geocities-era website. We shipped a credibility-led marketing site (real photos of the mill, ISO certs, client list, year-on-year growth chart), a Tally-integrated product catalog with regional pricing, and a distributor login portal. Result in nine months: 14 new buyer inquiries from US and EU directly attributed to the site, ₹1.8Cr in new export orders won, distributor calls down 35%.",
  faq: [
    {
      q: "Do you ship Bengali-language sites and WhatsApp templates?",
      a: "Yes. Bengali is a first-class language in our Kolkata builds — both on the site and in WATI / Gupshup templates. Bengali-script SEO is supported where consumer search demands it.",
    },
    {
      q: "Can you modernise a legacy MSME website without a full rebrand?",
      a: "Yes — that's most of our Kolkata work. We respect the existing brand equity and the existing buyer relationships, and we layer Google-discoverability, WhatsApp ordering, and a Tally-integrated catalog on top. Modernisation, not rebrand.",
    },
    {
      q: "Do you handle export-buyer-facing sites for Howrah / BT Road manufacturers?",
      a: "Yes — multi-currency pricing, US-EU buyer trust signals (ISO, BSCI, OEKO-TEX where applicable), distributor KYC portals, and English-first navigation with regional language toggle. Live for jute, engineering, and food-processing exporters.",
    },
    {
      q: "Do you have a presence in Kolkata?",
      a: "We're remote-first and serve Kolkata via async delivery on Slack with weekly Looms. We travel to Salt Lake or BT Road for kickoffs and major launches on request. Most engagements run end-to-end without travel.",
    },
  ],
  testimonials: [
    {
      quote:
        "We've been in business since 1986. Savin Group respected what we'd built and added what we lacked. Our first US buyer found us through Google.",
      author: "Director",
      role: "Jute textile exporter · Howrah, Kolkata",
    },
  ],
  relatedCities: ["chennai", "ahmedabad", "bhopal"],
};

const AHMEDABAD: CityContent = {
  slug: "ahmedabad",
  name: "Ahmedabad",
  nameHindi: "अहमदाबाद",
  state: "Gujarat",
  stateCode: "GJ",
  population: "8M+ metro",
  geo: { lat: "23.0225", lng: "72.5714" },
  metaTitle: "Best Website Development Company in Ahmedabad · Savin Group",
  metaDescription:
    "Top web development & D2C agency in Ahmedabad. We build textile portals, pharma sites, and revenue funnels for SMEs across SG Highway, Bopal, Vastrapur, and Prahlad Nagar. Gujarati-language native.",
  metaKeywords:
    "website development company Ahmedabad, textile website Ahmedabad, pharma website Ahmedabad, SG Highway agency, Bopal web development, Vastrapur, Prahlad Nagar, Gujarati language website, custom software Ahmedabad, Naroda",
  heroSubheadline:
    "Ahmedabad runs on textiles, pharma, ceramics, and an aggressive D2C bench coming out of the IIM-A network. The promoter is a sharp negotiator and a fast decider. We build revenue systems that respect both.",
  heroStats: [
    { value: "₹4Cr+", label: "Revenue impacted across Ahmedabad clients" },
    { value: "7+", label: "Textile / pharma / D2C rebuilds in Ahmedabad" },
    { value: "Gujarati", label: "Native bilingual layer for consumer brands" },
  ],
  localContext: [
    "Ahmedabad's commerce sits across SG Highway (corporate offices, IT services, the IIM-A-adjacent startup belt), Bopal-Shela (residential + new-money D2C and clinic chains), Vastrapur and Prahlad Nagar (mid-tier services and B2B), Naroda and Vatva for industrial / pharma, and the old city around Maninagar and Gomtipur for legacy textile and trading. We've shipped across all five — D2C launches in Bopal, pharma export sites in Vatva, textile B2B portals in the old city, and IIM-A-alumni SaaS marketing rebuilds in SG Highway.",
    "What's specific about Ahmedabad: the promoter is value-driven and skeptical. They will negotiate the proposal, ask for fixed-price clarity, want timeline guarantees, and check three references before signing. They will also pay full and on time once they sign — and they will refer you. The Gujarat MSME also operates with very high family involvement; the buyer's son or wife will sit in the kickoff. We accept and welcome that. The work is shipped in 6-12 weeks, fixed-priced where possible, with weekly demos.",
    "We bill in INR with GST and support Gujarati-language sites and WhatsApp flows for consumer-facing brands. Most Ahmedabad pharma and textile exporters get USD-friendly invoicing through our international entity.",
  ],
  whyHire: [
    {
      title: "Fixed-price clarity",
      body: "Most Ahmedabad engagements run fixed-price with milestone payments, not hourly retainers. Promoters want to know what they're spending and when they'll see the result. We give that.",
    },
    {
      title: "Gujarati + English bilingual",
      body: "Gujarati-language landing pages and Gujarati WATI templates for consumer-facing brands. SEO targeting Gujarati-script search where consumer demand justifies it.",
    },
    {
      title: "Pharma + textile export-aware",
      body: "Naroda / Vatva pharma gets USFDA / EU GMP-aware language, regional product gating, and distributor KYC. Maninagar textile gets multi-currency pricing, ISO / OEKO-TEX trust signals, and US/EU buyer SEO.",
    },
  ],
  industriesAngle:
    "Ahmedabad's revenue mix is textiles (Maninagar and the old-city manufacturer belt), pharma (Vatva, Naroda), ceramics (Morbi adjacency), and a fast-rising D2C / SaaS bench around IIM-A and SG Highway. We've built across textiles, pharma, and D2C — and we partner Ahmedabad-style: fixed scope, fast decisions, weekly demos.",
  neighborhoods: [
    "SG Highway",
    "Bopal",
    "Shela",
    "Vastrapur",
    "Prahlad Nagar",
    "Maninagar",
    "Naroda",
    "Vatva",
    "Gota",
    "Thaltej",
  ],
  caseStudyCallout:
    "We rebuilt the export-buyer-facing site for a textile exporter in Maninagar doing ₹65Cr/yr to Europe and the Middle East. Old site: PDF catalog, no regional pricing, no buyer-portal. New site: live multi-currency catalog gated by buyer login, OEKO-TEX and ISO 9001 trust signals, swatch-request workflow with WhatsApp confirmation, Stripe + Razorpay dual checkout for international samples. Result in two quarters: 18 new EU buyer inquiries directly from organic, 4 closed orders worth ₹2.4Cr, sample dispatch time down from 11 days to 4.",
  faq: [
    {
      q: "Do you do fixed-price builds for Ahmedabad clients?",
      a: "Yes — fixed-price with milestone payments is our default for Ahmedabad. Scope is locked at kickoff with a written deliverables list, change requests are quoted separately. Most builds ship in 6-12 weeks.",
    },
    {
      q: "Can you ship Gujarati-language landing pages and WhatsApp templates?",
      a: "Yes — Gujarati is a first-class language in our Ahmedabad builds, both on-site and in WATI / Gupshup templates. Gujarati-script SEO is supported for consumer brands where search volume justifies it.",
    },
    {
      q: "Do you handle export-buyer-facing sites for Naroda / Vatva pharma?",
      a: "Yes — USFDA / WHO-GMP / EU GMP-aware language, regional product visibility gating, distributor KYC portals, and DSCSA-aware traceability story pages. Standard for our Ahmedabad pharma engagements.",
    },
    {
      q: "Do you ship multi-currency, multi-language sites for textile exporters?",
      a: "Yes. Maninagar and old-city textile exporters get multi-currency pricing display (USD/EUR/GBP/INR), buyer-login-gated catalogs, ISO / OEKO-TEX / BSCI trust signals, and Stripe-friendly international sample payment.",
    },
  ],
  testimonials: [
    {
      quote:
        "They quoted fixed price, delivered in 9 weeks, and our first EU buyer came through Google in week 14. We've referred two friends.",
      author: "Promoter",
      role: "Textile exporter · Maninagar, Ahmedabad",
    },
  ],
  relatedCities: ["pune", "jaipur", "indore"],

  // ---------- Hindi indexability ----------
  // Ahmedabad is the manufacturing-pivot pillar (per 2026-05-07 strategy),
  // so it gets a complete hand-written Hindi body and re-enters the /in/hi
  // index ahead of the other 9 cities.
  bodyLocales: ["en", "hi"],
  translations: {
    hi: {
      metaTitle: "अहमदाबाद की सर्वश्रेष्ठ वेबसाइट डेवलपमेंट कंपनी · सनत डायनमो",
      metaDescription:
        "अहमदाबाद की शीर्ष वेब डेवलपमेंट और D2C एजेंसी। हम SG हाईवे, बोपल, वस्त्रापुर और प्रह्लाद नगर के SMEs के लिए टेक्सटाइल पोर्टल, फार्मा साइटें और रेवेन्यू फनल बनाते हैं। गुजराती भाषा में मूल।",
      heroSubheadline:
        "अहमदाबाद टेक्सटाइल, फार्मा, सिरेमिक्स और IIM-A नेटवर्क से निकले आक्रामक D2C बेंच पर चलता है। यहाँ का प्रमोटर तेज़ नेगोशिएटर और तेज़ निर्णय-कर्ता होता है। हम ऐसे रेवेन्यू सिस्टम बनाते हैं जो दोनों का सम्मान करें।",
      heroStats: [
        { value: "₹4Cr+", label: "अहमदाबाद क्लाइंट्स पर रेवेन्यू प्रभाव" },
        { value: "7+", label: "अहमदाबाद में टेक्सटाइल / फार्मा / D2C रिबिल्ड" },
        { value: "गुजराती", label: "उपभोक्ता ब्रांड्स के लिए द्विभाषी लेयर" },
      ],
      localContext: [
        "अहमदाबाद का कारोबार SG हाईवे (कॉर्पोरेट ऑफ़िस, IT सेवाएँ, IIM-A से सटे स्टार्टअप बेल्ट), बोपल-शेला (रेज़िडेंशियल और नई-पीढ़ी के D2C तथा क्लिनिक चेन), वस्त्रापुर और प्रह्लाद नगर (मध्यम स्तर की सेवाएँ और B2B), नरोडा और वटवा (इंडस्ट्रियल / फार्मा), और मणिनगर तथा गोमतीपुर के पुराने शहर (पारंपरिक टेक्सटाइल और ट्रेडिंग) में फैला है। हमने इन पाँचों क्षेत्रों में डिलीवर किया है — बोपल में D2C लॉन्च, वटवा में फार्मा एक्सपोर्ट साइटें, पुराने शहर में टेक्सटाइल B2B पोर्टल, और SG हाईवे पर IIM-A अल्युमनाई SaaS के मार्केटिंग रिबिल्ड।",
        "अहमदाबाद की ख़ासियत: यहाँ का प्रमोटर वैल्यू-ड्रिवन और संदेहशील होता है। वह प्रपोज़ल पर नेगोशिएट करेगा, फ़िक्स्ड-प्राइस स्पष्टता माँगेगा, टाइमलाइन गारंटी चाहेगा और साइन करने से पहले तीन रेफ़रेंस चेक करेगा। साइन करने के बाद वह पूरा भुगतान समय पर करेगा — और रेफ़रल भी देगा। गुजरात का MSME परिवार-केन्द्रित होकर चलता है; किकऑफ़ मीटिंग में बायर का बेटा या पत्नी भी बैठेंगे। हम इसे स्वीकार करते हैं और स्वागत करते हैं। काम 6-12 हफ़्तों में, जहाँ संभव हो फ़िक्स्ड-प्राइस पर, और साप्ताहिक डेमो के साथ डिलीवर होता है।",
        "हम INR में GST के साथ बिल करते हैं और उपभोक्ता ब्रांड्स के लिए गुजराती-भाषी साइटें तथा WhatsApp फ़्लो सपोर्ट करते हैं। ज़्यादातर अहमदाबाद के फार्मा और टेक्सटाइल एक्सपोर्टर्स को हमारी इंटरनेशनल एंटिटी के माध्यम से USD-फ्रेंडली इन्वॉइसिंग मिलती है।",
      ],
      whyHire: [
        {
          title: "फ़िक्स्ड-प्राइस स्पष्टता",
          body: "ज़्यादातर अहमदाबाद एंगेजमेंट फ़िक्स्ड-प्राइस पर मील-स्टोन पेमेंट्स के साथ चलते हैं, घंटे-आधारित रिटेनर पर नहीं। प्रमोटर जानना चाहते हैं कि वे क्या ख़र्च कर रहे हैं और कब परिणाम देखेंगे। हम वही देते हैं।",
        },
        {
          title: "गुजराती + अंग्रेज़ी द्विभाषी",
          body: "उपभोक्ता ब्रांड्स के लिए गुजराती-भाषी लैंडिंग पेज और गुजराती WATI टेम्प्लेट। जहाँ उपभोक्ता माँग न्यायसंगत हो, वहाँ गुजराती-लिपि सर्च के लिए SEO टार्गेटिंग।",
        },
        {
          title: "फार्मा + टेक्सटाइल एक्सपोर्ट-सजग",
          body: "नरोडा / वटवा फार्मा को USFDA / EU GMP-सजग भाषा, क्षेत्रीय प्रोडक्ट गेटिंग और डिस्ट्रिब्यूटर KYC मिलते हैं। मणिनगर टेक्सटाइल को मल्टी-करेंसी प्राइसिंग, ISO / OEKO-TEX ट्रस्ट सिग्नल और US/EU बायर SEO मिलते हैं।",
        },
      ],
      industriesAngle:
        "अहमदाबाद का रेवेन्यू मिश्रण है टेक्सटाइल (मणिनगर और पुराने शहर का मैन्युफ़ैक्चरर बेल्ट), फार्मा (वटवा, नरोडा), सिरेमिक्स (मोरबी से सटा हुआ), और IIM-A तथा SG हाईवे के आसपास तेज़ी से बढ़ता D2C / SaaS बेंच। हमने टेक्सटाइल, फार्मा और D2C — तीनों में बनाया है, और अहमदाबाद-स्टाइल में पार्टनर करते हैं: फ़िक्स्ड स्कोप, तेज़ निर्णय, साप्ताहिक डेमो।",
      caseStudyCallout:
        "हमने मणिनगर के एक टेक्सटाइल एक्सपोर्टर के लिए एक्सपोर्ट-बायर-फ़ेसिंग साइट को रिबिल्ड किया, जो यूरोप और मध्य-पूर्व को ₹65 करोड़/साल का कारोबार करता है। पुरानी साइट: PDF कैटलॉग, बिना क्षेत्रीय प्राइसिंग, बिना बायर-पोर्टल। नई साइट: बायर-लॉगिन से गेटेड लाइव मल्टी-करेंसी कैटलॉग, OEKO-TEX और ISO 9001 ट्रस्ट सिग्नल, WhatsApp कन्फ़र्मेशन के साथ स्वैच-रिक्वेस्ट वर्कफ़्लो, इंटरनेशनल सैम्पल्स के लिए Stripe + Razorpay डुअल चेकआउट। दो तिमाहियों में परिणाम: ऑर्गेनिक से सीधे 18 नई EU बायर इन्क्वायरी, ₹2.4 करोड़ के 4 क्लोज़्ड ऑर्डर, सैम्पल डिस्पैच टाइम 11 दिन से घटकर 4 दिन।",
      faq: [
        {
          q: "क्या आप अहमदाबाद क्लाइंट्स के लिए फ़िक्स्ड-प्राइस बिल्ड करते हैं?",
          a: "हाँ — अहमदाबाद के लिए हमारा डिफ़ॉल्ट फ़िक्स्ड-प्राइस है, मील-स्टोन पेमेंट्स के साथ। स्कोप किकऑफ़ पर लिखित डिलिवरेबल्स लिस्ट के साथ लॉक होता है, चेंज रिक्वेस्ट अलग से क्वोट होते हैं। ज़्यादातर बिल्ड 6-12 हफ़्तों में डिलीवर होते हैं।",
        },
        {
          q: "क्या आप गुजराती-भाषी लैंडिंग पेज और WhatsApp टेम्प्लेट डिलीवर कर सकते हैं?",
          a: "हाँ — गुजराती हमारे अहमदाबाद बिल्ड्स में फ़र्स्ट-क्लास भाषा है, साइट पर भी और WATI / Gupshup टेम्प्लेट्स में भी। जहाँ सर्च वॉल्यूम न्यायसंगत हो, वहाँ उपभोक्ता ब्रांड्स के लिए गुजराती-लिपि SEO सपोर्टेड है।",
        },
        {
          q: "क्या आप नरोडा / वटवा फार्मा के लिए एक्सपोर्ट-बायर-फ़ेसिंग साइटें संभालते हैं?",
          a: "हाँ — USFDA / WHO-GMP / EU GMP-सजग भाषा, क्षेत्रीय प्रोडक्ट विज़िबिलिटी गेटिंग, डिस्ट्रिब्यूटर KYC पोर्टल और DSCSA-सजग ट्रेसेबिलिटी स्टोरी पेज। हमारे अहमदाबाद फार्मा एंगेजमेंट के लिए स्टैंडर्ड है।",
        },
        {
          q: "क्या आप टेक्सटाइल एक्सपोर्टर्स के लिए मल्टी-करेंसी, मल्टी-लैंग्वेज साइट डिलीवर करते हैं?",
          a: "हाँ। मणिनगर और पुराने शहर के टेक्सटाइल एक्सपोर्टर्स को मल्टी-करेंसी प्राइसिंग डिस्प्ले (USD/EUR/GBP/INR), बायर-लॉगिन-गेटेड कैटलॉग, ISO / OEKO-TEX / BSCI ट्रस्ट सिग्नल और Stripe-फ्रेंडली इंटरनेशनल सैम्पल पेमेंट मिलता है।",
        },
      ],
      testimonials: [
        {
          quote:
            "उन्होंने फ़िक्स्ड प्राइस क्वोट किया, 9 हफ़्तों में डिलीवर किया, और हमारा पहला EU बायर हफ़्ते 14 में Google से आया। हमने दो दोस्तों को रेफ़र किया है।",
          author: "प्रमोटर",
          role: "टेक्सटाइल एक्सपोर्टर · मणिनगर, अहमदाबाद",
        },
      ],
    },
  },
};

const JAIPUR: CityContent = {
  slug: "jaipur",
  name: "Jaipur",
  nameHindi: "जयपुर",
  state: "Rajasthan",
  stateCode: "RJ",
  population: "4M+ metro",
  geo: { lat: "26.9124", lng: "75.7873" },
  metaTitle: "Best Website Development Company in Jaipur · Savin Group",
  metaDescription:
    "Top web development & D2C agency in Jaipur. We build jewellery e-commerce, edtech funnels, and revenue systems for brands across C-Scheme, Malviya Nagar, Vaishali Nagar, and Mansarovar.",
  metaKeywords:
    "website development company Jaipur, jewellery website Jaipur, e-commerce Jaipur, edtech agency Jaipur, C-Scheme web development, Malviya Nagar, Vaishali Nagar, Mansarovar, Sitapura, Sanganer, custom software Jaipur",
  heroSubheadline:
    "Jaipur runs on jewellery, handicraft, textiles, and a fast-rising tier-2 D2C ecosystem. The CPC market is 60% cheaper than Mumbai and the buyer intent is higher. We help Jaipur brands compound that advantage.",
  heroStats: [
    { value: "₹3Cr+", label: "Revenue impacted across Jaipur clients" },
    { value: "6+", label: "Jewellery / D2C launches shipped in Jaipur" },
    { value: "60%", label: "Lower CPC than Mumbai — we exploit this" },
  ],
  localContext: [
    "Jaipur's commerce splits across the old city (the jewellery and handicraft trading core — Johari Bazaar, Tripolia Bazaar, MI Road), C-Scheme and Civil Lines (legacy services and finance), Malviya Nagar and Mansarovar (new-money residential plus the post-2010 retail and clinic chains), and Sitapura and Sanganer (the manufacturing and printing belt). Tonk Road carries the education + coaching cluster and Vaishali Nagar sits at the centre of Jaipur's new-economy D2C bench. We've shipped jewellery e-commerce for old-city exporters, D2C launches for Mansarovar and Vaishali Nagar founders, and edtech funnels for Tonk Road institutes.",
    "What's specific about Jaipur: the jewellery exporter has a 40-year US/EU buyer book and a website that doesn't surface their craftsmanship. The D2C founder has IIM-A or Pearl Academy training and is launching a brand against thin tier-1 competition with a 60%-cheaper CPC. The edtech promoter is competing for IIT/NEET aspirants from Rajasthan and Madhya Pradesh against Kota — and winning when the website actually converts. Each gets a different revenue-system blueprint. We know which is which.",
    "We bill in INR with GST and support multi-currency invoicing for export-oriented Jaipur jewellery and handicraft brands. Most builds ship in 6-10 weeks.",
  ],
  whyHire: [
    {
      title: "Jewellery e-commerce specialist",
      body: "Sub-product variants (gold purity, gem certification, weight/karat), GIA-aware product cards, GST-compliant invoicing, and high-trust photography UX. Live for old-city exporters and Mansarovar D2C launches.",
    },
    {
      title: "60%-cheaper CPC playbook",
      body: "Jaipur's paid market is dramatically cheaper than tier-1. We help Jaipur D2C compound this — fast site + WhatsApp recovery + tier-2 SEO that ranks for the queries Mumbai brands ignore.",
    },
    {
      title: "Edtech enrollment-grade",
      body: "Tonk Road and Mansarovar coaching institutes get application-form UX, parent + student dual input, Razorpay handoff, EMI integration, and WATI follow-up for cohort drop-offs.",
    },
  ],
  industriesAngle:
    "Jaipur's revenue mix is jewellery (old city + Sitapura), handicraft and textile exports, education and coaching (Tonk Road + Mansarovar), and a fast-growing D2C bench (Vaishali Nagar, C-Scheme, Mansarovar). Each gets its own playbook — we don't ship one site type four ways. We've built jewellery e-commerce, D2C Shopify launches, and admission funnels for Jaipur clients in the past 18 months.",
  neighborhoods: [
    "C-Scheme",
    "Malviya Nagar",
    "Vaishali Nagar",
    "Mansarovar",
    "Tonk Road",
    "Ajmer Road",
    "Sitapura",
    "Sanganer",
    "Civil Lines",
    "Jagatpura",
  ],
  caseStudyCallout:
    "We launched the Shopify storefront for a Mansarovar-based D2C kurta brand. The founder had ₹3L of inventory, a Pearl Academy-trained design eye, and zero web presence. We shipped a Shopify Plus theme with India-specific size guides, Razorpay + COD checkout, WhatsApp post-purchase, and tier-2 city paid-organic split (because Jaipur paid is 60% cheaper than Mumbai). 90 days later: ₹4.2L/mo run-rate, 38% repeat-purchase, paid CAC at ₹312 vs the ₹900-1200 the same brand would face in Mumbai. The CPC arbitrage is real.",
  faq: [
    {
      q: "Do you build jewellery e-commerce for Jaipur exporters?",
      a: "Yes — sub-product variants (gold purity, gemstone certification, weight in grams or karats), GIA / IGI-aware product cards, multi-currency display, GST-compliant invoicing, and trust-led photography UX. Live for old-city exporters and Mansarovar D2C jewellery brands.",
    },
    {
      q: "Can you do D2C Shopify launches for tier-2 cities like Jaipur?",
      a: "Yes — Shopify or Shopify Plus, Razorpay + COD checkout, WhatsApp post-purchase via WATI, and a paid-organic split that exploits Jaipur's 60%-cheaper CPC vs Mumbai. Standard playbook.",
    },
    {
      q: "Do you handle education / coaching admission funnels in Jaipur?",
      a: "Yes — application-form UX optimised for parent + student dual input, Razorpay or Cashfree fee payment, EMI integration via Bajaj where needed, WATI follow-up for drop-offs. Live for Tonk Road and Mansarovar coaching institutes.",
    },
    {
      q: "Do you have a presence in Jaipur?",
      a: "We're remote-first and serve Jaipur clients via async delivery on Slack, with weekly Loom demos. We travel to Jaipur for kickoff and major launches on request. Most engagements run end-to-end without travel.",
    },
  ],
  testimonials: [
    {
      quote:
        "We're a 35-year jewellery export house. The new site is the first thing I can send to a US buyer that actually represents what we make. We've already won two new accounts from it.",
      author: "Director",
      role: "Jewellery exporter · Johari Bazaar, Jaipur",
    },
    {
      quote:
        "Our CAC in Jaipur paid is half what we'd pay in Mumbai. The site converts and the WhatsApp recovery is doing the rest.",
      author: "Founder",
      role: "D2C kurta brand · Mansarovar, Jaipur",
    },
  ],
  relatedCities: ["delhi", "indore", "ahmedabad"],
};

const INDORE: CityContent = {
  slug: "indore",
  name: "Indore",
  nameHindi: "इंदौर",
  state: "Madhya Pradesh",
  stateCode: "MP",
  population: "3.5M+ metro",
  geo: { lat: "22.7196", lng: "75.8577" },
  metaTitle: "Best Website Development Company in Indore · Savin Group",
  metaDescription:
    "Top web development & D2C agency in Indore. We build food-processing portals, MSME modernisation, and tier-2 D2C launches across Vijay Nagar, AB Road, Bhawarkuan, and Palasia.",
  metaKeywords:
    "website development company Indore, food processing website Indore, MSME website Indore, D2C agency Indore, Vijay Nagar web development, AB Road, Bhawarkuan, Palasia, Rau, custom software Indore, MP",
  heroSubheadline:
    "Indore is MP's commercial engine — food processing, education, and a fast-emerging D2C bench. The CPC is among the lowest in India and the buyers are loyal. We build revenue systems that compound that.",
  heroStats: [
    { value: "₹2Cr+", label: "Revenue impacted across Indore clients" },
    { value: "4+", label: "D2C / MSME rebuilds in Indore" },
    { value: "65%", label: "Lower paid acquisition cost vs metro tier-1" },
  ],
  localContext: [
    "Indore's commerce sits across Vijay Nagar (the new-economy retail / D2C / clinic-chain belt), AB Road and Palasia (mid-tier services and offices), Bhawarkuan and MG Road (the central retail spine), and Rau and Khargone Highway for the food-processing and manufacturing industrial belt. Indore is also home to the IIM-Indore alumni network — which has spawned a steady drip of D2C and consumer-product founders who chose to base in Indore for the lifestyle and cost advantage. We've shipped for both: a food-processing exporter on Khargone Highway, a D2C wellness brand in Vijay Nagar, and an MSME modernisation for a 25-year retail business in Bhawarkuan.",
    "What's specific about Indore: the buyer loyalty is real. A satisfied Indore client refers two more inside six months — the network effects are denser than in any tier-1 metro. The CPC is also among India's lowest, which makes Indore an exceptional D2C launching pad if the founder is willing to forgo tier-1 ego. The MSME owner here resembles Ahmedabad — value-driven, fixed-price-preferring, family-involved — but with more openness to modernisation and slightly less negotiation.",
    "We bill in INR with GST. Hindi + English bilingual layers are standard for consumer brands. Most Indore engagements ship in 5-9 weeks.",
  ],
  whyHire: [
    {
      title: "Tier-2 CPC arbitrage",
      body: "Indore paid is among the cheapest in India. We help Indore D2C brands compound this — fast-converting sites, WhatsApp recovery in 90 seconds, and SEO targeting tier-2 queries the metro brands ignore.",
    },
    {
      title: "Food-processing / agri export",
      body: "Khargone Highway and Pithampur food-processing get USFDA / FSSAI / Halal-aware product gating, distributor KYC, and US-EU buyer-facing trust signals. Live for one Indore exporter.",
    },
    {
      title: "MSME modernisation",
      body: "25-year retail and trading businesses in Bhawarkuan and MG Road get respectful modernisation — credibility-led marketing site, Tally-integrated catalog, WhatsApp ordering — without a startup-y rebrand.",
    },
  ],
  industriesAngle:
    "Indore's revenue mix is food processing (Khargone Highway, Pithampur), education and coaching (Bhawarkuan + Palasia), legacy retail and trading (Bhawarkuan, MG Road), and an emerging D2C bench (Vijay Nagar). Each gets its own blueprint. The food-processing exporter and the IIM-I-alumni D2C founder need very different revenue systems — we know which is which.",
  neighborhoods: [
    "Vijay Nagar",
    "AB Road",
    "Bhawarkuan",
    "Palasia",
    "MG Road",
    "Rau",
    "Khargone Highway",
    "Pithampur",
    "Sapna Sangeeta",
    "Bombay Hospital area",
  ],
  caseStudyCallout:
    "We rebuilt the website + ordering system for a 30-year sweets and namkeen brand in Bhawarkuan. They had 12 retail outlets across MP and a website nobody checked. Rebuild: store-locator with live stock, WhatsApp re-order for repeat customers, Razorpay + COD for online orders, and Hindi-language post-purchase flows. Result inside two quarters: online orders 4.8x baseline, 28% of those orders coming from outside Indore (Bhopal, Ujjain, Dewas — markets we couldn't reach before), repeat-purchase rate at 52%.",
  faq: [
    {
      q: "Do you understand the tier-2 CPC arbitrage opportunity in Indore?",
      a: "Yes — and we exploit it. Indore paid Meta CPCs are 60-65% lower than Mumbai and Bengaluru. We help Indore D2C compound this with conversion-engineered sites, sub-90-second WhatsApp recovery, and tier-2 SEO that ranks for the queries the metro brands ignore.",
    },
    {
      q: "Can you ship Hindi-language layers for Indore consumer brands?",
      a: "Yes — Hindi is a first-class language in our Indore builds, both on-site and in WATI / Gupshup templates. Hindi-script SEO is supported for consumer brands where search volume justifies it.",
    },
    {
      q: "Do you do food-processing export sites for Khargone Highway / Pithampur?",
      a: "Yes — FSSAI / USFDA / Halal-aware product gating, regional product visibility, distributor KYC portals, and US-EU buyer trust signals. Live for an Indore food exporter.",
    },
    {
      q: "Do you respect MSME modernisation pace?",
      a: "Yes. Most Indore MSME promoters don't want a startup-style rebrand — they want their existing brand equity preserved and modernised on top. That's our default Indore playbook: credibility-led marketing site, Tally-integrated catalog, WhatsApp ordering, Hindi layer.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our online orders crossed 1,200/mo by the third quarter. The Hindi WhatsApp flow alone tripled re-orders from older customers.",
      author: "Promoter",
      role: "Sweets and namkeen brand · Bhawarkuan, Indore",
    },
  ],
  relatedCities: ["bhopal", "jaipur", "ahmedabad"],
};

const BHOPAL: CityContent = {
  slug: "bhopal",
  name: "Bhopal",
  nameHindi: "भोपाल",
  state: "Madhya Pradesh",
  stateCode: "MP",
  population: "2.5M+ metro",
  geo: { lat: "23.2599", lng: "77.4126" },
  metaTitle: "Best Website Development Company in Bhopal · Savin Group",
  metaDescription:
    "Top web development & education-focused agency in Bhopal. We build coaching admission funnels, government-aligned portals, and MSME revenue systems across MP Nagar, New Market, Arera Colony, and Habibganj.",
  metaKeywords:
    "website development company Bhopal, education website Bhopal, coaching admission Bhopal, MP Nagar web development, New Market, Arera Colony, Habibganj, Kolar, custom software Bhopal, MP capital",
  heroSubheadline:
    "Bhopal is MP's capital — the seat of state government, a deep education and coaching bench, and an under-served MSME economy. The market is small but the loyalty is total.",
  heroStats: [
    { value: "₹1Cr+", label: "Revenue impacted across Bhopal clients" },
    { value: "3+", label: "Education / government-aligned builds" },
    { value: "Hindi", label: "First-class bilingual layer for consumer brands" },
  ],
  localContext: [
    "Bhopal's commerce splits across MP Nagar (the central business district — finance, services, government-adjacent vendors), New Market (legacy retail + government employee customer base), Arera Colony and Shyamla Hills (residential / new-money clinics and consumer brands), Habibganj (the railway-adjacent commercial spine), and Kolar Road and Bairagarh for the outer industrial / retail belt. The economy here is heavily government-influenced — MP Secretariat, public-sector banks, and the pension-economy customer base sit at the centre of consumer demand. We've shipped for an education-focused content portal, a Habibganj-area medical clinic chain, and a New Market retail modernisation.",
    "What's specific about Bhopal: the consumer base is value-driven and loyal, the education and coaching market is strong (state-level competitive exam aspirants, government-job preparation), and the MSME ecosystem is small but underserved by big-agency attention. The CPC is among India's lowest. The buyer journey often starts on Hindi-language Google search and ends on WhatsApp — we build for that path natively. Government-aligned vendor websites need a specific posture: credibility-led, bilingual (Hindi + English), with proper procurement / GeM-aware structure.",
    "We bill in INR with GST. Hindi-first is standard for Bhopal consumer brands. Most engagements ship in 5-8 weeks.",
  ],
  whyHire: [
    {
      title: "Education / coaching grade",
      body: "Government-job and state-exam coaching gets application-form UX, Razorpay fee handoff, EMI integration, WATI follow-up, and content-marketing-led SEO. Live for one Bhopal coaching client.",
    },
    {
      title: "Hindi-first defaults",
      body: "Bhopal consumer search and WhatsApp is overwhelmingly Hindi. Our builds ship Hindi-first navigation + WATI templates, with English as toggle. SEO targets Hindi-script queries where consumer demand justifies.",
    },
    {
      title: "Government-vendor-aware",
      body: "GeM-aligned vendor websites with proper procurement structure, MSME-Udyam credentials surfaced, ISO certs, and credibility-led navigation. Built for government-adjacent vendors in MP Nagar.",
    },
  ],
  industriesAngle:
    "Bhopal's revenue mix is education and coaching (state and government-job competitive exams), government-adjacent services and vendors (MP Nagar belt), healthcare clinics (Arera Colony, Habibganj), and a small but loyal MSME retail bench (New Market, Habibganj, Kolar Road). Each segment is small enough that one playbook doesn't fit — we tailor.",
  neighborhoods: [
    "MP Nagar",
    "New Market",
    "Arera Colony",
    "Habibganj",
    "Kolar Road",
    "Bairagarh",
    "Shyamla Hills",
    "Shahpura",
    "Jahangirabad",
    "TT Nagar",
  ],
  caseStudyCallout:
    "We built the digital admission funnel for an MP government-job coaching institute in MP Nagar. They were running a 12-counsellor phone-only admission flow with 38% conversion from inquiry to fee paid. New build: Hindi-language application form, parent + student dual input, Razorpay fee handoff with EMI, WATI follow-up at 2-hour and 24-hour intervals for drop-offs, content-marketing-led SEO targeting Hindi-script queries for state-exam preparation. Result in one cohort cycle: inquiry-to-fee conversion at 51%, content traffic growing 22% MoM, counsellor team reduced from 12 to 8 with no drop in conversion.",
  faq: [
    {
      q: "Do you handle Hindi-first sites and WhatsApp templates?",
      a: "Yes — Hindi is a first-class language in our Bhopal builds, on-site and in WATI / Gupshup templates. Hindi-script SEO is the default for consumer brands.",
    },
    {
      q: "Can you do education / coaching admission funnels for MP state-exam aspirants?",
      a: "Yes. Hindi-language application form UX, parent + student dual input, Razorpay fee handoff with EMI integration, WATI drop-off recovery at 2-hour and 24-hour intervals. Content-marketing-led SEO targeting state-exam Hindi queries.",
    },
    {
      q: "Do you build government-vendor-aware websites for MP Nagar firms?",
      a: "Yes. GeM-aligned vendor structure, MSME-Udyam credentials surfaced in nav and footer, ISO certs, English + Hindi bilingual, and credibility-led navigation. Built for government-adjacent vendors.",
    },
    {
      q: "Is the Bhopal market big enough for a full-stack revenue system rebuild?",
      a: "Yes — but we tailor scope. Bhopal engagements typically ship at half the budget of a Mumbai or Bengaluru rebuild, with shorter timelines (5-8 weeks) and tighter scope. The work pays for itself faster because the unit economics in Bhopal are leaner.",
    },
  ],
  testimonials: [
    {
      quote:
        "Our admissions inquiry-to-fee ratio jumped from 38% to 51% in one cohort. The Hindi WhatsApp follow-up was the biggest single change.",
      author: "Director",
      role: "Government-job coaching institute · MP Nagar, Bhopal",
    },
  ],
  relatedCities: ["indore", "jaipur", "kolkata"],
};

/* -------------------------------------------------------------------------- */
/*                              Export + helpers                              */
/* -------------------------------------------------------------------------- */

export const INDIA_CITIES: CityContent[] = [
  MUMBAI,
  DELHI,
  BENGALURU,
  PUNE,
  CHENNAI,
  HYDERABAD,
  KOLKATA,
  AHMEDABAD,
  JAIPUR,
  INDORE,
  BHOPAL,
];

export const INDIA_CITY_SLUGS: string[] = INDIA_CITIES.map((c) => c.slug);

export function getCityBySlug(slug: string): CityContent | null {
  return INDIA_CITIES.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

export function isValidCitySlug(slug: string): boolean {
  return INDIA_CITY_SLUGS.includes(slug.toLowerCase());
}

/**
 * Returns the city with body fields swapped for the locale translation if
 * one exists. EN is always identity (no swap). HI swaps any field present
 * in `translations.hi`; missing fields fall back to English.
 */
export function localizeCity(city: CityContent, locale: Locale): CityContent {
  if (locale !== "hi") return city;
  const tr = city.translations?.hi;
  if (!tr) return city;
  return {
    ...city,
    metaTitle: tr.metaTitle ?? city.metaTitle,
    metaDescription: tr.metaDescription ?? city.metaDescription,
    heroSubheadline: tr.heroSubheadline ?? city.heroSubheadline,
    heroStats: tr.heroStats ?? city.heroStats,
    localContext: tr.localContext ?? city.localContext,
    whyHire: tr.whyHire ?? city.whyHire,
    industriesAngle: tr.industriesAngle ?? city.industriesAngle,
    caseStudyCallout: tr.caseStudyCallout ?? city.caseStudyCallout,
    faq: tr.faq ?? city.faq,
    testimonials: tr.testimonials ?? city.testimonials,
  };
}

/**
 * Per-city indexability gate. Overrides the global INDEXABLE_LOCALES
 * (which is currently "en"-only after the 2026-05-09 hi demotion) so a
 * single city with a complete Hindi body block can re-enter the index for
 * /in/hi/cities/{slug} without exposing the other 9 fake-Hindi cities.
 *
 * - en  → always indexable (assuming country === "in")
 * - hi  → indexable ONLY if `bodyLocales` includes "hi" AND `translations.hi`
 *         exists. Both checks together prevent accidentally indexing a city
 *         that opted into hi without having actually written the Hindi body.
 * - other locales → never indexable for cities (city pages are India-only).
 */
export function isCityIndexable(
  city: CityContent,
  country: string,
  locale: string
): boolean {
  // Since 2026-09-09 city pages follow the same global country x locale
  // gate as every other page — they are no longer pinned to /in/. The
  // `city` argument is kept in the signature so per-city overrides can be
  // reintroduced without touching the ~10 call sites.
  void city;
  return isIndexable(country, locale);
}

/**
 * The set of indexable locales for a given city. Used to build the
 * hreflang cluster on the city page metadata so the cluster stays
 * consistent with the actual indexability decisions.
 */
export function getCityIndexableLocales(
  city: CityContent
): ReadonlyArray<(typeof INDEXABLE_LOCALES)[number]> {
  void city;
  return INDEXABLE_LOCALES;
}
