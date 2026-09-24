-- Read-only role the website connects as (DATABASE_URL). It can only SELECT
-- published blog posts; it cannot write, and it does not bypass RLS.
-- Already applied to the project. To recreate it (e.g. new project), replace
-- the password and run this in the SQL editor, then build DATABASE_URL as
--   postgresql://blog_reader.<project-ref>:<password>@<pooler-host>:6543/postgres
create role blog_reader login password 'CHANGE-ME' nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant usage on schema public to blog_reader;
grant select on public.blog_posts to blog_reader;

drop policy if exists "Blog reader sees published posts" on public.blog_posts;
create policy "Blog reader sees published posts"
  on public.blog_posts for select
  to blog_reader
  using (published = true);
