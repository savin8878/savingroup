import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

/**
 * Site robots policy.
 *
 *  - Allow the entire public tree. Every country × locale combination in
 *    RESOLVABLE_COUNTRIES × RESOLVABLE_LOCALES is indexable (see
 *    `constants.ts`), so every one of them must be crawlable.
 *  - Disallow `/api/` only. `/_next/` must NOT be disallowed: every stylesheet
 *    and every JS chunk the pages load lives under `/_next/static/`, and
 *    blocking it stops Googlebot's renderer from seeing the page as a user
 *    does. It also hides the framer-motion transitions that move elements out
 *    of their serialized `opacity:0` initial state, so the rendered page comes
 *    back visually empty. Next.js assets carry immutable content-hashed
 *    filenames and are not indexable as documents, so there is no
 *    duplicate-content reason to block them.
 *  - ALLOW the AI / generative-engine crawlers. We are a lead-gen agency, not
 *    a publisher with a paywall — being absent from ChatGPT / Gemini / Claude /
 *    Perplexity answers is lost discovery, not a protected moat. To be *cited*
 *    when someone asks an AI engine "best manufacturing software agency in
 *    Ahmedabad," those crawlers have to be able to read the content.
 *    (Reversed the prior "content is the moat" block on 2026-06-13 — see git
 *    history if we ever want to re-gate training-only bots.)
 *
 * The sitemap pointer fans out via `/sitemap-index.xml` → one
 * `/{country}/sitemap.xml` per INDEXABLE_COUNTRIES entry, each emitting
 * home + 8 static pages + blog index/posts/categories + 5 industries +
 * 11 city overviews + 11 city blog posts, per indexable locale.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Everything else — including GPTBot, OAI-SearchBot, Google-Extended,
        // ClaudeBot, PerplexityBot, CCBot — is allowed to read the public tree.
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
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
