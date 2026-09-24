/**
 * Blog UI chrome strings — translated per locale.
 *
 * Post body content stays in English (source of truth). Only the labels,
 * section headers, CTAs, and short chrome strings around the content are
 * translated here. Post title/subtitle/excerpt are translated per-post via
 * the `translations` field on BlogPost.
 */

import type { Locale } from "@/lib/i18n";

export interface BlogUiStrings {
  /** Page-level */
  blogEyebrow: string;
  blogTitleLead: string;
  blogTitleAccent: string;
  blogSubtitle: string;
  breadcrumb: string;

  /** Sections */
  whyWeWriteEyebrow: string;
  whyWeWriteTitle: string;
  whyWeWriteAccent: string;
  whyWeWriteBody1: string;
  whyWeWriteBody2: string;

  featuredEyebrow: string;
  featuredTitle: string;
  featuredTitleAccent: string;
  featuredReadMore: string;

  latestEyebrow: string;
  latestTitle: string;
  latestTitleAccent: string;

  mostReadEyebrow: string;
  mostReadTitle: string;

  topicClustersEyebrow: string;
  topicClustersTitle: string;
  topicClustersTitleAccent: string;
  topicClustersSubtitle: string;

  allPostsEyebrow: string;
  allPostsTitle: string;
  allPostsTitleAccent: string;

  byCategoryEyebrow: string;
  byCategoryTitle: string;
  byCategoryAccent: string;

  authorEyebrow: string;
  authorReadStory: string;
  authorBookAudit: string;

  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterTitleAccent: string;
  newsletterBody: string;
  newsletterEmailLabel: string;
  newsletterEmailPlaceholder: string;
  newsletterSubmit: string;
  newsletterPrivacy: string;

  faqEyebrow: string;
  faqTitle: string;
  faqTitleAccent: string;

  tagCloudLabel: string;
  filterLabel: string;
  searchPlaceholder: string;

  /** Post-level chrome */
  tldr: string;
  keyTakeaways: string;
  whatThisPostIsFor: string;
  primaryKeyword: string;
  alsoAnswers: string;
  monthlySearchesLabel: string;
  onThisPage: string;
  writtenBy: string;
  bookAudit: string;
  readNext: string;
  takeNextStep: string;
  frequentlyAsked: string;
  faqIntro: string;
  endOfPost: string;
  share: string;
  tags: string;
  previousPost: string;
  nextPost: string;
  keepReading: string;
  updatedOn: string;
  readTime: (min: number) => string;
  wordsCount: (words: number) => string;
  minRead: string;
  allPostsBackLink: string;
  fieldSketch: string;

  /** Stats card */
  statsLongForm: string;
  statsAvgRead: string;
  statsTopics: string;
  statsMonthlySearches: string;

  /** Category labels */
  categories: {
    all: string;
    growth: string;
    automation: string;
    seo: string;
    caseStudy: string;
    ops: string;
  };

  /** Common FAQs shown on the list page */
  listFaqs: { question: string; answer: string }[];
}

// ----------------------------------------------------------------------------
// English (source of truth)
// ----------------------------------------------------------------------------
const EN: BlogUiStrings = {
  blogEyebrow: "Blog · Field notes from the build",
  blogTitleLead: "Opinionated notes on",
  blogTitleAccent: "revenue systems.",
  blogSubtitle:
    "Long-form writing from the Savin Group team — revenue audits, conversion rate optimization, WhatsApp sales automation, the 5-layer revenue stack, and the SEO work that actually ranks. Written for SME founders.",
  breadcrumb: "Blog",

  whyWeWriteEyebrow: "Why we write",
  whyWeWriteTitle: "Most growth content is theory dressed as advice.",
  whyWeWriteAccent: "This isn't.",
  whyWeWriteBody1:
    "Every post on this blog is drawn from real engagements with real Indian SMEs — the D2C brand that went from 1.9% to 4.3% CVR in two hours, the real estate firm whose WhatsApp bot closes ₹30L deals while the founder sleeps, the clinic where appointment no-shows dropped from 31% to 7.2% in eight weeks. We don't write about hypotheticals. We write about what we shipped last week.",
  whyWeWriteBody2:
    "Our editorial rule is simple: every post has to pass the \"would I mail this to a friend?\" test. If it's too general or too theoretical to be useful on Monday morning, it doesn't ship. This is why we publish twice a month, not twice a week.",

  featuredEyebrow: "Featured · Editor's pick",
  featuredTitle: "Start here if you're new to",
  featuredTitleAccent: "revenue systems.",
  featuredReadMore: "Read the full post",

  latestEyebrow: "Just shipped",
  latestTitle: "The latest from the",
  latestTitleAccent: "workshop.",

  mostReadEyebrow: "Most read",
  mostReadTitle: "What founders are reading this week",

  topicClustersEyebrow: "Topic clusters",
  topicClustersTitle: "How the posts",
  topicClustersTitleAccent: "connect.",
  topicClustersSubtitle:
    "We write in hub-and-spoke clusters. Each cluster targets one primary keyword, then surrounds it with supporting posts that feed the pillar topic. This is how SEO actually compounds — and it's also how we think about the underlying problem.",

  allPostsEyebrow: "The full library",
  allPostsTitle: "All the field notes from the",
  allPostsTitleAccent: "build.",

  byCategoryEyebrow: "Browse by topic",
  byCategoryTitle: "Find a post for your",
  byCategoryAccent: "exact problem.",

  authorEyebrow: "Meet the writer",
  authorReadStory: "Read the Savin Group story",
  authorBookAudit: "Request a 45-minute audit",

  newsletterEyebrow: "The newsletter",
  newsletterTitle: "One long-form post a fortnight.",
  newsletterTitleAccent: "Zero noise.",
  newsletterBody:
    "Every new post lands in your inbox the morning it ships. No weekly digest, no promotional emails, no drip sequences — just the same long-form writing you see here, a little earlier than Google sees it.",
  newsletterEmailLabel: "Your work email",
  newsletterEmailPlaceholder: "founder@yourbiz.com",
  newsletterSubmit: "Subscribe to the blog",
  newsletterPrivacy: "We never share your address. One-click unsubscribe.",

  faqEyebrow: "FAQ",
  faqTitle: "Questions about",
  faqTitleAccent: "the blog.",

  tagCloudLabel: "Every tag on the blog",
  filterLabel: "filter",
  searchPlaceholder: "search posts — coming soon",

  tldr: "TL;DR — The short version",
  keyTakeaways: "Key takeaways",
  whatThisPostIsFor: "What this post is for",
  primaryKeyword: "Primary keyword",
  alsoAnswers: "Also answers",
  monthlySearchesLabel: "searches / mo (India)",
  onThisPage: "On this page",
  writtenBy: "Written by",
  bookAudit: "Request an audit",
  readNext: "Read next",
  takeNextStep: "Take the next step",
  frequentlyAsked: "Frequently asked",
  faqIntro: "Questions about this topic",
  endOfPost: "End of post",
  share: "Share",
  tags: "Tags",
  previousPost: "Previous post",
  nextPost: "Next post",
  keepReading: "Keep reading",
  updatedOn: "updated",
  readTime: (min) => `${min} min read`,
  wordsCount: (words) => `${words.toLocaleString()} words`,
  minRead: "min",
  allPostsBackLink: "All posts",
  fieldSketch: "Field sketch",

  statsLongForm: "Long-form posts",
  statsAvgRead: "Avg. read time",
  statsTopics: "Topics covered",
  statsMonthlySearches: "Monthly searches addressed",

  categories: {
    all: "All posts",
    growth: "Growth",
    automation: "Automation",
    seo: "SEO",
    caseStudy: "Case study",
    ops: "Ops",
  },

  listFaqs: [
    {
      question: "What does the Savin Group blog cover?",
      answer:
        "Revenue systems, conversion rate optimization, WhatsApp sales automation, the 5-layer revenue stack, SEO, and the operational glue that ties them together — written for founders of Indian SMEs, D2C brands, real estate firms, clinics and coaching institutes.",
    },
    {
      question: "Who writes the blog?",
      answer:
        "Posts are written by Kanha Singh, founder of Savin Group. Every post is drawn from real engagements — we don't write about hypotheticals.",
    },
    {
      question: "How often do new posts ship?",
      answer:
        "A new long-form post ships roughly every 10–14 days. We'd rather publish one good post a fortnight than three thin posts a week.",
    },
    {
      question: "Can I get these posts as a newsletter?",
      answer:
        "Yes — sign up at the bottom of the blog index page and every new post hits your inbox the morning it goes live.",
    },
    {
      question: "Are the posts localized for other languages?",
      answer:
        "Post titles, subtitles and summaries are translated into several Indian and European languages. The long-form body content stays in English — we don't believe in machine-translated technical writing, so deep reads stay in the source language.",
    },
  ],
};

// ----------------------------------------------------------------------------
// Hindi
// ----------------------------------------------------------------------------
const HI: BlogUiStrings = {
  ...EN,
  blogEyebrow: "Blog · Build से field notes",
  blogTitleLead: "Revenue systems पर",
  blogTitleAccent: "opinionated notes।",
  blogSubtitle:
    "Savin Group team से long-form writing — revenue audits, CRO, WhatsApp sales automation, 5-layer revenue stack और वो SEO जो असल में rank करता है। SME founders के लिए लिखा गया।",

  whyWeWriteEyebrow: "हम क्यों लिखते हैं",
  whyWeWriteTitle: "ज़्यादातर growth content सिर्फ़ theory है जिसे advice कहा जाता है।",
  whyWeWriteAccent: "यह वह नहीं है।",
  whyWeWriteBody1:
    "इस blog की हर post असली Indian SMEs के real engagements से आती है — वो D2C brand जिसका CVR 1.9% से 4.3% हुआ दो घंटों में, वो real estate firm जिसका WhatsApp bot founder के सोते समय ₹30L deals close करता है, वो clinic जहाँ appointment no-shows 8 हफ़्तों में 31% से 7.2% हो गए। हम hypotheticals पर नहीं लिखते — हम लिखते हैं जो पिछले हफ़्ते ship हुआ।",
  whyWeWriteBody2:
    "हमारा editorial rule simple है: हर post को \"क्या मैं इसे किसी friend को भेज सकता हूँ?\" test pass करना होता है। अगर Monday सुबह useful नहीं है, तो ship नहीं होती। इसलिए हम हफ़्ते में दो बार नहीं, महीने में दो बार publish करते हैं।",

  featuredEyebrow: "Featured · Editor की पसंद",
  featuredTitle: "अगर आप नए हैं तो यहाँ से शुरू करें —",
  featuredTitleAccent: "revenue systems।",
  featuredReadMore: "पूरी post पढ़ें",

  latestEyebrow: "अभी ship हुआ",
  latestTitle: "Workshop से",
  latestTitleAccent: "latest।",

  mostReadEyebrow: "सबसे ज़्यादा पढ़ा गया",
  mostReadTitle: "इस हफ़्ते founders क्या पढ़ रहे हैं",

  topicClustersEyebrow: "Topic clusters",
  topicClustersTitle: "Posts कैसे",
  topicClustersTitleAccent: "जुड़ी हुई हैं।",
  topicClustersSubtitle:
    "हम hub-and-spoke clusters में लिखते हैं। हर cluster एक primary keyword target करता है और उसके आसपास supporting posts। यही तरीका है जिससे SEO असल में compound होता है।",

  allPostsEyebrow: "पूरी library",
  allPostsTitle: "Build से सभी",
  allPostsTitleAccent: "field notes।",

  byCategoryEyebrow: "Topic से browse करें",
  byCategoryTitle: "अपनी exact problem के लिए",
  byCategoryAccent: "post ढूँढें।",

  authorEyebrow: "लेखक से मिलें",
  authorReadStory: "Savin Group की कहानी पढ़ें",
  authorBookAudit: "45-मिनट का audit book करें",

  newsletterEyebrow: "Newsletter",
  newsletterTitle: "एक long-form post हर 15 दिन में।",
  newsletterTitleAccent: "Zero noise।",
  newsletterBody:
    "हर नई post ship होने की सुबह आपके inbox में। कोई weekly digest नहीं, कोई promotional email नहीं — बस वही long-form writing जो यहाँ है, Google से थोड़ा पहले।",
  newsletterEmailLabel: "आपका work email",
  newsletterEmailPlaceholder: "founder@yourbiz.com",
  newsletterSubmit: "Blog subscribe करें",
  newsletterPrivacy: "हम आपका address कभी share नहीं करते। एक click में unsubscribe।",

  faqEyebrow: "FAQ",
  faqTitle: "Blog के बारे में",
  faqTitleAccent: "सवाल।",

  tagCloudLabel: "Blog के सभी tags",
  filterLabel: "filter",
  searchPlaceholder: "posts search करें — जल्द आ रहा है",

  tldr: "TL;DR — Short version",
  keyTakeaways: "मुख्य बातें",
  whatThisPostIsFor: "यह post किसके लिए है",
  primaryKeyword: "Primary keyword",
  alsoAnswers: "ये भी कवर करता है",
  monthlySearchesLabel: "searches / माह (India)",
  onThisPage: "इस page पर",
  writtenBy: "लेखक",
  bookAudit: "Audit book करें",
  readNext: "आगे पढ़ें",
  takeNextStep: "अगला कदम",
  frequentlyAsked: "पूछे जाने वाले सवाल",
  faqIntro: "इस topic पर सवाल",
  endOfPost: "Post का अंत",
  share: "Share करें",
  tags: "Tags",
  previousPost: "पिछली post",
  nextPost: "अगली post",
  keepReading: "और पढ़ते रहें",
  updatedOn: "updated",
  readTime: (min) => `${min} मिनट read`,
  wordsCount: (words) => `${words.toLocaleString()} शब्द`,
  minRead: "मिनट",
  allPostsBackLink: "सभी posts",
  fieldSketch: "Field sketch",

  statsLongForm: "Long-form posts",
  statsAvgRead: "औसत read time",
  statsTopics: "Topics",
  statsMonthlySearches: "मासिक searches cover",

  categories: {
    all: "सभी posts",
    growth: "Growth",
    automation: "Automation",
    seo: "SEO",
    caseStudy: "Case study",
    ops: "Ops",
  },

  listFaqs: [
    {
      question: "Savin Group blog क्या cover करता है?",
      answer:
        "Revenue systems, CRO, WhatsApp sales automation, 5-layer revenue stack, SEO और इनको जोड़ने वाला operational काम — Indian SMEs, D2C brands, real estate firms, clinics और coaching institutes के founders के लिए।",
    },
    {
      question: "Blog कौन लिखता है?",
      answer:
        "Posts Kanha Singh, Savin Group के founder, लिखते हैं। हर post असली engagements से आती है — हम hypotheticals नहीं लिखते।",
    },
    {
      question: "नई posts कितनी बार आती हैं?",
      answer:
        "हर 10–14 दिन में एक long-form post। हम हफ़्ते में तीन thin posts की बजाय महीने में दो अच्छी posts publish करना पसंद करते हैं।",
    },
    {
      question: "क्या ये posts newsletter में मिल सकती हैं?",
      answer:
        "हाँ — blog index page के नीचे sign up करें, हर नई post उसके live होने की सुबह आपके inbox में आएगी।",
    },
    {
      question: "क्या posts दूसरी languages में localized हैं?",
      answer:
        "Post titles, subtitles और summaries कई Indian और European languages में translate हैं। Long-form body English में रहती है — machine translation पर हम भरोसा नहीं करते, इसलिए deep reads source language में रहती हैं।",
    },
  ],
};

// ----------------------------------------------------------------------------
// Map — every locale either has a full override or falls back to English.
// ----------------------------------------------------------------------------
const TABLE: Partial<Record<Locale, BlogUiStrings>> = {
  en: EN,
  hi: HI,
  // Other locales fall back to English until we translate them.
};

export function getBlogUi(locale: Locale): BlogUiStrings {
  return TABLE[locale] ?? EN;
}
