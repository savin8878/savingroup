import { Fragment } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, Download, Gift, Headphones, IndianRupee, Layers, Minus, Plus,
  Search, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Zap, type LucideIcon,
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import { BlogEyebrow, BlogSection, Breadcrumbs, Chapter, SectionHeading, revealStyle } from "@/components/blog/BlogPrimitives";
import type { Messages } from "@/lib/i18n";
import { AUDIT, DISCOVERY, ENTRY, TIER_TO_SYSTEM } from "@/lib/offer";
import type { PricingCopy } from "./copy/pricing-copy";
import { buildCompareGroups, splitHeadline, splitPrice, type CompareGroup, type PricingContent } from "./pricing-data";
import { LayersFigure, PricingFigure, RailFigure, TiersFigure } from "./PricingFigures";
import { TierGlyph } from "./TierGlyph";
import { CompareHeader } from "./CompareHeader";
import { PlanPicker } from "./PlanPicker";
import s from "./Pricing.module.css";

/**
 * Sections of the pricing page. Server components; render them inside
 * <BlogMotion>. `p` is `t.pricing`; `copy` holds the strings new to this
 * layout (see copy/pricing-copy.ts).
 */

export interface PricingContext { t: Messages; p: PricingContent; copy: PricingCopy; country: string; locale: string }

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const pad = (n: number) => String(n).padStart(2, "0");

function tierCta(p: PricingContent, id: string) {
  return id === "enterprise" ? p.ctaEnterprise : p.ctaPrimary;
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

export function PricingHero({ ctx, downloadHref }: { ctx: PricingContext; downloadHref: string }) {
  const { t, p, copy } = ctx;
  const facts: [LucideIcon, string][] = [[SlidersHorizontal, copy.facts[0]], [Search, copy.facts[1]], [BadgeCheck, copy.facts[2]], [IndianRupee, copy.facts[3]]];
  return (
    <section className={blog.hero} aria-labelledby="pricing-title" id="pricing-hero">
      <div className={home.container}>
        <Breadcrumbs className={s.crumbs} items={[{ label: copy.home, href: "/" }, { label: t.nav.pricing }]} />
        <BlogEyebrow edition={copy.edition}>{p.eyebrow}</BlogEyebrow>
        <div className={blog.heroGrid}>
          <div className={blog.heroCopy}>
            <h1 id="pricing-title"><span>{copy.heroLead}</span><em>{copy.heroAccent}</em></h1>
            <p className={blog.heroLead}>{p.subtitle}</p>
            <div className={blog.heroActions}>
              <LocalizedLink href="/contact" className={home.primaryButton}>{p.ctaPrimary}<ArrowUpRight size={18} aria-hidden="true" /></LocalizedLink>
              {/* Native anchor: the route returns a PDF attachment, so the browser should download it, not navigate. */}
              <a href={downloadHref} className={cx(home.textButton, s.download)}>{copy.download}<Download size={15} aria-hidden="true" /></a>
            </div>
            <p className={s.heroNote}><span aria-hidden="true" />{copy.heroNote}</p>
          </div>
          <div className={blog.heroVisual}>
            <PricingFigure number={1} title={copy.figureTitle} legend={copy.legend}>
              <TiersFigure tiers={p.tiers.map((tier) => tier.name)} blocks={copy.figureBlocks} enterprise={copy.figureEnterprise} caption={copy.figureCaption} label={copy.figureAlt} />
            </PricingFigure>
          </div>
        </div>
        <div className={cx(home.heroBand, s.band)}>
          <span>{copy.bandLabel[0]}<br /><strong>{copy.bandLabel[1]}</strong></span>
          {facts.map(([Icon, text]) => <div key={text}><Icon size={19} aria-hidden="true" />{text}</div>)}
        </div>
      </div>
    </section>
  );
}

/* ── 01 · Plans + comparison ───────────────────────────────────────────── */

function Cell({ on, label, yes, no }: { on: boolean; label: string; yes: string; no: string }) {
  const off = !on || label === "—" || !label;
  return (
    <span className={cx(s.cell, off && s.cellOff)}>
      {off ? <Minus size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}
      <span className={blog.srOnly}>{off ? no : yes}: </span>
      <span>{!label || label === "—" ? "—" : label}</span>
    </span>
  );
}

export function PlansSection({ ctx }: { ctx: PricingContext }) {
  const { p, copy } = ctx;
  const groups: CompareGroup[] = buildCompareGroups(p.tiers, copy);
  const columns = p.tiers.length + 1;
  return (
    <BlogSection tone="surface" id="plans" labelledBy="plans-title">
      <SectionHeading number={1} label={copy.chapters[0]} lead={copy.plansTitle[0]} accent={copy.plansTitle[1]} id="plans-title" intro={copy.plansIntro} />

      <ul className={s.plans}>
        {p.tiers.map((tier, i) => (
          <li key={tier.id} data-blog-reveal="" style={revealStyle(i)}>
            <article id={`plan-${tier.id}`} className={cx(s.plan, tier.featured && s.planFeatured)} aria-labelledby={`plan-${tier.id}-name`}>
              <div className={s.planHead}>
                <TierGlyph name={tier.glyph} className={s.glyph} />
                {tier.badge && <span className={s.badge}><i />{tier.badge}</span>}
              </div>
              <h3 id={`plan-${tier.id}-name`} className={s.planName}>{tier.name}</h3>
              <p className={s.tagline}>{tier.tagline}</p>
              <div className={s.price}>
                <span className={s.priceLabel}>{tier.priceLabel}</span>
                <strong className={s.priceValue}>{splitPrice(tier.priceRange).map((line) => <span key={line}>{line}</span>)}</strong>
                <span className={s.priceInfo}>{tier.priceInfo}</span>
              </div>
              <div className={s.scopeRow}>
                <strong>{tier.scope}</strong>
                <span className={s.reqTag}><SlidersHorizontal size={11} aria-hidden="true" />{tier.reqTag}</span>
              </div>
              <p className={s.blockLabel}><i aria-hidden="true" />{copy.included}</p>
              <dl className={s.costs}>
                {tier.costRows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
              </dl>
              <p className={s.blockLabel}><i aria-hidden="true" />{copy.extras}</p>
              <ul className={s.extras}>
                {tier.extras.map((extra) => <li key={extra}><Check size={13} aria-hidden="true" />{extra}</li>)}
              </ul>
              <div className={s.planCta}>
                <LocalizedLink href="/contact" className={tier.featured ? home.primaryButton : home.textButton}>{tierCta(p, tier.id)}<ArrowUpRight size={17} aria-hidden="true" /></LocalizedLink>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className={s.plansFoot}>
        <span>{p.note}</span>
        <a href="#compare" className={home.textButton}>{copy.compareLabel}<ArrowDown size={15} aria-hidden="true" /></a>
      </div>

      {/* Feature comparison */}
      <div className={s.compare} id="compare">
        <div className={s.compareTitle}>
          <div>
            <p className={cx(s.blockLabel, s.labelTop)}><i aria-hidden="true" />{p.table.title}</p>
            <h3>{copy.compareTitle[0]}<br /><em>{copy.compareTitle[1]}</em></h3>
          </div>
          <p>{copy.compareIntro}</p>
        </div>

        {/* Desktop: sticky compare header + one table. */}
        <CompareHeader className={s.compareHead}>
          <div className={s.compareCell}><span className={s.compareLabel}>{copy.compareLabel}<strong>{p.table.featureLabel}</strong></span></div>
          {p.tiers.map((tier) => (
            <div key={tier.id} className={s.compareCell} data-featured={tier.featured ? "true" : undefined}>
              <span className={s.compareName}><TierGlyph name={tier.glyph} />{tier.name}</span>
              <span className={s.comparePrice}>{tier.priceRange}</span>
              <LocalizedLink href="/contact" className={cx(s.miniCta, tier.featured && s.miniCtaSolid)}>{tierCta(p, tier.id)}<ArrowUpRight size={13} aria-hidden="true" /></LocalizedLink>
            </div>
          ))}
        </CompareHeader>
        <table className={s.table}>
          <caption className={blog.srOnly}>{p.table.title}</caption>
          <colgroup><col />{p.tiers.map((tier) => <col key={tier.id} />)}</colgroup>
          <thead className={blog.srOnly}>
            <tr><th scope="col">{p.table.featureLabel}</th>{p.tiers.map((tier) => <th key={tier.id} scope="col">{tier.name}</th>)}</tr>
          </thead>
          <tbody>
            <tr className={s.groupRow}><th scope="colgroup" colSpan={columns}><span>{p.table.title}</span></th></tr>
            {p.table.rows.map((row) => (
              <tr key={row.feature} className={s.row}>
                <th scope="row"><span className={s.feature}>{row.feature}</span><span className={s.others}>{p.table.othersLabel}: {row.others}</span></th>
                {row.values.map((value, i) => <td key={i} data-featured={p.tiers[i]?.featured ? "true" : undefined}><Cell on={row.on[i]} label={value} yes={copy.yes} no={copy.no} /></td>)}
              </tr>
            ))}
            {groups.map((group) => (
              <Fragment key={group.heading}>
                <tr className={s.groupRow}><th scope="colgroup" colSpan={columns}><span>{group.heading}</span></th></tr>
                {group.rows.map((row) => (
                  <tr key={row.key} className={s.row}>
                    <th scope="row"><span className={s.feature}>{row.label}</span></th>
                    {row.cells.map((cell, i) => <td key={i} data-featured={p.tiers[i]?.featured ? "true" : undefined}><Cell on={!!cell?.on} label={cell?.label ?? "—"} yes={copy.yes} no={copy.no} /></td>)}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Phones: one accordion per tier, nothing hidden. */}
        <div className={s.compareMobile}>
          {p.tiers.map((tier, i) => (
            <details key={tier.id} open={!!tier.featured}>
              <summary><span>{copy.everythingIn(tier.name)}<small>{tier.priceRange}</small></span><Plus size={18} aria-hidden="true" /></summary>
              <div className={s.mobileGroup}>
                <p>{p.table.title}</p>
                <ul className={s.mobileList}>
                  {p.table.rows.map((row) => <li key={row.feature}><span className={s.feature}>{row.feature}</span><Cell on={row.on[i]} label={row.values[i]} yes={copy.yes} no={copy.no} /><span className={s.others}>{p.table.othersLabel}: {row.others}</span></li>)}
                </ul>
              </div>
              {groups.map((group) => (
                <div key={group.heading} className={s.mobileGroup}>
                  <p>{group.heading}</p>
                  <ul className={s.mobileList}>
                    {group.rows.map((row) => <li key={row.key}><span className={s.feature}>{row.label}</span><Cell on={!!row.cells[i]?.on} label={row.cells[i]?.label ?? "—"} yes={copy.yes} no={copy.no} /></li>)}
                  </ul>
                </div>
              ))}
              <div className={s.mobileCta}><LocalizedLink href="/contact" className={tier.featured ? home.primaryButton : home.textButton}>{tierCta(p, tier.id)}<ArrowUpRight size={17} aria-hidden="true" /></LocalizedLink></div>
            </details>
          ))}
        </div>
      </div>
    </BlogSection>
  );
}

/* ── 02 · Which plan fits? ─────────────────────────────────────────────── */

export function PickerSection({ ctx }: { ctx: PricingContext }) {
  const { p, copy } = ctx;
  const featured = Math.max(0, p.tiers.findIndex((tier) => tier.featured));
  const total = copy.questions.length;
  return (
    <BlogSection id="which-plan" labelledBy="which-plan-title">
      <SectionHeading number={2} label={copy.chapters[1]} lead={copy.pickerTitle[0]} accent={copy.pickerTitle[1]} id="which-plan-title" intro={copy.pickerIntro} />
      <PlanPicker
        questions={copy.questions}
        tiers={p.tiers.map((tier, i) => ({ id: tier.id, name: tier.name, glyph: tier.glyph, priceRange: tier.priceRange, ctaLabel: tierCta(p, tier.id), reason: copy.reasons[i] ?? copy.defaultReason, seePlan: copy.seePlan(tier.name) }))}
        defaultIndex={featured}
        defaultReason={copy.defaultReason}
        labels={{ suggestion: copy.suggestion, startingPoint: copy.startingPoint, answered: Array.from({ length: total + 1 }, (_, n) => copy.answered(n, total)), reset: copy.reset, note: p.note }}
      />
    </BlogSection>
  );
}

/* ── 03 · What a quote includes ────────────────────────────────────────── */

export function QuoteSection({ ctx }: { ctx: PricingContext }) {
  const { p, copy } = ctx;
  return (
    <BlogSection tone="surface" id="quote" labelledBy="quote-title">
      <SectionHeading number={3} label={copy.chapters[2]} lead={copy.quoteTitle[0]} accent={copy.quoteTitle[1]} id="quote-title" intro={copy.quoteIntro} />
      <div className={s.railWrap}>
        <PricingFigure number={2} title={copy.railTitle}><RailFigure label={copy.railAlt} /></PricingFigure>
      </div>
      <ol className={s.steps}>
        {copy.steps.map((step, i) => (
          <li key={step.title} data-blog-reveal="" style={revealStyle(i)}>
            <span className={s.stepLabel}>{step.label}</span>
            <strong>{step.title}</strong>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>

      {/* How we're different (t.pricing.comparison + highlight) */}
      <div className={s.different} id="how-different">
        <div className={s.differentHead}>
          <div>
            <p className={cx(s.blockLabel, s.labelTop)}><i aria-hidden="true" />{p.comparison.eyebrow}</p>
            <h3>{p.comparison.title}</h3>
          </div>
          <p>{p.comparison.intro}</p>
        </div>
        <ul className={s.compCards}>
          {p.comparison.cards.map((card, i) => (
            <li key={card.title} data-blog-reveal="" style={revealStyle(i)}>
              <div className={cx(s.compCard, card.highlight && s.compHighlight)}>
                <p className={s.compTitle}><span>{card.title}</span>{card.badge && <span className={s.badge}><i />{card.badge}</span>}</p>
                <strong className={s.compPrice}>{card.price}</strong>
                <span className={s.compScale}>{card.scale}</span>
                <ul className={s.compList}>
                  {card.features.map((feature) => <li key={feature.label} data-on={feature.on}>{feature.on ? <Check size={13} aria-hidden="true" /> : <Minus size={13} aria-hidden="true" />}{feature.label}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <aside className={s.highlight} aria-labelledby="highlight-title">
          <h3 id="highlight-title">{p.highlight.title}</h3>
          <div><p>{p.highlight.lineA}</p><p>{p.highlight.lineB}</p></div>
        </aside>
      </div>
    </BlogSection>
  );
}

/* ── 04 · Advantages ───────────────────────────────────────────────────── */

const ADVANTAGE_ICONS: Record<string, LucideIcon> = {
  layers: Layers, sliders: SlidersHorizontal, gift: Gift, zap: Zap, search: Search, smartphone: Smartphone, shield: ShieldCheck, headphones: Headphones,
};

export function AdvantagesSection({ ctx }: { ctx: PricingContext }) {
  const { p, copy } = ctx;
  return (
    <BlogSection id="advantages" labelledBy="advantages-title">
      <SectionHeading number={4} label={p.advantages.title} lead={copy.advantagesTitle[0]} accent={copy.advantagesTitle[1]} id="advantages-title" intro={copy.advantagesIntro} />
      <ul className={s.advGrid}>
        {p.advantages.items.map((item, i) => {
          const Icon = ADVANTAGE_ICONS[item.icon] ?? Sparkles;
          return (
            <li key={item.title} className={s.adv} data-blog-reveal="" style={revealStyle(i % 4)}>
              <div className={s.advIcon}><Icon size={21} strokeWidth={1.35} aria-hidden="true" /><span aria-hidden="true">{pad(i + 1)}</span></div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          );
        })}
      </ul>
    </BlogSection>
  );
}

/* ── 05 · The system behind each tier (dark band) ──────────────────────── */

export function SystemSection({ ctx }: { ctx: PricingContext }) {
  const { p, copy } = ctx;
  const stacks = Object.entries(TIER_TO_SYSTEM).map(([name, { systems, note }]) => ({ name, systems, note, priced: p.tiers.find((tier) => tier.name === name) }));
  return (
    <BlogSection tone="dark" id="tier-map" labelledBy="tier-map-title" className={s.system}>
      <SectionHeading number={5} label={copy.systemEyebrow} lead={copy.systemTitle[0]} accent={copy.systemTitle[1]} id="tier-map-title" intro={copy.systemIntro(ENTRY.site.display, ENTRY.site.tier, ENTRY.system.display, ENTRY.system.service)} />
      <div className={s.systemTop}>
        <div className={s.systemFigure}>
          <PricingFigure number={3} title={copy.systemFigureTitle}>
            <LayersFigure label={copy.systemFigureAlt} stacks={stacks.map((stack) => ({ name: stack.name, systems: stack.systems, dashed: stack.name === "Enterprise" }))} />
          </PricingFigure>
        </div>
        {/* The two-step commercial path, stated once, in order. */}
        <div className={s.pathCol}>
          <div className={s.pathGrid}>
            <div>
              <span className={s.pathLabel}>{copy.step1Label}</span>
              <strong>{AUDIT.label}</strong>
              <p>{copy.step1Body}</p>
            </div>
            <ArrowRight size={18} aria-hidden="true" />
            <div>
              <span className={s.pathLabel}>{copy.step2Label(DISCOVERY.price)}</span>
              <strong>{DISCOVERY.duration} {DISCOVERY.name}</strong>
              <p>{copy.step2Body} {DISCOVERY.note}</p>
            </div>
          </div>
          <div className={s.systemFoot}>
            <span>{copy.chapters[4]}</span>
            <LocalizedLink href="/services" className={home.textButton}>{copy.systemLink}<ArrowUpRight size={16} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
          </div>
        </div>
      </div>
      <ul className={s.tierMap}>
        {stacks.map((stack, i) => (
          <li key={stack.name} data-blog-reveal="" style={revealStyle(i)}>
            <div className={s.tierCard}>
              <div className={s.tierCardHead}><h3>{stack.name}</h3>{stack.priced && <span>{stack.priced.priceRange}</span>}</div>
              <ul className={s.tierSystems} aria-label={copy.systemsLabel}>
                {stack.systems.map((system) => <li key={system}><Check size={13} aria-hidden="true" />{system}</li>)}
              </ul>
              <p className={s.tierNote}>{stack.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </BlogSection>
  );
}

/* ── 06 · FAQ ──────────────────────────────────────────────────────────── */

export function PricingFaqSection({ ctx, items }: { ctx: PricingContext; items: { q: string; a: string }[] }) {
  const { t, copy } = ctx;
  const [lead, accent] = splitHeadline(t.faq.title);
  return (
    <BlogSection id="faq" labelledBy="faq-title">
      <div className={home.faqGrid}>
        <div>
          <Chapter number={6}>{t.faq.eyebrow}</Chapter>
          <h2 id="faq-title">{lead}{accent && <><br /><em>{accent}</em></>}</h2>
          <p className={home.bodyCopy}>{copy.faqBody}</p>
          <LocalizedLink href="/contact" className={home.textButton}>{copy.faqLink}<ArrowUpRight size={17} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
        </div>
        <div className={cx(home.faqList, s.faqList)}>
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}<Plus size={18} aria-hidden="true" /></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </BlogSection>
  );
}
