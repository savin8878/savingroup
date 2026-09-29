import { getTranslation } from "@/lib/i18n";
import { INDUSTRY_DATA, INDUSTRY_SLUGS } from "@/lib/industry-data";
import { INDIA_CITIES } from "@/lib/cities";
import { SITE_ORIGIN, normalizePublicUrl } from "@/lib/public-url";

// /llms.txt (https://llmstxt.org): a Markdown map of the site for language
// models and agents. Lighthouse's `llms-txt` audit requires an H1, at least
// one Markdown link and more than 50 characters.
//
// Everything is read from the repo (translations, industry and city data), so
// the file changes only on deploy and needs no database. Links point at the
// default market, /in/en; the other markets are reachable through the sitemap
// index listed at the end.
export const dynamic = "force-static";

const page = (pathname = "") => normalizePublicUrl({ country: "in", locale: "en", pathname });

function render(): string {
  const t = getTranslation("en");
  const lines = [
    `# ${t.brand.name}`,
    "",
    `> ${t.brand.oneLiner}`,
    "",
    t.seo.description,
    "",
    "Every page is published per market and language at /{country}/{locale}/ (for example /us/en/ or /in/hi/). The links below use the default edition, India in English.",
    "",
    "## Main pages",
    "",
    `- [Home](${page()}): what ${t.brand.name} builds and for whom`,
    `- [Services](${page("services")}): custom software, AI automation and SEO`,
    `- [Industries](${page("industries")}): the sectors we build revenue systems for`,
    `- [Pricing](${page("pricing")}): engagement models and indicative prices`,
    `- [Case studies](${page("case-studies")}): delivered projects and their results`,
    `- [About](${page("about")}): the team and how we work`,
    `- [Contact](${page("contact")}): start a project or ask a question`,
    "",
    "## Industries",
    "",
    ...INDUSTRY_SLUGS.map((slug) => {
      const industry = INDUSTRY_DATA[slug];
      return `- [${industry.serviceType}](${page(`industries/${slug}`)}): ${industry.metaDescription}`;
    }),
    "",
    "## Cities in India",
    "",
    ...INDIA_CITIES.map((city) => `- [${city.name}](${page(`cities/${city.slug}`)}): ${city.state}`),
    "",
    "## Insights",
    "",
    `- [Blog](${page("blogs")}): guides on software, automation and growth`,
    `- [Newsroom](${page("newsroom")}): company and industry news`,
    "",
    "## Optional",
    "",
    `- [Sitemap index](${SITE_ORIGIN}/sitemap-index.xml): every indexable URL, per country`,
    `- [Privacy policy](${page("privacy")})`,
    `- [Terms of service](${page("terms")})`,
    "",
  ];
  return lines.join("\n");
}

export function GET() {
  return new Response(render(), {
    // text/plain rather than text/markdown: browsers download the latter
    // instead of showing it.
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
