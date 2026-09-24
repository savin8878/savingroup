import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Sparkles,
  User,
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
import { getCityPosts, getCityPost } from "@/lib/city-blog";
import {
  buildBreadcrumbJsonLd,
  buildCityAlternates,
  buildFaqJsonLd,
} from "@/lib/seo";
import { PageHero } from "@/components/sections/PageHero";
import { Section, Eyebrow } from "@/components/primitives/section";
import { Cta } from "@/components/sections/Cta";
import {
  CityLeadCTA,
} from "@/components/illustrations/CityPageVisuals";
import LocalizedLink from "@/components/LocalizedLink";

const BLOG_PATH = "blog";

type RouteParams = {
  country: string;
  locale: string;
  city: string;
  slug: string;
};

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "hi"];
  const country = "in";
  const params: Array<RouteParams> = [];
  for (const city of INDIA_CITIES) {
    const posts = getCityPosts(city.slug);
    for (const locale of locales) {
      for (const p of posts) {
        params.push({ country, locale, city: city.slug, slug: p.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { country, locale, city: citySlug, slug } = await params;
  const city = getCityBySlug(citySlug);
  const post = getCityPost(citySlug, slug);
  if (!city || !post) return { title: "Not found" };

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;

  const alternates = buildCityAlternates({
    country,
    locale: lc,
    city,
    cityPath: `${city.slug}/${BLOG_PATH}/${post.slug}`,
  });

  return {
    title: `${post.title} · ${city.name} Journal · Savin Group`,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
    metadataBase: new URL(BASE_URL),
    alternates,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}${alternates.canonical}`,
      siteName: "Savin Group",
      locale: `${lc}_${country.toUpperCase()}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
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
    },
  };
}

export default async function CityBlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { country, locale, city: citySlug, slug } = await params;
  const city = getCityBySlug(citySlug);
  const post = getCityPost(citySlug, slug);
  if (!city || !post) notFound();

  const lc = (LOCALE_CODES.includes(locale as Locale) ? locale : "en") as Locale;
  const t = getTranslation(lc);
  const identity = getCityIdentity(citySlug);

  const phoneDisplay = t.contact.details.phone;
  const whatsappE164 = phoneDisplay.replace(/[^\d]/g, "");

  const homeUrl = `${BASE_URL}/${country}/${lc}`;
  const cityUrl = `${homeUrl}/cities/${city.slug}`;
  const blogUrl = `${cityUrl}/${BLOG_PATH}`;
  const postUrl = `${blogUrl}/${post.slug}`;

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t.nav.home, url: homeUrl },
    { name: "Cities", url: `${homeUrl}/cities` },
    { name: city.name, url: cityUrl },
    { name: "Journal", url: blogUrl },
    { name: post.title, url: postUrl },
  ]);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: t.brand.name,
      url: homeUrl,
    },
    keywords: post.keywords.join(", "),
    inLanguage: lc,
    about: {
      "@type": "Place",
      name: city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: "IN",
      },
    },
    image: `${BASE_URL}/og.png`,
  };

  const faqLd = buildFaqJsonLd(post.faq.map((f) => ({ q: f.q, a: f.a })));

  const otherPosts = getCityPosts(city.slug).filter((p) => p.slug !== post.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <PageHero
        eyebrow={`${city.name} journal`}
        title={
          <>
            {post.title.split(" — ")[0]}
            {post.title.includes(" — ") && (
              <>
                {" — "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: identity
                      ? `linear-gradient(120deg, ${identity.themeColor}, ${identity.themeColorAccent})`
                      : undefined,
                  }}
                >
                  {post.title.split(" — ").slice(1).join(" — ")}
                </span>
              </>
            )}
          </>
        }
        subtitle={post.subtitle}
        breadcrumb={`${city.name} · Journal`}
      />

      {/* Meta strip */}
      <Section className="pt-6">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <LocalizedLink
            href={`/cities/${city.slug}/blog`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-foreground"
          >
            <ArrowLeft size={11} />
            Back to {city.name} journal
          </LocalizedLink>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5">
            <Calendar size={11} />
            {post.publishedAt}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5">
            <Clock size={11} />
            {post.readTime} min read
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5">
            <User size={11} />
            {post.author}
          </span>
        </div>
      </Section>

      {/* Body */}
      <Section className="pt-8">
        <article className="grid gap-12 lg:grid-cols-12">
          {/* Sidebar TOC */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <div
                className="rounded-2xl border bg-surface/40 p-5"
                style={{
                  borderColor:
                    identity?.themeColor.replace(")", " / 0.3)") ??
                    "var(--border)",
                }}
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Sparkles size={11} />
                  Sections
                </div>
                <nav className="mt-4 space-y-2">
                  {post.sections.map((s, i) => (
                    <a
                      key={i}
                      href={`#section-${i + 1}`}
                      className="block rounded-lg border border-border bg-background/60 px-3 py-2 text-xs leading-tight text-foreground transition-colors hover:border-accent/40 hover:text-accent-strong"
                    >
                      <span
                        className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.22em]"
                        style={{
                          color: identity?.themeColor ?? "var(--accent)",
                        }}
                      >
                        §{String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  ))}
                </nav>

                <div className="mt-5 border-t border-border pt-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Keywords
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.keywords.slice(0, 4).map((k) => (
                      <span
                        key={k}
                        className="rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Body */}
          <div className="lg:col-span-9">
            {/* Excerpt callout */}
            <div
              className="rounded-2xl border-l-4 bg-surface/40 p-5 sm:p-6"
              style={{ borderColor: identity?.themeColor ?? "var(--accent)" }}
            >
              <p className="text-pretty text-base leading-relaxed text-foreground sm:text-lg">
                {post.excerpt}
              </p>
            </div>

            {/* Sections */}
            <div className="mt-10 space-y-12">
              {post.sections.map((section, i) => (
                <section
                  key={i}
                  id={`section-${i + 1}`}
                  className="scroll-mt-32"
                >
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: identity?.themeColor ?? "var(--accent)" }}
                  >
                    §{String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-balance mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((p, pi) => (
                      <p
                        key={pi}
                        className="text-base leading-relaxed text-muted-foreground sm:text-lg"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                      {section.bullets.map((b, bi) => (
                        <li
                          key={bi}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground sm:text-base"
                        >
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full"
                            style={{
                              background:
                                identity?.themeColor ?? "var(--accent)",
                            }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.callout && (
                    <div
                      className="mt-6 rounded-2xl border p-5 sm:p-6"
                      style={{
                        borderColor:
                          identity?.themeColor.replace(")", " / 0.4)") ??
                          "var(--accent)",
                        background:
                          identity?.themeColor.replace(")", " / 0.06)") ??
                          "var(--accent-soft)",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
                        style={{
                          color: identity?.themeColor ?? "var(--accent)",
                        }}
                      >
                        <Sparkles size={11} />
                        {section.callout.title}
                      </div>
                      <p className="mt-3 text-base leading-relaxed text-foreground">
                        {section.callout.body}
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-16">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                Common questions on this post.
              </h2>
              <div className="mt-6 divide-y divide-border rounded-3xl border border-border bg-surface/40">
                {post.faq.map((qa, i) => (
                  <details
                    key={qa.q}
                    open={i === 0}
                    className="group p-5 sm:p-6 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-4 text-left">
                      <span className="font-display text-base font-semibold leading-snug text-foreground sm:text-lg">
                        {qa.q}
                      </span>
                      <Plus
                        size={18}
                        className="mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                        style={{ color: identity?.themeColor ?? "var(--accent)" }}
                      />
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {qa.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </article>
      </Section>

      {/* Lead CTA — at the bottom, after the long read */}
      <Section className="pt-0">
        <CityLeadCTA
          city={city}
          whatsappNumber={whatsappE164}
          phoneNumber={phoneDisplay}
        />
      </Section>

      {/* Other posts */}
      {otherPosts.length > 0 && (
        <Section className="pt-0">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Eyebrow>Other {city.name} posts</Eyebrow>
              <h2 className="text-balance mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                Keep reading the {city.name} journal.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <LocalizedLink
                href={`/cities/${city.slug}/blog`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent-strong"
              >
                All {city.name} posts
                <ArrowUpRight size={14} />
              </LocalizedLink>
            </div>
            <div className="lg:col-span-12">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherPosts.slice(0, 3).map((p) => (
                  <LocalizedLink
                    key={p.slug}
                    href={`/cities/${city.slug}/blog/${p.slug}`}
                    className="group rounded-3xl border border-border bg-surface/40 p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      {p.publishedAt} · {p.readTime} min
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {p.excerpt}
                    </p>
                  </LocalizedLink>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      <Cta t={t} country={country} />
    </>
  );
}
