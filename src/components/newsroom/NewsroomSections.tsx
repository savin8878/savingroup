import type { ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import bi from "@/components/blog/index/BlogIndex.module.css";
import cat from "@/components/blog/category/Category.module.css";
import { FigureArt } from "@/components/blog/BlogFigures";
import { OperationsScene } from "@/components/home/TechnicalVisuals";
import { BlogEyebrow, BlogSection, Breadcrumbs, Chapter, MetaLine, SectionHeading, TagList, revealStyle } from "@/components/blog/BlogPrimitives";
import { LibraryFilter, type LibraryEntry } from "@/components/blog/index/LibraryFilter";
import { NEWS_CATEGORY_SKETCH, type NewsCategory, type NewsPost } from "@/lib/news";
import type { NewsroomCopy } from "./copy/newsroom-copy";
import { NewsCard, NewsGrid, deskHref, deskLabel, newsHref } from "./NewsPrimitives";
import ns from "./Newsroom.module.css";

/**
 * Sections of the newsroom index — the home page's chaptered structure
 * (eyebrow → hero plate → numbered chapters → dark band → FAQ → closing band)
 * applied to a daily industry desk. Server components; render inside
 * <BlogMotion>. Pass already-localized stories.
 */

const pad = (n: number) => String(n).padStart(2, "0");
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

export interface DeskCount { key: NewsCategory | "all"; count: number }

/* ── 00 · Hero ─────────────────────────────────────────────────────────── */

export function NewsroomHero({ copy, total, lead, updated, counts }: {
  copy: NewsroomCopy; total: number; lead?: NewsPost; updated?: string; counts: DeskCount[];
}) {
  return (
    <section className={blog.hero} aria-labelledby="newsroom-title" id="newsroom-hero">
      <div className={home.container}>
        <Breadcrumbs className={ns.crumbs} items={[{ label: copy.home, href: "/" }, { label: copy.breadcrumb }]} label={copy.breadcrumbAria} />
        <BlogEyebrow edition={copy.edition}>{copy.eyebrow}</BlogEyebrow>
        <div className={blog.heroGrid}>
          <div className={blog.heroCopy}>
            <h1 id="newsroom-title"><span>{copy.titleLead}</span><em>{copy.titleAccent}</em></h1>
            <p className={blog.heroLead}>{copy.subtitle}</p>
            <div className={blog.heroActions}>
              {lead && <LocalizedLink href={newsHref(lead.slug)} className={home.primaryButton}>{copy.heroPrimary}<ArrowUpRight size={18} aria-hidden="true" /></LocalizedLink>}
              <a href="#wire" className={home.textButton}>{copy.heroSecondary}<ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <p className={ns.heroNote}><span aria-hidden="true" />{total > 0 && updated ? copy.heroNote(total, updated) : copy.heroEmpty}</p>
          </div>
          <div className={cx(blog.heroVisual, ns.heroVisual)} data-blog-scene="">
            <div className={home.visualIndex}><span>{copy.figureIndex}</span><span>{copy.figureTitle}</span><Plus size={15} aria-hidden="true" /></div>
            <OperationsScene />
            <div className={home.sceneLegend}>{copy.legend.map((item) => <span key={item}><i />{item}</span>)}</div>
          </div>
        </div>
        <nav className={cx(bi.band, ns.band)} aria-label={copy.desksEyebrow}>
          <p className={bi.bandLabel}>{copy.bandLabel[0]}<br /><strong>{copy.bandLabel[1]}</strong></p>
          <ul className={bi.bandList}>
            {counts.map(({ key, count }) => (
              <li key={key}>
                <LocalizedLink href={key === "all" ? "#archive" : deskHref(key)} className={bi.bandLink}>
                  <strong>{pad(count)}</strong>
                  <span>{deskLabel(copy, key)}</span>
                  <ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" />
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ── 01 · Lead story ───────────────────────────────────────────────────── */

export function LeadSection({ copy, locale, lead, rest }: { copy: NewsroomCopy; locale: string; lead?: NewsPost; rest: NewsPost[] }) {
  if (!lead) return null;
  return (
    <BlogSection tone="surface" id="lead" labelledBy="lead-title">
      <SectionHeading
        number={1}
        label={copy.leadEyebrow}
        lead={copy.leadTitle}
        accent={copy.leadAccent}
        id="lead-title"
        action={<p className={ns.leadNote}>{deskLabel(copy, lead.category)}<i aria-hidden="true" />{copy.leadKicker}</p>}
      />
      <div className={ns.leadWrap} data-blog-reveal="">
        <NewsCard post={lead} copy={copy} locale={locale} variant="feature" index={1} kicker={copy.leadKicker} />
      </div>
      {rest.length > 0 && (
        <ul className={cx(blog.grid, ns.cardGrid)}>
          {rest.map((post, i) => (
            <li key={post.slug} data-blog-reveal="" style={revealStyle(i % 3)}>
              <NewsCard post={post} copy={copy} locale={locale} index={i + 2} />
            </li>
          ))}
        </ul>
      )}
    </BlogSection>
  );
}

/* ── 02 · The wire + most important ────────────────────────────────────── */

export function WireSection({ copy, locale, latest, top }: { copy: NewsroomCopy; locale: string; latest: NewsPost[]; top: NewsPost[] }) {
  return (
    <BlogSection id="wire" labelledBy="wire-title">
      <SectionHeading number={2} label={copy.wireEyebrow} lead={copy.wireTitle} accent={copy.wireAccent} id="wire-title" intro={copy.wireIntro} />
      <div className={bi.latestLayout}>
        <div className={ns.wireRows}>
          {latest.length > 0
            ? <NewsGrid posts={latest} copy={copy} locale={locale} variant="row" headingLevel={3} label={copy.wireEyebrow} />
            : <p className={ns.empty}>{copy.emptyIndex}</p>}
        </div>
        <aside className={bi.mostRead} aria-labelledby="top-stories-title">
          <p className={bi.mostReadEyebrow}><i aria-hidden="true" />{copy.topEyebrow}</p>
          <h3 id="top-stories-title" className={bi.mostReadTitle}>{copy.topTitle}</h3>
          <ol className={bi.mostReadList}>
            {top.map((post, i) => (
              <li key={post.slug} data-blog-reveal="" style={revealStyle(i)}>
                <article className={bi.mrItem} data-figure-hover="">
                  <span className={bi.rank} aria-hidden="true">{pad(i + 1)}</span>
                  <div className={bi.mrMain}>
                    <MetaLine category={deskLabel(copy, post.category)} readTime={copy.readTime(post.readTime)} />
                    <h4 className={bi.mrTitle}><LocalizedLink href={newsHref(post.slug)}>{post.title}</LocalizedLink></h4>
                  </div>
                  <ArrowUpRight size={15} className={blog.arrow} aria-hidden="true" />
                </article>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <div className={cx(blog.sectionFoot, bi.foot)}>
        <span>{copy.archiveTitle} {copy.archiveAccent}</span>
        <a href="#archive">{copy.wireAll}<ArrowDown size={16} className={blog.arrow} aria-hidden="true" /></a>
      </div>
    </BlogSection>
  );
}

/* ── 03 · Desks ────────────────────────────────────────────────────────── */

export interface DeskView { key: NewsCategory; count: number; latest?: NewsPost }

/** The desk grid on its own (the desk page embeds it under its own heading). */
export function DeskGrid({ copy, desks }: { copy: NewsroomCopy; desks: DeskView[] }) {
  return (
      <ul className={cx(cat.directory, desks.length % 3 === 0 || desks.length > 4 ? cat.directory3 : desks.length <= 2 ? cat.directory2 : undefined)} aria-label={copy.desksEyebrow}>
        {desks.map((desk, i) => {
          const d = copy.desks[desk.key];
          return (
            <li key={desk.key} data-blog-reveal="" style={revealStyle(i % 3)}>
              <article className={cat.dirCell} data-figure-hover="">
                <div className={cat.dirFigure} aria-hidden="true"><FigureArt sketch={NEWS_CATEGORY_SKETCH[desk.key]} compact /></div>
                <div className={cat.dirBody}>
                  <div className={cat.dirKicker}><span>{deskLabel(copy, desk.key)}</span><span>{pad(desk.count)}</span></div>
                  <h3 className={cx(cat.dirTitle, cat.bidi)}><LocalizedLink href={deskHref(desk.key)}>{d.headline} <em>{d.accent}</em></LocalizedLink></h3>
                  {desk.latest && <span className={ns.deskLatest}><span>{copy.latestOnDesk}</span>{desk.latest.title}</span>}
                  <div className={cat.dirFoot}><span>{copy.deskCount(desk.count)}</span><ArrowUpRight size={16} className={blog.arrow} aria-hidden="true" /></div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
  );
}

export function DesksSection({ copy, desks, embedded = false }: { copy: NewsroomCopy; desks: DeskView[]; embedded?: boolean }) {
  if (embedded) return <DeskGrid copy={copy} desks={desks} />;
  return (
    <BlogSection tone="surface" id="desks" labelledBy="desks-title">
      <SectionHeading number={3} label={copy.desksEyebrow} lead={copy.desksTitle} accent={copy.desksAccent} id="desks-title" intro={copy.desksIntro} />
      <DeskGrid copy={copy} desks={desks} />
    </BlogSection>
  );
}

/* ── 04 · How the newsroom works (dark band) ───────────────────────────── */

export interface NewsroomStat { label: string; value: ReactNode; accent?: boolean }

export function HowSection({ copy, stats }: { copy: NewsroomCopy; stats: NewsroomStat[] }) {
  return (
    <BlogSection tone="dark" id="how" labelledBy="how-title" className={ns.how}>
      <div className={bi.whyGrid}>
        <div>
          <Chapter number={4}>{copy.howEyebrow}</Chapter>
          <h2 id="how-title">{copy.howTitle}<br /><em>{copy.howAccent}</em></h2>
          <p className={ns.howBody}>{copy.howBody}</p>
          <div className={ns.steps}>
            {copy.steps.map((step) => <div key={step.code}><span>{step.code}</span><strong>{step.title}</strong><p>{step.body}</p></div>)}
          </div>
        </div>
        <div className={bi.numbers} data-blog-reveal="">
          <p className={bi.numbersTitle}><span className={home.signal} aria-hidden="true" />{copy.numbersTitle}</p>
          <dl>
            {stats.map((stat) => (
              <div key={stat.label} className={stat.accent ? bi.numberAccent : undefined}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </BlogSection>
  );
}

/* ── 05 · Archive, grouped by desk ─────────────────────────────────────── */

export interface ArchiveGroup { key: NewsCategory; posts: NewsPost[] }

export function ArchiveSection({ copy, locale, groups, total, tags }: { copy: NewsroomCopy; locale: string; groups: ArchiveGroup[]; total: number; tags: string[] }) {
  const entries: LibraryEntry[] = groups.flatMap((group) => group.posts.map((post) => ({
    slug: post.slug,
    category: group.key,
    text: [post.title, post.dek, post.excerpt, post.keywords.primary, deskLabel(copy, post.category), ...post.tags, ...post.sources.map((s) => s.publisher)].join(" ").toLowerCase(),
  })));
  const options = [{ key: "all", label: deskLabel(copy, "all"), count: total }, ...groups.map((g) => ({ key: g.key, label: deskLabel(copy, g.key), count: g.posts.length }))];

  return (
    <BlogSection id="archive" labelledBy="archive-title">
      <SectionHeading number={5} label={copy.archiveEyebrow} lead={copy.archiveTitle} accent={copy.archiveAccent} id="archive-title" intro={copy.archiveIntro} />
      {groups.length === 0 ? <p className={ns.empty}>{copy.emptyIndex}</p> : (
        <LibraryFilter
          options={options}
          entries={entries}
          labels={{ filter: copy.filter, search: copy.search, placeholder: copy.searchPlaceholder, results: copy.results, empty: copy.empty, clear: copy.clear }}
        >
          {groups.map((group, g) => (
            <div key={group.key} id={`cat-${group.key}`} className={bi.group} data-library-group={group.key}>
              <div className={bi.groupHead}>
                <h3 className={bi.groupTitle}><span aria-hidden="true">{pad(g + 1)}</span>{deskLabel(copy, group.key)}</h3>
                <span className={bi.groupCount}>{copy.deskCount(group.posts.length)}</span>
                <LocalizedLink href={deskHref(group.key)} className={bi.groupLink}>{copy.openDesk}<ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
              </div>
              <NewsGrid posts={group.posts} copy={copy} locale={locale} variant="row" headingLevel={4} itemAttr />
            </div>
          ))}
        </LibraryFilter>
      )}
      {tags.length > 0 && (
        <div className={bi.tagCloud}>
          <p className={bi.tagCloudLabel}><i aria-hidden="true" />{copy.tagCloud}</p>
          <TagList tags={tags} label={copy.tagCloud} />
        </div>
      )}
    </BlogSection>
  );
}

/* ── 06 · FAQ ──────────────────────────────────────────────────────────── */

export function NewsroomFaqSection({ copy, number = 6 }: { copy: NewsroomCopy; number?: number }) {
  return (
    <BlogSection id="faq" labelledBy="newsroom-faq-title">
      <div className={home.faqGrid}>
        <div>
          <Chapter number={number}>{copy.faqEyebrow}</Chapter>
          <h2 id="newsroom-faq-title">{copy.faqTitle}<br /><em>{copy.faqAccent}</em></h2>
          <p className={home.bodyCopy}>{copy.faqBody}</p>
          <LocalizedLink href="/contact" className={home.textButton}>{copy.faqLink}<ArrowUpRight size={17} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
        </div>
        <div className={cx(home.faqList, bi.faqList)}>
          {copy.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<Plus size={18} aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </BlogSection>
  );
}

/** Keeps the shared (Tailwind) India geo footer legible inside the newsroom root. */
export function NewsGeoFrame({ children }: { children: ReactNode }) {
  return <div className={ns.geo}>{children}</div>;
}
