-- Newsroom table for the sanat-dynamo site (www.savingroup.in).
-- Idempotent: safe to run on every publish and in the Supabase SQL editor.
-- Nested content is jsonb and matches the NewsPost types in the site's
-- src/lib/news.ts. The automation publisher (lib/sanat) owns this file; the
-- site keeps a copy at supabase/news-schema.sql for manual setup.

create table if not exists public.news_posts (
  slug              text primary key,
  title             text not null,
  dek               text not null default '',
  excerpt           text not null default '',
  category          text not null
                    check (category in ('ai', 'automation', 'manufacturing', 'software', 'markets', 'policy')),
  read_time         integer not null default 3,
  published_at      timestamptz not null default now(),
  updated_at        timestamptz,
  -- { "name": "...", "role": "...", "bio": "..." }
  author            jsonb not null,
  hero_sketch       text not null default 'layerStack'
                    check (hero_sketch in ('auditLens', 'leakyFunnel', 'whatsappFlow', 'layerStack', 'seoPeakGraph', 'procurementFlow')),
  -- { "primary", "secondary": [], "intent" }
  keywords          jsonb not null default '{}'::jsonb,
  takeaways         jsonb not null default '[]'::jsonb,
  -- [{ "heading", "paragraphs": [], "bullets"?: [], "callout"?: { "title", "body" }, "pullQuote"? }]
  sections          jsonb not null default '[]'::jsonb,
  -- [{ "url", "title", "publisher" }]
  sources           jsonb not null default '[]'::jsonb,
  tags              jsonb not null default '[]'::jsonb,
  related_slugs     jsonb not null default '[]'::jsonb,
  -- [{ "question", "answer" }]
  faq               jsonb,
  featured          boolean not null default false,
  -- Editorial weight 0-100 (drives the lead story and "most important" rail).
  priority          integer not null default 50,
  -- { "hi": { "title", "dek", "excerpt" }, ... }
  translations      jsonb,
  -- Set false to hide a story without deleting it.
  published         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists news_posts_published_at_idx on public.news_posts (published_at desc);
create index if not exists news_posts_category_idx on public.news_posts (category);

alter table public.news_posts enable row level security;

drop policy if exists "Published news posts are public" on public.news_posts;
create policy "Published news posts are public"
  on public.news_posts for select
  to anon, authenticated
  using (published = true);

-- The site connects as the read-only blog_reader role (see supabase/reader-role.sql
-- over there). Grant it SELECT when the role exists; a fresh project without the
-- role still gets a working table.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'blog_reader') then
    grant usage on schema public to blog_reader;
    grant select on public.news_posts to blog_reader;
    drop policy if exists "News reader sees published posts" on public.news_posts;
    create policy "News reader sees published posts"
      on public.news_posts for select
      to blog_reader
      using (published = true);
  end if;
end $$;
