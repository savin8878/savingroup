# Blog database (Supabase)

Blog posts live in the `public.blog_posts` table. Everything else about the
blog (categories, topic clusters, UI text, design) stays in the codebase.

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | Table, constraints, RLS. Safe to re-run. |
| `reader-role.sql` | Read-only `blog_reader` role the site connects as. |
| `seed.sql` | The original posts (generated — `node supabase/generate-seed.ts`). Upserts every column, so re-running it overwrites dashboard edits to those posts. |
| `blog-posts.seed.ts` | Source for `seed.sql`. |

## Environment

See `.env.example`. On Vercel set **`DATABASE_URL`** (the `blog_reader`
connection string from `.env.local`) and optionally `BLOG_REVALIDATE_SECRET`.
Never put `DIRECT_URL` (admin) on Vercel. A build without `DATABASE_URL`
fails on purpose rather than shipping an empty blog.

## Editing posts

Use the Supabase Table Editor on `blog_posts`:

- `published = false` hides a post; `sort_order` sets list order and prev/next.
- Nested fields are JSON (`sections`, `keywords`, `faq`, `author`, …) with the
  shapes described in `schema.sql` and `src/lib/blogs.ts`. A row with an
  invalid `author.name`, `keywords.primary`, `category` or `hero_sketch` is
  skipped and logged instead of breaking the blog.
- A section with `"embed": "procurement"` renders the interactive procurement
  walkthrough after its text.

Changes appear within ~6 minutes. For instant updates, create a Database
Webhook (Database → Webhooks) on `blog_posts` for insert/update/delete:
`POST https://www.savingroup.in/api/revalidate/blog` with HTTP header
`x-revalidate-secret: <BLOG_REVALIDATE_SECRET>`.

## Connection security

The site connects as `blog_reader` (SELECT on published posts only) with full
TLS verification against the pinned Supabase root CA (`src/lib/supabase-ca.ts`).

## Newsroom table

Short industry stories live in `public.news_posts` (`news-schema.sql`, safe to
re-run). They are written automatically by the Savin Group publisher — the
`lib/sanat` pipeline in the sibling `automation` project — which connects with
the admin `DIRECT_URL`, upserts rows on `slug`, and then calls
`POST /api/revalidate/blog` so the story is live immediately. The site reads
the table through the same read-only `blog_reader` role as the blog
(`news-schema.sql` grants it SELECT on published rows).

The newsroom renders at `/{country}/{locale}/newsroom`, with one page per
desk (`/newsroom/category/{ai|automation|manufacturing|software|markets|policy}`)
and one per story (`/newsroom/{slug}`). A project without the table renders an
empty newsroom rather than failing the build.
