import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { countryNamesByISO } from "@/lib/country";
import type { Locale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*                          Country and city lookups                          */
/* -------------------------------------------------------------------------- */

/**
 * Full country name dictionary (all 249 ISO 3166-1 codes) from
 * `@/lib/country`. Localized per request locale via `Intl.DisplayNames`.
 */
const COUNTRY_NAMES_EN = countryNamesByISO as Record<string, string>;

/** Default city per country — capital or largest city. Covers major markets. */
const DEFAULT_CITIES: Record<string, string> = {
  ad: "Andorra la Vella", ae: "Dubai", af: "Kabul", ag: "Saint John's",
  al: "Tirana", am: "Yerevan", ao: "Luanda", ar: "Buenos Aires",
  at: "Vienna", au: "Sydney", az: "Baku", ba: "Sarajevo", bb: "Bridgetown",
  bd: "Dhaka", be: "Brussels", bf: "Ouagadougou", bg: "Sofia", bh: "Manama",
  bi: "Bujumbura", bj: "Porto-Novo", bn: "Bandar Seri Begawan", bo: "La Paz",
  br: "São Paulo", bs: "Nassau", bt: "Thimphu", bw: "Gaborone", by: "Minsk",
  bz: "Belmopan", ca: "Toronto", cd: "Kinshasa", cf: "Bangui", cg: "Brazzaville",
  ch: "Zurich", ci: "Abidjan", cl: "Santiago", cm: "Yaoundé", cn: "Shanghai",
  co: "Bogotá", cr: "San José", cu: "Havana", cv: "Praia", cy: "Nicosia",
  cz: "Prague", de: "Berlin", dj: "Djibouti", dk: "Copenhagen", dm: "Roseau",
  do: "Santo Domingo", dz: "Algiers", ec: "Quito", ee: "Tallinn", eg: "Cairo",
  er: "Asmara", es: "Madrid", et: "Addis Ababa", fi: "Helsinki", fj: "Suva",
  fm: "Palikir", fr: "Paris", ga: "Libreville", gb: "London", gd: "St. George's",
  ge: "Tbilisi", gh: "Accra", gm: "Banjul", gn: "Conakry", gq: "Malabo",
  gr: "Athens", gt: "Guatemala City", gw: "Bissau", gy: "Georgetown",
  hk: "Hong Kong", hn: "Tegucigalpa", hr: "Zagreb", ht: "Port-au-Prince",
  hu: "Budapest", id: "Jakarta", ie: "Dublin", il: "Tel Aviv", in: "Bangalore",
  iq: "Baghdad", ir: "Tehran", is: "Reykjavík", it: "Milan", jm: "Kingston",
  jo: "Amman", jp: "Tokyo", ke: "Nairobi", kg: "Bishkek", kh: "Phnom Penh",
  ki: "Tarawa", km: "Moroni", kn: "Basseterre", kp: "Pyongyang", kr: "Seoul",
  kw: "Kuwait City", kz: "Almaty", la: "Vientiane", lb: "Beirut", lc: "Castries",
  li: "Vaduz", lk: "Colombo", lr: "Monrovia", ls: "Maseru", lt: "Vilnius",
  lu: "Luxembourg", lv: "Riga", ly: "Tripoli", ma: "Casablanca", mc: "Monaco",
  md: "Chișinău", me: "Podgorica", mg: "Antananarivo", mh: "Majuro",
  mk: "Skopje", ml: "Bamako", mm: "Yangon", mn: "Ulaanbaatar", mo: "Macao",
  mr: "Nouakchott", mt: "Valletta", mu: "Port Louis", mv: "Malé", mw: "Lilongwe",
  mx: "Mexico City", my: "Kuala Lumpur", mz: "Maputo", na: "Windhoek",
  ne: "Niamey", ng: "Lagos", ni: "Managua", nl: "Amsterdam", no: "Oslo",
  np: "Kathmandu", nr: "Yaren", nz: "Auckland", om: "Muscat", pa: "Panama City",
  pe: "Lima", pg: "Port Moresby", ph: "Manila", pk: "Karachi", pl: "Warsaw",
  pt: "Lisbon", pw: "Ngerulmud", py: "Asunción", qa: "Doha", ro: "Bucharest",
  rs: "Belgrade", ru: "Moscow", rw: "Kigali", sa: "Riyadh", sb: "Honiara",
  sc: "Victoria", sd: "Khartoum", se: "Stockholm", sg: "Singapore",
  si: "Ljubljana", sk: "Bratislava", sl: "Freetown", sm: "San Marino",
  sn: "Dakar", so: "Mogadishu", sr: "Paramaribo", ss: "Juba", st: "São Tomé",
  sv: "San Salvador", sy: "Damascus", sz: "Mbabane", td: "N'Djamena",
  tg: "Lomé", th: "Bangkok", tj: "Dushanbe", tl: "Dili", tm: "Ashgabat",
  tn: "Tunis", to: "Nukuʻalofa", tr: "Istanbul", tt: "Port of Spain",
  tv: "Funafuti", tw: "Taipei", tz: "Dar es Salaam", ua: "Kyiv", ug: "Kampala",
  us: "New York", uy: "Montevideo", uz: "Tashkent", va: "Vatican City",
  vc: "Kingstown", ve: "Caracas", vn: "Ho Chi Minh City", vu: "Port Vila",
  ws: "Apia", ye: "Sana'a", za: "Johannesburg", zm: "Lusaka", zw: "Harare",
};

/** Default state / admin region per country. Sparse — only filled for markets
 * where the state materially differs from the city. */
const DEFAULT_STATES: Record<string, string> = {
  in: "Karnataka", us: "New York", gb: "England", ae: "Dubai",
  sa: "Riyadh Province", ca: "Ontario", au: "New South Wales",
  de: "Berlin", fr: "Île-de-France", es: "Community of Madrid",
  it: "Lombardy", nl: "North Holland", jp: "Tokyo", kr: "Seoul",
  cn: "Shanghai", my: "Kuala Lumpur", th: "Bangkok", id: "Jakarta",
  ph: "Metro Manila", vn: "Ho Chi Minh City", bd: "Dhaka", pk: "Sindh",
  lk: "Western Province", np: "Bagmati", za: "Gauteng", ng: "Lagos",
  ke: "Nairobi County", eg: "Cairo Governorate", br: "São Paulo",
  mx: "Mexico City",
};

/** Indian Tier-1 city list — used by CityBanner. */
export const INDIAN_TIER1 = [
  "Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad",
  "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
];

/* -------------------------------------------------------------------------- */
/*                         Localized country name helper                      */
/* -------------------------------------------------------------------------- */

/**
 * Return the country name for an ISO code, localized to the requested locale.
 *
 * Uses the built-in `Intl.DisplayNames` API (supported in all modern runtimes
 * including the Next.js Edge runtime) so that `/us/hi` pages render
 * "संयुक्त राज्य अमेरिका" while `/us/fr` pages render "États-Unis".
 *
 * Falls back to the English dictionary, then to the uppercased ISO code.
 */
export function getCountryName(countryCode: string, locale: Locale = "en"): string {
  const code = countryCode.trim().toUpperCase();
  if (!code) return "";

  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    const name = dn.of(code);
    if (name && name !== code) return name;
  } catch {
    // Intl.DisplayNames unavailable — fall through to dictionary
  }

  return COUNTRY_NAMES_EN[countryCode.toLowerCase()] ?? code;
}

/** Default city for a country slug. Falls back to the localized country name
 * when the country isn't in the defaults map (so the copy still reads as a
 * proper noun rather than an ISO code). */
export function getDefaultCity(countryCode: string, locale: Locale = "en"): string {
  const code = countryCode.toLowerCase();
  return DEFAULT_CITIES[code] ?? getCountryName(code, locale);
}

/** Default state for a country slug. Falls back to the default city. */
export function getDefaultState(countryCode: string, locale: Locale = "en"): string {
  const code = countryCode.toLowerCase();
  return DEFAULT_STATES[code] ?? getDefaultCity(code, locale);
}

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface GeoInfo {
  /** Detected or default city (always populated) */
  city: string;
  /** Detected or default state / admin region */
  state: string;
  /** ISO 3166-1 alpha-2 country code, lowercase. Always matches URL. */
  countryCode: string;
  /** Human-readable country name, localized to the request locale. */
  countryName: string;
  /** Latitude — may be empty if unknown */
  latitude?: string;
  /** Longitude — may be empty if unknown */
  longitude?: string;
  /** True if visitor geo enriched the city/state (visitor was in the URL country) */
  detected: boolean;
  /** "vercel" | "ipwhois" | "default" — where the city/state data came from */
  source: "vercel" | "ipwhois" | "default";
}

/* -------------------------------------------------------------------------- */
/*                          Free IP API fallback (ipwho.is)                   */
/* -------------------------------------------------------------------------- */

interface IpWhoIsResponse {
  ip?: string;
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}

async function lookupIpWhoIs(ip: string): Promise<Partial<GeoInfo> | null> {
  try {
    const url = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/";
    const res = await fetch(url, {
      headers: { "User-Agent": "SavinGroup/1.0" },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoIsResponse;
    if (!data.success) return null;

    return {
      city: data.city || "",
      state: data.region || "",
      countryCode: (data.country_code || "").toLowerCase(),
      latitude: data.latitude !== undefined ? String(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? String(data.longitude) : undefined,
    };
  } catch {
    return null;
  }
}

const cachedLookupIpWhoIs = unstable_cache(
  async (ip: string) => lookupIpWhoIs(ip),
  ["ipwhois-v1"],
  { revalidate: 3600, tags: ["geo"] }
);

/* -------------------------------------------------------------------------- */
/*                               Public getGeo                                */
/* -------------------------------------------------------------------------- */

/**
 * Resolve geo info for a URL country slug.
 *
 * Core contract (critical for SEO): **the URL country slug ALWAYS wins.**
 * Every server render of `/us/en/about` produces the same countryName
 * regardless of which IP requested it — so Googlebot (crawling from a
 * datacenter) sees the same "United States" content that a US visitor sees.
 *
 * Visitor IP is used only to enrich the `city` and `state` when the visitor
 * is actually in the URL country. If the visitor is elsewhere (or we can't
 * tell), we fall back to the country's default city — deterministic per URL.
 */
/**
 * Deterministic, URL-only geo. Same input → same output, always, with no
 * `headers()` read and therefore no visitor IP involved.
 *
 * Use this for anything that ends up in `<head>` or in structured data.
 * `getGeo` enriches `city`/`state` from the requester's IP when the visitor
 * is inside the URL country, which is fine for visible "now serving X" copy
 * but wrong for metadata: it made `<title>` and `<meta description>` change
 * from request to request on the same canonical URL, and it fed a postal
 * address into LocalBusiness JSON-LD. Metadata must describe the page, not
 * the person fetching it.
 *
 * Reading `headers()` also opts the route out of static rendering, so keeping
 * it out of `generateMetadata` lets these pages be prerendered and CDN-cached.
 */
export function getUrlGeo(countrySlug: string, locale: Locale = "en"): GeoInfo {
  const urlCountry = (countrySlug || "in").toLowerCase();
  return {
    city: getDefaultCity(urlCountry, locale),
    state: getDefaultState(urlCountry, locale),
    countryCode: urlCountry,
    countryName: getCountryName(urlCountry, locale),
    detected: false,
    source: "default",
  };
}

export async function getGeo(
  countrySlug: string,
  locale: Locale = "en",
): Promise<GeoInfo> {
  const urlCountry = (countrySlug || "in").toLowerCase();
  const countryName = getCountryName(urlCountry, locale);

  const h = await headers();
  const visitorCountry = (
    h.get("x-geo-country") ||
    h.get("x-vercel-ip-country") ||
    ""
  ).toLowerCase();
  const visitorCity = h.get("x-geo-city") || h.get("x-vercel-ip-city") || "";
  const visitorRegion =
    h.get("x-geo-region") || h.get("x-vercel-ip-country-region") || "";
  const visitorLat =
    h.get("x-geo-latitude") || h.get("x-vercel-ip-latitude") || undefined;
  const visitorLng =
    h.get("x-geo-longitude") || h.get("x-vercel-ip-longitude") || undefined;

  // 1. Visitor is in the URL country → enrich city/state from their headers
  if (visitorCountry === urlCountry && visitorCity) {
    return {
      city: safeDecode(visitorCity),
      state: safeDecode(visitorRegion) || getDefaultState(urlCountry, locale),
      countryCode: urlCountry,
      countryName,
      latitude: visitorLat ?? undefined,
      longitude: visitorLng ?? undefined,
      detected: true,
      source: "vercel",
    };
  }

  // 2. Visitor country missing from headers → try IP API, but ONLY accept
  //    enrichment if it matches the URL country (same rule as above).
  const clientIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "";

  if (!visitorCountry && clientIp && !isPrivateIp(clientIp)) {
    const api = await cachedLookupIpWhoIs(clientIp);
    if (api?.city && api.countryCode === urlCountry) {
      return {
        city: api.city,
        state: api.state || getDefaultState(urlCountry, locale),
        countryCode: urlCountry,
        countryName,
        latitude: api.latitude,
        longitude: api.longitude,
        detected: true,
        source: "ipwhois",
      };
    }
  }

  // 3. Visitor not in URL country (or unknown) → deterministic defaults.
  //    This is the path Googlebot always hits, and it's what we want: the
  //    same page rendered the same way for every crawler request.
  return {
    city: getDefaultCity(urlCountry, locale),
    state: getDefaultState(urlCountry, locale),
    countryCode: urlCountry,
    countryName,
    detected: false,
    source: "default",
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "0.0.0.0" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

/**
 * Build a compact location string for meta descriptions and social previews.
 * Example: "Bangalore, Karnataka, India"
 */
export function formatLocation(geo: GeoInfo): string {
  const parts = [geo.city, geo.state, geo.countryName].filter(
    (p, i, arr) => p && arr.indexOf(p) === i
  );
  return parts.join(", ");
}

/**
 * Short location — "Bangalore, India" — for meta titles where length matters.
 */
export function formatLocationShort(geo: GeoInfo): string {
  return [geo.city, geo.countryName].filter(Boolean).join(", ");
}
