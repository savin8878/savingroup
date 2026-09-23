import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Clock,
  Quote,
  Sparkles,
  Tag,
  User,
  ChevronRight,
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
import { getCityPosts } from "@/lib/city-blog";
import { buildBreadcrumbJsonLd, buildCityAlternates } from "@/lib/seo";
import { Section } from "@/components/primitives/section";
import { SnapRowHint } from "@/components/primitives/snap-row-hint";
import { Cta } from "@/components/sections/Cta";
import { cityIdentityVisuals } from "@/components/illustrations/CityIdentityVisuals";
import LocalizedLink from "@/components/LocalizedLink";
import { CityPageNav } from "@/components/sections/CityPageNav";

const BLOG_PATH = "blog";

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
  if (!city) return { title: "Not found" };

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const identity = getCityIdentity(citySlug);

  const title = `${city.name} Journal — Field Notes on Building Revenue Systems in ${city.name}${identity ? ` (${identity.nickname})` : ""} · Sanat Dynamo`;
  const description = `Long-form posts on what we ship in ${city.name}: local SEO, lead routing, dealer portals, and the moves agencies serving ${city.name} consistently miss.`;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city,
    cityPath: `${city.slug}/${BLOG_PATH}`,
  });

  return {
    title,
    description,
    keywords: `${city.name} blog, ${city.name} insights, ${city.name} marketing, ${city.name} digital strategy, ${city.name} agency notes, ${city.name} case studies`,
    metadataBase: new URL(BASE_URL),
    alternates,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Sanat Dynamo",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "website",
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
  };
}

export default async function CityBlogIndexPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; city: string }>;
}) {
  const { country, locale, city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const t = getTranslation(lc);
  const identity = getCityIdentity(citySlug);
  const Identity = cityIdentityVisuals[citySlug];
  const posts = getCityPosts(citySlug);

  const homeUrl = `${BASE_URL}/${country}/${lc}`;
  const cityUrl = `${homeUrl}/cities/${city.slug}`;
  const blogUrl = `${cityUrl}/${BLOG_PATH}`;

  const themeColor = identity?.themeColor ?? "oklch(0.78 0.165 70)";
  const themeAccent = identity?.themeColorAccent ?? "oklch(0.66 0.18 295)";

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: homeUrl },
    { name: "Cities", url: `${homeUrl}/cities` },
    { name: city.name, url: cityUrl },
    { name: "Journal", url: blogUrl },
  ]);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${blogUrl}#blog`,
    name: `${city.name} Journal — Sanat Dynamo`,
    url: blogUrl,
    description: `Long-form posts on operating in ${city.name}.`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      url: `${blogUrl}/${p.slug}`,
      datePublished: p.publishedAt,
      author: { "@type": "Organization", name: t.brand.name },
    })),
  };

  // Issue number is derived from post count + a rolling baseline so the
  // editorial framing always looks credible (Issue 01 is fine; "0 posts" is not).
  const issueNumber = String(Math.max(1, posts.length)).padStart(2, "0");
  const featured = posts[0];
  const rest = posts.slice(1);

  const totalReadTime = posts.reduce((sum, p) => sum + p.readTime, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      {/* Sub-page nav strip linking the 7 city sub-pages */}
      <div className="container-px mx-auto max-w-7xl pt-20 sm:pt-24 lg:pt-28">
        <CityPageNav
          citySlug={city.slug}
          cityName={city.name}
          themeColor={identity?.themeColor}
          active="blog"
        />
      </div>

      {/* ===================================================================== */}
      {/*                       EDITORIAL MASTHEAD HERO                          */}
      {/* ===================================================================== */}
      <header className="relative isolate mt-6 overflow-hidden sm:mt-10 lg:mt-14">
        {/* breadcrumb above the masthead */}
        <div className="container-px relative z-10 mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <LocalizedLink
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Home
            </LocalizedLink>
            <ChevronRight size={11} />
            <LocalizedLink
              href="/cities"
              className="transition-colors hover:text-foreground"
            >
              Cities
            </LocalizedLink>
            <ChevronRight size={11} />
            <LocalizedLink
              href={`/cities/${city.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {city.name}
            </LocalizedLink>
            <ChevronRight size={11} />
            <span className="text-foreground">Journal</span>
          </nav>
        </div>

        {/* masthead band */}
        <div
          className="border-y"
          style={{
            borderColor: themeColor.replace(")", " / 0.3)"),
            background: `linear-gradient(140deg, ${themeColor.replace(")", " / 0.1)")}, transparent 60%)`,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full blur-3xl"
            style={{ background: themeColor.replace(")", " / 0.18)") }}
          />
          <div className="container-px relative z-10 mx-auto max-w-7xl py-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
              {/* LEFT — masthead text */}
              <div className="lg:col-span-7">
                {/* publication line */}
                <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: themeColor.replace(")", " / 0.4)"),
                      background: themeColor.replace(")", " / 0.08)"),
                      color: themeColor,
                    }}
                  >
                    <BookOpen size={11} />
                    Sanat Dynamo · {city.name} Journal
                  </span>
                  <span>VOL. I</span>
                  <span>·</span>
                  <span>ISSUE {issueNumber}</span>
                  <span>·</span>
                  <span>2026</span>
                </div>

                {/* serif-style oversized masthead title */}
                <h1 className="text-balance mt-6 font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-foreground">
                  The{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(120deg, ${themeColor}, ${themeAccent})`,
                    }}
                  >
                    {city.name}
                  </span>
                  <br />
                  Journal.
                </h1>

                {/* subtitle */}
                <p className="text-pretty mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Long-form field notes on building revenue systems where
                  buyers, agencies, and stacks collide.{" "}
                  {identity ? (
                    <>
                      Written from inside{" "}
                      <span className="font-semibold text-foreground">
                        {identity.nickname}
                      </span>
                      .
                    </>
                  ) : (
                    <>Written from inside {city.name}.</>
                  )}
                </p>

                {/* edition stats — newspaper-style */}
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6 sm:grid-cols-4 sm:gap-6"
                    style={{ borderColor: themeColor.replace(")", " / 0.2)") }}>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      In this issue
                    </dt>
                    <dd
                      className="mt-1 font-display text-2xl font-semibold tracking-tight"
                      style={{ color: themeColor }}
                    >
                      {String(posts.length).padStart(2, "0")}{" "}
                      <span className="text-sm text-muted-foreground">
                        {posts.length === 1 ? "post" : "posts"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      Total read
                    </dt>
                    <dd
                      className="mt-1 font-display text-2xl font-semibold tracking-tight"
                      style={{ color: themeColor }}
                    >
                      {totalReadTime}
                      <span className="text-sm text-muted-foreground"> min</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      Beat
                    </dt>
                    <dd className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                      Revenue systems · {city.name}
                    </dd>
                  </div>
                  <div className="hidden sm:block">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      Filed from
                    </dt>
                    <dd className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                      {city.state}, IN
                    </dd>
                  </div>
                </dl>

                {/* sub-nav: city overview / about / journal (current) */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <LocalizedLink
                    href={`/cities/${city.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {city.name} overview
                  </LocalizedLink>
                  <LocalizedLink
                    href={`/cities/${city.slug}/about`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    About {identity?.nickname ?? city.name}
                  </LocalizedLink>
                </div>
              </div>

              {/* RIGHT — city identity card */}
              <div className="lg:col-span-5">
                {Identity && (
                  <div
                    className="overflow-hidden rounded-3xl border bg-background/60 p-2 backdrop-blur-sm sm:p-3"
                    style={{
                      borderColor: themeColor.replace(")", " / 0.3)"),
                    }}
                  >
                    <Identity className="rounded-2xl" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/*                            EMPTY STATE                                  */}
      {/* ===================================================================== */}
      {posts.length === 0 && (
        <Section className="pt-12">
          <div className="rounded-3xl border border-dashed border-border bg-surface/30 p-10 text-center">
            <p className="text-muted-foreground">
              The {city.name} journal launches soon. Check back for posts on
              local revenue-system tactics — or read our pan-India journal in
              the meantime.
            </p>
            <LocalizedLink
              href="/blogs"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong hover:underline"
            >
              Pan-India journal <ArrowUpRight size={14} />
            </LocalizedLink>
          </div>
        </Section>
      )}

      {/* ===================================================================== */}
      {/*                            FEATURED POST                                */}
      {/* ===================================================================== */}
      {featured && (
        <Section className="pt-12 sm:pt-16">
          {/* divider rule with editor's note */}
          <div className="mb-10 flex items-center gap-4">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: themeColor }}
            >
              Featured · §01
            </span>
            <span
              className="h-px flex-1"
              style={{ background: themeColor.replace(")", " / 0.3)") }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Editor&apos;s pick
            </span>
          </div>

          <LocalizedLink
            href={`/cities/${city.slug}/blog/${featured.slug}`}
            className="group block"
          >
            <article className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* LEFT — large title block */}
              <div className="lg:col-span-7">
                {/* meta line — author, date, read time */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User size={11} />
                    {featured.author}
                  </span>
                  <span>·</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {featured.readTime} min read
                  </span>
                </div>

                {/* magazine-style oversized headline */}
                <h2 className="text-balance mt-5 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-4xl lg:text-[3rem]">
                  {featured.title}
                </h2>

                {/* dek / subtitle */}
                <p className="text-pretty mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {featured.subtitle}
                </p>

                {/* drop-cap excerpt */}
                <div className="mt-7">
                  <p className="text-pretty text-base leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:leading-none sm:text-lg sm:first-letter:text-6xl">
                    <span style={{ color: themeColor }}>
                      {featured.excerpt.charAt(0)}
                    </span>
                    {featured.excerpt.slice(1)}
                  </p>
                </div>

                {/* keywords as filed-under tags */}
                <div className="mt-7 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    <Tag size={9} />
                    Filed under
                  </span>
                  {featured.keywords.slice(0, 4).map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <div
                  className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all group-hover:-translate-y-0.5"
                  style={{
                    borderColor: themeColor.replace(")", " / 0.4)"),
                    background: themeColor.replace(")", " / 0.08)"),
                    color: themeColor,
                  }}
                >
                  Read the full piece
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>

              {/* RIGHT — pull-quote card with section TOC */}
              <div className="lg:col-span-5">
                <div
                  className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
                  style={{
                    borderColor: themeColor.replace(")", " / 0.3)"),
                    background: `linear-gradient(160deg, ${themeColor.replace(")", " / 0.06)")}, transparent 70%)`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-3xl"
                    style={{ background: themeColor.replace(")", " / 0.2)") }}
                  />
                  <div className="relative">
                    {/* pull quote */}
                    <Quote size={28} style={{ color: themeColor }} />
                    <p className="mt-3 font-display text-lg font-semibold leading-snug text-foreground sm:text-xl">
                      &ldquo;{featured.sections[0]?.paragraphs[0]?.slice(0, 180)}
                      …&rdquo;
                    </p>

                    {/* section TOC */}
                    <div
                      className="mt-7 border-t pt-5"
                      style={{ borderColor: themeColor.replace(")", " / 0.2)") }}
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        <Sparkles size={10} />
                        In this piece
                      </div>
                      <ol className="mt-3 space-y-2">
                        {featured.sections.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm"
                          >
                            <span
                              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-bold"
                              style={{
                                background: themeColor.replace(")", " / 0.1)"),
                                color: themeColor,
                              }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-foreground">{s.heading}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </LocalizedLink>
        </Section>
      )}

      {/* ===================================================================== */}
      {/*                            ARCHIVE / OTHER POSTS                        */}
      {/* ===================================================================== */}
      {rest.length > 0 && (
        <Section className="pt-0">
          <div className="mb-8 flex items-center gap-4">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: themeColor }}
            >
              Archive · §02
            </span>
            <span
              className="h-px flex-1"
              style={{ background: themeColor.replace(")", " / 0.3)") }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {rest.length} {rest.length === 1 ? "more piece" : "more pieces"}
            </span>
          </div>
          {/* Mobile: snap-x carousel. lg+: 3-col grid */}
          <div className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-col sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none lg:grid lg:grid-cols-3">
            {rest.map((p, i) => (
              <LocalizedLink
                key={p.slug}
                href={`/cities/${city.slug}/blog/${p.slug}`}
                className="group flex w-[82vw] max-w-[320px] flex-shrink-0 snap-start flex-col rounded-3xl border border-border bg-surface/40 p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 sm:h-full sm:w-auto sm:max-w-none sm:flex-shrink sm:p-7"
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{ color: themeColor }}
                >
                  No. {String(i + 2).padStart(2, "0")}
                </span>
                <h3 className="mt-3 flex-1 font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-xl">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  <span>{formatDate(p.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {p.readTime} min
                  </span>
                </div>
              </LocalizedLink>
            ))}
          </div>
          <SnapRowHint count={rest.length} />
        </Section>
      )}

      {/* ===================================================================== */}
      {/*                          EDITOR'S COLOPHON                              */}
      {/* ===================================================================== */}
      <Section className="pt-0">
        <div
          className="rounded-3xl border p-6 sm:p-10"
          style={{
            borderColor: themeColor.replace(")", " / 0.3)"),
            background: `linear-gradient(135deg, ${themeColor.replace(")", " / 0.05)")}, transparent 70%)`,
          }}
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Colophon
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                The {city.name} Journal is written by operators who have
                shipped revenue systems inside this metro — not from a
                content desk.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Every post tells the operational truth of the city: the buyer
                pattern, the stack, the leak, the move. We don&apos;t write
                roundups; we write what&apos;s working.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <LocalizedLink
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: themeColor,
                  color: "var(--background)",
                  boxShadow: `0 14px 36px -14px ${themeColor.replace(")", " / 0.65)")}`,
                }}
              >
                Pitch a story
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </LocalizedLink>
            </div>
          </div>
        </div>
      </Section>

      <Cta t={t} country={country} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  helpers                                   */
/* -------------------------------------------------------------------------- */

function formatDate(iso: string): string {
  // ISO-date → "MAY 06 2026" newspaper-style date stamp
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")} ${d.getUTCFullYear()}`;
}
