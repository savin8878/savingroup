import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  Landmark,
  Languages,
  Lightbulb,
  MapPin,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  getTranslation,
  type Locale,
  LOCALE_CODES,
} from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { INDIA_CITIES, getCityBySlug } from "@/lib/cities";
import { getCityIdentity } from "@/lib/city-identity";
import { getCityExtras } from "@/lib/city-extras";
import { getCityPosts } from "@/lib/city-blog";
import { buildBreadcrumbJsonLd, buildCityAlternates } from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { SnapRowHint } from "@/components/primitives/snap-row-hint";
import { Cta } from "@/components/sections/Cta";
import { cityIdentityVisuals } from "@/components/illustrations/CityIdentityVisuals";
import {
  CityLeadCTA,
  CityHiddenGem,
} from "@/components/illustrations/CityPageVisuals";
import LocalizedLink from "@/components/LocalizedLink";
import { CityPageNav } from "@/components/sections/CityPageNav";

const ABOUT_PATH = "about";

/* -------------------------------------------------------------------------- */
/*                                  Static                                    */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "hi"];
  const country = "in";
  const params: Array<{ country: string; locale: string; city: string }> = [];
  for (const city of INDIA_CITIES) {
    for (const locale of locales) {
      params.push({ country, locale, city: city.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}): Promise<Metadata> {
  const { country, locale, city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  const identity = getCityIdentity(citySlug);
  if (!city || !identity) return { title: "Not found" };

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;

  const title = `About ${city.name} (${identity.nickname}) — Heritage, Industries & Why We Build Here · Sanat Dynamo`;
  const description = `${city.name} is ${identity.nickname.toLowerCase()}: ${identity.tagline} ${identity.nicknameOrigin.split(".")[0]}.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city,
    cityPath: `${city.slug}/${ABOUT_PATH}`,
  });

  return {
    title,
    description,
    keywords: `about ${city.name}, ${identity.nickname}, why is ${city.name} called ${identity.nickname}, ${city.name} landmarks, ${city.name} history, ${city.name} industries, ${city.name} economy, ${identity.landmarks.map((l) => l.name).join(", ")}`,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "article",
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og.png`],
    },
    robots: isIndexable(country, lc)
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
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    other: {
      "geo.country": "IN",
      "geo.region": `IN-${city.stateCode}`,
      "geo.placename": city.name,
      "geo.position": `${city.geo.lat};${city.geo.lng}`,
      ICBM: `${city.geo.lat}, ${city.geo.lng}`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default async function CityAboutPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}) {
  const { country, locale, city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  const identity = getCityIdentity(citySlug);
  const extras = getCityExtras(citySlug);

  if (!city || !identity) notFound();

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const t = getTranslation(lc);
  const Identity = cityIdentityVisuals[citySlug];
  const posts = getCityPosts(citySlug);

  const phoneDisplay = t.contact.details.phone;
  const whatsappE164 = phoneDisplay.replace(/[^\d]/g, "");

  const homeUrl = `${BASE_URL}/${country}/${lc}`;
  const cityUrl = `${homeUrl}/cities/${city.slug}`;
  const aboutUrl = `${cityUrl}/${ABOUT_PATH}`;

  // Breadcrumb: Home → Cities → {City} → About
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: homeUrl },
    { name: "Cities", url: `${homeUrl}/cities` },
    { name: city.name, url: cityUrl },
    { name: "About", url: aboutUrl },
  ]);

  // Place schema — surfaces in Google Knowledge Panel-style results
  const placeLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${aboutUrl}#place`,
    name: `${city.name} — ${identity.nickname}`,
    alternateName: identity.nicknameRegional,
    description: identity.tagline,
    url: aboutUrl,
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.geo.lat,
      longitude: city.geo.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "IN",
    },
    containsPlace: identity.landmarks.map((l) => ({
      "@type": "LandmarksOrHistoricalBuildings",
      name: l.name,
      description: l.meaning,
    })),
  };

  // ItemList — landmarks as an ordered list with anchor URLs back to the
  // page. ItemList is what powers Google's "carousel" rich result, and the
  // per-landmark anchor URLs make each entry independently linkable.
  const landmarksItemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${aboutUrl}#landmarks`,
    name: `Landmarks of ${city.name}`,
    description: `The defining places of ${city.name} — what each one stands for in the city's identity.`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: identity.landmarks.length,
    itemListElement: identity.landmarks.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LandmarksOrHistoricalBuildings",
        name: l.name,
        description: l.meaning,
        url: `${aboutUrl}#${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        containedInPlace: { "@id": `${aboutUrl}#place` },
      },
    })),
  };

  // Article schema — this is editorial about-content, not a service page
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${aboutUrl}#article`,
    headline: `About ${city.name} (${identity.nickname})`,
    description: identity.tagline,
    url: aboutUrl,
    datePublished: "2026-05-08",
    dateModified: "2026-05-08",
    author: {
      "@type": "Organization",
      name: t.brand.name,
      url: homeUrl,
    },
    publisher: {
      "@type": "Organization",
      name: t.brand.name,
      url: homeUrl,
    },
    about: { "@id": `${aboutUrl}#place` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landmarksItemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <PageHero
        eyebrow={`About ${city.name}`}
        title={
          <>
            {city.name} —{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(120deg, ${identity.themeColor}, ${identity.themeColorAccent})`,
              }}
            >
              {identity.nickname}
            </span>
            {identity.nicknameRegional && (
              <>
                <br />
                <span className="text-[0.5em] text-muted-foreground">
                  {identity.nicknameRegional}
                </span>
              </>
            )}
          </>
        }
        subtitle={identity.tagline}
        breadcrumb={`${city.name} · About`}
      />

      {/* Unified sub-page nav — links all 7 city sub-pages, current highlighted */}
      <div className="container-px mx-auto max-w-7xl pt-4 sm:pt-6">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity.themeColor}
          active="about"
        />
      </div>

      {/* Identity hero visual */}
      <Section className="pt-6">
        <CityIdentityHero identity={identity} city={city} Identity={Identity} />
      </Section>

      {/* Lead CTA cluster — early on the about page so visitors can act */}
      <Section className="pt-0">
        <CityLeadCTA
          city={city}
          whatsappNumber={whatsappE164}
          phoneNumber={phoneDisplay}
        />
      </Section>

      {/* Why is it called X — the SEO money block */}
      <Section className="pt-0">
        <NicknameOriginBlock identity={identity} cityName={city.name} />
      </Section>

      {/* History — 2-3 paragraph rich text */}
      <Section className="pt-0">
        <HistoryBlock identity={identity} cityName={city.name} />
      </Section>

      {/* Landmarks grid */}
      <Section className="pt-0">
        <LandmarksBlock identity={identity} cityName={city.name} />
      </Section>

      {/* Culture beats */}
      <Section className="pt-0">
        <CultureBlock identity={identity} cityName={city.name} />
      </Section>

      {/* Economic anchors */}
      <Section className="pt-0">
        <EconomicAnchorsBlock identity={identity} cityName={city.name} />
      </Section>

      {/* Why we serve here — the bridge to commercial pitch */}
      <Section className="pt-0">
        <WhyWeServeBlock identity={identity} cityName={city.name} />
      </Section>

      {/* Hidden gem — operational edge */}
      {extras && (
        <Section className="pt-0">
          <CityHiddenGem extras={extras} cityName={city.name} />
        </Section>
      )}

      {/* Did you know strip */}
      <Section className="pt-0">
        <DidYouKnowBlock identity={identity} />
      </Section>

      {/* Recent posts on the city blog */}
      {posts.length > 0 && (
        <Section className="pt-0">
          <RecentPostsBlock cityName={city.name} citySlug={city.slug} posts={posts} />
        </Section>
      )}

      <Cta t={t} country={country} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Blocks                                   */
/* -------------------------------------------------------------------------- */

function CityIdentityHero({
  identity,
  city,
  Identity,
}: {
  identity: ReturnType<typeof getCityIdentity>;
  city: ReturnType<typeof getCityBySlug>;
  Identity: React.ComponentType<{ className?: string }> | undefined;
}) {
  if (!identity || !city) return null;
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-10"
      style={{
        borderColor: identity.themeColor.replace(")", " / 0.3)"),
        background: `linear-gradient(160deg, ${identity.themeColor.replace(")", " / 0.08)")}, ${identity.themeColorAccent.replace(")", " / 0.04)")} 60%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: identity.themeColor.replace(")", " / 0.18)") }}
      />
      <div className="relative grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{
              borderColor: identity.themeColor.replace(")", " / 0.4)"),
              background: identity.themeColor.replace(")", " / 0.08)"),
              color: identity.themeColor,
            }}
          >
            <Landmark size={11} />
            City identity · {identity.nickname}
          </div>
          <h2 className="text-balance mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            The visual identity of {city.name}.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {identity.tagline}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {identity.foundedYear && (
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Calendar size={10} />
                  Founded
                </div>
                <div
                  className="mt-1 font-display text-lg font-semibold tracking-tight"
                  style={{ color: identity.themeColor }}
                >
                  {identity.foundedYear}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <Languages size={10} />
                We work in
              </div>
              <div className="mt-1 text-xs font-semibold text-foreground">
                {identity.languages.join(" · ")}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {Identity && <Identity className="rounded-2xl border border-border/60 bg-background/40 p-2 sm:p-4" />}
        </div>
      </div>
    </div>
  );
}

function NicknameOriginBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-4">
        <Eyebrow>Why the nickname</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Why is {cityName} called {identity.nickname}?
        </h2>
      </div>
      <div className="lg:col-span-8">
        <div
          className="rounded-3xl border-l-4 bg-surface/40 p-6 sm:p-8"
          style={{ borderColor: identity.themeColor }}
        >
          <Quote
            size={24}
            className="mb-3"
            style={{ color: identity.themeColor }}
          />
          <p className="text-pretty text-base leading-relaxed text-foreground sm:text-lg">
            {identity.nicknameOrigin}
          </p>
        </div>
      </div>
    </div>
  );
}

function HistoryBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div>
      <div className="max-w-3xl">
        <Eyebrow>Heritage</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          A short history of {cityName}.
        </h2>
      </div>
      {/* Mobile: snap-x carousel. lg+: 3-col grid */}
      <div className="mt-8 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid lg:grid-cols-3">
        {identity.history.map((para, i) => (
          <article
            key={i}
            className="w-[82vw] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface/40 p-5 sm:w-auto sm:max-w-none sm:flex-shrink sm:p-6"
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: identity.themeColor }}
            >
              Era · 0{i + 1}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
              {para}
            </p>
          </article>
        ))}
      </div>
      <SnapRowHint count={identity.history.length} />
    </div>
  );
}

function LandmarksBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div>
      <div className="max-w-3xl">
        <Eyebrow>Landmarks</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          The places that define {cityName}.
        </h2>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {identity.landmarks.map((l, i) => (
          <article
            key={l.name}
            id={l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className="group relative scroll-mt-32 overflow-hidden rounded-2xl border border-border bg-surface/40 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-0.5 transition-all group-hover:w-1"
              style={{
                background: `linear-gradient(180deg, ${identity.themeColor}, transparent)`,
              }}
            />
            <div className="flex items-start gap-3 pl-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-[10px] font-bold"
                style={{
                  borderColor: identity.themeColor.replace(")", " / 0.4)"),
                  background: identity.themeColor.replace(")", " / 0.08)"),
                  color: identity.themeColor,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {l.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {l.meaning}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CultureBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div>
      <div className="max-w-3xl">
        <Eyebrow>Culture</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          What it feels like to live in {cityName}.
        </h2>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {identity.culture.map((c) => (
          <article
            key={c.category}
            className="rounded-2xl border border-border bg-surface/40 p-5"
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{
                borderColor: identity.themeColor.replace(")", " / 0.4)"),
                color: identity.themeColor,
              }}
            >
              {c.category}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function EconomicAnchorsBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div>
      <div className="max-w-3xl">
        <Eyebrow>Economy</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          What {cityName} ships to the world.
        </h2>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {identity.economy.map((e, i) => (
          <article
            key={e.cluster}
            className="group rounded-3xl border border-border bg-surface/40 p-6 transition-all hover:border-accent/40 sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: identity.themeColor.replace(")", " / 0.1)"),
                  color: identity.themeColor,
                }}
              >
                <TrendingUp size={18} strokeWidth={1.75} />
              </div>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground"
              >
                Cluster · 0{i + 1}
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {e.cluster}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {e.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function WhyWeServeBlock({
  identity,
  cityName,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
  cityName: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-10"
      style={{
        borderColor: identity.themeColor.replace(")", " / 0.3)"),
        background: `linear-gradient(140deg, ${identity.themeColor.replace(")", " / 0.07)")}, transparent 70%)`,
      }}
    >
      <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Eyebrow>Why we build here</Eyebrow>
          <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            What we ship in {cityName} that nobody else does.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {identity.whyWeServe}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div
            className="rounded-3xl border-l-4 bg-background/70 p-5"
            style={{ borderColor: identity.themeColor }}
          >
            <Lightbulb
              size={20}
              style={{ color: identity.themeColor }}
              className="mb-3"
            />
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Our wedge in {cityName}
            </div>
            <div
              className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight"
              style={{ color: identity.themeColor }}
            >
              {identity.tagline.split(":")[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DidYouKnowBlock({
  identity,
}: {
  identity: NonNullable<ReturnType<typeof getCityIdentity>>;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
      <Eyebrow>Did you know</Eyebrow>
      {/* Mobile: snap-x carousel. sm+: 3-col grid */}
      <div className="mt-6 -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {identity.didYouKnow.map((fact, i) => (
          <article
            key={i}
            className="w-[78vw] max-w-[300px] flex-shrink-0 snap-start rounded-2xl border border-border bg-background/60 p-5 sm:w-auto sm:max-w-none sm:flex-shrink"
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: identity.themeColor }}
            >
              Fact · 0{i + 1}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {fact}
            </p>
          </article>
        ))}
      </div>
      <SnapRowHint count={identity.didYouKnow.length} />
    </div>
  );
}

function RecentPostsBlock({
  cityName,
  citySlug,
  posts,
}: {
  cityName: string;
  citySlug: string;
  posts: ReturnType<typeof getCityPosts>;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <Eyebrow>{cityName} journal</Eyebrow>
        <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          Field notes from operating in {cityName}.
        </h2>
      </div>
      <div className="lg:col-span-5 lg:text-right">
        <LocalizedLink
          href={`/cities/${citySlug}/blog`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent-strong"
        >
          Open full {cityName} journal
          <ArrowUpRight size={14} />
        </LocalizedLink>
      </div>
      <div className="lg:col-span-12">
        {/* Mobile: snap-x carousel. sm+: 2/3-col grid */}
        <div className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <LocalizedLink
              key={p.slug}
              href={`/cities/${citySlug}/blog/${p.slug}`}
              className="group w-[82vw] max-w-[320px] flex-shrink-0 snap-start rounded-3xl border border-border bg-surface/40 p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 sm:w-auto sm:max-w-none sm:flex-shrink"
            >
              <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                <span>{p.publishedAt}</span>
                <span>{p.readTime} min</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {p.excerpt}
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-strong">
                Read post <ArrowUpRight size={12} />
              </div>
            </LocalizedLink>
          ))}
        </div>
        <SnapRowHint count={Math.min(posts.length, 3)} />
      </div>
    </div>
  );
}
