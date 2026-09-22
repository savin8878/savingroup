// middleware.ts  (or src/middleware.ts)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TARGET_COUNTRIES } from "@/lib/constants";

export const validCountryISOs = [
  "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "ar", "as", "at", "au", "aw", "ax", "az",
  "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bl", "bm", "bn", "bo", "bq", "br",
  "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl",
  "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do",
  "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "fi", "fj", "fk", "fm", "fo", "fr", "ga",
  "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gt", "gu",
  "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq",
  "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr",
  "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma",
  "mc", "md", "me", "mf", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms",
  "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no",
  "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr",
  "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se",
  "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv", "sx", "sy",
  "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv",
  "tz", "ua", "ug", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf",
  "ws", "ye", "yt", "za", "zm", "zw",
];

export const validLocales = ["en", "es", "fr", "de", "ar", "hi", "zh", "gu"];

// Default values
const defaultCountry = "in";
const defaultLocale = "en";

/**
 * Map a non-target country to the closest target market for canonical redirects.
 * Keeps visitor-country intent without creating 240 near-duplicate indexed pages.
 * Countries not listed here fall through to `defaultCountry` (India).
 */
const NEAREST_TARGET: Record<string, string> = {
  // Americas → US
  mx: "us", br: "us", ar: "us", cl: "us", co: "us", pe: "us", ve: "us", uy: "us",
  py: "us", bo: "us", ec: "us", cr: "us", pa: "us", gt: "us", hn: "us", sv: "us",
  ni: "us", cu: "us", do: "us", ht: "us", jm: "us", tt: "us", pr: "us",
  // Oceania → AU
  nz: "au", fj: "au", pg: "au",
  // South Asia → IN
  bd: "in", pk: "in", lk: "in", np: "in", bt: "in", mv: "in", af: "in",
  // SE Asia / East Asia → SG
  my: "sg", th: "sg", id: "sg", ph: "sg", vn: "sg", kh: "sg", la: "sg", mm: "sg",
  hk: "sg", tw: "sg", jp: "sg", kr: "sg", cn: "sg", mo: "sg",
  // Gulf (non-KSA/UAE) → AE
  qa: "ae", kw: "ae", bh: "ae", om: "ae", ye: "ae", jo: "ae", lb: "ae", iq: "ae",
  // Middle East North Africa → AE
  eg: "ae", tr: "ae", il: "ae", ir: "ae", ma: "ae", tn: "ae", dz: "ae", ly: "ae", sd: "ae",
  // EU non-target → DE
  at: "de", ch: "de", be: "de", lu: "de", dk: "de", se: "de", no: "de", fi: "de",
  is: "de", ie: "gb", pl: "de", cz: "de", sk: "de", hu: "de", ro: "de", bg: "de",
  hr: "de", si: "de", gr: "de", pt: "es", it: "de", ee: "de", lv: "de", lt: "de",
  ua: "de", by: "de", ru: "de",
  // Africa → AE or FR (francophone) — simple split
  za: "gb", ng: "gb", ke: "gb", gh: "gb", et: "gb", tz: "gb", ug: "gb", zm: "gb",
  zw: "gb", rw: "gb", sn: "fr", ci: "fr", cm: "fr", mg: "fr", bf: "fr", ml: "fr",
};

/**
 * Check if a user-agent is a known search-engine bot. Bots don't send
 * `x-vercel-ip-country`, so we skip the external IP API call entirely for
 * them and honor the URL country directly. This cuts Googlebot TTFB and
 * preserves crawl budget.
 */
function isSearchEngineBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("yandexbot") ||
    ua.includes("baiduspider") ||
    ua.includes("applebot") ||
    ua.includes("slurp") || // Yahoo
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot") ||
    ua.includes("linkedinbot") ||
    ua.includes("whatsapp")
  );
}

/**
 * Get browser preferred language from accept-language header
 */
function getBrowserLanguage(req: NextRequest): string {
  const acceptLanguage = req.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const primaryLang = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  return validLocales.includes(primaryLang) ? primaryLang : defaultLocale;
}

/**
 * Get country code using Vercel headers (preferred) or fallback API.
 * Bots are short-circuited to the default country to avoid external fetch.
 */
async function getUserCountry(req: NextRequest): Promise<string> {
  // Search-engine bots — skip external IP lookup entirely (saves TTFB + crawl budget)
  if (isSearchEngineBot(req.headers.get("user-agent"))) {
    return defaultCountry;
  }

  // Primary: Vercel geolocation headers (available on Edge & Serverless functions)
  const vercelCountry = req.headers.get("x-vercel-ip-country")?.toLowerCase();

  if (vercelCountry && validCountryISOs.includes(vercelCountry)) {
    return vercelCountry;
  }

  // Fallback: IP API (used in local dev or when headers missing)
  const clientIP =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";

  try {
    const response = await fetch(`https://ip.nesscoindia.com/${clientIP}`, {
      headers: {
        "User-Agent": "NextJS-Middleware",
      },
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new Error(`IP API failed: ${response.status}`);
    }

    const ipData = await response.json();
    const country = ipData.country?.toLowerCase();

    if (country && validCountryISOs.includes(country)) {
      return country;
    }
  } catch (err) {
    console.error("Fallback IP fetch error:", err);
  }

  // Ultimate fallback
  return defaultCountry;
}

/**
 * Map a detected country to the closest target market we actually index.
 * If the visitor's country IS a target, we keep it. Otherwise we canonicalize
 * to the nearest target (e.g., br → us, my → sg) so we don't create
 * near-duplicate URLs Google has to deduplicate.
 */
function canonicalizeToTarget(country: string): string {
  if ((TARGET_COUNTRIES as readonly string[]).includes(country)) {
    return country;
  }
  return NEAREST_TARGET[country] ?? defaultCountry;
}

/**
 * Main middleware – handles country/language prefix redirects.
 *
 * Redirect semantics:
 *   - When the URL already has a valid country/locale → pass through (no redirect).
 *   - When we need to ADD country/locale to the URL (bare `/`, `/about`, etc.)
 *     → 308 permanent redirect so Google consolidates ranking to the target.
 *     Previously used 307 which is temporary and bleeds PageRank.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip internal paths, API routes, static files, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") || // files like favicon.ico, robots.txt
    pathname === "/sitemap-index.xml" ||
    pathname.endsWith(".xml")
  ) {
    return NextResponse.next();
  }

  // Parse existing country/language from URL
  const pathParts = pathname.split("/").filter(Boolean);
  const urlCountry = pathParts[0]?.toLowerCase();
  const urlLanguage = pathParts[1]?.toLowerCase();

  const isCountryValid = validCountryISOs.includes(urlCountry);
  const isLanguageValid = validLocales.includes(urlLanguage);

  // If URL already has valid country + language → continue
  if (isCountryValid && isLanguageValid) {
    // Normalize casing FIRST. `validCountryISOs`/`validLocales` are checked
    // against the lowercased segments, so `/IN/EN/about` passes validation and
    // then renders with the raw params — which `buildAlternates` turns into a
    // self-referencing canonical for the mixed-case URL. That makes every page
    // reachable at 16 case permutations of its two leading segments, each one
    // declaring itself canonical and `index, follow`. 308 to the lowercase form
    // so there is exactly one URL per page.
    if (pathParts[0] !== urlCountry || pathParts[1] !== urlLanguage) {
      const url = req.nextUrl.clone();
      url.pathname = `/${[urlCountry, urlLanguage, ...pathParts.slice(2)].join("/")}`;
      return NextResponse.redirect(url, 308);
    }

    const res = NextResponse.next();
    res.headers.set("x-next-url-path", pathname);
    res.headers.set("x-next-url-query", req.nextUrl.search);
    // Forward Vercel geo headers so server components can read them via next/headers
    const city = req.headers.get("x-vercel-ip-city");
    const region = req.headers.get("x-vercel-ip-country-region");
    const country = req.headers.get("x-vercel-ip-country");
    const latitude = req.headers.get("x-vercel-ip-latitude");
    const longitude = req.headers.get("x-vercel-ip-longitude");
    if (city) res.headers.set("x-geo-city", decodeURIComponent(city));
    if (region) res.headers.set("x-geo-region", region);
    if (country) res.headers.set("x-geo-country", country);
    if (latitude) res.headers.set("x-geo-latitude", latitude);
    if (longitude) res.headers.set("x-geo-longitude", longitude);
    return res;
  }

  try {
    // Detect country (Vercel preferred + fallback, bots short-circuit to default)
    const detectedCountry = await getUserCountry(req);

    // Detect language from browser
    const browserLanguage = getBrowserLanguage(req);

    // Decide final values — any URL-country that isn't a TARGET gets
    // canonicalized to the nearest target so we don't create 240 near-duplicate
    // indexed URL trees.
    const resolvedCountry = isCountryValid ? urlCountry : detectedCountry;
    const finalCountry = canonicalizeToTarget(resolvedCountry);
    const finalLanguage = isLanguageValid ? urlLanguage : browserLanguage;

    // Build new path: /country/language/rest...
    const newPathParts = [finalCountry, finalLanguage, ...pathParts.slice(isCountryValid ? 1 : 0)];
    const newPathname = `/${newPathParts.join("/")}`;

    const url = req.nextUrl.clone();
    url.pathname = newPathname;

    // 308 = permanent redirect. Google consolidates ranking signals to the
    // target URL; 307 (previous value) was temporary and stranded PageRank.
    return NextResponse.redirect(url, 308);
  } catch (error) {
    console.error("Middleware error:", error);

    // Fallback redirect in case of any error
    const fallbackUrl = req.nextUrl.clone();
    fallbackUrl.pathname = "/in/en";
    return NextResponse.redirect(fallbackUrl, 308);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets|favicon-96x96.png|favicon-180x180.png|favicon.ico|favicon.svg|google059bd1b2c050b28b.html|google7f9e3db7a201227d.html|robots.txt|api|^app$|^app/|sitemap-index.xml|[a-zA-Z]{2}/sitemap.xml|[a-zA-Z]{2}/[a-zA-Z]{2}/sitemap.xml).*)",
  ],
};
