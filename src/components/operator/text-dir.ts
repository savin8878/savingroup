// components/operator/text-dir.ts
//
// Direction and language of one run of model or visitor text, decided by
// counting its letters rather than by its first strong character.
//
// Why not dir="auto" or unicode-bidi: plaintext: both take the direction of
// the FIRST strong character, and Arabic business text routinely opens a
// sentence or a bullet with a Latin product name ("Excel ليس المشكلة…",
// "- Tally: …"). First-strong lays that whole Arabic paragraph out
// left-to-right, with the full stop and bullet at the wrong end. Counting
// letters finds the paragraph's real direction; inside it, the Unicode bidi
// algorithm still orders the embedded Latin words correctly.
//
// Why a language as well: the Operator replies in the script the visitor
// writes in, not the page's, so a Hindi reply on /in/en is normal. Without a
// lang on that text, screen readers voice Devanagari with the English
// synthesizer (WCAG 3.1.2), and the :lang() typography rules that drop
// tracking and capitals for non-Latin scripts never apply to it.
//
// Pure (type-only imports): loaded by scripts/operator-client.test.mjs under
// type stripping, and meant to be shared by views/ for model-authored labels.

export type TextDirection = "ltr" | "rtl";

type Script =
  | "latin"
  | "greek"
  | "cyrillic"
  | "hebrew"
  | "arabic"
  | "rtl-other"
  | "devanagari"
  | "bengali"
  | "gurmukhi"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "thai"
  | "kana"
  | "han"
  | "hangul"
  | "other";

const RTL_SCRIPTS: ReadonlySet<Script> = new Set<Script>(["hebrew", "arabic", "rtl-other"]);

/** The language a screen reader should switch to for a script, when it is not the page's. */
const SCRIPT_LANG: Partial<Record<Script, string>> = {
  greek: "el",
  cyrillic: "ru",
  hebrew: "he",
  arabic: "ar",
  devanagari: "hi",
  bengali: "bn",
  gurmukhi: "pa",
  gujarati: "gu",
  tamil: "ta",
  telugu: "te",
  kannada: "kn",
  malayalam: "ml",
  thai: "th",
  kana: "ja",
  han: "zh",
  hangul: "ko",
};

/** Script of each site locale (lib/i18n Locale); anything unknown is treated as Latin. */
const LOCALE_SCRIPT: Record<string, Script> = { ar: "arabic", hi: "devanagari", gu: "gujarati", zh: "han" };
const LATIN_LOCALES: ReadonlySet<string> = new Set(["en", "es", "fr", "de"]);

// Built from strings because the compile target (ES2017) predates Unicode
// property escapes in regex literals; every browser the site supports has them.
const LETTER = new RegExp("\\p{L}", "u");
/** Links, emails and code say nothing about the language around them. */
const NOISE = /`[^`]*`|\]\([^)]*\)|https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
/** Enough letters to decide; keeps per-frame work flat on a long streaming block. */
const SAMPLE_CHARS = 2000;

function scriptOf(cp: number): Script {
  if (cp < 0x250 || (cp >= 0x1e00 && cp <= 0x1eff) || (cp >= 0x2c60 && cp <= 0x2c7f) || (cp >= 0xa720 && cp <= 0xa7ff) || (cp >= 0xff21 && cp <= 0xff5a)) return "latin";
  if ((cp >= 0x370 && cp <= 0x3ff) || (cp >= 0x1f00 && cp <= 0x1fff)) return "greek";
  if (cp >= 0x400 && cp <= 0x52f) return "cyrillic";
  if ((cp >= 0x590 && cp <= 0x5ff) || (cp >= 0xfb1d && cp <= 0xfb4f)) return "hebrew";
  if ((cp >= 0x600 && cp <= 0x6ff) || (cp >= 0x750 && cp <= 0x77f) || (cp >= 0x870 && cp <= 0x8ff) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff)) return "arabic";
  if (cp >= 0x700 && cp <= 0x86f) return "rtl-other"; // Syriac, Thaana, NKo, Samaritan, Mandaic
  if ((cp >= 0x900 && cp <= 0x97f) || (cp >= 0xa8e0 && cp <= 0xa8ff)) return "devanagari";
  if (cp >= 0x980 && cp <= 0x9ff) return "bengali";
  if (cp >= 0xa00 && cp <= 0xa7f) return "gurmukhi";
  if (cp >= 0xa80 && cp <= 0xaff) return "gujarati";
  if (cp >= 0xb80 && cp <= 0xbff) return "tamil";
  if (cp >= 0xc00 && cp <= 0xc7f) return "telugu";
  if (cp >= 0xc80 && cp <= 0xcff) return "kannada";
  if (cp >= 0xd00 && cp <= 0xd7f) return "malayalam";
  if (cp >= 0xe00 && cp <= 0xe7f) return "thai";
  if (cp >= 0x3040 && cp <= 0x30ff) return "kana";
  if ((cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x20000 && cp <= 0x3134f)) return "han";
  if ((cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x1100 && cp <= 0x11ff)) return "hangul";
  // Other RTL blocks outside the BMP (Old South Arabian, Adlam, …).
  if ((cp >= 0x10800 && cp <= 0x10fff) || (cp >= 0x1e800 && cp <= 0x1efff)) return "rtl-other";
  return "other";
}

/** Letters per script, links/emails/code removed. */
function countScripts(text: string): Map<Script, number> {
  const counts = new Map<Script, number>();
  const sample = text.length > SAMPLE_CHARS * 2 ? text.slice(0, SAMPLE_CHARS * 2) : text;
  let seen = 0;
  for (const ch of sample.replace(NOISE, " ")) {
    if (!LETTER.test(ch)) continue;
    const script = scriptOf(ch.codePointAt(0) as number);
    counts.set(script, (counts.get(script) ?? 0) + 1);
    if (++seen >= SAMPLE_CHARS) break;
  }
  return counts;
}

/** The locale's base direction (only Arabic is right-to-left among the site's locales). */
export function localeDir(locale: string): TextDirection {
  return LOCALE_SCRIPT[locale] === "arabic" ? "rtl" : "ltr";
}

/**
 * Paragraph direction of `text`: "rtl" once right-to-left letters make up at
 * least 40% of its letters, "ltr" when it has other letters, and `fallback`
 * (the page's direction) when it has none (digits, emoji, an empty draft).
 *
 * 40%, not 50%: Latin product names are long ("WhatsApp", "Excel") next to
 * short Arabic words, so a sentence a reader sees as Arabic can still hold
 * nearly as many Latin letters.
 */
export function textDir(text: string, fallback: TextDirection): TextDirection {
  let rtl = 0;
  let ltr = 0;
  for (const [script, n] of countScripts(text)) {
    if (RTL_SCRIPTS.has(script)) rtl += n;
    else ltr += n;
  }
  if (rtl + ltr === 0) return fallback;
  return rtl / (rtl + ltr) >= 0.4 ? "rtl" : "ltr";
}

/**
 * The lang to put on `text`, or undefined when the page's language already
 * fits (same script as the page locale, or no letters at all).
 *
 * The dominant script decides: a Hindi reply full of English product names
 * is still Hindi. Latin text on a non-Latin page is tagged "en" (the
 * Operator's other language); on a Latin page it inherits, because Latin
 * letters alone cannot tell English from Spanish.
 */
export function scriptLang(text: string, locale: string): string | undefined {
  const counts = countScripts(text);
  const pageScript = LOCALE_SCRIPT[locale] ?? "latin";
  let best: Script | null = null;
  let bestCount = 0;
  for (const [script, n] of counts) {
    // Ties go to the page's own script: no switch without a clear majority.
    if (n > bestCount || (n === bestCount && script === pageScript)) {
      best = script;
      bestCount = n;
    }
  }
  if (!best || best === pageScript) return undefined;
  if (best === "latin") return LATIN_LOCALES.has(locale) ? undefined : "en";
  return SCRIPT_LANG[best];
}
