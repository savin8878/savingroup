/**
 * Branded, static pricing sheet rendered with @react-pdf/renderer and served
 * by the sibling `route.ts` as a downloadable `application/pdf`.
 *
 * This is a print artifact, not the live page — no animations, fixed layout,
 * built-in Helvetica fonts (so it renders identically everywhere). The ₹ glyph
 * is not in Helvetica's base set, so prices are rendered with an "Rs " prefix
 * to avoid missing-glyph boxes. Content is read from the same `t.pricing`
 * dictionary the web page uses, so the PDF never drifts from the site.
 */
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Messages } from "@/lib/i18n";

/* ---- shape of the pricing dictionary (heterogeneous tiers → declare it) ---- */
interface Feature {
  label: string;
  on: boolean;
}
interface Tier {
  id: string;
  name: string;
  tagline: string;
  priceRange: string;
  priceInfo: string;
  scope: string;
  reqTag: string;
  costRows: { label: string; value: string }[];
  extras: string[];
  groups: { heading: string; items: Feature[] }[];
}
interface PdfData {
  title: string;
  subtitle: string;
  note: string;
  tiers: Tier[];
  comparison: {
    title: string;
    intro: string;
    cards: { title: string; price: string; scale: string; highlight: boolean; features: Feature[] }[];
  };
  advantages: { title: string; items: { title: string; body: string }[] };
  table: {
    title: string;
    featureLabel: string;
    othersLabel: string;
    tierLabels: string[];
    rows: { feature: string; others: string; values: string[]; on: boolean[] }[];
  };
  highlight: { title: string; lineA: string; lineB: string };
}

const C = {
  accent: "#C0781A",
  accentTint: "#FBEFDC",
  success: "#2E8B4F",
  ink: "#1A1A1A",
  gray: "#555555",
  faint: "#9A9A9A",
  border: "#E4E4E4",
  tint: "#F7F4EF",
  white: "#FFFFFF",
};

/** Helvetica has no ₹ glyph — swap to "Rs " so prices render cleanly. */
const rs = (s: string) => s.replace(/₹/g, "Rs ");

const s = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 46,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.gray,
    lineHeight: 1.4,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 16, color: C.accent },
  brandTag: { fontSize: 7.5, color: C.faint, marginTop: 2, letterSpacing: 1 },
  headerRight: { alignItems: "flex-end" },
  kicker: { fontFamily: "Helvetica-Bold", fontSize: 9, color: C.ink, letterSpacing: 2 },
  date: { fontSize: 7.5, color: C.faint, marginTop: 2 },
  rule: { height: 1.5, backgroundColor: C.accent, marginTop: 8, marginBottom: 14 },

  h1: { fontFamily: "Helvetica-Bold", fontSize: 18, color: C.ink, marginBottom: 5 },
  sub: { fontSize: 9, color: C.gray, marginBottom: 10, maxWidth: 460 },
  noteBox: {
    backgroundColor: C.accentTint,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    borderRadius: 3,
    padding: 8,
    marginBottom: 16,
  },
  noteText: { fontSize: 8, color: C.ink },

  cardsWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 11,
    marginBottom: 13,
  },
  cardFeatured: { borderWidth: 1.5, borderColor: C.accent, backgroundColor: "#FFFCF7" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tierName: { fontFamily: "Helvetica-Bold", fontSize: 13, color: C.ink },
  popPill: {
    backgroundColor: C.accent,
    color: C.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 1,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  tierTag: { fontSize: 7.5, color: C.gray, marginTop: 2, marginBottom: 7 },
  price: { fontFamily: "Helvetica-Bold", fontSize: 15, color: C.accent },
  priceInfo: { fontSize: 6.5, color: C.faint, marginTop: 1, marginBottom: 7 },
  scopeBox: {
    backgroundColor: C.tint,
    borderRadius: 3,
    paddingVertical: 4,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: C.ink,
    marginBottom: 3,
  },
  reqTag: { fontSize: 6.5, color: C.accent, marginBottom: 7 },

  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1,
    color: C.ink,
    marginTop: 5,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  costRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1.5 },
  costLabel: { fontSize: 7.5, color: C.gray, flex: 1 },
  costVal: { fontSize: 7.5, color: C.ink, fontFamily: "Helvetica-Bold" },
  liRow: { flexDirection: "row", marginBottom: 1.5 },
  bulletOn: { fontFamily: "Helvetica-Bold", color: C.success, fontSize: 7.5, width: 8 },
  bulletOff: { color: C.faint, fontSize: 7.5, width: 8 },
  liOn: { fontSize: 7.5, color: C.ink, flex: 1 },
  liOff: { fontSize: 7.5, color: C.faint, flex: 1 },

  h2: { fontFamily: "Helvetica-Bold", fontSize: 14, color: C.ink, marginBottom: 4 },
  h2sub: { fontSize: 8.5, color: C.gray, marginBottom: 12, maxWidth: 470 },

  compRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  compCard: { width: "32%", borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: 10 },
  compCardHi: { borderWidth: 1.5, borderColor: C.accent, backgroundColor: "#FFFCF7" },
  compTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: C.ink, textAlign: "center" },
  compPrice: { fontFamily: "Helvetica-Bold", fontSize: 16, textAlign: "center", marginTop: 4 },
  compScale: { fontSize: 7, color: C.faint, textAlign: "center", marginBottom: 7 },

  /* table */
  tHeadRow: { flexDirection: "row", backgroundColor: C.tint, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.border },
  tRowAlt: { backgroundColor: "#FBFBFB" },
  th: { fontFamily: "Helvetica-Bold", fontSize: 6.8, color: C.ink, padding: 4, letterSpacing: 0.5 },
  thAccent: { color: C.accent },
  td: { fontSize: 6.8, padding: 4 },
  cFeature: { width: "22%" },
  cOthers: { width: "15%" },
  cTier: { width: "15.75%" },

  advWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 6 },
  advItem: { width: "48.5%", marginBottom: 8 },
  advTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.ink, marginBottom: 1 },
  advBody: { fontSize: 7.5, color: C.gray },

  highlight: {
    backgroundColor: C.accentTint,
    borderWidth: 1,
    borderColor: C.accent,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  hTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.ink, marginBottom: 4, textAlign: "center" },
  hLine: { fontSize: 8.5, color: C.gray, textAlign: "center", marginBottom: 2 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 6,
    fontSize: 7,
    color: C.faint,
  },
});

function TierCard({ tier }: { tier: Tier }) {
  const featured = tier.id === "growth";
  return (
    <View style={featured ? [s.card, s.cardFeatured] : s.card} wrap={false}>
      <View style={s.cardTopRow}>
        <Text style={s.tierName}>{tier.name}</Text>
        {featured && <Text style={s.popPill}>MOST POPULAR</Text>}
      </View>
      <Text style={s.tierTag}>{tier.tagline}</Text>
      <Text style={s.price}>{rs(tier.priceRange)}</Text>
      <Text style={s.priceInfo}>{tier.priceInfo}</Text>
      <Text style={s.scopeBox}>{tier.scope}</Text>
      <Text style={s.reqTag}>{tier.reqTag}</Text>

      {tier.costRows.map((row) => (
        <View key={row.label} style={s.costRow}>
          <Text style={s.costLabel}>{row.label}</Text>
          <Text style={s.costVal}>{row.value}</Text>
        </View>
      ))}

      <Text style={s.sectionLabel}>Free extras</Text>
      {tier.extras.map((e) => (
        <View key={e} style={s.liRow}>
          <Text style={s.bulletOn}>+</Text>
          <Text style={s.liOn}>{e}</Text>
        </View>
      ))}

      {tier.groups.map((g) => (
        <View key={g.heading}>
          <Text style={s.sectionLabel}>{g.heading}</Text>
          {g.items.map((it) => (
            <View key={it.label} style={s.liRow}>
              <Text style={it.on ? s.bulletOn : s.bulletOff}>{it.on ? "•" : "–"}</Text>
              <Text style={it.on ? s.liOn : s.liOff}>{it.label}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function buildPricingDocument({
  t,
  dateLabel,
  website,
  email,
  phone,
}: {
  t: Messages;
  dateLabel: string;
  website: string;
  email: string;
  phone: string;
}) {
  const p = t.pricing as unknown as PdfData;
  const brandName = t.brand.name;
  const tagline = t.brand.tagline;

  const Footer = () => (
    <View style={s.footer} fixed>
      <Text>
        {website} · {email} · {phone}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${brandName} · ${pageNumber}/${totalPages}`} />
    </View>
  );

  const Header = () => (
    <View>
      <View style={s.headerRow}>
        <View>
          <Text style={s.brand}>{brandName}</Text>
          <Text style={s.brandTag}>{tagline.toUpperCase()}</Text>
        </View>
        <View style={s.headerRight}>
          <Text style={s.kicker}>PRICING</Text>
          <Text style={s.date}>{dateLabel}</Text>
        </View>
      </View>
      <View style={s.rule} />
    </View>
  );

  return (
    <Document
      title={`${brandName} — Pricing`}
      author={brandName}
      subject="Pricing plans"
      creator={brandName}
    >
      {/* Page 1 — plans */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h1}>{p.title}</Text>
        <Text style={s.sub}>{p.subtitle}</Text>
        <View style={s.noteBox}>
          <Text style={s.noteText}>{rs(p.note)}</Text>
        </View>
        <View style={s.cardsWrap}>
          {p.tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </View>
        <Footer />
      </Page>

      {/* Page 2 — how we're different + table + advantages */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.h2}>{p.comparison.title}</Text>
        <Text style={s.h2sub}>{rs(p.comparison.intro)}</Text>

        <View style={s.compRow}>
          {p.comparison.cards.map((card) => (
            <View key={card.title} style={card.highlight ? [s.compCard, s.compCardHi] : s.compCard} wrap={false}>
              <Text style={s.compTitle}>{card.title}</Text>
              <Text style={[s.compPrice, { color: card.highlight ? C.accent : C.faint }]}>
                {rs(card.price)}
              </Text>
              <Text style={s.compScale}>{card.scale}</Text>
              {card.features.map((f) => (
                <View key={f.label} style={s.liRow}>
                  <Text style={f.on ? s.bulletOn : s.bulletOff}>{f.on ? "•" : "–"}</Text>
                  <Text style={f.on ? s.liOn : s.liOff}>{f.label}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* comparison table */}
        <Text style={[s.sectionLabel, { fontSize: 9, marginBottom: 5 }]}>{p.table.title}</Text>
        <View>
          <View style={s.tHeadRow}>
            <Text style={[s.th, s.cFeature]}>{p.table.featureLabel}</Text>
            <Text style={[s.th, s.cOthers]}>{p.table.othersLabel}</Text>
            {p.table.tierLabels.map((label, i) => (
              <Text key={label} style={[s.th, s.cTier, i === 1 ? s.thAccent : {}]}>
                {label}
              </Text>
            ))}
          </View>
          {p.table.rows.map((row, ri) => (
            <View key={row.feature} style={ri % 2 === 1 ? [s.tRow, s.tRowAlt] : s.tRow} wrap={false}>
              <Text style={[s.td, s.cFeature, { fontFamily: "Helvetica-Bold", color: C.ink }]}>
                {row.feature}
              </Text>
              <Text style={[s.td, s.cOthers, { color: C.faint }]}>{rs(row.others)}</Text>
              {row.values.map((v, vi) => (
                <Text
                  key={vi}
                  style={[s.td, s.cTier, { color: row.on[vi] ? C.ink : C.faint }]}
                >
                  {row.on[vi] ? "• " : "– "}
                  {rs(v)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* advantages */}
        <Text style={[s.sectionLabel, { fontSize: 9, marginTop: 16, marginBottom: 6 }]}>
          {p.advantages.title}
        </Text>
        <View style={s.advWrap}>
          {p.advantages.items.map((adv) => (
            <View key={adv.title} style={s.advItem} wrap={false}>
              <Text style={s.advTitle}>{adv.title}</Text>
              <Text style={s.advBody}>{adv.body}</Text>
            </View>
          ))}
        </View>

        {/* highlight */}
        <View style={s.highlight} wrap={false}>
          <Text style={s.hTitle}>{p.highlight.title}</Text>
          <Text style={s.hLine}>{rs(p.highlight.lineA)}</Text>
          <Text style={s.hLine}>{rs(p.highlight.lineB)}</Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}
