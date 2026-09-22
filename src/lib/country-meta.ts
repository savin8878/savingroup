/**
 * Country metadata: region, primary currency, primary language, and market
 * tier. The values here drive substantive per-country body copy — so that
 * `/us/en/services` and `/de/en/services` render materially different
 * paragraphs, not just name-swapped duplicates.
 *
 * Tier explanation:
 *   T1 — mature digital market, English-ready, high spend (US, UK, DE, SG...)
 *   T2 — emerging digital market, mixed English adoption (IN, BR, AE, MX...)
 *   T3 — smaller or specialized market — copy speaks to niche/remote work
 *
 * Region drives which neighboring markets / time zones we reference in copy.
 *
 * Sources are baseline defaults — entries that are missing for a country fall
 * back to `inferFromLocale()` / region-default currency.
 */

import type { Locale } from "@/lib/i18n";

export type Region =
  | "asia"
  | "europe"
  | "americas"
  | "africa"
  | "oceania"
  | "middle-east";

export type MarketTier = "t1" | "t2" | "t3";

export interface CountryMeta {
  /** Broad region — drives regional framing in body copy */
  region: Region;
  /** ISO-4217 currency code — e.g. "USD", "INR", "EUR" */
  currency: string;
  /** Unicode currency symbol — e.g. "$", "₹", "€" */
  currencySymbol: string;
  /** Primary language code as used on-site (must be one of our LOCALE_CODES
   *  when possible — falls back to "en") */
  primaryLocale: Locale;
  /** Market tier — drives which value-prop messaging we surface */
  tier: MarketTier;
}

/* -------------------------------------------------------------------------- */
/*                    Explicit overrides for priority markets                 */
/* -------------------------------------------------------------------------- */

const OVERRIDES: Record<string, CountryMeta> = {
  // South Asia
  in: { region: "asia", currency: "INR", currencySymbol: "₹", primaryLocale: "hi", tier: "t2" },
  bd: { region: "asia", currency: "BDT", currencySymbol: "৳", primaryLocale: "en", tier: "t3" },
  pk: { region: "asia", currency: "PKR", currencySymbol: "₨", primaryLocale: "en", tier: "t3" },
  lk: { region: "asia", currency: "LKR", currencySymbol: "₨", primaryLocale: "en", tier: "t3" },
  np: { region: "asia", currency: "NPR", currencySymbol: "₨", primaryLocale: "en", tier: "t3" },

  // East Asia
  cn: { region: "asia", currency: "CNY", currencySymbol: "¥", primaryLocale: "zh", tier: "t1" },
  jp: { region: "asia", currency: "JPY", currencySymbol: "¥", primaryLocale: "en", tier: "t1" },
  kr: { region: "asia", currency: "KRW", currencySymbol: "₩", primaryLocale: "en", tier: "t1" },
  hk: { region: "asia", currency: "HKD", currencySymbol: "HK$", primaryLocale: "zh", tier: "t1" },
  tw: { region: "asia", currency: "TWD", currencySymbol: "NT$", primaryLocale: "zh", tier: "t1" },

  // SE Asia
  sg: { region: "asia", currency: "SGD", currencySymbol: "S$", primaryLocale: "en", tier: "t1" },
  my: { region: "asia", currency: "MYR", currencySymbol: "RM", primaryLocale: "en", tier: "t2" },
  th: { region: "asia", currency: "THB", currencySymbol: "฿", primaryLocale: "en", tier: "t2" },
  id: { region: "asia", currency: "IDR", currencySymbol: "Rp", primaryLocale: "en", tier: "t2" },
  ph: { region: "asia", currency: "PHP", currencySymbol: "₱", primaryLocale: "en", tier: "t2" },
  vn: { region: "asia", currency: "VND", currencySymbol: "₫", primaryLocale: "en", tier: "t2" },

  // Middle East
  ae: { region: "middle-east", currency: "AED", currencySymbol: "د.إ", primaryLocale: "ar", tier: "t1" },
  sa: { region: "middle-east", currency: "SAR", currencySymbol: "﷼", primaryLocale: "ar", tier: "t1" },
  qa: { region: "middle-east", currency: "QAR", currencySymbol: "﷼", primaryLocale: "ar", tier: "t2" },
  kw: { region: "middle-east", currency: "KWD", currencySymbol: "د.ك", primaryLocale: "ar", tier: "t2" },
  bh: { region: "middle-east", currency: "BHD", currencySymbol: ".د.ب", primaryLocale: "ar", tier: "t2" },
  om: { region: "middle-east", currency: "OMR", currencySymbol: "﷼", primaryLocale: "ar", tier: "t2" },
  jo: { region: "middle-east", currency: "JOD", currencySymbol: "د.ا", primaryLocale: "ar", tier: "t3" },
  il: { region: "middle-east", currency: "ILS", currencySymbol: "₪", primaryLocale: "en", tier: "t1" },
  eg: { region: "middle-east", currency: "EGP", currencySymbol: "£", primaryLocale: "ar", tier: "t2" },
  tr: { region: "middle-east", currency: "TRY", currencySymbol: "₺", primaryLocale: "en", tier: "t2" },
  ir: { region: "middle-east", currency: "IRR", currencySymbol: "﷼", primaryLocale: "en", tier: "t3" },
  iq: { region: "middle-east", currency: "IQD", currencySymbol: "ع.د", primaryLocale: "ar", tier: "t3" },

  // Europe — Eurozone
  de: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "de", tier: "t1" },
  fr: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "fr", tier: "t1" },
  es: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "es", tier: "t1" },
  it: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t1" },
  nl: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t1" },
  be: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "fr", tier: "t1" },
  at: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "de", tier: "t1" },
  ie: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t1" },
  pt: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t1" },
  fi: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t1" },
  gr: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "en", tier: "t2" },
  lu: { region: "europe", currency: "EUR", currencySymbol: "€", primaryLocale: "fr", tier: "t1" },

  // Europe — non-Eurozone
  gb: { region: "europe", currency: "GBP", currencySymbol: "£", primaryLocale: "en", tier: "t1" },
  ch: { region: "europe", currency: "CHF", currencySymbol: "CHF", primaryLocale: "de", tier: "t1" },
  se: { region: "europe", currency: "SEK", currencySymbol: "kr", primaryLocale: "en", tier: "t1" },
  no: { region: "europe", currency: "NOK", currencySymbol: "kr", primaryLocale: "en", tier: "t1" },
  dk: { region: "europe", currency: "DKK", currencySymbol: "kr", primaryLocale: "en", tier: "t1" },
  pl: { region: "europe", currency: "PLN", currencySymbol: "zł", primaryLocale: "en", tier: "t1" },
  cz: { region: "europe", currency: "CZK", currencySymbol: "Kč", primaryLocale: "en", tier: "t1" },
  hu: { region: "europe", currency: "HUF", currencySymbol: "Ft", primaryLocale: "en", tier: "t2" },
  ro: { region: "europe", currency: "RON", currencySymbol: "lei", primaryLocale: "en", tier: "t2" },
  ru: { region: "europe", currency: "RUB", currencySymbol: "₽", primaryLocale: "en", tier: "t2" },
  ua: { region: "europe", currency: "UAH", currencySymbol: "₴", primaryLocale: "en", tier: "t2" },

  // Americas
  us: { region: "americas", currency: "USD", currencySymbol: "$", primaryLocale: "en", tier: "t1" },
  ca: { region: "americas", currency: "CAD", currencySymbol: "C$", primaryLocale: "en", tier: "t1" },
  mx: { region: "americas", currency: "MXN", currencySymbol: "$", primaryLocale: "es", tier: "t2" },
  br: { region: "americas", currency: "BRL", currencySymbol: "R$", primaryLocale: "en", tier: "t2" },
  ar: { region: "americas", currency: "ARS", currencySymbol: "$", primaryLocale: "es", tier: "t2" },
  cl: { region: "americas", currency: "CLP", currencySymbol: "$", primaryLocale: "es", tier: "t2" },
  co: { region: "americas", currency: "COP", currencySymbol: "$", primaryLocale: "es", tier: "t2" },
  pe: { region: "americas", currency: "PEN", currencySymbol: "S/", primaryLocale: "es", tier: "t2" },

  // Oceania
  au: { region: "oceania", currency: "AUD", currencySymbol: "A$", primaryLocale: "en", tier: "t1" },
  nz: { region: "oceania", currency: "NZD", currencySymbol: "NZ$", primaryLocale: "en", tier: "t1" },

  // Africa
  za: { region: "africa", currency: "ZAR", currencySymbol: "R", primaryLocale: "en", tier: "t2" },
  ng: { region: "africa", currency: "NGN", currencySymbol: "₦", primaryLocale: "en", tier: "t2" },
  ke: { region: "africa", currency: "KES", currencySymbol: "KSh", primaryLocale: "en", tier: "t2" },
  ma: { region: "africa", currency: "MAD", currencySymbol: "د.م.", primaryLocale: "fr", tier: "t2" },
  gh: { region: "africa", currency: "GHS", currencySymbol: "₵", primaryLocale: "en", tier: "t3" },
  et: { region: "africa", currency: "ETB", currencySymbol: "Br", primaryLocale: "en", tier: "t3" },
  ug: { region: "africa", currency: "UGX", currencySymbol: "USh", primaryLocale: "en", tier: "t3" },
  tz: { region: "africa", currency: "TZS", currencySymbol: "TSh", primaryLocale: "en", tier: "t3" },
};

/* -------------------------------------------------------------------------- */
/*                     Region detection by ISO code ranges                    */
/* -------------------------------------------------------------------------- */

/** Fallback region inference for countries not in OVERRIDES, based on
 *  continental groupings. Not exhaustive but covers the long tail. */
const REGION_BY_CODE: Record<Region, readonly string[]> = {
  asia: [
    "af","am","az","bn","bt","cc","cx","ge","hm","io","kg","kh","kp","kz",
    "la","mm","mn","mo","mv","tj","tl","tm","uz",
  ],
  "middle-east": [
    "cy","lb","ps","sy","ye",
  ],
  europe: [
    "ad","al","ax","ba","bg","by","ee","fo","gg","gi","hr","im","is","je",
    "li","lt","lv","mc","md","me","mk","mt","rs","si","sj","sk","sm","va",
  ],
  americas: [
    "ag","ai","aw","bb","bl","bm","bo","bq","bs","bz","cr","cu","cw","dm",
    "do","ec","fk","gd","gf","gl","gp","gt","gy","hn","ht","jm","kn","ky",
    "lc","mf","mq","ms","ni","pa","pm","pr","py","sr","sv","sx","tc","tt",
    "uy","vc","ve","vg","vi",
  ],
  africa: [
    "ao","bf","bi","bj","bv","cd","cf","cg","ci","cm","cv","dj","dz","eh",
    "er","ga","gm","gn","gq","gw","km","lr","ls","ly","mg","ml","mr","mu",
    "mw","mz","na","ne","re","rw","sc","sd","sh","sl","sn","so","ss","st",
    "sz","td","tf","tg","tn","yt","zm","zw",
  ],
  oceania: [
    "as","ck","fj","fm","gu","ki","mh","mp","nc","nf","nr","nu","pf","pg",
    "pn","pw","sb","tk","to","tv","um","vu","wf","ws",
  ],
};

function inferRegion(code: string): Region {
  const c = code.toLowerCase();
  for (const [region, codes] of Object.entries(REGION_BY_CODE) as [Region, readonly string[]][]) {
    if (codes.includes(c)) return region;
  }
  return "asia";
}

const REGION_DEFAULT_CURRENCY: Record<Region, { currency: string; symbol: string }> = {
  asia: { currency: "USD", symbol: "$" },
  "middle-east": { currency: "USD", symbol: "$" },
  europe: { currency: "EUR", symbol: "€" },
  americas: { currency: "USD", symbol: "$" },
  africa: { currency: "USD", symbol: "$" },
  oceania: { currency: "USD", symbol: "$" },
};

/* -------------------------------------------------------------------------- */
/*                                Public API                                  */
/* -------------------------------------------------------------------------- */

/**
 * Return metadata for any ISO 3166-1 alpha-2 country code. Guaranteed to
 * return a usable `CountryMeta` — falls back to region inference and region
 * default currency for codes not in `OVERRIDES`.
 */
export function getCountryMeta(countryCode: string): CountryMeta {
  const code = countryCode.toLowerCase();
  const override = OVERRIDES[code];
  if (override) return override;

  const region = inferRegion(code);
  const regionDefault = REGION_DEFAULT_CURRENCY[region];
  return {
    region,
    currency: regionDefault.currency,
    currencySymbol: regionDefault.symbol,
    primaryLocale: "en",
    tier: "t3",
  };
}

/**
 * Localized region label — used to frame country positioning in body copy.
 * e.g. `"Asia-Pacific region"`, `"European market"`.
 */
export function getRegionLabel(region: Region, locale: Locale = "en"): string {
  const labels: Record<Locale, Record<Region, string>> = {
    en: {
      asia: "Asia-Pacific",
      "middle-east": "Middle East",
      europe: "Europe",
      americas: "the Americas",
      africa: "Africa",
      oceania: "Oceania",
    },
    es: {
      asia: "Asia-Pacífico",
      "middle-east": "Medio Oriente",
      europe: "Europa",
      americas: "las Américas",
      africa: "África",
      oceania: "Oceanía",
    },
    fr: {
      asia: "Asie-Pacifique",
      "middle-east": "Moyen-Orient",
      europe: "Europe",
      americas: "les Amériques",
      africa: "Afrique",
      oceania: "Océanie",
    },
    de: {
      asia: "Asien-Pazifik",
      "middle-east": "Naher Osten",
      europe: "Europa",
      americas: "Amerika",
      africa: "Afrika",
      oceania: "Ozeanien",
    },
    ar: {
      asia: "آسيا والمحيط الهادئ",
      "middle-east": "الشرق الأوسط",
      europe: "أوروبا",
      americas: "الأمريكتين",
      africa: "أفريقيا",
      oceania: "أوقيانوسيا",
    },
    hi: {
      asia: "एशिया-प्रशांत",
      "middle-east": "मध्य पूर्व",
      europe: "यूरोप",
      americas: "अमेरिका",
      africa: "अफ्रीका",
      oceania: "ओशिनिया",
    },
    zh: {
      asia: "亚太地区",
      "middle-east": "中东",
      europe: "欧洲",
      americas: "美洲",
      africa: "非洲",
      oceania: "大洋洲",
    },
    gu: {
      asia: "એશિયા-પેસિફિક",
      "middle-east": "મધ્ય પૂર્વ",
      europe: "યુરોપ",
      americas: "અમેરિકા",
      africa: "આફ્રિકા",
      oceania: "ઓશનિયા",
    },
  };
  return labels[locale]?.[region] ?? labels.en[region];
}

/**
 * Entry engagement price, per market, as an explicit {amount, currency} pair.
 *
 * WHY THIS TABLE EXISTS. `formatLocalPrice` used to take a single hardcoded
 * `60000` — an INR figure — and hand it to `Intl.NumberFormat` with whatever
 * currency the URL country implied. The number never changed; only the symbol
 * did. So /us/en/services advertised the entry engagement at "$60,000" and
 * /gb/en/services at "£60,000", roughly 85x the real ₹60,000 (~US$700). There
 * was no exchange-rate step anywhere. With every country now indexable, that
 * figure is customer-facing in eleven markets.
 *
 * A price in another market is a commercial decision, not an arithmetic
 * result, so nothing here is derived or invented: only India is set, because
 * only India's price is known from the site's own copy (en.json `priceRange`,
 * and the city pages' "We bill in INR with GST"). Every other market falls
 * back to the real INR price rather than displaying a fabricated local one.
 *
 * TO SET A MARKET PRICE: add one line. `us: { amount: 2500, currency: "USD" }`.
 */
const STARTING_PRICE: Record<string, { amount: number; currency: string }> = {
  in: { amount: 60000, currency: "INR" },
};

/** The price quoted when a market has no explicit entry above. */
const DEFAULT_STARTING_PRICE = STARTING_PRICE.in;

/**
 * Format the entry engagement price for a market.
 *
 * Returns the market's own price when one is configured, otherwise the real
 * INR price — never the INR integer wearing a foreign currency symbol.
 */
export function formatLocalPrice(
  countryCode: string,
  locale: Locale = "en",
): string {
  const price = STARTING_PRICE[countryCode.toLowerCase()] ?? DEFAULT_STARTING_PRICE;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 0,
    }).format(price.amount);
  } catch {
    return `${price.currency} ${price.amount.toLocaleString()}`;
  }
}
