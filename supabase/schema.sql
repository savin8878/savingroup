-- Blog posts table. Run this once in the Supabase SQL editor, then run seed.sql.
-- Nested content (sections, keywords, faq, ...) is stored as jsonb and matches
-- the BlogPost types in src/lib/blogs.ts.

create table if not exists public.blog_posts (
  slug              text primary key,
  title             text not null,
  subtitle          text not null default '',
  excerpt           text not null default '',
  category          text not null
                    check (category in ('growth', 'automation', 'seo', 'case-study', 'ops')),
  read_time         integer not null default 5,
  published_at      date not null,
  updated_at        date,
  -- { "name": "...", "role": "...", "bio": "..." }
  author            jsonb not null,
  hero_sketch       text not null
                    check (hero_sketch in ('auditLens', 'leakyFunnel', 'whatsappFlow', 'layerStack', 'seoPeakGraph', 'procurementFlow')),
  -- { "primary", "secondary": [], "searchVolume", "difficulty", "intent" }
  keywords          jsonb not null,
  takeaways         jsonb not null default '[]'::jsonb,
  -- [{ "heading", "paragraphs": [], "bullets"?: [], "callout"?: { "title", "body" }, "pullQuote"?, "embed"?: "procurement" }]
  sections          jsonb not null default '[]'::jsonb,
  tags              jsonb not null default '[]'::jsonb,
  related_slugs     jsonb not null default '[]'::jsonb,
  -- [{ "href", "label", "note" }]
  cross_page_links  jsonb,
  -- [{ "question", "answer" }]
  faq               jsonb,
  featured          boolean not null default false,
  popularity_score  integer,
  -- { "hi": { "title", "subtitle", "excerpt" }, ... }
  translations      jsonb,
  -- Display order (also drives prev/next navigation). Lower = first.
  sort_order        integer not null default 0,
  -- Set false to hide a post without deleting it.
  published         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- `create table if not exists` leaves an existing table's constraints alone,
-- so re-apply the hero_sketch list here. Keep it in sync with BlogSketchKey.
alter table public.blog_posts drop constraint if exists blog_posts_hero_sketch_check;
alter table public.blog_posts add constraint blog_posts_hero_sketch_check
  check (hero_sketch in ('auditLens', 'leakyFunnel', 'whatsappFlow', 'layerStack', 'seoPeakGraph', 'procurementFlow'));

create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_sort_idx on public.blog_posts (sort_order);

-- Public read access to published posts only. Writes go through the
-- Supabase dashboard / service role, which bypasses RLS.
alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are public" on public.blog_posts;
create policy "Published blog posts are public"
  on public.blog_posts for select
  to anon, authenticated
  using (published = true);
