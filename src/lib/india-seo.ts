/**
 * India-Specific SEO Optimizations for Sanat Dynamo
 *
 * This module provides utilities for maximizing search visibility in India,
 * including:
 * - State-level geo-targeting (18 states + UTs)
 * - Hindi language SEO optimization
 * - City-cluster authority building
 * - Indian search intent patterns (D2C, MSME, manufacturing, edtech)
 * - WhatsApp + SMS discovery signals
 * - Indian mobile-first optimization
 *
 * India's search landscape differs from global SEO:
 * 1. Mobile-first is not optional — 95%+ of organic traffic is mobile
 * 2. Hindi queries are growing 25% YoY; regional languages matter
 * 3. Voice search (Alexa, Google Assistant in Hindi/regional) is high-intent
 * 4. Local business schema matters more than global pages
 * 5. Review volume (Google Reviews) is THE ranking factor for local intent
 * 6. Backlink quality trumps quantity (domestic authority matters most)
 */

import type { Locale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*                      Indian State Geo-Targeting Data                       */
/* -------------------------------------------------------------------------- */

export interface IndianStateData {
  code: string; // ISO 3166-2:IN code (e.g., "DL", "MH", "KA")
  name: string;
  nameHindi: string;
  region: "north" | "south" | "east" | "west" | "northeast";
  majorCities: string[];
  population: string; // e.g., "32M+"
  gdpTier: "tier1" | "tier2" | "tier3";
  keyIndustries: string[]; // [manufacturing, IT, agriculture, etc.]
  searchVolume: "high" | "medium" | "low";
  mobilePercentage: number; // % of traffic that's mobile
}

/**
 * Indian states ordered by search volume and economic activity.
 * Tier-1 states (already targeted): DL, MH, KA
 * Tier-2 states (expanding): TN, TS, AP, GJ, WB, UP, MP, RJ
 * Tier-3 states (secondary): remaining 8+ states
 */
export const INDIAN_STATES: Record<string, IndianStateData> = {
  IN_DL: {
    code: "DL",
    name: "Delhi",
    nameHindi: "दिल्ली",
    region: "north",
    majorCities: ["Delhi", "Noida", "Gurgaon", "Faridabad"],
    population: "32M+ NCR",
    gdpTier: "tier1",
    keyIndustries: ["IT services", "real estate", "edtech", "finance"],
    searchVolume: "high",
    mobilePercentage: 91,
  },
  IN_MH: {
    code: "MH",
    name: "Maharashtra",
    nameHindi: "महाराष्ट्र",
    region: "west",
    majorCities: ["Mumbai", "Pune", "Nagpur", "Aurangabad"],
    population: "126M",
    gdpTier: "tier1",
    keyIndustries: ["finance", "D2C", "manufacturing", "IT"],
    searchVolume: "high",
    mobilePercentage: 92,
  },
  IN_KA: {
    code: "KA",
    name: "Karnataka",
    nameHindi: "कर्नाटक",
    region: "south",
    majorCities: ["Bengaluru", "Mysore", "Mangalore"],
    population: "67M",
    gdpTier: "tier1",
    keyIndustries: ["IT/SaaS", "manufacturing", "agriculture"],
    searchVolume: "high",
    mobilePercentage: 90,
  },
  IN_TN: {
    code: "TN",
    name: "Tamil Nadu",
    nameHindi: "तमिलनाडु",
    region: "south",
    majorCities: ["Chennai", "Coimbatore", "Madurai"],
    population: "72M",
    gdpTier: "tier2",
    keyIndustries: ["automotive", "textiles", "healthcare", "manufacturing"],
    searchVolume: "high",
    mobilePercentage: 89,
  },
  IN_GJ: {
    code: "GJ",
    name: "Gujarat",
    nameHindi: "गुजरात",
    region: "west",
    majorCities: ["Ahmedabad", "Surat", "Vadodara"],
    population: "60M",
    gdpTier: "tier2",
    keyIndustries: ["textiles", "pharma", "petrochemicals", "D2C"],
    searchVolume: "high",
    mobilePercentage: 90,
  },
  IN_AP: {
    code: "AP",
    name: "Andhra Pradesh",
    nameHindi: "आंध्र प्रदेश",
    region: "south",
    majorCities: ["Visakhapatnam", "Vijayawada"],
    population: "49M",
    gdpTier: "tier2",
    keyIndustries: ["IT services", "pharma", "manufacturing"],
    searchVolume: "medium",
    mobilePercentage: 92,
  },
  IN_TS: {
    code: "TS",
    name: "Telangana",
    nameHindi: "तेलंगाना",
    region: "south",
    majorCities: ["Hyderabad"],
    population: "35M",
    gdpTier: "tier2",
    keyIndustries: ["IT/pharma", "HITEC City", "Genome Valley"],
    searchVolume: "high",
    mobilePercentage: 91,
  },
  IN_WB: {
    code: "WB",
    name: "West Bengal",
    nameHindi: "पश्चिम बंगाल",
    region: "east",
    majorCities: ["Kolkata", "Darjeeling"],
    population: "91M",
    gdpTier: "tier2",
    keyIndustries: ["MSME", "manufacturing", "textiles", "trading"],
    searchVolume: "medium",
    mobilePercentage: 88,
  },
  IN_UP: {
    code: "UP",
    name: "Uttar Pradesh",
    nameHindi: "उत्तर प्रदेश",
    region: "north",
    majorCities: ["Lucknow", "Kanpur"],
    population: "199M",
    gdpTier: "tier2",
    keyIndustries: ["agriculture", "textiles", "MSME"],
    searchVolume: "medium",
    mobilePercentage: 93,
  },
};

/* -------------------------------------------------------------------------- */
/*                    India-Specific Search Intent Patterns                   */
/* -------------------------------------------------------------------------- */

export interface IndianSearchIntent {
  category: string;
  keywords: string[];
  intent: "transactional" | "commercial" | "informational" | "navigational";
  searchVolume: "high" | "medium" | "low";
  notes: string;
}

/**
 * Common India-specific search patterns ranked by conversion likelihood.
 * Use these to inform content strategy and landing page optimization.
 */
export const INDIA_SEARCH_INTENTS: IndianSearchIntent[] = [
  {
    category: "D2C + E-commerce",
    keywords: [
      "website for D2C brand",
      "Shopify setup India",
      "e-commerce development",
      "WhatsApp commerce",
    ],
    intent: "commercial",
    searchVolume: "high",
    notes:
      "₹50Cr+ D2C market. Buyers searching for conversion-optimized funnels. Price sensitive.",
  },
  {
    category: "Real Estate",
    keywords: [
      "real estate website",
      "builder microsite",
      "RERA-compliant site",
      "property listing platform",
    ],
    intent: "commercial",
    searchVolume: "high",
    notes:
      "Lead generation is primary. Speed of callback matters. Multi-city campaigns.",
  },
  {
    category: "EdTech + Coaching",
    keywords: [
      "coaching institute website",
      "education platform",
      "IIT/NEET coaching site",
      "online course platform",
    ],
    intent: "commercial",
    searchVolume: "high",
    notes:
      "Enrollment funnels + parent/student dual UX. Tier-2 cities dominate.",
  },
  {
    category: "Manufacturing + B2B",
    keywords: [
      "ERP website",
      "manufacturer portal",
      "distributor network",
      "wholesale marketplace",
    ],
    intent: "commercial",
    searchVolume: "medium",
    notes:
      "GST compliance critical. Dealer portal integration. Tally/Marg integrations.",
  },
  {
    category: "Healthcare + Services",
    keywords: [
      "hospital website",
      "clinic booking system",
      "appointment scheduling",
      "patient portal",
    ],
    intent: "transactional",
    searchVolume: "medium",
    notes:
      "Indian healthcare is SMS/WhatsApp first. No-show reduction via WATI.",
  },
  {
    category: "IT Services + SaaS",
    keywords: [
      "custom software India",
      "SaaS development",
      "IT services agency",
      "software outsourcing",
    ],
    intent: "commercial",
    searchVolume: "medium",
    notes:
      "USD-first pricing. SOC2/ISO signals matter. Bengaluru is center.",
  },
];

/* -------------------------------------------------------------------------- */
/*                         Hindi Language Optimization                        */
/* -------------------------------------------------------------------------- */

/**
 * Hindi word replacements for SEO. Use in title/description generation
 * for Hindi pages to avoid Hinglish (which Google treats as lower-quality).
 */
export const HINDI_SEO_TERMS: Record<string, string> = {
  "website development": "वेबसाइट विकास",
  "digital agency": "डिजिटल एजेंसी",
  "web design": "वेब डिजाइन",
  "e-commerce": "ई-कॉमर्स",
  "SEO agency": "SEO एजेंसी",
  "custom software": "कस्टम सॉफ्टवेयर",
  "business growth": "व्यावसायिक वृद्धि",
  "revenue": "राजस्व",
  "conversion": "रूपांतरण",
  "mobile app": "मोबाइल ऐप",
  "marketing": "विपणन",
  "Delhi": "दिल्ली",
  "Mumbai": "मुंबई",
  "Bengaluru": "बेंगलुरु",
  "India": "भारत",
};

/**
 * Hindi query patterns that indicate high-intent searches.
 * Focus on these for Hindi content optimization.
 */
export const HIGH_INTENT_HINDI_QUERIES: string[] = [
  "दिल्ली में सबसे अच्छी वेबसाइट डेवलपमेंट कंपनी",
  "मुंबई में ई-कॉमर्स वेबसाइट",
  "भारत में डिजिटल मार्केटिंग एजेंसी",
  "अहमदाबाद में टेक्सटाइल वेबसाइट",
  "Chennai में हॉस्पिटल वेबसाइट",
];

/* -------------------------------------------------------------------------- */
/*                    City Authority Building Strategy                         */
/* -------------------------------------------------------------------------- */

/**
 * India operates on "city clusters" — 10 metros + emerging tier-2 cities
 * drive 60%+ of digital spend. Authority in one city doesn't auto-transfer.
 * Each city requires:
 * 1. Deep local content (600+ words, real neighborhoods, case studies)
 * 2. Local business schema (LocalBusiness + service area)
 * 3. City-specific backlinks (local events, business listings)
 * 4. Testimonials from that city (review velocity matters)
 * 5. Multi-language support (Tamil in Chennai, Gujarati in Ahmedabad, etc.)
 */

export interface CityAuthorityStrategy {
  city: string;
  state: string;
  population: string;
  industries: string[];
  /**
   * Languages worth shipping for this city. This is a PLANNING field, not a
   * runtime locale switch, so it may name languages the site does not resolve
   * yet (Chennai recommends `ta`, which is absent from `Locale`). Typed as
   * string[] for that reason — do not narrow it back to Locale[] unless every
   * recommendation has been added to i18n.ts + middleware.ts first.
   */
  recommendedLanguages: string[];
  contentPillars: string[];
  backlogPriority: 1 | 2 | 3;
  notes: string;
}

export const CITY_AUTHORITY_ROADMAP: CityAuthorityStrategy[] = [
  {
    city: "Delhi NCR",
    state: "Delhi",
    population: "32M+",
    industries: ["real estate", "edtech", "finance"],
    recommendedLanguages: ["en", "hi"],
    contentPillars: [
      "Real estate developer funnels",
      "IIT/NEET coaching sites",
      "NBFC lead capture",
    ],
    backlogPriority: 1,
    notes:
      "Largest market. 45%+ of tier-1 e-commerce. Focus: sub-5-min lead routing.",
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    population: "20M+",
    industries: ["D2C", "BFSI", "real estate"],
    recommendedLanguages: ["en", "hi"],
    contentPillars: [
      "Shopify Plus + D2C",
      "NBFC lead funnels",
      "Luxury real estate",
    ],
    backlogPriority: 1,
    notes: "Costliest CPC market. High-converting buyer. Focus: funnel speed.",
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    population: "13M+",
    industries: ["SaaS", "startups", "IT services"],
    recommendedLanguages: ["en"],
    contentPillars: ["SaaS pricing pages", "B2B sales funnels", "Startup sites"],
    backlogPriority: 1,
    notes:
      "Startup capital. Engineering-aware buyer. Focus: technical credibility.",
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    population: "8M+",
    industries: ["textiles", "pharma", "D2C"],
    recommendedLanguages: ["en", "gu"],
    contentPillars: [
      "Textile export sites",
      "Pharma portals",
      "D2C launches",
    ],
    backlogPriority: 2,
    notes:
      "Fast-growing. Bilingual essential (Gujarati 60%+ of market). Fixed-price model.",
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    population: "11M+",
    industries: ["healthcare", "auto", "IT services"],
    recommendedLanguages: ["en", "ta"],
    contentPillars: [
      "Hospital portals",
      "Auto dealer networks",
      "IT services global SEO",
    ],
    backlogPriority: 2,
    notes: "Healthcare quiet capital. Tamil language critical for consumer.",
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    population: "10M+",
    industries: ["IT", "pharma", "SaaS"],
    recommendedLanguages: ["en"],
    contentPillars: [
      "IT services global buyer",
      "Pharma compliance",
      "SaaS growth",
    ],
    backlogPriority: 2,
    notes:
      "HITEC City + Genome Valley. Pharma compliance critical. SaaS emerging.",
  },
];

/* -------------------------------------------------------------------------- */
/*                      Mobile-First India Optimization                       */
/* -------------------------------------------------------------------------- */

/**
 * India's mobile optimization requirements differ from global:
 * - Median internet speed: 8-12 Mbps (slow by US standards)
 * - 4G is primary (2G still used in rural areas)
 * - Data cost: ₹20-50/GB (high relative to income)
 * - Users expect INSTANT page loads (<2s LCP)
 * - Image optimization critical (50% of India's traffic is image-heavy)
 */

export const INDIA_MOBILE_OPTIMIZATION_CHECKLIST = [
  "LCP < 2s (not 2.5s) — India's threshold is stricter",
  "Image optimization: AVIF + WebP mandatory, not optional",
  "First Input Delay < 100ms (slower networks are sensitive)",
  "Cumulative Layout Shift < 0.05 (low-end phones critical)",
  "Zero JavaScript blocking page render",
  "Preload critical paths (checkout, lead form submit)",
  "PWA support (offline mode for shopping carts)",
  "Minified CSS/JS + HTTP/2 push",
  "Remove all third-party analytics until page interactive",
  "India-specific font subsetting (Noto Sans for Hindi)",
];

/* -------------------------------------------------------------------------- */
/*                        WhatsApp + SMS Discovery                            */
/* -------------------------------------------------------------------------- */

/**
 * WhatsApp is not just a messaging app in India — it's THE primary discovery,
 * lead capture, and conversion channel. Your website is the storefront;
 * WhatsApp is where the sale happens.
 *
 * Signal Google:
 * - Link WhatsApp in contact schema (tel: links + WA:// URIs)
 * - Schema markup for WhatsApp ordering (BuyAction via WhatsApp)
 * - Emphasize WhatsApp in copy ("Order on WhatsApp", "Reply on WA")
 * - Structured data for lead-form-to-WhatsApp handoff
 */

export function buildWhatsAppContactSchema(
  phoneE164: string,
  country: string = "IN",
) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: phoneE164,
    areaServed: country,
    availableLanguage: ["en", "hi"],
    // Multiple contact methods signal buyer confidence
    contactMethods: [
      {
        type: "WhatsApp",
        uri: `https://wa.me/${phoneE164.replace(/[^\d]/g, "")}`,
      },
      {
        type: "Phone",
        uri: `tel:${phoneE164}`,
      },
    ],
  };
}

/**
 * For D2C and e-commerce, recommend WhatsApp shopping to customers.
 * Schema signals to Google that purchases can be made via WhatsApp.
 */
export function buildWhatsAppShoppingSchema(
  phoneE164: string,
  businessName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BuyAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `https://wa.me/${phoneE164.replace(/[^\d]/g, "")}?text=I'd%20like%20to%20buy%20from%20${encodeURIComponent(businessName)}`,
      actionPlatform: "DesktopWebPlatform",
    },
    actionName: "Order on WhatsApp",
  };
}

/* -------------------------------------------------------------------------- */
/*                     India-Specific Robots + Crawl Hints                     */
/* -------------------------------------------------------------------------- */

/**
 * India's Googlebot prioritizes:
 * 1. XML sitemaps (crawl hints)
 * 2. Structured data (schema.org)
 * 3. Internal linking (anchor text is critical)
 * 4. Update frequency (fresh content signals)
 *
 * Recommendations:
 * - Submit sitemaps to Search Console with "In India" target
 * - Use region-tagged hreflang (en-IN, hi-IN)
 * - Link cities together (Mumbai → Pune → Bengaluru)
 * - Publish 2-3x/month (blog, case studies, updates)
 */

export const INDIA_SITEMAP_PRIORITIES = {
  home: 1.0,
  cities: 0.9,
  citySubpages: 0.85, // /cities/{city}/about, /services, etc.
  industries: 0.8,
  services: 0.8,
  blogs: 0.7,
  blogPosts: 0.65,
  legalPages: 0.5,
};

/**
 * Internal linking strategy for India authority building.
 * Link pattern: Home → (Vertical + Geographic) → Deep content
 */
export const INDIA_INTERNAL_LINKING_PATTERN = [
  // Home links to all cities (builds geo-cluster signal)
  "Home → Cities (all 10)",
  // Each city links to related cities (Mumbai → Pune → Bengaluru)
  "City → Related cities (2-3 neighbors)",
  // Industry pages link to city-specific angles
  "Industry → Cities with that industry",
  // Blog posts link to relevant city/industry pages
  "Blog → City (if mentioned) + Industry (if applicable)",
];

/* -------------------------------------------------------------------------- */
/*                    Measurement + Reporting for India SEO                   */
/* -------------------------------------------------------------------------- */

/**
 * KPIs that matter for India-specific SEO success.
 * Global metrics often mislead for India market.
 */

export const INDIA_SEO_KPIS = {
  // Traffic
  organicMobileTraffic: "Should be 90%+",
  cityClusterTraffic: "% of traffic from each metro",
  hindiLanguageTraffic: "% from hi-IN queries (growth indicator)",

  // Rankings
  cityKeywordRankings: "Track top-10 for each city's core keywords",
  localBusinessRankings: "Presence in 3-pack for city + industry combos",
  hindiRankings: "Track if Hindi pages begin ranking (lagging indicator)",

  // Engagement
  averageTimeOnSite: "India mobile often low; 60+ sec is good",
  scrollDepth: "% reaching case study section (conversion indicator)",
  clickToWhatsApp: "% of visitors clicking WhatsApp link",

  // Conversion
  leadVolumeByCity: "Breakdown by city (not just total)",
  leadQualityByCity: "Conversion rate by city (quality varies)",
  costPerLeadByCity: "Which cities are most cost-effective",

  // Competitive
  sharedDomains: "Competitor sites ranking in same SERPs",
  sharedLocalBusinesses: "Competitor local pages in 3-pack",
  backlinks: "Domain authority of Indian backlinks (local > global here)",
};
