import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

/**
 * Site robots policy.
 *
 *  - Allow the entire public tree. Non-indexable country URLs (`/us/*`,
 *    `/de/*`, ...) are kept *crawlable* on purpose — they ship `noindex`
 *    metadata, and Google must be allowed to fetch the page to see that tag.
 *    Disallowing them here would freeze the existing index entries.
 *  - Disallow API + internal Next.js paths (no SEO value, leak surface area).
 *  - ALLOW the AI / generative-engine crawlers. We are a lead-gen agency, not
 *    a publisher with a paywall — being absent from ChatGPT / Gemini / Claude /
 *    Perplexity answers is lost discovery, not a protected moat. To be *cited*
 *    when someone asks an AI engine "best manufacturing software agency in
 *    Ahmedabad," those crawlers have to be able to read the content.
 *    (Reversed the prior "content is the moat" block on 2026-06-13 — see git
 *    history if we ever want to re-gate training-only bots.)
 *
 * The sitemap pointer fans out via `/sitemap-index.xml` → per-country
 * `/in/sitemap.xml`, which currently emits the home + 8 static pages +
 * blog index/posts/categories + 5 industries + 11 cities × (overview +
 * services + process + case-studies + contact + about + blog) sub-pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Everything else — including GPTBot, OAI-SearchBot, Google-Extended,
        // ClaudeBot, PerplexityBot, CCBot — is allowed to read the public tree.
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        // Bytespider (ByteDance) is the one exception: it crawls aggressively,
        // ignores crawl-delay, and drives ~zero referral traffic. Keep it out.
        userAgent: "Bytespider",
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap-index.xml`,
    host: BASE_URL,
  };
}
