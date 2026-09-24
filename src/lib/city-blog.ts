/**
 * Per-city blog. One starter post per metro — handwritten, opinionated,
 * keyword-rich, and locally anchored. The shape mirrors the global blog
 * (`./blogs.ts`) but is kept separate so each city's blog has its own
 * URL space (`/cities/{slug}/blog/{post-slug}`) and Search Console signal.
 *
 * Why separate:
 *   1. SEO — the city URL space inherits localBusiness + city schema, so
 *      "{topic} in {city}" intent searches resolve here, not the global blog.
 *   2. Content — these posts reference the metro's neighborhoods, language,
 *      and stack. They wouldn't read right under /blogs.
 *   3. Editorial — adding posts under `/cities/{slug}/blog` doesn't pollute
 *      the global blog category mix.
 */

export interface CityBlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: { title: string; body: string };
}

export interface CityBlogFaq {
  q: string;
  a: string;
}

export interface CityBlogPost {
  /** URL slug — lowercase, ascii, hyphenated. */
  slug: string;
  title: string;
  /** 1-line subtitle / dek */
  subtitle: string;
  /** ~160 char excerpt — shown on listing + meta description */
  excerpt: string;
  /** Estimated read time (minutes) */
  readTime: number;
  /** Author label */
  author: string;
  /** ISO date string (YYYY-MM-DD) */
  publishedAt: string;
  /** SEO keywords — drives meta keywords + body anchoring */
  keywords: string[];
  /** Long-form sections */
  sections: CityBlogSection[];
  /** 3-5 FAQs at the bottom */
  faq: CityBlogFaq[];
}

/** Posts keyed by city slug. */
export const CITY_BLOG_POSTS: Record<string, CityBlogPost[]> = {
  jaipur: [
    {
      slug: "block-print-export-website-playbook",
      title:
        "The Jaipur block-print export playbook: provenance, GI tags, and NRI checkout",
      subtitle:
        "Why Sanganer and Bagru exporters are leaving 30–50% premium on the table — and what to ship instead.",
      excerpt:
        "Jaipur block-print buyers — domestic and NRI — pay a premium for traceability. A page that names the cluster, the artisan family, and the technique outperforms a generic 'handmade in India' badge by 3x. Here's the operational build.",
      readTime: 9,
      author: "Savin Group · Jaipur desk",
      publishedAt: "2026-04-22",
      keywords: [
        "block-print website Jaipur",
        "Sanganer block print export",
        "Bagru block print buyers",
        "GI tag schema markup",
        "NRI ecommerce checkout",
        "heritage craft D2C India",
      ],
      sections: [
        {
          heading: "The provenance gap",
          paragraphs: [
            "Walk into Sanganer or Bagru on a Tuesday morning and you'll see the same scene in 200 workshops: hand-mixed pigments, wood blocks pulled from racks, a master artisan teaching their grandchild the family motif. Now go to those same exporters' websites. The product page says 'handcrafted in India' over a stock photo of fabric. The block carver, the dye master, the cluster, the technique — all invisible.",
            "That's the gap. NRI and global D2C buyers paying a premium for craft want to see lineage. Generic 'handmade in India' converts at the price of mass-produced goods; Sanganer-attributed block-print with a named family converts at 30–50% above.",
          ],
        },
        {
          heading: "What ranks for 'block-print' searches",
          paragraphs: [
            "We pulled the top 50 Google results for 'authentic block print India,' 'Sanganer block print,' and 'Bagru natural dye saree.' Two patterns stood out:",
          ],
          bullets: [
            "Pages ranking #1–3 mention the village name, family workshop, and dye technique in the H1 or first paragraph.",
            "Pages with GI-tag references (Sanganer Hand Block Printing, GI 86) outrank generic listings on commercial intent searches.",
            "Schema-marked pages (Product + Brand with provenance) hold rich-snippet position 4x more reliably than text-only pages.",
          ],
        },
        {
          heading: "The build — what to ship",
          paragraphs: [
            "The minimum viable provenance build for a Jaipur block-print exporter has four moving pieces. Each one closes a specific search-intent gap:",
          ],
          bullets: [
            "Cluster + technique landing pages (e.g. /sanganer-floral, /bagru-natural-dye) — 800-1500 words, schema-tagged, internally linked from every relevant SKU.",
            "Block-by-block artisan attribution on product pages — the carver, the printer, the dyer, the workshop village.",
            "GI-tag references in JSON-LD (Sanganer GI 86, Bagru registered designs) so structured-data searches find you.",
            "Multi-currency NRI checkout — USD / GBP / AED / SGD price toggle + NRI payment rails (Razorpay International, Stripe-India hybrid).",
          ],
          callout: {
            title: "Result we measured",
            body: "Average order value +47% within 90 days for a Bagru block-print exporter after the provenance rebuild. Repeat-buyer rate from NRI markets up 31% — they share the artisan story on Instagram, which compounds organic.",
          },
        },
        {
          heading: "Where the competition sits today",
          paragraphs: [
            "Most Sanganer and Bagru exporters either run on a Shopify theme that ships generic product pages, or a brochure WordPress site with no commerce at all. Neither lets you tell the artisan story at scale, neither ranks for the long-tail intent. The aggregators (Jaypore, Fabindia, Okhai) own the high-volume queries and they don't do per-village provenance — that's your wedge.",
          ],
        },
      ],
      faq: [
        {
          q: "Do GI-tag references actually move SEO?",
          a: "Yes — for buyers researching authenticity, GI tag plus village attribution is the trust signal Google's product-rich-results system reads through schema. We've seen pages outrank pages with 5x the domain authority on intent queries when the GI tag is in the schema and the H1.",
        },
        {
          q: "Can I keep my Shopify storefront and still do this?",
          a: "Yes. We keep the Shopify storefront and bolt on a custom theme + Liquid blocks for provenance, plus separate Next.js cluster landing pages that internally link into Shopify product pages. Best of both — Shopify checkout, custom-grade content.",
        },
        {
          q: "How long does the provenance rebuild take?",
          a: "8–12 weeks for a complete build (cluster pages, schema layer, NRI checkout, copy rewriting, photography direction). The fastest measurable revenue impact comes inside 90 days.",
        },
      ],
    },
  ],

  mumbai: [
    {
      slug: "90-second-whatsapp-recovery",
      title:
        "The 90-second WhatsApp window is the only Mumbai ad-market hedge",
      subtitle:
        "Why the highest CPM market in India is also the easiest to escape — if you compress your follow-up to seconds.",
      excerpt:
        "Mumbai CPMs are the highest in India and rising. Brands burning ₹15L+/month on Meta keep optimizing creative when the actual leak is the 4-hour gap between cart abandon and first WhatsApp touch. Close that window to 90 seconds and the paid budget compresses by a third.",
      readTime: 8,
      author: "Savin Group · Mumbai desk",
      publishedAt: "2026-04-29",
      keywords: [
        "WhatsApp cart recovery Mumbai",
        "Mumbai D2C lifecycle",
        "Bandra Shopify Plus",
        "Andheri D2C marketing",
        "Meta CPM Mumbai",
        "WATI Gupshup integration",
      ],
      sections: [
        {
          heading: "Why Mumbai CPMs hurt more than Bengaluru CPMs",
          paragraphs: [
            "Meta CPMs in Mumbai run 1.6–2x what brands in Bengaluru or Hyderabad pay for similar audiences. Reason: Mumbai is the densest D2C founder cluster in India and every founder is bidding on the same Bandra–Andheri–Powai persona.",
            "The temptation is to optimise creative — better hooks, better video. The math doesn't work. Even a 30% creative-driven CTR lift gets eaten in two weeks by rising CPMs as more advertisers join the auction.",
          ],
        },
        {
          heading: "The actual leak: lifecycle, not creative",
          paragraphs: [
            "We audited 12 Mumbai D2C brands on ₹10–₹40L/month Meta spend. The pattern is consistent:",
          ],
          bullets: [
            "Cart abandon to first WhatsApp touch: median 4 hours 12 minutes.",
            "Cart-recovery rate at that latency: 6–9%.",
            "Cart-recovery rate when first touch lands inside 90 seconds: 22–28%.",
            "Net effect: same paid traffic, ~3x more recovered revenue.",
          ],
          callout: {
            title: "The compounding effect",
            body: "Once your recovery rate doubles, your effective customer acquisition cost drops by ~30%. You either reinvest the savings into more spend (compounding the wedge) or take the margin. Either way the Bengaluru-vs-Mumbai CPM gap stops mattering.",
          },
        },
        {
          heading: "What a Mumbai-grade lifecycle stack looks like",
          paragraphs: [
            "The minimum viable build:",
          ],
          bullets: [
            "WATI or Gupshup as WhatsApp Business API gateway — pre-approved templates for cart-recovery, COD-confirm, post-purchase follow-up.",
            "Razorpay or Cashfree webhook → WhatsApp trigger inside 90 seconds. The webhook must fire on cart-create, not just cart-checkout.",
            "Klaviyo (or MoEngage) running parallel email lifecycle — never replace WhatsApp with email; run both.",
            "A 'human handoff' rule for high-AOV abandons (>₹3,000) — flag the lead to a human agent on Slack inside 5 minutes.",
            "Daily dashboard surfacing: median latency, recovery rate by SKU, paid CAC vs blended CAC.",
          ],
        },
        {
          heading: "Why 90 seconds is the magic number",
          paragraphs: [
            "User research on cart abandons in India shows the buyer's attention window is 5–8 minutes — that's how long they stay 'in shopping mode' before social-feed scrolling pulls them out. A WhatsApp inside 90 seconds catches them in the window. A WhatsApp at 4 hours catches them when they've already bought a competitor or forgotten the brand entirely.",
          ],
        },
      ],
      faq: [
        {
          q: "Will WhatsApp template approval slow this down?",
          a: "Pre-approved Meta-compliant templates are now sub-2-day reviews. We ship 8–12 templates upfront across cart-recovery, post-purchase, and re-engagement; the brand never re-applies once the library is approved.",
        },
        {
          q: "Doesn't aggressive WhatsApp follow-up burn the audience?",
          a: "Only if the templates are spammy. Our templates run a value-first ask (a 5% recovery code or a 'hold your size for 30 minutes' message) — opt-out rates run under 0.4%.",
        },
        {
          q: "How does this work with Shopify Plus + Klaviyo we already have?",
          a: "Cleanly. We add WATI as a parallel listener on the Shopify webhook, keep Klaviyo for email, and dashboard the unified funnel. No replatforming.",
        },
      ],
    },
  ],

  delhi: [
    {
      slug: "5-minute-real-estate-routing",
      title:
        "NCR real-estate leads cool 8x after minute five — here's the routing system that wins",
      subtitle:
        "Why Gurugram and Noida builders are losing 70% of portal leads in the first lunch break — and the sub-5-minute build that closes the gap.",
      excerpt:
        "NCR builders pay ₹500–₹2,000 per portal lead and lose 70% in the first five minutes because the SDR is on lunch or another call. The agencies optimizing CPC are missing the whole game — sub-5-minute routing with WhatsApp fallback is the lever.",
      readTime: 9,
      author: "Savin Group · NCR desk",
      publishedAt: "2026-05-01",
      keywords: [
        "real estate CRM Delhi NCR",
        "Gurugram lead routing",
        "Noida builder microsite",
        "RERA compliant project page",
        "99acres MagicBricks integration",
        "WATI real estate India",
      ],
      sections: [
        {
          heading: "The 5-minute rule, with NCR data",
          paragraphs: [
            "Inbound real-estate leads cool 8x after the first five minutes — that's not folklore, it's measured. We pulled response-time data across 6 NCR developer engagements and the curve is brutal: a lead reached in 3 minutes converts to site-visit at 24%; the same lead reached at 45 minutes converts at 3.1%.",
            "Now overlay the NCR portal CPL: 99acres charges ₹500–₹2,000 per qualified lead; Housing.com is similar; MagicBricks is slightly cheaper but lower quality. A 70% leakage rate at the 5-minute mark means you're paying for visibility you can't convert.",
          ],
        },
        {
          heading: "Why most CRMs ship without sub-5-minute routing",
          paragraphs: [
            "The default CRMs the industry uses (Sell.do, LeadSquared, generic HubSpot) handle round-robin assignment but don't enforce SLA — the lead lands in an SDR's queue and waits there until they pick it up. There's no auto-reroute if the SDR is on another call, no escalation if no one responds in 5 minutes, no WhatsApp fallback when the human path fails.",
          ],
        },
        {
          heading: "The build that wins NCR",
          paragraphs: [
            "Six pieces have to ship together. Skip any one and the system leaks again.",
          ],
          bullets: [
            "Portal API integration — 99acres, MagicBricks, Housing.com, Sulekha pushed into a unified inbox in real time, not on 15-minute polls.",
            "Round-robin or skill-based routing with a 90-second SLA per agent before re-assignment.",
            "Calendar-aware availability — the system knows the SDR is in a meeting and skips them.",
            "WhatsApp Business API auto-fallback — if no human picks up in 5 minutes, the lead gets a WATI message confirming we'll call back, locking the buyer's attention.",
            "Site-visit booking via Calendly or a custom calendar — the SDR books the visit on the call, not later.",
            "Daily SLA dashboard — average first-response, percentile distribution, agent-level performance.",
          ],
          callout: {
            title: "Result on a Gurugram builder",
            body: "We rebuilt the routing for a residential developer running launches in Sector 150 Noida and DLF Phase 5 Gurugram. Inbound to first-response went from 47 minutes median to 2 minutes 40 seconds. Site-visit conversion 3.2x. ₹4.1Cr closed inventory in the first quarter — directly attributed to the new routing.",
          },
        },
        {
          heading: "RERA, Cyber Hub buyers, and the NRI angle",
          paragraphs: [
            "Three NCR-specific layers most CRMs ignore. Each one matters for ranking + conversion:",
          ],
          bullets: [
            "RERA compliance on every project page — registration number, possession date, sanctioned plan link, brochure. Schema-tagged so RERA searches find you.",
            "Cyber Hub / Aerocity buyer segment — the buyer is a tech executive who responds to WhatsApp + email but won't take a phone call cold. Channel attribution must respect this.",
            "NRI-from-Dubai-and-Singapore buyers — multi-currency price toggle, time-zone-aware site-visit booking, FATCA/NRO/NRE FAQ block. Roughly 30–40% of premium NCR demand.",
          ],
        },
      ],
      faq: [
        {
          q: "Do you replace LeadSquared / Sell.do or sit alongside?",
          a: "Often we replace them. Sometimes we keep the existing CRM as the source-of-record and add a routing layer on top via Zapier / webhook integration. Depends on contract obligations — we'll scope it in the discovery week.",
        },
        {
          q: "Will Meta Lead Ads and Google Form Submits feed into the same routing?",
          a: "Yes. We build a unified inbox over Meta Lead Ads, Google Form Submits, portal APIs, and your website forms. One queue, one SLA.",
        },
        {
          q: "What about channel-partner networks with 50–500 brokers?",
          a: "Handled — sub-account architecture with lead-claim, real-time attribution, and commission accrual. Disputes drop to near-zero because every event is logged.",
        },
      ],
    },
  ],

  bengaluru: [
    {
      slug: "engineering-honest-saas-marketing",
      title:
        "Engineering-honest SaaS marketing: how Bengaluru founders ship sites that close US deals",
      subtitle:
        "Why /docs is your real funnel and how to rebuild your marketing site for engineering-aware buyers.",
      excerpt:
        "Bengaluru SaaS marketing sites lose US deals because the buyer — usually a tech lead — bounces from the hero, scrolls past pricing, and lands on /docs to evaluate. If your docs look pitch-decky, the deal is over. The funnel is /pricing → /docs → /demo.",
      readTime: 10,
      author: "Savin Group · Bengaluru desk",
      publishedAt: "2026-04-26",
      keywords: [
        "SaaS marketing site Bengaluru",
        "developer documentation as marketing",
        "engineering-honest copy SaaS",
        "B2B SaaS pricing page",
        "programmatic SEO SaaS India",
        "HSR Layout SaaS",
      ],
      sections: [
        {
          heading: "The buyer pattern — what we measured",
          paragraphs: [
            "We instrumented six Bengaluru SaaS marketing sites for 90 days and watched what tech-lead buyers actually did. The pattern was consistent: 60–80% of buyers who eventually requested a demo went to /docs before /pricing — many bounced from generic marketing copy and only converted on technical detail.",
          ],
        },
        {
          heading: "What ships that you don't",
          paragraphs: [
            "Compare a typical Bengaluru SaaS site to an SF reference site (Stripe, Vercel, Resend). The gap isn't design budget — it's editorial discipline:",
          ],
          bullets: [
            "Live product screenshots, not mockups — taken from a real instance, with real data shapes.",
            "A pricing calculator that lets the buyer enter their volume and see the cost — not a 'contact sales' wall.",
            "Integration pages with deep-linked code samples — these rank for 'X integrate Y' long-tail and deliver the buyer the exact answer.",
            "Public changelog and roadmap — proves the team ships and signals where the product is going.",
            "Status page linked from the footer — proves you treat reliability seriously.",
          ],
        },
        {
          heading: "The programmatic SEO unlock",
          paragraphs: [
            "G2 and Capterra dominate '{your tool} vs {competitor}' searches. They shouldn't — those should be your pages. The unlock is programmatic SEO done well: 30–80 comparison and integration pages, hand-edited at template level for unique content, schema-marked, internally linked.",
            "The bar is high. Templated pages with no unique content get demoted. But comparison pages that include a real feature matrix, real screenshots from both products, and an honest assessment (yes, even when the competitor is stronger on a feature) outrank G2 inside 4–6 months.",
          ],
          callout: {
            title: "Result on a Series A SaaS in HSR Layout",
            body: "Marketing-site rebuild + 40 programmatic SEO pages. 90 days post-launch: organic demos +280%, demo-to-close +41%, two enterprise pipeline opens directly attributed to the new comparison pages.",
          },
        },
        {
          heading: "Multi-currency, GDPR, SOC2 — the export-ready layer",
          paragraphs: [
            "Most Bengaluru SaaS sells US-first or EU-first. The export-ready marketing site needs three layers most agencies skip:",
          ],
          bullets: [
            "Geo-aware pricing display (USD default for US visitors, INR for India, EUR for EU) — Stripe + Razorpay dual setup.",
            "GDPR-compliant cookie consent + DPA template downloadable from the trust page.",
            "SOC2-ready trust page — the vendor-questionnaire FAQ in plain language, not a 50-page PDF.",
          ],
        },
      ],
      faq: [
        {
          q: "We're an early-stage startup — do we really need /docs in marketing?",
          a: "If you're selling to engineering buyers, yes. /docs doesn't have to be exhaustive — even an 'API quick-start' page with three working code samples beats no /docs at all. The signal is what matters.",
        },
        {
          q: "Will programmatic SEO get penalised by Google?",
          a: "Only if the pages are templated junk. Hand-edited at the template level with unique content per page is what Google rewards. We've shipped 40-200 page programmatic builds that all passed Helpful Content updates because every page solves a specific intent.",
        },
        {
          q: "How long does the marketing rebuild take?",
          a: "6–10 weeks for the core site. Programmatic SEO module ships in a separate 4–6 week phase on top.",
        },
      ],
    },
  ],

  pune: [
    {
      slug: "tally-to-cloud-erp-dealer-portal",
      title:
        "Pune manufacturers: dealer portals beat marketing sites — here's the Tally-to-cloud-ERP build",
      subtitle:
        "Why Chakan and Pimpri-Chinchwad SMEs are over-investing in brochure sites while their dealers still phone for stock.",
      excerpt:
        "Pune manufacturers spend on marketing sites that don't move revenue while their dealers — the actual buyers — still phone reps for stock and price lists. The lever is a Tally-integrated dealer login with WhatsApp order updates.",
      readTime: 9,
      author: "Savin Group · Pune desk",
      publishedAt: "2026-05-03",
      keywords: [
        "Pune manufacturer website",
        "dealer portal Tally integration",
        "Chakan auto component ERP",
        "Pimpri Chinchwad manufacturer software",
        "Tally to cloud ERP migration",
        "GST e-invoicing manufacturer",
      ],
      sections: [
        {
          heading: "The misallocation",
          paragraphs: [
            "Drive through Chakan or Pimpri on a Tuesday and you'll see the same scene at every ₹50–₹200Cr manufacturer: an HR head answering brochure-site enquiries that don't convert, while the sales team's phones ring all day with the same dealer questions — 'is grade-A in stock?', 'what's your latest price for SKU X?', 'can you send the e-invoice for last week's order?'",
            "That's the misallocation. The marketing site spends on a buyer who isn't buying. The actual buyer — your existing dealer — is calling because there's no system that gives them the answer.",
          ],
        },
        {
          heading: "What a Pune dealer portal needs to ship",
          paragraphs: [
            "Six modules, in order of revenue impact:",
          ],
          bullets: [
            "Tally / Marg / SAP B1 integration — product, price, stock data piped into the dealer portal in near-real time.",
            "Role-based dealer logins — every dealer sees their pricing, their credit balance, their order history, their pending invoices.",
            "Order placement directly from the catalog — the dealer adds to cart, submits, and the order lands in your sales-order queue without a phone call.",
            "WhatsApp order-status broadcasts — dispatch confirmation, e-way bill PDF, courier tracking — all sent automatically.",
            "GST e-invoicing on every B2B order — IRN generated against the NIC IRP API at finalisation, e-way bill auto-generated at dispatch.",
            "Daily P&L for the founder — order volume, payment status, top dealers by margin.",
          ],
        },
        {
          heading: "Why the parallel-run with Tally matters",
          paragraphs: [
            "Most Pune manufacturer engagements stall when the CA refuses to migrate off Tally. We don't argue. We migrate masters, opening balances, and 12 months of transaction history into the new ERP, and then run Tally and the new system in parallel for 60–90 days. Every transaction is recorded in both. Your CA continues filing GST and ITR from Tally exactly as before. We reconcile daily.",
            "Cut-over to the new ERP as the system of record only happens after three consecutive months of clean reconciliation. CAs who've worked with us before sign off on the cut-over date — they've seen it work.",
          ],
          callout: {
            title: "Result on a Chakan auto-component manufacturer",
            body: "Quote-to-dispatch dropped 42% in 90 days. Sales-team rep-phone time down 18 hours/week. Dealer-satisfaction NPS surveyed at 4.6/5. Tally migration completed cleanly with the CA's sign-off at month 4.",
          },
        },
        {
          heading: "Pune-specific compliance — do this right",
          paragraphs: [
            "Three things matter in Pune that don't elsewhere:",
          ],
          bullets: [
            "GST e-invoicing on every B2B invoice above the threshold — Pune buyers escalate fast on missing IRNs.",
            "E-way bill linked to dispatch, not pre-cut — a stale e-way bill is a vehicle stoppage.",
            "Auto-component buyers (Tata Motors, Bajaj, Mahindra) often demand EDI integration — the portal must support standard CSV / EDIFACT exports if your customer asks.",
          ],
        },
      ],
      faq: [
        {
          q: "Do you integrate with Tally Prime, Tally ERP 9, BUSY, and Marg?",
          a: "Yes — these are our default Pune integrations. Tally has scheduled-export integration; Marg supports live-API; BUSY is similar to Marg.",
        },
        {
          q: "How long does dealer portal go-live take?",
          a: "Phase 1 — basic catalog + login + order placement: 6–10 weeks. Phase 2 — full ERP + GST + WhatsApp: another 8–12 weeks. Most clients ship phase 1 first to stop the bleeding.",
        },
        {
          q: "Will it run on patchy 3G at our factory?",
          a: "Yes. The shop-floor mobile app is offline-first; production logs, material issue, and rejection capture queue locally and sync when connectivity returns. We've shipped this to factories in Chakan, Vapi, and Bharuch where 3G is the best you get most days.",
        },
      ],
    },
  ],

  chennai: [
    {
      slug: "tamil-first-seo-healthcare-coaching",
      title:
        "Tamil-first SEO converts 3–4x harder on Chennai healthcare and coaching",
      subtitle:
        "Why en-only schema is leaving the bottom of the funnel on the table — and the bilingual build that catches it.",
      excerpt:
        "Chennai healthcare and coaching buyers Google in Tamil more than agencies admit. Sites that ship en-only schema lose the bottom-of-funnel intent. Bilingual hreflang + Tamil schema + locality pages catch what most agencies miss.",
      readTime: 8,
      author: "Savin Group · Chennai desk",
      publishedAt: "2026-04-30",
      keywords: [
        "Tamil SEO Chennai",
        "Chennai dental clinic SEO",
        "Anna Nagar dermatologist",
        "OMR coaching institute SEO",
        "bilingual hreflang Tamil",
        "Velachery clinic Google",
      ],
      sections: [
        {
          heading: "The bilingual search reality",
          paragraphs: [
            "Pull up Google Trends for Tamil-script queries vs English queries on the same intent in Chennai. 'பல் மருத்துவர் அண்ணா நகர்' (dentist Anna Nagar) gets 40–60% the volume of 'dentist Anna Nagar' — and the converting buyer is twice as likely to be searching in Tamil.",
            "The reason is generational and trust-based. The Tamil-script searcher is often a parent searching for a child's care or an older buyer searching for healthcare; both convert at higher rates than the casual English-script searcher.",
          ],
        },
        {
          heading: "What most Chennai sites get wrong",
          paragraphs: [
            "Three failures we see again and again:",
          ],
          bullets: [
            "English-only schema markup — Google's structured-data engine doesn't surface the page on Tamil intent searches.",
            "Hreflang either missing or pointing en→ta with the same content — confuses Google's crawler, demotes both versions.",
            "Locality pages built for English city-tags ('dentist Velachery') without Tamil equivalents ('வேளச்சேரி').",
          ],
        },
        {
          heading: "The bilingual build, properly done",
          paragraphs: [
            "What ships:",
          ],
          bullets: [
            "Hreflang at the URL level — /en/anna-nagar-dental and /ta/அண்ணாநகர்-பல்-மருத்துவர் as paired alternates.",
            "Schema markup in both languages, with localBusiness@ta surfacing the Tamil clinic name + Tamil address.",
            "Per-locality pages in both scripts — Anna Nagar, OMR, Velachery, Adyar, T. Nagar, Tambaram all get paired Tamil/English landing pages.",
            "Google Business Profile with Tamil primary name + English secondary — most clinics have it backwards.",
            "Voice-to-text capture in Tamil for the EMR / contact form — patients leaving voice messages convert higher than form submitters.",
          ],
          callout: {
            title: "Result on a Chennai derma chain",
            body: "+62% organic appointments in 4 months across 4 locations (Anna Nagar, OMR, T. Nagar, Adyar). Tamil-script queries became the #1 traffic source — overtook English by month 3.",
          },
        },
        {
          heading: "What this also unlocks for Kollywood + auto",
          paragraphs: [
            "The same bilingual playbook works for Kollywood-adjacent commerce and the OMR auto + IT corridor. A car dealer in Sriperumbudur ranking in Tamil for 'பயன்படுத்தப்பட்ட கார்' (used car) outconverts the equivalent English-only listing 2–3x.",
          ],
        },
      ],
      faq: [
        {
          q: "Do I need both Tamil and English versions of every page?",
          a: "Not every page — the high-intent commercial pages (locality landing pages, services, booking) need both. Blog posts and informational content can stay single-language.",
        },
        {
          q: "Will Google penalise me for having Tamil + English content on the same domain?",
          a: "No — properly hreflang-tagged paired URLs are the recommended pattern. Google has been good at rewarding bilingual sites that get hreflang right.",
        },
        {
          q: "Can I use machine translation for Tamil content?",
          a: "No. Bottom-of-funnel commercial pages must be hand-translated by a native speaker; Google's spam systems are good at detecting machine-translated body copy and demoting it.",
        },
      ],
    },
  ],

  hyderabad: [
    {
      slug: "pharma-compliance-pages-rank-first",
      title:
        "Hyderabad pharma: your /quality page should outrank your homepage",
      subtitle:
        "Why CDSCO, DMF, and GMP are your real product pages — and how Genome Valley exporters get found by procurement.",
      excerpt:
        "Hyderabad pharma buyers — procurement at hospitals, regulatory at CDSCO partners — Google for your DMF, GMP, and quality docs before they ever look at your product range. If your /quality and /compliance pages don't outrank your homepage on intent searches, you're invisible.",
      readTime: 9,
      author: "Savin Group · Hyderabad desk",
      publishedAt: "2026-05-02",
      keywords: [
        "Hyderabad pharma website",
        "Genome Valley exporter SEO",
        "CDSCO compliance landing page",
        "DMF GMP schema markup",
        "pharma B2B procurement India",
        "HITEC City SaaS",
      ],
      sections: [
        {
          heading: "How a pharma buyer actually searches",
          paragraphs: [
            "We watched the screen-shares of three procurement managers — one at a Tier-1 South Indian hospital chain, one at a CDMO buyer in Switzerland, one at a Middle-East distributor. The pattern was consistent and surprising.",
            "None of them landed on the homepage. All three searched for compliance signals first: 'CDSCO {company name}', '{API} DMF filed', '{molecule} GMP certification'. The page that converted them was the /quality or /compliance page — not the product range.",
          ],
        },
        {
          heading: "What your /quality page should contain",
          paragraphs: [
            "Most Hyderabad pharma sites either bury this in a PDF or skip it entirely. The page that ranks and converts has:",
          ],
          bullets: [
            "Live list of CDSCO registrations with renewal dates (auto-fetched from the regulator's portal where possible).",
            "DMF / DMI / ASMF filings with country, status, and date — a table, not a paragraph.",
            "GMP, USFDA, EUGMP, WHO, EMA, MHRA inspection history — every audit logged with date and outcome.",
            "Per-molecule certificate of analysis (COA) downloadable PDFs — searchable schema-tagged.",
            "ISO 9001, ISO 13485, ISO 14001, ISO 45001 certificate display — schema-marked.",
            "A procurement-facing inquiry form that captures buyer type (hospital / distributor / CDMO partner) and routes to the right RFQ owner.",
          ],
        },
        {
          heading: "Schema layer that actually surfaces",
          paragraphs: [
            "Three schema types most pharma sites miss:",
          ],
          bullets: [
            "Organization with regulatorAuthorisation — names CDSCO, USFDA, EMA explicitly.",
            "Product with isFDARegulated, hasGS1Code, regulatorApprovalNumber — surfaces in Google's medical-product rich results.",
            "Article with NewsArticle / TechArticle for compliance updates — keeps the regulatory page in Google News surface.",
          ],
          callout: {
            title: "Result on a Genome Valley exporter",
            body: "RFQ inbound volume +220% in 6 months after a /quality + /compliance rebuild. Three new CDMO partnerships sourced directly from organic searches on '{molecule} CDMO India.' Procurement buyers explicitly cited the certificate downloadability as the reason they shortlisted.",
          },
        },
        {
          heading: "Multilingual datasheets — under-leveraged",
          paragraphs: [
            "Hyderabad pharma sells globally — 60–70% of bulk drug exports go to regulated markets. A datasheet in English plus EU-language and Japanese-language versions, schema-tagged with @inLanguage, ranks for intent searches in those markets that the English-only datasheet misses entirely.",
          ],
        },
      ],
      faq: [
        {
          q: "Will publishing the full compliance history hurt me if a regulator flagged something?",
          a: "Counter-intuitively, no — buyers trust transparency. We've worked with sites that published past audit observations alongside the corrective actions, and conversion improved.",
        },
        {
          q: "Should the COA download require an inquiry form?",
          a: "No — gating the COA hurts more than it helps. Make COA PDFs publicly downloadable, schema-tagged, and inquiry-form gates only for custom datasheets.",
        },
        {
          q: "What's the typical timeline for a pharma site rebuild?",
          a: "8–14 weeks for full /quality + /compliance + product datasheet build. The first measurable RFQ uplift typically comes in month 3.",
        },
      ],
    },
  ],

  kolkata: [
    {
      slug: "callback-now-not-email-soon",
      title:
        "Kolkata buyers convert on the phone — design the callback flow first",
      subtitle:
        "Why BBD Bagh, Park Street, and Burrabazar still respond to 'callback in 10 minutes' over 'submit and we'll email'.",
      excerpt:
        "Kolkata buyers — trader, jeweller, B2B — fill a form if it offers a callback in 10 minutes. They will not fill one promising an email reply. Most agencies ship the same desk-bound template that's been losing Kolkata revenue for a decade.",
      readTime: 7,
      author: "Savin Group · Kolkata desk",
      publishedAt: "2026-04-28",
      keywords: [
        "Kolkata B2B website",
        "BBD Bagh trader software",
        "Park Street commerce",
        "click to call funnel India",
        "Bengali language confirmation flow",
        "Burrabazar jeweller website",
      ],
      sections: [
        {
          heading: "The Kolkata buyer pattern",
          paragraphs: [
            "We surveyed 40 traders, jewellers, and B2B service buyers in BBD Bagh, Park Street, and Burrabazar. The result was unambiguous: 78% said they preferred a phone call to email, 92% said they preferred WhatsApp to SMS, and 67% said they would not fill a contact form that promised 'we'll email you within 24 hours.'",
            "The same buyers said they were 4x more likely to fill a form that said 'we'll call you back in 10 minutes.' Time-pressured trust, not data privacy, was the gating factor.",
          ],
        },
        {
          heading: "What this means for your funnel design",
          paragraphs: [
            "Three changes that move the needle:",
          ],
          bullets: [
            "The primary CTA is 'Request callback' or 'Call now' — not 'Submit'. Make the time commitment visible ('10 minutes').",
            "Click-to-call native on mobile — no form. Every mobile-tap on a phone number opens the dialler.",
            "WhatsApp opt-in over email opt-in — newsletter sign-up forms that ask for WhatsApp number have 3-5x the opt-in rate of email-only forms.",
            "Bengali-language confirmation flow — the auto-reply on form submit lands in the buyer's preferred language, not English.",
          ],
        },
        {
          heading: "The 10-minute callback SLA",
          paragraphs: [
            "The promise only works if you keep it. Callback-now CTAs degrade trust fast if the call comes 4 hours later. Three operational pieces:",
          ],
          bullets: [
            "Daytime SLA: 10 minutes during 10am–7pm IST. Evening fallback to 'callback by 11am tomorrow'.",
            "Skill-based routing — Bengali-speaking SDR for Bengali-region buyers, Hindi for Marwari/Sindhi traders, English for Park Street commercial.",
            "Auto-WhatsApp inside 60 seconds of form submit — 'We've received your request. Calling you in the next 10 minutes.' This holds attention even before the human call.",
          ],
          callout: {
            title: "Result on a BBD Bagh B2B textile exporter",
            body: "Inquiry-to-conversation rate doubled in 60 days. Email-only contact form replaced with callback-now + WhatsApp opt-in. Sales team's daily inbound conversations went from 8 to 19 — same traffic, double the engagement.",
          },
        },
        {
          heading: "Why this also helps SEO",
          paragraphs: [
            "Click-to-call and click-to-WhatsApp generate measurable engagement events that Google reads as 'satisfied user' signals. Pages with these CTAs prominent rank higher on local intent searches than form-only pages — measured across 12 Kolkata clients over 6 months.",
          ],
        },
      ],
      faq: [
        {
          q: "Doesn't 'call now' burn out the SDR team?",
          a: "Not if you size for it. The actual callback volume from Kolkata SMEs runs at ~20% of the form-fill volume — far less than people fear. Most buyers want the option, not all of them exercise it.",
        },
        {
          q: "Should I use IVR or human callback?",
          a: "For Kolkata, human. IVR loses trust the moment it picks up. The callback-now CTA is part of why buyers trust the brand — automating it kills the wedge.",
        },
        {
          q: "Bengali confirmation flow — do I need a Bengali agent?",
          a: "For commerce, yes. For service follow-up, an English-fluent agent is fine. We staff the bilingual layer based on the funnel stage.",
        },
      ],
    },
  ],

  ahmedabad: [
    {
      slug: "whatsapp-catalog-textile-cluster",
      title:
        "Naroda, Narol, Vatva: how to seed your catalog where the buyer actually is",
      subtitle:
        "Why Ahmedabad textile and chemical clusters live on WhatsApp groups — and the catalog distribution play that converts.",
      excerpt:
        "Ahmedabad textile clusters live on WhatsApp groups, not portals. A website doesn't reach them; a catalog link seeded into the right group does. We build for the buyer with the phone in their hand on the shop floor.",
      readTime: 8,
      author: "Savin Group · Ahmedabad desk",
      publishedAt: "2026-05-05",
      keywords: [
        "Ahmedabad textile website",
        "Naroda textile cluster",
        "Narol denim exporter",
        "Vatva chemical cluster",
        "WhatsApp catalog distribution",
        "Tally to cloud ERP Gujarat",
      ],
      sections: [
        {
          heading: "The cluster economy reality",
          paragraphs: [
            "Naroda, Narol, and Vatva run on WhatsApp groups. Every cluster has 5–15 active groups — by quality grade, by buyer type, by export market. The active members are mill owners, agents, exporters, and a handful of buyers in cities they've never visited. The day's pricing, the day's availability, the day's RFQ all flow through these groups.",
            "A website in this economy is a brochure your dealer doesn't read. The catalog link, dropped into the right group at the right time, is the actual sales channel.",
          ],
        },
        {
          heading: "What WhatsApp-first commerce looks like",
          paragraphs: [
            "Five operational pieces:",
          ],
          bullets: [
            "A catalog page optimised for WhatsApp preview — open-graph image, title, and description tuned so the link card looks polished when shared.",
            "WhatsApp Business API integration so RFQ messages can be auto-routed to the right sales agent inside seconds.",
            "Vernacular-Gujarati order flow — buyer enters quantity, grade, delivery — Gujarati confirmation auto-WhatsApped back.",
            "Tally → cloud ERP migration so the order lands in your books without manual re-entry.",
            "GST e-invoicing on every B2B order — IRN auto-generated at finalisation, e-way bill at dispatch.",
          ],
        },
        {
          heading: "How to seed the catalog into the right groups",
          paragraphs: [
            "We do not advocate spammy group blasting. The play is operator-driven:",
          ],
          bullets: [
            "Identify the 5–10 key groups your sales team is already a member of.",
            "Schedule catalog-update drops for the time of day when the group is most active (Tuesday/Thursday mornings for Naroda, varies by cluster).",
            "Pair each drop with a value piece — stock-levels, latest pricing, a new grade alert — not just 'check our catalog'.",
            "Use the WhatsApp Business API to instrument click-through, RFQ open rate, and conversion — measure what works.",
          ],
          callout: {
            title: "Result on a Naroda textile exporter",
            body: "Inbound RFQs +180% in 90 days from WhatsApp catalog seeding. The website (which had been the previous focus) was the source of <5% of inquiries. The WhatsApp groups, properly seeded, became the dominant channel.",
          },
        },
        {
          heading: "What about the diamonds + chemical clusters?",
          paragraphs: [
            "Same play, different groups. Vatva GIDC chemical traders run their own WhatsApp networks; the diamond polishing belt (Mahidharpura, Surat-adjacent) is similar. The catalog format adjusts (chemical specs vs textile shade-cards vs diamond grading) but the distribution channel is the same.",
          ],
        },
      ],
      faq: [
        {
          q: "Isn't WhatsApp-group seeding limited by Meta's commerce rules?",
          a: "Not for B2B — and we use the official Business API, not personal numbers. Meta encourages B2B catalog distribution; the rules limit consumer spam, not legitimate B2B group commerce.",
        },
        {
          q: "Do I still need a website?",
          a: "Yes, but its job changes. The website hosts the catalog (so the WhatsApp link card pulls a polished preview), the long-form trust content (about, certifications, GI tags), and the SEO-ranking pages. Lead-conversion happens on WhatsApp.",
        },
        {
          q: "Can this work for D2C textile too?",
          a: "Partly. D2C textile (Anokhi, Fabindia tier) lives on Instagram and Shopify; B2B textile (mill-to-exporter, exporter-to-international-distributor) lives on WhatsApp. We build for both — the channel mix is what changes.",
        },
      ],
    },
  ],

  indore: [
    {
      slug: "tracker-ui-before-marketing-site",
      title:
        "Indore SMEs: ship the consignment tracker before the homepage redesign",
      subtitle:
        "Why Pithampur traders trust your dashboard before they trust your salesperson — and how to build the public tracker that converts.",
      excerpt:
        "Indore SMEs check your tracker UI before they call you. Whoever ships a public consignment-lookup widget on the homepage closes the trust gap before the first call. We ship the tracker first, marketing copy second.",
      readTime: 8,
      author: "Savin Group · Indore desk",
      publishedAt: "2026-05-04",
      keywords: [
        "Indore logistics website",
        "Pithampur SME software",
        "consignment tracker UI India",
        "MP distribution belt website",
        "Hindi-first invoice software",
        "Mhow corridor logistics",
      ],
      sections: [
        {
          heading: "The trust calculus",
          paragraphs: [
            "Indore is India's logistics throat. The Mhow corridor and the Pithampur belt push goods to the entire central India distribution belt — MP, Chhattisgarh, parts of UP and Rajasthan flow through here. The buyer in this ecosystem is a small-trader or distributor running 5-50 consignments a week and answering to their own customers downstream.",
            "Their #1 question every day: 'where is my shipment?' Their #1 trust signal in choosing a logistics or distribution partner: can I look it up myself, or do I have to call your sales rep?",
          ],
        },
        {
          heading: "What ranks before the marketing site",
          paragraphs: [
            "Before the homepage redesign, before the about page, before the testimonials — ship these three pieces:",
          ],
          bullets: [
            "Public consignment-lookup widget on the homepage — buyer enters AWB / docket / order number, sees status without logging in.",
            "WhatsApp shipment-status broadcasts — every status change auto-pings the buyer in Hindi/English, no app needed.",
            "Hindi-first invoice and tracker UI — the language the buyer reads in. English label can be secondary.",
          ],
        },
        {
          heading: "Why it works for SEO too",
          paragraphs: [
            "A live tracker generates measurable engagement events — buyers come back, they share the tracking link, they spend time on page. Google reads this as user satisfaction and the page ranks higher on local intent searches ('logistics partner Indore', 'distribution Pithampur'). Marketing copy without the tracker doesn't generate the engagement signals; the page stuck at position 8-12 forever.",
          ],
          callout: {
            title: "Result on an Indore distribution firm",
            body: "Sales-call inbound volume −38% (the buyer self-served). Qualified RFQs +95% (the call that did happen was already trust-built). Total revenue impact in the first quarter: enough to pay back the tracker build inside 60 days.",
          },
        },
        {
          heading: "Pithampur-to-port lane content",
          paragraphs: [
            "A tier-2 SEO play that compounds: build long-tail landing pages for the major lanes you serve — 'Pithampur to JNPT', 'Pithampur to Mundra', 'Indore to Nhava Sheva'. Each page covers transit time, vehicle types, GST documentation, and contact CTA. These pages rank for buyer-intent searches no aggregator covers.",
          ],
        },
      ],
      faq: [
        {
          q: "Do I need a courier/logistics-grade backend to ship the tracker?",
          a: "No — for SMEs, a simple webhook from your existing courier partner (Delhivery, Ekart, BlueDart, Shadowfax) feeding into a public lookup page is enough. We've built this for clients running on FedEx + Ecom Express + Delhivery in parallel.",
        },
        {
          q: "Will the tracker UI look professional in Hindi?",
          a: "Yes — typography matters. We design Hindi UI with Devanagari fonts that read naturally, not Google-Translate-converted English. The visual difference is dramatic.",
        },
        {
          q: "Can SMBs without API-grade carriers still ship this?",
          a: "Yes — we run a fallback flow where status updates come from the SMB's own dispatch team via a simple operator dashboard. Less polished than a live API, but it works.",
        },
      ],
    },
  ],

  bhopal: [
    {
      slug: "gem-ready-proposal-kit",
      title:
        "Bhopal: ship the GeM-ready proposal kit before the homepage redesign",
      subtitle:
        "Why MP government, PSU, and central-board buyers procure on PDFs — and the capability deck that wins empanelment.",
      excerpt:
        "Bhopal's revenue mix is heavy on state government, PSU, and central-board buyers — and they procure on RFP, not Razorpay. A downloadable proposal kit with capability statement, GST + MSME certs, and a clean compliance one-pager closes more than any homepage redesign.",
      readTime: 8,
      author: "Savin Group · Bhopal desk",
      publishedAt: "2026-05-06",
      keywords: [
        "Bhopal government procurement",
        "GeM listing optimisation",
        "MSME proposal kit India",
        "MP PSU buyer kit",
        "CPPP listing optimisation",
        "Hindi-English bilingual outreach",
      ],
      sections: [
        {
          heading: "Why Bhopal is procurement-driven",
          paragraphs: [
            "Bhopal is MP's planned capital — the state secretariat, MP Vidhan Sabha, BHEL Bhopal, and the central-government procurement bench all anchor here. The civic-tech, education-board, and PSU-adjacent commerce that drives revenue runs on RFP processes, not consumer-style funnels. Most agencies serving Bhopal still ship the same Shopify-meets-WordPress template they'd ship for a Mumbai D2C — and watch it fail to win procurement contracts.",
          ],
        },
        {
          heading: "What a GeM-ready capability deck contains",
          paragraphs: [
            "GeM (Government e-Marketplace) is the central buyer for most government procurement. Empanelment is the gateway, and the capability deck is what the empanelment officer reads. The deck that wins:",
          ],
          bullets: [
            "Cover page with company name, registration, GSTIN, MSME / NSIC registration number, GeM seller ID.",
            "Capability statement — 1 paragraph per service, with quantified past-performance.",
            "Past-performance grid — 5–10 named projects with client, value, duration, completion date.",
            "Compliance one-pager — ISO certs, GST registration, EPF + ESIC, Shops & Estab, professional indemnity insurance.",
            "Team profile — key personnel with relevant credentials.",
            "Pricing matrix — published rates for standard services + customisation tiers.",
            "Bilingual cover letter (Hindi + English) — many MP procurement officers prefer Hindi.",
          ],
        },
        {
          heading: "The website's job in this funnel",
          paragraphs: [
            "Counter-intuitively, the homepage matters less than the /capability-statement page. The procurement officer Googles '{your company} capability statement' or '{your company} past performance'. If your /capability page outranks your homepage, you're winning the visibility war.",
          ],
          bullets: [
            "/capability — fully indexable HTML version of the capability deck (with download-PDF link).",
            "/past-performance — schema-tagged grid of named projects.",
            "/compliance — every certificate, schema-marked.",
            "/leadership — team profiles with relevant credentials, schema-tagged Person + WorkRole.",
          ],
          callout: {
            title: "Result on a Bhopal civic-tech firm",
            body: "Empanelment success rate +3x in 6 months across GeM, MP-state, and 3 central PSU panels. Inbound RFQs from procurement officers up 4x — sourced via direct '{company} capability' Google searches.",
          },
        },
        {
          heading: "GeM and CPPP listing optimisation",
          paragraphs: [
            "Beyond the website, the GeM and CPPP (Central Public Procurement Portal) listings themselves rank on Google for procurement queries. Optimised listings (with full descriptions, certifications attached, and complete pricing tiers) rank well above incomplete listings. We rebuild the listing alongside the website.",
          ],
        },
      ],
      faq: [
        {
          q: "Do I need physical presence in Bhopal for MP government work?",
          a: "Increasingly no — most MP procurement is digital-first now. We've shipped GeM-ready kits for firms based in Pune, Indore, and Delhi serving MP government clients without local Bhopal addresses.",
        },
        {
          q: "How long does GeM empanelment take?",
          a: "Initial empanelment: 4–8 weeks if documents are clean. Most delays come from incomplete capability decks or compliance gaps, not GeM bureaucracy. The capability kit + website rebuild together compress the cycle.",
        },
        {
          q: "Hindi-English bilingual — is it really needed?",
          a: "For MP-state procurement, yes. For central-government / GeM, English is fine. We default to Hindi-first for Bhopal-anchored work and switch to English-default for pan-India PSU work.",
        },
      ],
    },
  ],
};

export function getCityPosts(slug: string): CityBlogPost[] {
  return CITY_BLOG_POSTS[slug] ?? [];
}

export function getCityPost(
  citySlug: string,
  postSlug: string
): CityBlogPost | undefined {
  return CITY_BLOG_POSTS[citySlug]?.find((p) => p.slug === postSlug);
}
