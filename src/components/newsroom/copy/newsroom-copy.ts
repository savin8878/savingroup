/**
 * Newsroom UI copy (index, desk pages, story pages). English is the source of
 * truth; other locales override what they translate and fall back per key.
 * Story bodies are English, like blog bodies.
 */

import { CTA_LABEL } from "@/lib/offer";
import type { Locale } from "@/lib/i18n";
import type { NewsCategory } from "@/lib/news";
import type { BlogMotionLabels } from "@/components/blog/BlogMotion";

export interface DeskCopy {
  headline: string;
  accent: string;
  description: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface NewsroomCopy {
  home: string;
  breadcrumb: string;
  breadcrumbAria: string;
  eyebrow: string;
  edition: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  heroPrimary: string;
  heroSecondary: string;
  heroNote: (stories: number, updated: string) => string;
  heroEmpty: string;
  figureIndex: string;
  figureTitle: string;
  legend: [string, string, string];
  bandLabel: [string, string];
  categories: Record<NewsCategory | "all", string>;

  leadEyebrow: string;
  leadTitle: string;
  leadAccent: string;
  leadKicker: string;
  readStory: string;

  wireEyebrow: string;
  wireTitle: string;
  wireAccent: string;
  wireIntro: string;
  topEyebrow: string;
  topTitle: string;
  wireAll: string;

  desksEyebrow: string;
  desksTitle: string;
  desksAccent: string;
  desksIntro: string;
  deskCount: (n: number) => string;
  openDesk: string;
  latestOnDesk: string;

  howEyebrow: string;
  howTitle: string;
  howAccent: string;
  howBody: string;
  steps: { code: string; title: string; body: string }[];
  numbersTitle: string;
  statStories: string;
  statSources: string;
  statDesks: string;
  statUpdated: string;
  storiesUnit: string;

  archiveEyebrow: string;
  archiveTitle: string;
  archiveAccent: string;
  archiveIntro: string;
  filter: string;
  search: string;
  searchPlaceholder: string;
  results: string;
  empty: string;
  clear: string;
  tagCloud: string;

  faqEyebrow: string;
  faqTitle: string;
  faqAccent: string;
  faqBody: string;
  faqLink: string;
  faqs: { question: string; answer: string }[];

  finalEyebrow: string;
  finalQuestion: string;
  finalLead: string;
  finalAccent: string;
  ctaLabel: string;
  finalNote: (minutes: number) => string;
  circuitLabel: string;
  footerCenter: string;
  backToTop: string;
  emptyIndex: string;

  /** Story page */
  allStories: string;
  published: string;
  updated: string;
  readTime: (min: number) => string;
  minRead: string;
  words: string;
  wordsCount: (n: number) => string;
  desk: string;
  sources: string;
  sourcesIntro: string;
  sourceCount: (n: number) => string;
  originalReport: string;
  whatItMeans: string;
  whatItMeansLabel: string;
  keepReading: string;
  readNext: string;
  newerStory: string;
  olderStory: string;
  share: string;
  onThisPage: string;
  tags: string;
  faqLabel: string;
  storyFaqLead: string;
  reportedBy: string;
  endOfStory: string;
  bookAudit: string;
  ctaTitle: string;
  ctaBody: string;

  /** Desk page */
  storiesIn: (n: number, label: string) => string;
  deskLead: string;
  deskAllEyebrow: string;
  deskAllTitle: (n: number, label: string) => [string, string];
  deskIntro: string;
  deskEmpty: string;
  otherDesks: string;
  otherDesksTitle: string;
  otherDesksAccent: string;
  statLatest: string;
  statReading: string;
  statPublishers: string;
  deskAnswers: string;
  desks: Record<NewsCategory, DeskCopy>;

  motion: BlogMotionLabels;
}

const EN: NewsroomCopy = {
  home: "Home",
  breadcrumb: "Newsroom",
  breadcrumbAria: "Breadcrumb",
  eyebrow: "Newsroom · The industry, decoded daily",
  edition: "Savin Group / Industry desk",
  titleLead: "The industry moves.",
  titleAccent: "We decode it.",
  subtitle:
    "Short, sourced stories on AI, automation, manufacturing technology and the software that runs growing Indian businesses — reported from primary sources every day and closed with what it means for your operation.",
  heroPrimary: "Read the lead story",
  heroSecondary: "Browse the wire",
  heroNote: (n, updated) => `${n} stories · updated ${updated}`,
  heroEmpty: "The desk is being set up — the first stories land with the next scheduled run.",
  figureIndex: "FIG. 01",
  figureTitle: "THE DAILY SIGNAL",
  legend: ["Primary sources", "Editorial desk", "Operator briefing"],
  bandLabel: ["The desks", "By subject."],
  categories: {
    all: "All stories",
    ai: "AI & agents",
    automation: "Automation & robotics",
    manufacturing: "Manufacturing & IoT",
    software: "Software & ERP",
    markets: "Business & markets",
    policy: "Policy & regulation",
  },

  leadEyebrow: "Lead story",
  leadTitle: "What matters",
  leadAccent: "today.",
  leadKicker: "Start here",
  readStory: "Read the story",

  wireEyebrow: "The wire",
  wireTitle: "Every story,",
  wireAccent: "newest first.",
  wireIntro: "Each piece is written from the original report and at least one corroborating source. The closing section is ours: what it means for Indian operators.",
  topEyebrow: "Most important",
  topTitle: "Stories our desk ranked highest this week",
  wireAll: "Browse the archive",

  desksEyebrow: "The desks",
  desksTitle: "Six beats,",
  desksAccent: "one operating picture.",
  desksIntro: "Every story is filed to a desk. Open a desk to read only the developments that touch that part of your business.",
  deskCount: (n) => `${n} ${n === 1 ? "story" : "stories"}`,
  openDesk: "Open desk",
  latestOnDesk: "Latest",

  howEyebrow: "How the newsroom works",
  howTitle: "Sourced, not scraped.",
  howAccent: "Decoded, not summarised.",
  howBody:
    "Our desk watches publisher feeds and industry search across India and the world, ranks what a plant head or founder actually needs to know, reads the original report, and writes a short explainer where every fact is attributed. The last section of each story is the part you cannot get from a headline: what it means for your operation this quarter.",
  steps: [
    { code: "01 / DISCOVER", title: "Signals from the industry", body: "Publisher feeds and news search, filtered to developments with numbers, names and consequences." },
    { code: "02 / VERIFY", title: "Facts from the source", body: "The original report is read in full and corroborated; only attributed facts make it into the story." },
    { code: "03 / DECODE", title: "Implications for operators", body: "A plain-spoken close on cost, timing and what to check — marked as our read, not the news." },
  ],
  numbersTitle: "The newsroom, by the numbers",
  statStories: "Stories published",
  statSources: "Publishers cited",
  statDesks: "Desks",
  statUpdated: "Last story",
  storiesUnit: "",

  archiveEyebrow: "Archive",
  archiveTitle: "Every story,",
  archiveAccent: "by desk.",
  archiveIntro: "Filter by desk or search by headline and tag.",
  filter: "filter",
  search: "Search stories",
  searchPlaceholder: "Search headlines, desks, tags",
  results: "{n} of {total} stories",
  empty: "No stories match that. Try a broader word or another desk.",
  clear: "Show all stories",
  tagCloud: "Every tag in the newsroom",

  faqEyebrow: "FAQ",
  faqTitle: "Questions about",
  faqAccent: "the newsroom.",
  faqBody: "Short answers on how stories are chosen, sourced and written. For anything about your own operation, talk to us directly.",
  faqLink: "Ask us a question",
  faqs: [
    {
      question: "What does the Savin Group Newsroom cover?",
      answer: "Developments in AI and agents, industrial automation and robotics, manufacturing technology and IoT, business software and ERP, the markets Indian SMEs sell into, and the policy that shapes them — chosen for what an operator can act on.",
    },
    {
      question: "How are stories sourced?",
      answer: "Every story starts from a published report. We read the original in full, corroborate it with a second publisher where one exists, and attribute every fact inline. The source list sits at the end of each story.",
    },
    {
      question: "Is the analysis part of the news?",
      answer: "No. The final section, “What it means for Indian operators”, is our read — clearly marked as such. The sections above it stay factual and attributed.",
    },
    {
      question: "How often does the desk publish?",
      answer: "Several short stories a day on working days, with the lead story refreshed when something more important lands.",
    },
    {
      question: "Can I get the newsroom in my language?",
      answer: "Headlines and summaries are translated for the Indian and European locales the site serves. Story bodies stay in English, the language the sources were written in.",
    },
  ],

  finalEyebrow: "Every story ends with what it means for your operation",
  finalQuestion: "A development here touch your plant, your funnel or your stack?",
  finalLead: "Let’s",
  finalAccent: "engineer the response.",
  ctaLabel: CTA_LABEL,
  finalNote: (m) => `Free ${m}-minute audit. A written diagnosis. A clear next step.`,
  circuitLabel: "Your next chapter",
  footerCenter: "The industry, decoded daily.",
  backToTop: "Back to top",
  emptyIndex: "No stories have been published yet.",

  allStories: "All stories",
  published: "Published",
  updated: "updated",
  readTime: (min) => `${min} min read`,
  minRead: "min",
  words: "words",
  wordsCount: (n) => `${n.toLocaleString()} words`,
  desk: "Desk",
  sources: "Sources",
  sourcesIntro: "Every fact in this story is attributed to one of these reports.",
  sourceCount: (n) => `${n} ${n === 1 ? "source" : "sources"}`,
  originalReport: "Read the original report",
  whatItMeans: "What it means for you",
  whatItMeansLabel: "Operator briefing",
  keepReading: "Keep reading",
  readNext: "More from the desk",
  newerStory: "Newer story",
  olderStory: "Older story",
  share: "Share",
  onThisPage: "In this story",
  tags: "Tags",
  faqLabel: "FAQ",
  storyFaqLead: "Questions about this development",
  reportedBy: "Reported by",
  endOfStory: "End of story",
  bookAudit: "Request an audit",
  ctaTitle: "Want this mapped to your operation?",
  ctaBody: "A free audit of one workflow — a written diagnosis and a clear next step.",

  storiesIn: (n, label) => `${n} ${n === 1 ? "story" : "stories"} on the ${label} desk`,
  deskLead: "Start with the lead story",
  deskAllEyebrow: "All stories on this desk",
  deskAllTitle: (n, label) => [`${n} ${n === 1 ? "story" : "stories"} on`, `${label}.`],
  deskIntro: "The most important story leads; the rest follow newest first.",
  deskEmpty: "No stories on this desk yet.",
  otherDesks: "Browse the other desks",
  otherDesksTitle: "Six beats,",
  otherDesksAccent: "one operating picture.",
  statLatest: "Latest story",
  statReading: "Total reading time",
  statPublishers: "Publishers cited",
  deskAnswers: "This desk covers",
  desks: {
    ai: {
      headline: "AI & agents —",
      accent: "from answers to actions.",
      description: "Model releases, agent platforms, enterprise adoption data and the governance questions that decide whether an AI workflow is safe to switch on.",
      keywords: ["ai agents", "generative ai adoption", "enterprise ai india", "llm business use", "ai governance"],
      metaTitle: "AI & Agents News · Adoption, Agents, Governance for Indian Operators",
      metaDescription: "Daily, sourced stories on AI models, agent platforms and enterprise adoption — decoded for founders and plant heads of Indian businesses.",
    },
    automation: {
      headline: "Automation & robotics —",
      accent: "work that moves on its own.",
      description: "Industrial robots, workflow automation, RPA and the vendors, prices and deployments that change what a small plant can automate this year.",
      keywords: ["industrial automation news", "robotics india", "workflow automation", "rpa", "cobots"],
      metaTitle: "Automation & Robotics News · Industrial, Workflow and RPA for SMEs",
      metaDescription: "Sourced stories on industrial automation, robotics and workflow tools — with what each development means for Indian manufacturers and service businesses.",
    },
    manufacturing: {
      headline: "Manufacturing & IoT —",
      accent: "the shop floor, connected.",
      description: "Smart-factory rollouts, sensor and IoT platforms, PLI-era capacity investments and the production data that turns machines into decisions.",
      keywords: ["manufacturing technology india", "iot smart factory", "industry 4.0", "pli scheme", "msme manufacturing"],
      metaTitle: "Manufacturing & IoT News · Smart Factories, Sensors, Capacity in India",
      metaDescription: "Daily manufacturing technology and IoT stories — factory investments, sensor platforms and production data — decoded for Indian plant heads.",
    },
    software: {
      headline: "Software & ERP —",
      accent: "the systems that run the business.",
      description: "ERP, CRM, SaaS pricing, integrations and platform changes that affect how growing Indian businesses run orders, stock, finance and customers.",
      keywords: ["erp india", "saas pricing", "business software news", "crm", "systems integration"],
      metaTitle: "Software & ERP News · Business Systems, SaaS and Integrations",
      metaDescription: "Sourced stories on ERP, CRM, SaaS and integrations — what changed, what it costs and what it means for operations teams in India.",
    },
    markets: {
      headline: "Business & markets —",
      accent: "the numbers behind the decisions.",
      description: "Funding, demand signals, MSME data, exports and the market moves that change what Indian operators should plan for this quarter.",
      keywords: ["msme news india", "startup funding india", "business news operators", "exports india", "sme growth"],
      metaTitle: "Business & Markets News · Funding, Demand and MSME Signals",
      metaDescription: "Business and market developments read for their operational consequences — funding, demand, MSME data and exports for Indian SMEs.",
    },
    policy: {
      headline: "Policy & regulation —",
      accent: "the rules that shape the work.",
      description: "GST, data protection, labour, incentive schemes and compliance changes — reported with the deadlines and decisions they create.",
      keywords: ["policy news india business", "gst updates", "data protection india", "pli incentives", "compliance sme"],
      metaTitle: "Policy & Regulation News · GST, Data, Incentives for Indian Businesses",
      metaDescription: "Policy and regulation stories with the deadlines, costs and decisions they create for Indian SMEs and manufacturers.",
    },
  },

  motion: {
    pause: "Pause motion",
    paused: "Motion paused",
    reduced: "Reduced motion",
    pauseAria: "Pause diagram motion",
    resumeAria: "Resume diagram motion",
    reducedAria: "Motion reduced by your device preference",
  },
};

const HI: NewsroomCopy = {
  ...EN,
  home: "होम",
  breadcrumb: "Newsroom",
  eyebrow: "Newsroom · Industry की खबरें, रोज़ decode",
  titleLead: "Industry आगे बढ़ती है।",
  titleAccent: "हम उसे decode करते हैं।",
  subtitle:
    "AI, automation, manufacturing technology और उस software पर छोटी, sourced stories जो बढ़ते Indian businesses को चलाता है — रोज़ primary sources से report की गई, और अंत में यह कि आपके operation के लिए इसका क्या मतलब है।",
  heroPrimary: "Lead story पढ़ें",
  heroSecondary: "Wire देखें",
  heroNote: (n, updated) => `${n} stories · ${updated} को update`,
  categories: { all: "सभी stories", ai: "AI और agents", automation: "Automation और robotics", manufacturing: "Manufacturing और IoT", software: "Software और ERP", markets: "Business और markets", policy: "Policy और regulation" },
  leadEyebrow: "Lead story",
  leadTitle: "आज क्या",
  leadAccent: "मायने रखता है।",
  readStory: "Story पढ़ें",
  wireEyebrow: "Wire",
  wireTitle: "हर story,",
  wireAccent: "सबसे नई पहले।",
  topEyebrow: "सबसे ज़रूरी",
  topTitle: "इस हफ़्ते हमारे desk की top stories",
  desksEyebrow: "Desks",
  desksTitle: "छह beats,",
  desksAccent: "एक operating picture।",
  deskCount: (n) => `${n} stories`,
  openDesk: "Desk खोलें",
  howEyebrow: "Newsroom कैसे काम करता है",
  howTitle: "Sourced, scraped नहीं।",
  howAccent: "Decoded, summarised नहीं।",
  archiveEyebrow: "Archive",
  archiveTitle: "हर story,",
  archiveAccent: "desk के हिसाब से।",
  search: "Stories search करें",
  searchPlaceholder: "Headlines, desks, tags",
  results: "{total} में से {n} stories",
  empty: "कोई story match नहीं हुई। कोई broader शब्द या दूसरा desk try करें।",
  clear: "सभी stories दिखाएँ",
  faqTitle: "Newsroom के बारे में",
  faqAccent: "सवाल।",
  finalLead: "चलिए,",
  finalAccent: "response engineer करते हैं।",
  ctaLabel: "Free audit request करें",
  finalNote: (m) => `Free ${m}-मिनट audit। Written diagnosis। Clear next step।`,
  backToTop: "ऊपर जाएँ",
  allStories: "सभी stories",
  published: "प्रकाशित",
  readTime: (min) => `${min} मिनट read`,
  minRead: "मिनट",
  words: "शब्द",
  wordsCount: (n) => `${n.toLocaleString()} शब्द`,
  sources: "Sources",
  whatItMeans: "आपके लिए इसका मतलब",
  keepReading: "और पढ़ते रहें",
  readNext: "Desk से और",
  newerStory: "नई story",
  olderStory: "पुरानी story",
  share: "Share करें",
  onThisPage: "इस story में",
  tags: "Tags",
  endOfStory: "Story का अंत",
  bookAudit: "Audit book करें",
};

const TABLE: Partial<Record<Locale, NewsroomCopy>> = { en: EN, hi: HI };

export function getNewsroomCopy(locale: string): NewsroomCopy {
  return TABLE[locale as Locale] ?? EN;
}
