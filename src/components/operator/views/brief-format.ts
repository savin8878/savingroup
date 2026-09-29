// components/operator/views/brief-format.ts
//
// Text renderings of an audit brief and a Business X-Ray: Markdown for the
// download, plain text for the clipboard and for the WhatsApp / email links
// the visitor opens themselves. Pure — labels arrive as arguments (from
// views-copy) and only protocol types are imported — so node --test can load
// it and the size caps are testable offline.
//
// The caps exist because the handoff is a URL. wa.me and mailto: links are
// cut or refused by some apps well before 2,000 characters, and a brief is
// typed in Devanagari, Arabic or Han as often as in English, where one
// character can encode to nine. So the limits below are measured on the
// ENCODED text, and a cut always lands on a line boundary with a note that
// the full brief is one Copy or Download away — never mid-sentence, never
// silently.

import type { AuditBrief, AutomationLevel, BusinessXRay, CapabilityId } from "@/lib/operator/protocol";

/** Longest `text=` value (after encodeURIComponent) we put in a wa.me link. */
export const WHATSAPP_TEXT_MAX = 1800;
/** Longest `body=` value (after encoding, CRLF line breaks) we put in a mailto: link. */
export const MAILTO_BODY_MAX = 1800;

export type BriefField =
  | "summary"
  | "company"
  | "contact"
  | "industry"
  | "currentSystems"
  | "currentWorkflow"
  | "primaryProblem"
  | "observedFriction"
  | "desiredOutcome"
  | "potentialArchitecture"
  | "unknowns"
  | "urgency"
  | "relevantCapabilities";

/**
 * One order everywhere (screen, clipboard, links). The summary leads because
 * a capped WhatsApp message loses its END, and the summary is the one field
 * that stands on its own.
 */
export const BRIEF_FIELDS: readonly BriefField[] = [
  "summary",
  "company",
  "contact",
  "industry",
  "currentSystems",
  "currentWorkflow",
  "primaryProblem",
  "observedFriction",
  "desiredOutcome",
  "potentialArchitecture",
  "unknowns",
  "urgency",
  "relevantCapabilities",
];

export interface BriefLabels {
  /** "Audit brief" — heading, email subject, file name. */
  title: string;
  /** First line of the WhatsApp / email text, in the visitor's voice. */
  greeting: string;
  fields: Record<BriefField, string>;
  contact: { name: string; role: string; email: string; phone: string };
  capabilities: Record<CapabilityId, string>;
  /** Appended when a text had to be cut: "…(full brief: use Copy or Download)". */
  truncated: string;
  /** Markdown footer label before the destinations. */
  sendTo: string;
}

export interface XRayLabels {
  /** The eight section names, in order. */
  sections: string[];
  company: string;
  companyFields: { industry: string; size: string; locations: string; offering: string };
  stated: string;
  inferred: string;
  /** Names of automation levels 0–6. */
  levels: string[];
  approach: string;
  scope: string;
  successMeasure: string;
  /** Shown for an empty section. */
  none: string;
}

export interface BriefEntry {
  field: BriefField;
  label: string;
  value: string | string[];
}

/** Collapse any line breaks the model put inside a value, so one field is one line. */
const oneLine = (text: string) => text.replace(/\s*[\r\n]+\s*/g, " ").trim();
const present = (text: string | undefined): text is string => typeof text === "string" && text.trim() !== "";

/** "918305838352" → "+91 83058 38352"; any other length → "+<digits>". */
export function formatWhatsAppNumber(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  const india = /^91(\d{5})(\d{5})$/.exec(clean);
  return india ? `+91 ${india[1]} ${india[2]}` : `+${clean}`;
}

/** Contact details the visitor volunteered, joined for one line; "" when none. */
export function contactLine(contact: AuditBrief["contact"]): string {
  if (!contact) return "";
  return [contact.name, contact.role, contact.email, contact.phone].filter(present).map(oneLine).join(" · ");
}

/** The fields that have something to say, in BRIEF_FIELDS order. Missing optional fields are omitted, never filled. */
export function briefEntries(brief: AuditBrief, labels: BriefLabels): BriefEntry[] {
  const values: Record<BriefField, string | string[] | undefined> = {
    summary: brief.summary,
    company: brief.company,
    contact: contactLine(brief.contact),
    industry: brief.industry,
    currentSystems: brief.currentSystems,
    currentWorkflow: brief.currentWorkflow,
    primaryProblem: brief.primaryProblem,
    observedFriction: brief.observedFriction,
    desiredOutcome: brief.desiredOutcome,
    potentialArchitecture: brief.potentialArchitecture,
    unknowns: brief.unknowns,
    urgency: brief.urgency,
    relevantCapabilities: brief.relevantCapabilities.map((id) => labels.capabilities[id] ?? id),
  };
  const entries: BriefEntry[] = [];
  for (const field of BRIEF_FIELDS) {
    const value = values[field];
    if (Array.isArray(value)) {
      const items = value.filter(present).map(oneLine);
      if (items.length) entries.push({ field, label: labels.fields[field], value: items });
    } else if (present(value)) {
      entries.push({ field, label: labels.fields[field], value: oneLine(value) });
    }
  }
  return entries;
}

export function briefSubject(brief: AuditBrief, labels: BriefLabels): string {
  return present(brief.company) ? `${labels.title} — ${oneLine(brief.company)}` : labels.title;
}

/**
 * Keep whole lines from the top while `fits` holds, then add `note`. If not
 * even the first line fits beside the note (a pathological one-paragraph
 * field), that line is cut at a word boundary instead, so the result is
 * never just the note.
 */
function fitLines(lines: string[], fits: (text: string) => boolean, note: string): string {
  const whole = lines.join("\n");
  if (fits(whole)) return whole;
  const withNote = (kept: string[]) => [...kept, note].join("\n");
  const kept: string[] = [];
  for (const line of lines) {
    if (!fits(withNote([...kept, line]))) break;
    kept.push(line);
  }
  // Trailing blank lines and orphaned list headings read as a broken message.
  while (kept.length && (kept[kept.length - 1] === "" || kept[kept.length - 1].endsWith(":"))) kept.pop();
  if (kept.length === 0 && lines.length) {
    const words = lines[0].split(" ");
    let cut = "";
    for (const word of words) {
      const next = cut ? `${cut} ${word}` : word;
      if (!fits(withNote([`${next}…`]))) break;
      cut = next;
    }
    if (cut) kept.push(`${cut}…`);
  }
  return withNote(kept);
}

/**
 * The brief as plain text: greeting, title, then one line per field (lists
 * as "- item" lines). When `measure(text)` exceeds `maxChars`, whole lines
 * are dropped from the end and `labels.truncated` is appended. `measure`
 * defaults to the character count; pass `whatsAppLength` / `mailtoLength`
 * to cap by the encoded size of the link instead.
 */
export function briefToPlainText(
  brief: AuditBrief,
  labels: BriefLabels,
  maxChars: number,
  measure: (text: string) => number = (text) => text.length,
): string {
  const lines = [labels.greeting, "", labels.title, ""];
  for (const entry of briefEntries(brief, labels)) {
    if (Array.isArray(entry.value)) {
      if (entry.field === "currentSystems" || entry.field === "relevantCapabilities") lines.push(`${entry.label}: ${entry.value.join(", ")}`);
      else lines.push(`${entry.label}:`, ...entry.value.map((item) => `- ${item}`));
    } else {
      lines.push(`${entry.label}: ${entry.value}`);
    }
  }
  return fitLines(lines, (text) => measure(text) <= maxChars, labels.truncated);
}

/** Length of `text` once it is a wa.me `text=` value. */
export const whatsAppLength = (text: string) => encodeURIComponent(text).length;
/** Length of `text` once it is a mailto: `body=` value (CRLF line breaks, RFC 6068). */
export const mailtoLength = (text: string) => encodeURIComponent(text.replace(/\r?\n/g, "\r\n")).length;

/**
 * `https://wa.me/<digits>?text=…`. The text should already be capped with
 * `briefToPlainText(…, WHATSAPP_TEXT_MAX, whatsAppLength)` so the cut carries
 * a note; this re-checks and drops trailing lines as a last guard.
 */
export function buildWhatsAppUrl(digits: string, text: string): string {
  const safe = fitLines(text.split("\n"), (value) => whatsAppLength(value) <= WHATSAPP_TEXT_MAX, "…");
  return `https://wa.me/${digits.replace(/\D/g, "")}?text=${encodeURIComponent(safe)}`;
}

/**
 * `mailto:<email>?subject=…&body=…` with every line break sent as %0D%0A.
 * The address is left unencoded (clients disagree on decoding %40), so the
 * caller must pass a plain address; the body is capped like WhatsApp's.
 */
export function buildMailtoUrl(email: string, subject: string, body: string): string {
  const safe = fitLines(body.split(/\r?\n/), (value) => mailtoLength(value) <= MAILTO_BODY_MAX, "…");
  const encode = (value: string) => encodeURIComponent(value.replace(/\r?\n/g, "\r\n"));
  return `mailto:${email.trim()}?subject=${encode(oneLine(subject))}&body=${encode(safe)}`;
}

export function briefToMarkdown(brief: AuditBrief, labels: BriefLabels, destinations?: { email?: string; whatsapp?: string }): string {
  const out = [`# ${briefSubject(brief, labels)}`, ""];
  for (const entry of briefEntries(brief, labels)) {
    if (Array.isArray(entry.value)) out.push(`**${entry.label}:**`, "", ...entry.value.map((item) => `- ${item}`), "");
    else out.push(`**${entry.label}:** ${entry.value}`, "");
  }
  const to = [destinations?.email, destinations?.whatsapp].filter(present);
  if (to.length) out.push("---", "", `${labels.sendTo}: ${to.join(" · ")}`, "");
  return out.join("\n");
}

/** "L2 · System integration". */
export function levelLabel(level: AutomationLevel, labels: Pick<XRayLabels, "levels">): string {
  return `L${level} · ${labels.levels[level] ?? ""}`.trim();
}

const two = (n: number) => String(n).padStart(2, "0");

export function xrayToMarkdown(xray: BusinessXRay, labels: XRayLabels): string {
  const out = [`# ${oneLine(xray.title)}`, ""];
  const facts = (["industry", "size", "locations", "offering"] as const).filter((key) => present(xray.company[key]));
  if (facts.length) {
    out.push(`## ${labels.company}`, "");
    for (const key of facts) out.push(`- **${labels.companyFields[key]}:** ${oneLine(xray.company[key] as string)}`);
    out.push("");
  }
  const section = (n: number, body: string[]) => {
    out.push(`## ${two(n)} · ${labels.sections[n - 1] ?? ""}`, "", ...(body.length ? body : [`_${labels.none}_`]), "");
  };
  const list = (items: string[], ordered = false) => items.filter(present).map((item, i) => `${ordered ? `${i + 1}.` : "-"} ${oneLine(item)}`);

  section(1, list(xray.currentWorkflow, true));
  section(2, xray.systems.filter((system) => present(system.name)).map((system) => `- **${oneLine(system.name)}**${present(system.role) ? ` — ${oneLine(system.role)}` : ""}`));
  section(3, list(xray.handoffs));
  section(4, xray.friction.filter((item) => present(item.issue)).map((item) => `- **[${item.evidence === "stated" ? labels.stated : labels.inferred}]** ${oneLine(item.issue)}`));
  section(5, xray.automationPoints.filter((item) => present(item.point)).flatMap((item) => [
    `- **${oneLine(item.point)}** — ${levelLabel(item.level, labels)}`,
    ...(present(item.approach) ? [`  ${labels.approach}: ${oneLine(item.approach)}`] : []),
  ]));
  section(6, present(xray.connectedArchitecture) ? [xray.connectedArchitecture.trim()] : []);
  section(7, list(xray.verificationQuestions, true));
  const experiment = xray.firstExperiment;
  section(8, present(experiment.name) ? [
    `**${oneLine(experiment.name)}**`,
    "",
    ...(present(experiment.scope) ? [`- ${labels.scope}: ${oneLine(experiment.scope)}`] : []),
    ...(present(experiment.successMeasure) ? [`- ${labels.successMeasure}: ${oneLine(experiment.successMeasure)}`] : []),
  ] : []);
  return out.join("\n");
}

/** ASCII file name from a title ("Acme — Stores X-Ray" → "acme-stores-x-ray"); `fallback` when nothing Latin survives. */
export function fileSlug(text: string, fallback: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || fallback;
}
