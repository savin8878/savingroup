import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  DM_Sans,
  JetBrains_Mono,
  Bodoni_Moda,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Arabic,
} from "next/font/google";
import "./globals.css";
import {
  getTranslation,
  LOCALES,
  LOCALE_CODES,
  type Locale,
} from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import {
  buildAlternates,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo";
import Header from "@/components/common/header";
import type { CityNavItem } from "@/components/common/MegaMenu";
import Footer from "@/components/common/footer";
import { INDIA_CITIES } from "@/lib/cities";
import { getCityIdentity } from "@/lib/city-identity";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

/**
 * Editorial display face — the tall, high-contrast didone used for the one
 * headline per page that carries the message (hero H1 accent line, the closing
 * CTA, and the big stat numerals). Deliberately NOT wired to `--font-display`:
 * a didone at 14px is unreadable, and using it for every H2/H3 is what makes a
 * page look decorated rather than designed. See `.font-editorial` in
 * globals.css for the one place it is allowed to apply.
 *
 * `optical-size` is the reason this family and not Playfair/Prata: Bodoni Moda
 * thins its hairlines as the size axis climbs, which is what gives the display
 * sizes their contrast without making the 2rem mobile rendering fall apart.
 */
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni-moda",
});

/* -------------------------------------------------------------------------- */
/*                        Script fonts for non-Latin locales                  */
/* -------------------------------------------------------------------------- */

/**
 * Space Grotesk, DM Sans and JetBrains Mono are Latin-only families — they
 * have no Devanagari, Gujarati, Arabic or Han coverage at any subset. Every
 * locale is indexable, so /in/hi, /in/gu, /ae/ar and /in/zh were rendering
 * their entire body in whatever fallback the device happened to have, next to
 * Latin brand names still in DM Sans: mismatched weight, x-height and
 * baseline on the same line, plus a layout shift when the Latin face swaps in.
 *
 * Declared at module scope because `next/font` requires it, then applied
 * per-locale below, so a visitor only ever downloads the script they read.
 * `preload: false` keeps the other three out of the document's preload list.
 */
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
  variable: "--font-script",
});

const notoGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  display: "swap",
  preload: false,
  variable: "--font-script",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-script",
});

/**
 * Chinese is deliberately NOT a webfont. Noto Sans SC's `chinese-simplified`
 * subset is several megabytes — an unreasonable download for a locale whose
 * body copy is still largely English, and far worse than the problem it would
 * solve. `zh` gets the system CJK stack from globals.css instead, which is
 * what the platform fonts on every Chinese-configured device already provide.
 */

/** The script face for a locale; empty string for Latin and CJK locales. */
function scriptFontClass(locale: Locale): string {
  switch (locale) {
    case "hi":
      return notoDevanagari.variable;
    case "gu":
      return notoGujarati.variable;
    case "ar":
      return notoArabic.variable;
    default:
      return "";
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E1A" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale: rawLocale } = await params;
  const locale = (LOCALE_CODES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "en") as Locale;
  const t = getTranslation(locale);

  // Hreflang + canonical fallback for the locale layout. Child pages
  // override this via their own `generateMetadata`; this serves as the
  // baseline for any route that doesn't set its own alternates. Region
  // tagging (en-IN, hi-IN) and the noindex-page-emits-no-hreflang policy
  // are both centralized in `buildAlternates`.
  const alternates = buildAlternates({ country, locale, subPath: "" });

  return {
    title: {
      default: t.seo.title,
      template: `%s · ${t.brand.name}`,
    },
    description: t.seo.description,
    keywords: t.seo.keywords,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title: t.seo.title,
      description: t.seo.description,
      url: `${BASE_URL}/${country}/${locale}`,
      siteName: t.brand.name,
      locale: `${locale}_${country.toUpperCase()}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.seo.title,
      description: t.seo.description,
    },
    // Every country x locale in INDEXABLE_COUNTRIES x INDEXABLE_LOCALES is
    // indexed. Both sets currently track their RESOLVABLE_* counterparts, so
    // that is all 12 markets x 8 locales. Anything outside those sets still
    // resolves but ships `noindex,follow`.
    //
    // This is the indexability lever. Widening it is cheap; what makes the
    // widened surface hold up is content parity — see the note on
    // INDEXABLE_LOCALES in constants.ts.
    robots: isIndexable(country, locale)
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale: rawLocale } = await params;
  const locale = (LOCALE_CODES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "en") as Locale;
  const t = getTranslation(locale);
  const meta = LOCALES[locale];

  const orgLd = buildOrganizationJsonLd(t);
  const siteLd = buildWebsiteJsonLd(t, locale, country);

  // Slim city nav data for the header mega-menu — built server-side so the
  // full CITY_IDENTITY object never enters the client bundle. Only the
  // fields the menu actually renders (slug/name/state/nickname/themeColor)
  // are sent down.
  const cityNavItems: CityNavItem[] = INDIA_CITIES.map((c) => {
    const id = getCityIdentity(c.slug);
    return {
      slug: c.slug,
      name: c.name,
      state: c.state,
      nickname: id?.nickname,
      themeColor: id?.themeColor,
    };
  });

  // NO AggregateRating here.
  //
  // This used to emit a site-wide ProfessionalService carrying
  // `aggregateRating` 4.9 / ratingCount "50" plus a 5-star Review per
  // testimonial — on every route, including /privacy and /terms. Three
  // problems, in order of seriousness:
  //
  //  1. The numbers are invented. `ratingCount` was a hardcoded literal
  //     backed by no review corpus anywhere on the site, and every enumerated
  //     review was 5.0, so the 4.9 average could not have been computed from
  //     them. The same figures were rendered to users as fact.
  //  2. Google will not show stars for it regardless: pages where the
  //     reviewed entity controls the reviews about itself are ineligible for
  //     the review snippet feature when using LocalBusiness or Organization
  //     types. The markup could never have produced the rich result it was
  //     added for.
  //  3. The node carried no `address`, which LocalBusiness requires, so it
  //     was invalid on top of being untrue.
  //
  // The fix for stars is a Google Business Profile with real reviews, not
  // markup. Do not reintroduce ratings the site cannot substantiate.

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrains.variable} ${bodoniModa.variable} ${scriptFontClass(locale)}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
          }}
        />

        {/* Last-resort visibility net for a client that never runs JS. See
            NO-JS SAFETY NET in globals.css — the entrance animations are CSS
            now, but a few illustration components still serialise `opacity:0`
            from framer-motion, and content is never worth an effect. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>[style*="opacity:0"],[style*="opacity: 0"]' +
              "{opacity:1!important;transform:none!important}</style>",
          }}
        />

        {/* Preconnect to external origins for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Hreflang is emitted by Next.js from metadata.alternates.languages
            on each page. We deliberately do NOT emit hardcoded <link rel="alternate">
            tags here — the layout doesn't know the page path, so any tags it
            emits would point at the country root instead of the actual page.
            That mismatch (HTML hreflang vs sitemap hreflang) was killing
            cluster recognition; Google would discard the cluster and fold
            variants together. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
        />
      </head>
      <body className="min-h-screen font-sans text-foreground antialiased" suppressHydrationWarning>
        <Header
          translations={t}
          locale={locale}
          country={country}
          cities={cityNavItems}
        />
        <main className="flex-grow">{children}</main>
        <Footer translations={t} />
      </body>
    </html>
  );
}
