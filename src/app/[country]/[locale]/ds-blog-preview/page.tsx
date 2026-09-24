// TEMPORARY design-system preview — delete before finishing.
import { ArrowDown } from "lucide-react";
import home from "@/components/home/IndustrialHome.module.css";
import styles from "@/components/blog/Blog.module.css";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogFigure, type BlogFigureKey } from "@/components/blog/BlogFigures";
import { ProcurementWalkthrough } from "@/components/blog/ProcurementWalkthrough";
import {
  BlogEyebrow, BlogSection, Breadcrumbs, Callout, CategoryNav, FinalCta, InlineText, MetaLine, PostCard, PostGrid,
  ProseHeading, PullQuote, SectionHeading, Takeaways, Toc, AuthorCard, PostPager, TagList, formatPostDate, getCategoryLabel,
} from "@/components/blog/BlogPrimitives";
import { getAllBlogPosts, localizePost } from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";
import type { Locale } from "@/lib/i18n";

export const metadata = { robots: { index: false, follow: false } };

const KEYS: BlogFigureKey[] = ["auditLens", "leakyFunnel", "whatsappFlow", "layerStack", "seoPeakGraph", "procurementFlow"];

export default async function Preview({ params, searchParams }: { params: Promise<{ country: string; locale: string }>; searchParams: Promise<{ only?: string }> }) {
  const { locale } = await params;
  const { only } = await searchParams;
  const ui = getBlogUi(locale as Locale);
  const posts = (await getAllBlogPosts()).map((p) => localizePost(p, locale as Locale));
  const show = (key: string) => !only || only.split(",").includes(key);
  const post = posts[0];

  return (
    <BlogMotion progress skipTo="#preview-article">
      {show("hero") && <section className={styles.hero} aria-labelledby="pv-title" id="pv-hero">
        <div className={home.container}>
          <BlogEyebrow edition="Field notes / Savin Group">{ui.blogEyebrow}</BlogEyebrow>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="pv-title"><span>{ui.blogTitleLead}</span><em>{ui.blogTitleAccent}</em></h1>
              <p className={styles.heroLead}>{ui.blogSubtitle}</p>
              <div className={styles.heroActions}><a href="#pv-latest" className={home.textButton}>{ui.latestEyebrow}<ArrowDown size={16} aria-hidden="true" /></a></div>
            </div>
            <div className={styles.heroVisual}><BlogFigure sketch="workshop" number={1} count={posts.length} legend={["Field notes", "Editorial system", "Published"]} /></div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{posts.length}</strong><span>{ui.statsLongForm}</span></div>
            <div className={styles.stat}><strong>9 min</strong><span>{ui.statsAvgRead}</span></div>
            <div className={styles.stat}><strong>5</strong><span>{ui.statsTopics}</span></div>
            <div className={styles.stat}><strong>38K</strong><span>{ui.statsMonthlySearches}</span></div>
          </div>
        </div>
      </section>}

      {show("figures") && <BlogSection tone="surface" id="pv-figures" labelledBy="pv-fig-title" scene>
        <SectionHeading number={1} label="FIGURES" lead="Every sketch." accent="Drawn in one hand." id="pv-fig-title" intro="Each BlogSketchKey rendered with its caption row." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))", gap: 48 }}>
          {KEYS.map((key, i) => <div key={key} id={`pv-fig-${key}`}><BlogFigure sketch={key} number={i + 2} /></div>)}
        </div>
      </BlogSection>}

      {show("cards") && posts.length > 0 && <BlogSection id="pv-latest" labelledBy="pv-latest-title">
        <SectionHeading number={2} label={ui.latestEyebrow} lead={ui.latestTitle} accent={ui.latestTitleAccent} id="pv-latest-title" intro={ui.blogSubtitle.slice(0, 120)} />
        <div style={{ marginBottom: 28 }}><CategoryNav ui={ui} active="all" counts={{ all: posts.length, growth: 4, automation: 5, seo: 7, "case-study": 1, ops: 5 }} /></div>
        <div id="pv-feature" style={{ marginBottom: 40 }}><PostCard post={posts[1] ?? post} ui={ui} locale={locale} variant="feature" index={1} kicker={ui.featuredEyebrow} /></div>
        <div id="pv-grid"><PostGrid posts={posts.slice(0, 6)} ui={ui} locale={locale} /></div>
      </BlogSection>}

      {show("rows") && posts.length > 0 && <BlogSection tone="dark" labelledBy="pv-rows-title" scene id="pv-rows">
        <SectionHeading number={3} label={ui.allPostsEyebrow} lead={ui.allPostsTitle} accent={ui.allPostsTitleAccent} id="pv-rows-title" />
        <PostGrid posts={posts.slice(0, 5)} ui={ui} locale={locale} variant="row" />
      </BlogSection>}

      {show("article") && post && <section className={styles.articleHero} aria-labelledby="pv-article-title" id="pv-article-hero">
        <div className={home.container}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: ui.breadcrumb, href: "/blogs" }, { label: post.title }]} />
          <div className={styles.articleHeroGrid}>
            <div>
              <MetaLine category={getCategoryLabel(ui, post.category)} date={formatPostDate(post.publishedAt, locale)} dateTime={post.publishedAt} readTime={ui.readTime(post.readTime)} />
              <h1 id="pv-article-title" className={styles.articleTitle}>{post.title}</h1>
              <p className={styles.articleSubtitle}>{post.subtitle}</p>
              <div className={styles.byline}><span className={styles.avatar}>KS</span><div><strong>{post.author.name}</strong><span>{post.author.role}</span></div></div>
            </div>
            <BlogFigure sketch="procurementFlow" number={1} />
          </div>
        </div>
      </section>}

      {show("article") && post && <BlogSection tone="surface" id="preview-article">
        <Takeaways label={ui.tldr} title={ui.keyTakeaways} items={post.takeaways} id="pv-tldr" />
        <div className={styles.articleLayout} style={{ marginTop: 56 }} data-blog-article="">
          <aside className={styles.articleAside}><Toc title={ui.onThisPage} meta={ui.readTime(post.readTime)} items={post.sections.slice(0, 5).map((s, i) => ({ id: `pv-s-${i}`, label: s.heading }))} /></aside>
          <div className={styles.articleMain}>
            <div className={styles.prose}>
              {post.sections.slice(0, 3).map((section, i) => <section key={i} className={styles.proseSection} aria-labelledby={`pv-s-${i}`}>
                <ProseHeading id={`pv-s-${i}`} number={i + 1}>{section.heading}</ProseHeading>
                {section.paragraphs.map((p, k) => <p key={k} className={i === 0 && k === 0 ? styles.dropCap : undefined}><InlineText text={p} /></p>)}
                {section.bullets && <ul>{section.bullets.map((b) => <li key={b}><InlineText text={b} /></li>)}</ul>}
                {section.callout && <Callout label="Field note" title={section.callout.title}><p>{section.callout.body}</p></Callout>}
                {section.pullQuote && <PullQuote cite={post.author.name}>{section.pullQuote}</PullQuote>}
                {i === 0 && <div className={styles.embed} id="pv-walk"><ProcurementWalkthrough figure="FIG. 02" /></div>}
                {i === 1 && <div className={styles.proseFigure}><BlogFigure sketch={post.heroSketch} number={3} /></div>}
              </section>)}
              <Callout label="Callout" title="A callout title reads in the display face.">
                <p>Body copy in the callout is muted and slightly smaller. <a href="#pv-hero">Links keep the accent underline</a>.</p>
              </Callout>
              <PullQuote cite="Kanha Singh">Most growth content is theory dressed as advice. This isn’t.</PullQuote>
              <ol><li>Ordered list item one.</li><li>Ordered list item two with <strong>strong text</strong>.</li></ol>
            </div>
            <div style={{ marginTop: 48 }}><TagList tags={post.tags} label={ui.tags} /></div>
            <div style={{ marginTop: 32 }}><AuthorCard label={ui.writtenBy} name={post.author.name} role={post.author.role} bio={post.author.bio} /></div>
            <div style={{ marginTop: 32 }}><PostPager prev={posts[1] ?? null} next={posts[2] ?? null} ui={ui} /></div>
          </div>
        </div>
      </BlogSection>}

      {show("final") && <FinalCta eyebrow="The next connection starts with a conversation" question="Have a business process that shouldn’t be manual?" lead="Let’s" accent="engineer it." ctaLabel="Request your free audit" note="Free 45-minute audit. A written diagnosis. A clear next step." secondary={{ label: ui.allPostsBackLink, href: "/blogs" }} footer={{ left: "Savin Group", center: "Field notes from the build.", backToTop: { label: "Back to top", href: "#pv-hero" } }} />}
    </BlogMotion>
  );
}
