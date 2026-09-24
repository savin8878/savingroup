import type { Locale } from "@/lib/i18n";
import type { BlogCategory } from "@/lib/blogs";
import type { BlogMotionLabels } from "@/components/blog/BlogMotion";

/**
 * UI copy for /blogs/category/<category>. English is the source; every other
 * locale falls back to it key by key (see getCategoryCopy). Category headlines,
 * descriptions and SEO keywords stay in the page's CATEGORY_COPY.
 */
export interface CategoryPageCopy {
  home: string;
  breadcrumbAria: string;
  readLead: string;
  /** Mono meta: "5 posts in Ops". */
  postsIn: (count: number, label: string) => string;
  statPosts: string;
  statReading: string;
  statUpdated: string;
  /** Stats row, fourth cell (monthly searches, or average read when a category has no volume data). */
  statSearches: string;
  statAvgRead: string;
  /** Unit after a minute count in the stats row ("78 min"). */
  minUnit: string;
  pageAnswers: string;
  allPostsEyebrow: string;
  /** Two-line section heading: [lead, accent]. `topic` comes from `topics`. */
  notesHeading: (count: number, topic: string) => [string, string];
  /** What each category's notes are about, as it reads inside notesHeading ("SEO", "operations"). */
  topics: Record<BlogCategory, string>;
  postsIntro: string;
  /** Used instead of postsIntro when the category has exactly one post. */
  postsIntroSingle: string;
  leadKicker: string;
  moreLabel: string;
  empty: string;
  clustersLead: string;
  clustersAccent: string;
  clusterLabel: string;
  inThisCategory: string;
  clusterCount: (total: number, here: number) => string;
  otherEyebrow: string;
  postCount: (count: number) => string;
  finalLead: string;
  finalAccent: string;
  circuitLabel: string;
  footerCenter: string;
  backToTop: string;
  figures: Record<BlogCategory, { title: string; legend: [string, string, string] }>;
  motion: BlogMotionLabels;
}

const EN: CategoryPageCopy = {
  home: "Home",
  breadcrumbAria: "Breadcrumb",
  readLead: "Start with the lead post",
  postsIn: (n, label) => `${n} ${n === 1 ? "post" : "posts"} in ${label}`,
  statPosts: "Posts in this category",
  statReading: "Total reading time",
  statUpdated: "Last updated",
  statSearches: "Monthly searches addressed",
  statAvgRead: "Avg. read time",
  minUnit: "min",
  pageAnswers: "This page answers",
  allPostsEyebrow: "All posts in this category",
  notesHeading: (n, topic) => [`${n} field ${n === 1 ? "note" : "notes"} on`, `${topic}.`],
  topics: { growth: "growth", automation: "automation", seo: "SEO", "case-study": "real outcomes", ops: "operations" },
  postsIntro: "The lead post is the one we’d hand a founder first. The rest follow in reading order.",
  postsIntroSingle: "One field note so far — the one we’d hand a founder first.",
  leadKicker: "Start here",
  moreLabel: "More posts in this category",
  empty: "No posts in this category yet.",
  clustersLead: "How these posts",
  clustersAccent: "connect.",
  clusterLabel: "Cluster",
  inThisCategory: "In this category",
  clusterCount: (total, here) => `${total} posts · ${here} here`,
  otherEyebrow: "Browse other categories",
  postCount: (n) => `${n} ${n === 1 ? "post" : "posts"}`,
  finalLead: "Let’s",
  finalAccent: "engineer it.",
  circuitLabel: "Your next chapter",
  footerCenter: "Field notes from the build.",
  backToTop: "Back to top",
  figures: {
    growth: { title: "Where the leads leak", legend: ["Stages", "Leaks", "Recovered"] },
    automation: { title: "The conversation pipeline", legend: ["Messages", "Qualified", "CRM"] },
    seo: { title: "Compounding search growth", legend: ["Paid", "Organic", "Cluster"] },
    "case-study": { title: "The revenue audit", legend: ["Pipeline", "Leaks found", "Fixed"] },
    ops: { title: "The five-layer stack", legend: ["Layers", "Signal", "Feedback loop"] },
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

const ES: Partial<CategoryPageCopy> = {
  home: "Inicio",
  breadcrumbAria: "Ruta de navegación",
  readLead: "Empieza por el artículo principal",
  postsIn: (n, label) => `${n} ${n === 1 ? "artículo" : "artículos"} en ${label}`,
  statPosts: "Artículos en esta categoría",
  statReading: "Tiempo total de lectura",
  statUpdated: "Última actualización",
  statSearches: "Búsquedas mensuales cubiertas",
  statAvgRead: "Lectura media",
  minUnit: "min",
  pageAnswers: "Esta página responde",
  allPostsEyebrow: "Todos los artículos de esta categoría",
  notesHeading: (n, topic) => [`${n} ${n === 1 ? "nota de campo" : "notas de campo"} sobre`, `${topic}.`],
  topics: { growth: "crecimiento", automation: "automatización", seo: "SEO", "case-study": "resultados reales", ops: "operaciones" },
  postsIntro: "El artículo principal es el que le daríamos primero a un fundador. El resto sigue en orden de lectura.",
  postsIntroSingle: "Por ahora, una sola nota de campo: la que le daríamos primero a un fundador.",
  leadKicker: "Empieza aquí",
  moreLabel: "Más artículos de esta categoría",
  empty: "Todavía no hay artículos en esta categoría.",
  clustersLead: "Cómo se conectan",
  clustersAccent: "estos artículos.",
  clusterLabel: "Clúster",
  inThisCategory: "En esta categoría",
  clusterCount: (total, here) => `${total} artículos · ${here} aquí`,
  otherEyebrow: "Explora otras categorías",
  postCount: (n) => `${n} ${n === 1 ? "artículo" : "artículos"}`,
  finalLead: "Vamos a",
  finalAccent: "construirlo.",
  circuitLabel: "Tu próximo capítulo",
  footerCenter: "Notas de campo desde la obra.",
  backToTop: "Volver arriba",
  figures: {
    growth: { title: "Dónde se fugan los leads", legend: ["Etapas", "Fugas", "Recuperados"] },
    automation: { title: "El flujo de conversación", legend: ["Mensajes", "Calificados", "CRM"] },
    seo: { title: "Crecimiento orgánico compuesto", legend: ["Pago", "Orgánico", "Clúster"] },
    "case-study": { title: "La auditoría de ingresos", legend: ["Embudo", "Fugas", "Resuelto"] },
    ops: { title: "El stack de cinco capas", legend: ["Capas", "Señal", "Retroalimentación"] },
  },
  motion: {
    pause: "Pausar movimiento",
    paused: "Movimiento en pausa",
    reduced: "Movimiento reducido",
    pauseAria: "Pausar el movimiento de los diagramas",
    resumeAria: "Reanudar el movimiento de los diagramas",
    reducedAria: "Movimiento reducido por la preferencia de tu dispositivo",
  },
};

const FR: Partial<CategoryPageCopy> = {
  home: "Accueil",
  breadcrumbAria: "Fil d’Ariane",
  readLead: "Commencer par l’article principal",
  postsIn: (n, label) => `${n} ${n === 1 ? "article" : "articles"} dans ${label}`,
  statPosts: "Articles dans cette catégorie",
  statReading: "Temps de lecture total",
  statUpdated: "Dernière mise à jour",
  statSearches: "Recherches mensuelles couvertes",
  statAvgRead: "Temps de lecture moyen",
  minUnit: "min",
  pageAnswers: "Cette page répond à",
  allPostsEyebrow: "Tous les articles de cette catégorie",
  notesHeading: (n, topic) => [`${n} ${n === 1 ? "note de terrain" : "notes de terrain"} sur`, `${topic}.`],
  topics: { growth: "la croissance", automation: "l’automatisation", seo: "le SEO", "case-study": "des résultats réels", ops: "les opérations" },
  postsIntro: "L’article principal est celui que nous confierions en premier à un fondateur. Les autres suivent dans l’ordre de lecture.",
  postsIntroSingle: "Une seule note de terrain pour l’instant : celle que nous confierions en premier à un fondateur.",
  leadKicker: "Commencer ici",
  moreLabel: "Autres articles de cette catégorie",
  empty: "Aucun article dans cette catégorie pour l’instant.",
  clustersLead: "Comment ces articles",
  clustersAccent: "se relient.",
  clusterLabel: "Cluster",
  inThisCategory: "Dans cette catégorie",
  clusterCount: (total, here) => `${total} articles · ${here} ici`,
  otherEyebrow: "Parcourir les autres catégories",
  postCount: (n) => `${n} ${n === 1 ? "article" : "articles"}`,
  finalLead: "Construisons-le",
  finalAccent: "ensemble.",
  circuitLabel: "Votre prochain chapitre",
  footerCenter: "Notes de terrain, depuis l’atelier.",
  backToTop: "Retour en haut",
  figures: {
    growth: { title: "Où fuient les prospects", legend: ["Étapes", "Fuites", "Récupérés"] },
    automation: { title: "Le pipeline de conversation", legend: ["Messages", "Qualifiés", "CRM"] },
    seo: { title: "Croissance organique composée", legend: ["Payant", "Organique", "Cluster"] },
    "case-study": { title: "L’audit des revenus", legend: ["Pipeline", "Fuites", "Corrigé"] },
    ops: { title: "La pile à cinq couches", legend: ["Couches", "Signal", "Boucle de retour"] },
  },
  motion: {
    pause: "Mettre en pause",
    paused: "Animation en pause",
    reduced: "Animation réduite",
    pauseAria: "Mettre en pause l’animation des schémas",
    resumeAria: "Reprendre l’animation des schémas",
    reducedAria: "Animation réduite selon les préférences de votre appareil",
  },
};

const DE: Partial<CategoryPageCopy> = {
  home: "Startseite",
  breadcrumbAria: "Brotkrumennavigation",
  readLead: "Mit dem Leitartikel beginnen",
  postsIn: (n, label) => `${n} ${n === 1 ? "Beitrag" : "Beiträge"} in ${label}`,
  statPosts: "Beiträge in dieser Kategorie",
  statReading: "Gesamte Lesezeit",
  statUpdated: "Zuletzt aktualisiert",
  statSearches: "Abgedeckte Suchen pro Monat",
  statAvgRead: "Ø Lesezeit",
  minUnit: "Min.",
  pageAnswers: "Diese Seite beantwortet",
  allPostsEyebrow: "Alle Beiträge dieser Kategorie",
  notesHeading: (n, topic) => [`${n} ${n === 1 ? "Feldnotiz" : "Feldnotizen"} zu`, `${topic}.`],
  topics: { growth: "Wachstum", automation: "Automatisierung", seo: "SEO", "case-study": "echten Ergebnissen", ops: "Betrieb & Systemen" },
  postsIntro: "Den Leitartikel würden wir einem Gründer zuerst geben. Die übrigen folgen in Lesereihenfolge.",
  postsIntroSingle: "Bisher eine Feldnotiz – die, die wir einem Gründer zuerst geben würden.",
  leadKicker: "Hier beginnen",
  moreLabel: "Weitere Beiträge dieser Kategorie",
  empty: "In dieser Kategorie gibt es noch keine Beiträge.",
  clustersLead: "Wie diese Beiträge",
  clustersAccent: "zusammenhängen.",
  clusterLabel: "Cluster",
  inThisCategory: "In dieser Kategorie",
  clusterCount: (total, here) => `${total} Beiträge · ${here} hier`,
  otherEyebrow: "Weitere Kategorien",
  postCount: (n) => `${n} ${n === 1 ? "Beitrag" : "Beiträge"}`,
  finalLead: "Lassen Sie es uns",
  finalAccent: "entwickeln.",
  circuitLabel: "Ihr nächstes Kapitel",
  footerCenter: "Feldnotizen aus der Praxis.",
  backToTop: "Nach oben",
  figures: {
    growth: { title: "Wo Leads verloren gehen", legend: ["Stufen", "Lecks", "Zurückgewonnen"] },
    automation: { title: "Die Gesprächs-Pipeline", legend: ["Nachrichten", "Qualifiziert", "CRM"] },
    seo: { title: "Kumulierendes Suchwachstum", legend: ["Bezahlt", "Organisch", "Cluster"] },
    "case-study": { title: "Das Umsatz-Audit", legend: ["Pipeline", "Lecks", "Behoben"] },
    ops: { title: "Der Fünf-Schichten-Stack", legend: ["Schichten", "Signal", "Rückkopplung"] },
  },
  motion: {
    pause: "Bewegung pausieren",
    paused: "Bewegung pausiert",
    reduced: "Reduzierte Bewegung",
    pauseAria: "Diagramm-Animation pausieren",
    resumeAria: "Diagramm-Animation fortsetzen",
    reducedAria: "Bewegung durch Ihre Geräteeinstellung reduziert",
  },
};

/** Arabic counted nouns: 1 → singular, 2 → dual, 3–10 → plural, 11+ → singular. */
const arCount = (n: number, one: string, two: string, few: string) => (n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${one}`);

const AR: Partial<CategoryPageCopy> = {
  home: "الرئيسية",
  breadcrumbAria: "مسار التنقل",
  readLead: "ابدأ بالمقال الرئيسي",
  postsIn: (n, label) => `${arCount(n, "مقال واحد", "مقالان", "مقالات")} في ${label}`,
  statPosts: "مقالات هذا التصنيف",
  statReading: "إجمالي وقت القراءة",
  statUpdated: "آخر تحديث",
  statSearches: "عمليات البحث الشهرية المستهدفة",
  statAvgRead: "متوسط وقت القراءة",
  minUnit: "دقيقة",
  pageAnswers: "تجيب هذه الصفحة عن",
  allPostsEyebrow: "كل مقالات هذا التصنيف",
  notesHeading: (n, topic) => [`${arCount(n, "ملاحظة ميدانية واحدة", "ملاحظتان ميدانيتان", "ملاحظات ميدانية")} عن`, `${topic}.`],
  topics: { growth: "النمو", automation: "الأتمتة", seo: "SEO", "case-study": "نتائج حقيقية", ops: "العمليات" },
  postsIntro: "المقال الرئيسي هو الذي نعطيه لأي مؤسس قبل غيره. وتتبعه بقية المقالات بترتيب القراءة.",
  postsIntroSingle: "ملاحظة ميدانية واحدة حتى الآن، وهي التي نعطيها لأي مؤسس قبل غيرها.",
  leadKicker: "ابدأ من هنا",
  moreLabel: "مقالات أخرى في هذا التصنيف",
  empty: "لا توجد مقالات في هذا التصنيف بعد.",
  clustersLead: "كيف تترابط",
  clustersAccent: "هذه المقالات.",
  clusterLabel: "مجموعة",
  inThisCategory: "في هذا التصنيف",
  clusterCount: (total, here) => `${arCount(total, "مقال واحد", "مقالان", "مقالات")} · ${here} هنا`,
  otherEyebrow: "تصفح تصنيفات أخرى",
  postCount: (n) => arCount(n, "مقال واحد", "مقالان", "مقالات"),
  finalLead: "لنبنِه",
  finalAccent: "معاً.",
  circuitLabel: "فصلك القادم",
  footerCenter: "ملاحظات ميدانية من موقع العمل.",
  backToTop: "العودة إلى الأعلى",
  figures: {
    growth: { title: "أين يتسرب العملاء المحتملون", legend: ["المراحل", "التسربات", "المستعاد"] },
    automation: { title: "مسار المحادثة", legend: ["الرسائل", "المؤهَّلون", "CRM"] },
    seo: { title: "نمو البحث التراكمي", legend: ["مدفوع", "عضوي", "مجموعة"] },
    "case-study": { title: "تدقيق الإيرادات", legend: ["المسار", "التسربات", "تم الإصلاح"] },
    ops: { title: "البنية ذات الطبقات الخمس", legend: ["الطبقات", "الإشارة", "حلقة التغذية الراجعة"] },
  },
  motion: {
    pause: "إيقاف الحركة",
    paused: "الحركة متوقفة",
    reduced: "حركة مخففة",
    pauseAria: "إيقاف حركة الرسوم التوضيحية",
    resumeAria: "استئناف حركة الرسوم التوضيحية",
    reducedAria: "الحركة مخففة وفق إعدادات جهازك",
  },
};

const HI: Partial<CategoryPageCopy> = {
  home: "होम",
  breadcrumbAria: "Breadcrumb",
  readLead: "Lead post से शुरू करें",
  postsIn: (n, label) => `${label} में ${n} ${n === 1 ? "post" : "posts"}`,
  statPosts: "इस category में posts",
  statReading: "कुल reading time",
  statUpdated: "आख़िरी update",
  statSearches: "मासिक searches cover",
  statAvgRead: "औसत read time",
  minUnit: "मिनट",
  pageAnswers: "यह page इनका जवाब देता है",
  allPostsEyebrow: "इस category की सभी posts",
  notesHeading: (n, topic) => [`${topic} पर`, `${n} field ${n === 1 ? "note" : "notes"}।`],
  topics: { growth: "Growth", automation: "Automation", seo: "SEO", "case-study": "असली नतीजों", ops: "Operations" },
  postsIntro: "Lead post वो है जो हम किसी founder को सबसे पहले देंगे। बाकी posts reading order में हैं।",
  postsIntroSingle: "अभी एक field note है — वही जो हम किसी founder को सबसे पहले देंगे।",
  leadKicker: "यहाँ से शुरू करें",
  moreLabel: "इस category की और posts",
  empty: "इस category में अभी कोई post नहीं है।",
  clustersLead: "ये posts आपस में",
  clustersAccent: "कैसे जुड़ती हैं।",
  clusterLabel: "Cluster",
  inThisCategory: "इस category में",
  clusterCount: (total, here) => `${total} posts · ${here} यहाँ`,
  otherEyebrow: "दूसरी categories देखें",
  postCount: (n) => `${n} ${n === 1 ? "post" : "posts"}`,
  finalLead: "चलिए इसे",
  finalAccent: "engineer करते हैं।",
  circuitLabel: "आपका अगला chapter",
  footerCenter: "Build से field notes।",
  backToTop: "ऊपर जाएँ",
  figures: {
    growth: { title: "Leads कहाँ leak होते हैं", legend: ["चरण", "Leaks", "वापस मिले"] },
    automation: { title: "Conversation pipeline", legend: ["Messages", "Qualified", "CRM"] },
    seo: { title: "Compounding search growth", legend: ["Paid", "Organic", "Cluster"] },
    "case-study": { title: "Revenue audit", legend: ["Pipeline", "Leaks", "Fixed"] },
    ops: { title: "Five-layer stack", legend: ["Layers", "Signal", "Feedback loop"] },
  },
  motion: {
    pause: "Motion रोकें",
    paused: "Motion रुका है",
    reduced: "Reduced motion",
    pauseAria: "Diagram motion रोकें",
    resumeAria: "Diagram motion फिर शुरू करें",
    reducedAria: "आपके device की setting से motion कम है",
  },
};

const ZH: Partial<CategoryPageCopy> = {
  home: "首页",
  breadcrumbAria: "面包屑导航",
  readLead: "从主打文章开始",
  postsIn: (n, label) => `${label}分类共 ${n} 篇文章`,
  statPosts: "本分类文章",
  statReading: "总阅读时长",
  statUpdated: "最近更新",
  statSearches: "覆盖的月搜索量",
  statAvgRead: "平均阅读时长",
  minUnit: "分钟",
  pageAnswers: "本页回答",
  allPostsEyebrow: "本分类全部文章",
  notesHeading: (n, topic) => [`关于${topic}的`, `${n} 篇实战笔记。`],
  topics: { growth: "增长", automation: "自动化", seo: "SEO", "case-study": "真实成果", ops: "运营" },
  postsIntro: "主打文章是我们最想先推荐给创始人的那一篇，其余文章按阅读顺序排列。",
  postsIntroSingle: "目前只有一篇实战笔记，也是我们最想先推荐给创始人的那一篇。",
  leadKicker: "从这里开始",
  moreLabel: "本分类更多文章",
  empty: "本分类暂无文章。",
  clustersLead: "这些文章",
  clustersAccent: "如何相互关联。",
  clusterLabel: "主题集群",
  inThisCategory: "本分类",
  clusterCount: (total, here) => `共 ${total} 篇 · 本分类 ${here} 篇`,
  otherEyebrow: "浏览其他分类",
  postCount: (n) => `${n} 篇文章`,
  finalLead: "让我们一起",
  finalAccent: "把它做出来。",
  circuitLabel: "你的下一章",
  footerCenter: "来自一线的实战笔记。",
  backToTop: "返回顶部",
  figures: {
    growth: { title: "线索在哪里流失", legend: ["阶段", "流失", "挽回"] },
    automation: { title: "对话流水线", legend: ["消息", "已筛选", "CRM"] },
    seo: { title: "复利式搜索增长", legend: ["付费", "自然", "集群"] },
    "case-study": { title: "收入审计", legend: ["漏斗", "漏洞", "已修复"] },
    ops: { title: "五层收入架构", legend: ["层级", "信号", "反馈回路"] },
  },
  motion: {
    pause: "暂停动画",
    paused: "动画已暂停",
    reduced: "已减少动画",
    pauseAria: "暂停图示动画",
    resumeAria: "恢复图示动画",
    reducedAria: "已根据设备偏好减少动画",
  },
};

const GU: Partial<CategoryPageCopy> = {
  home: "હોમ",
  breadcrumbAria: "બ્રેડક્રમ્બ",
  readLead: "મુખ્ય લેખથી શરૂ કરો",
  postsIn: (n, label) => `${label}માં ${n} લેખ`,
  statPosts: "આ કેટેગરીમાં લેખ",
  statReading: "કુલ વાંચન સમય",
  statUpdated: "છેલ્લે અપડેટ",
  statSearches: "આવરી લીધેલી માસિક સર્ચ",
  statAvgRead: "સરેરાશ વાંચન સમય",
  minUnit: "મિનિટ",
  pageAnswers: "આ પેજ જવાબ આપે છે",
  allPostsEyebrow: "આ કેટેગરીના બધા લેખ",
  notesHeading: (n, topic) => [`${topic} પર`, `${n} ફીલ્ડ ${n === 1 ? "નોટ" : "નોટ્સ"}.`],
  topics: { growth: "ગ્રોથ", automation: "ઓટોમેશન", seo: "SEO", "case-study": "વાસ્તવિક પરિણામો", ops: "ઓપરેશન્સ" },
  postsIntro: "મુખ્ય લેખ એ છે જે અમે કોઈ પણ ફાઉન્ડરને સૌથી પહેલા આપીએ. બાકીના લેખ વાંચનના ક્રમમાં છે.",
  postsIntroSingle: "અત્યાર સુધી એક ફીલ્ડ નોટ છે — જે અમે કોઈ પણ ફાઉન્ડરને સૌથી પહેલા આપીએ.",
  leadKicker: "અહીંથી શરૂ કરો",
  moreLabel: "આ કેટેગરીના વધુ લેખ",
  empty: "આ કેટેગરીમાં હજી કોઈ લેખ નથી.",
  clustersLead: "આ લેખો એકબીજા સાથે",
  clustersAccent: "કેવી રીતે જોડાય છે.",
  clusterLabel: "ક્લસ્ટર",
  inThisCategory: "આ કેટેગરીમાં",
  clusterCount: (total, here) => `${total} લેખ · ${here} અહીં`,
  otherEyebrow: "બીજી કેટેગરી જુઓ",
  postCount: (n) => `${n} લેખ`,
  finalLead: "ચાલો તેને",
  finalAccent: "સાથે બનાવીએ.",
  circuitLabel: "તમારો આગલો અધ્યાય",
  footerCenter: "કામના મેદાનમાંથી ફીલ્ડ નોટ્સ.",
  backToTop: "ઉપર જાઓ",
  figures: {
    growth: { title: "લીડ્સ ક્યાં ગુમ થાય છે", legend: ["તબક્કા", "લીક", "પાછા મેળવ્યા"] },
    automation: { title: "વાતચીતની પાઇપલાઇન", legend: ["સંદેશા", "યોગ્ય", "CRM"] },
    seo: { title: "ચક્રવૃદ્ધિ સર્ચ ગ્રોથ", legend: ["પેઇડ", "ઓર્ગેનિક", "ક્લસ્ટર"] },
    "case-study": { title: "રેવન્યુ ઓડિટ", legend: ["પાઇપલાઇન", "લીક", "સુધાર્યું"] },
    ops: { title: "પાંચ-સ્તરીય સ્ટેક", legend: ["સ્તરો", "સિગ્નલ", "ફીડબેક લૂપ"] },
  },
  motion: {
    pause: "મોશન રોકો",
    paused: "મોશન રોકાયેલું છે",
    reduced: "ઓછું મોશન",
    pauseAria: "ડાયાગ્રામનું મોશન રોકો",
    resumeAria: "ડાયાગ્રામનું મોશન ફરી શરૂ કરો",
    reducedAria: "તમારા ડિવાઇસની પસંદગી મુજબ મોશન ઓછું છે",
  },
};

const TABLE: Record<Locale, Partial<CategoryPageCopy>> = { en: EN, es: ES, fr: FR, de: DE, ar: AR, hi: HI, zh: ZH, gu: GU };

/** Locale copy merged over English, so a missing key never renders blank. */
export function getCategoryCopy(locale: string): CategoryPageCopy {
  const table = TABLE[locale as Locale];
  if (!table || table === EN) return EN;
  return { ...EN, ...table, topics: { ...EN.topics, ...table.topics }, figures: { ...EN.figures, ...table.figures }, motion: { ...EN.motion, ...table.motion } };
}
