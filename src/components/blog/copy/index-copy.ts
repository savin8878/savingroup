/**
 * Blog index (/blogs) — UI copy that is new with the home-style redesign.
 *
 * Everything that already existed stays in `getBlogUi()` (src/lib/blog-i18n.ts);
 * only strings the old page hard-coded, or that the new layout introduces, live
 * here. English is the source of truth; every other locale falls back to it.
 */

import { CTA_LABEL } from "@/lib/offer";
import type { Locale } from "@/lib/i18n";

export interface BlogIndexCopy {
  /** Visible breadcrumb root (the JSON-LD keeps "Home"). */
  home: string;
  /** Hero eyebrow, inline end. */
  edition: string;
  heroPrimary: string;
  heroNote: (posts: number, lastShipped: string) => string;
  figureTitle: string;
  figureAlt: string;
  legend: [string, string, string];
  /** Hero category band label: first line muted, second line ink. */
  bandLabel: [string, string];
  featuredCount: (count: number) => string;
  editorsPick: string;
  fillerTitle: string;
  fillerLink: string;
  latestAll: string;
  clusterLabel: string;
  postsCount: (count: number) => string;
  whyByline: string;
  whyTeamLink: string;
  numbersTitle: string;
  libraryIntro: string;
  viewCategory: string;
  searchLabel: string;
  searchPlaceholder: string;
  /** "{n}" and "{total}" are replaced. */
  results: string;
  empty: string;
  clear: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  faqBody: string;
  faqLink: string;
  finalEyebrow: string;
  finalQuestion: string;
  finalLead: string;
  finalAccent: string;
  ctaLabel: string;
  finalNote: (minutes: number) => string;
  circuitLabel: string;
  footerCenter: string;
  backToTop: string;
  motion: { pause: string; paused: string; reduced: string; pauseAria: string; resumeAria: string; reducedAria: string };
}

const EN: BlogIndexCopy = {
  home: "Home",
  edition: "Savin Group / Field notes",
  heroPrimary: "Read the editor’s pick",
  heroNote: (n, date) => `${n} long-form posts · last shipped ${date}`,
  figureTitle: "The workshop",
  figureAlt: "Illustration: field notes from client engagements move through an editorial desk and become published articles that reach readers.",
  legend: ["Field notes", "Editorial desk", "Published"],
  bandLabel: ["The library", "By topic."],
  featuredCount: (n) => `${n} featured`,
  editorsPick: "Editor’s pick",
  fillerTitle: "Every post, grouped by the problem it solves.",
  fillerLink: "Browse the library",
  latestAll: "Browse every post",
  clusterLabel: "Cluster",
  postsCount: (n) => `${n} ${n === 1 ? "post" : "posts"}`,
  whyByline: "Kanha Singh · Founder",
  whyTeamLink: "More on the team",
  numbersTitle: "The blog, by the numbers",
  libraryIntro: "Filter by topic, or search by title and tag. Every post links to the next one worth reading.",
  viewCategory: "Open topic page",
  searchLabel: "Search posts",
  searchPlaceholder: "Search titles, topics, tags",
  results: "{n} of {total} posts",
  empty: "No posts match that. Try a broader word or another topic.",
  clear: "Show all posts",
  authorName: "Kanha Singh",
  authorRole: "Founder · Savin Group",
  authorBio:
    "Kanha runs Savin Group. He writes this blog the way he writes internal retro notes — specific, opinionated, and mostly drawn from whichever client project shipped last week. Before building revenue systems for SMEs full-time he spent years in D2C, real estate tech, and automation consulting.",
  faqBody: "Short answers about how the blog is written and published. For anything about your own business, ask us directly.",
  faqLink: "Ask us a question",
  finalEyebrow: "Every post started as a client problem",
  finalQuestion: "Recognise your business in one of these posts?",
  finalLead: "Let’s",
  finalAccent: "engineer the fix.",
  ctaLabel: CTA_LABEL,
  finalNote: (m) => `Free ${m}-minute audit. A written diagnosis. A clear next step.`,
  circuitLabel: "Your next chapter",
  footerCenter: "Field notes from the build.",
  backToTop: "Back to top",
  motion: {
    pause: "Pause motion",
    paused: "Motion paused",
    reduced: "Reduced motion",
    pauseAria: "Pause diagram motion",
    resumeAria: "Resume diagram motion",
    reducedAria: "Motion reduced by your device preference",
  },
};

const ES: BlogIndexCopy = {
  home: "Inicio",
  edition: "Savin Group / Notas de campo",
  heroPrimary: "Leer la selección del editor",
  heroNote: (n, date) => `${n} artículos en profundidad · último publicado ${date}`,
  figureTitle: "El taller",
  figureAlt: "Ilustración: las notas de campo de los proyectos con clientes pasan por una mesa editorial y se convierten en artículos publicados que llegan a los lectores.",
  legend: ["Notas de campo", "Mesa editorial", "Publicado"],
  bandLabel: ["La biblioteca", "Por tema."],
  featuredCount: (n) => `${n} destacados`,
  editorsPick: "Selección del editor",
  fillerTitle: "Cada artículo, agrupado según el problema que resuelve.",
  fillerLink: "Explorar la biblioteca",
  latestAll: "Ver todos los artículos",
  clusterLabel: "Clúster",
  postsCount: (n) => `${n} ${n === 1 ? "artículo" : "artículos"}`,
  whyByline: "Kanha Singh · Fundador",
  whyTeamLink: "Conoce al equipo",
  numbersTitle: "El blog, en cifras",
  libraryIntro: "Filtra por tema o busca por título y etiqueta. Cada artículo enlaza con el siguiente que vale la pena leer.",
  viewCategory: "Abrir página del tema",
  searchLabel: "Buscar artículos",
  searchPlaceholder: "Busca títulos, temas, etiquetas",
  results: "{n} de {total} artículos",
  empty: "Ningún artículo coincide. Prueba con una palabra más general u otro tema.",
  clear: "Mostrar todos los artículos",
  authorName: "Kanha Singh",
  authorRole: "Fundador · Savin Group",
  authorBio:
    "Kanha dirige Savin Group. Escribe este blog como escribe sus notas internas de retrospectiva: concreto, con opinión y casi siempre a partir del proyecto que se entregó la semana pasada. Antes de dedicarse por completo a construir sistemas de ingresos para pymes, pasó años en D2C, tecnología inmobiliaria y consultoría de automatización.",
  faqBody: "Respuestas breves sobre cómo se escribe y se publica el blog. Para cualquier cosa sobre tu negocio, pregúntanos directamente.",
  faqLink: "Haznos una pregunta",
  finalEyebrow: "Cada artículo empezó como el problema de un cliente",
  finalQuestion: "¿Reconoces tu negocio en alguno de estos artículos?",
  finalLead: "Vamos a",
  finalAccent: "diseñar la solución.",
  ctaLabel: "Solicita tu auditoría gratuita",
  finalNote: (m) => `Auditoría gratuita de ${m} minutos. Un diagnóstico por escrito. Un siguiente paso claro.`,
  circuitLabel: "Tu próximo capítulo",
  footerCenter: "Notas de campo desde la obra.",
  backToTop: "Volver arriba",
  motion: {
    pause: "Pausar animación",
    paused: "Animación en pausa",
    reduced: "Movimiento reducido",
    pauseAria: "Pausar la animación de los diagramas",
    resumeAria: "Reanudar la animación de los diagramas",
    reducedAria: "Movimiento reducido por la preferencia de tu dispositivo",
  },
};

const FR: BlogIndexCopy = {
  home: "Accueil",
  edition: "Savin Group / Notes de terrain",
  heroPrimary: "Lire le choix de la rédaction",
  heroNote: (n, date) => `${n} articles de fond · dernier publié le ${date}`,
  figureTitle: "L’atelier",
  figureAlt: "Illustration : les notes de terrain issues des missions clients passent par un bureau éditorial et deviennent des articles publiés qui atteignent les lecteurs.",
  legend: ["Notes de terrain", "Bureau éditorial", "Publié"],
  bandLabel: ["La bibliothèque", "Par thème."],
  featuredCount: (n) => `${n} à la une`,
  editorsPick: "Choix de la rédaction",
  fillerTitle: "Chaque article, classé selon le problème qu’il résout.",
  fillerLink: "Parcourir la bibliothèque",
  latestAll: "Voir tous les articles",
  clusterLabel: "Cluster",
  postsCount: (n) => `${n} article${n === 1 ? "" : "s"}`,
  whyByline: "Kanha Singh · Fondateur",
  whyTeamLink: "En savoir plus sur l’équipe",
  numbersTitle: "Le blog en chiffres",
  libraryIntro: "Filtrez par thème ou cherchez par titre et mot-clé. Chaque article renvoie vers le suivant qui mérite d’être lu.",
  viewCategory: "Ouvrir la page du thème",
  searchLabel: "Rechercher des articles",
  searchPlaceholder: "Titres, thèmes, mots-clés",
  results: "{n} sur {total} articles",
  empty: "Aucun article ne correspond. Essayez un mot plus large ou un autre thème.",
  clear: "Afficher tous les articles",
  authorName: "Kanha Singh",
  authorRole: "Fondateur · Savin Group",
  authorBio:
    "Kanha dirige Savin Group. Il écrit ce blog comme ses notes de rétrospective internes : précis, engagé, et le plus souvent tiré du projet livré la semaine précédente. Avant de construire à plein temps des systèmes de revenus pour les PME, il a passé des années dans le D2C, la proptech et le conseil en automatisation.",
  faqBody: "Des réponses courtes sur la façon dont le blog est écrit et publié. Pour toute question sur votre activité, écrivez-nous directement.",
  faqLink: "Posez-nous une question",
  finalEyebrow: "Chaque article est né d’un problème client",
  finalQuestion: "Vous reconnaissez votre entreprise dans l’un de ces articles ?",
  finalLead: "Construisons",
  finalAccent: "la solution.",
  ctaLabel: "Demandez votre audit gratuit",
  finalNote: (m) => `Audit gratuit de ${m} minutes. Un diagnostic écrit. Une prochaine étape claire.`,
  circuitLabel: "Votre prochain chapitre",
  footerCenter: "Notes de terrain, depuis le chantier.",
  backToTop: "Retour en haut",
  motion: {
    pause: "Mettre en pause",
    paused: "Animation en pause",
    reduced: "Mouvement réduit",
    pauseAria: "Mettre en pause l’animation des schémas",
    resumeAria: "Reprendre l’animation des schémas",
    reducedAria: "Mouvement réduit selon les préférences de votre appareil",
  },
};

const DE: BlogIndexCopy = {
  home: "Startseite",
  edition: "Savin Group / Praxisnotizen",
  heroPrimary: "Die Empfehlung der Redaktion lesen",
  heroNote: (n, date) => `${n} ausführliche Beiträge · zuletzt veröffentlicht am ${date}`,
  figureTitle: "Die Werkstatt",
  figureAlt: "Illustration: Praxisnotizen aus Kundenprojekten laufen über einen Redaktionstisch und werden zu veröffentlichten Artikeln, die ihre Leser erreichen.",
  legend: ["Praxisnotizen", "Redaktion", "Veröffentlicht"],
  bandLabel: ["Die Bibliothek", "Nach Thema."],
  featuredCount: (n) => `${n} empfohlen`,
  editorsPick: "Empfehlung der Redaktion",
  fillerTitle: "Jeder Beitrag, sortiert nach dem Problem, das er löst.",
  fillerLink: "Bibliothek durchsuchen",
  latestAll: "Alle Beiträge ansehen",
  clusterLabel: "Cluster",
  postsCount: (n) => `${n} ${n === 1 ? "Beitrag" : "Beiträge"}`,
  whyByline: "Kanha Singh · Gründer",
  whyTeamLink: "Mehr über das Team",
  numbersTitle: "Der Blog in Zahlen",
  libraryIntro: "Nach Thema filtern oder nach Titel und Schlagwort suchen. Jeder Beitrag verweist auf den nächsten, der sich lohnt.",
  viewCategory: "Themenseite öffnen",
  searchLabel: "Beiträge durchsuchen",
  searchPlaceholder: "Titel, Themen, Schlagwörter",
  results: "{n} von {total} Beiträgen",
  empty: "Kein Beitrag passt. Versuchen Sie einen allgemeineren Begriff oder ein anderes Thema.",
  clear: "Alle Beiträge zeigen",
  authorName: "Kanha Singh",
  authorRole: "Gründer · Savin Group",
  authorBio:
    "Kanha leitet Savin Group. Er schreibt diesen Blog so wie seine internen Retro-Notizen: konkret, meinungsstark und meist aus dem Projekt, das letzte Woche live ging. Bevor er sich ganz dem Aufbau von Umsatzsystemen für KMU widmete, war er jahrelang in D2C, Immobilien-Tech und Automatisierungsberatung tätig.",
  faqBody: "Kurze Antworten dazu, wie der Blog geschrieben und veröffentlicht wird. Alles zu Ihrem eigenen Unternehmen fragen Sie uns am besten direkt.",
  faqLink: "Stellen Sie uns eine Frage",
  finalEyebrow: "Jeder Beitrag begann als Problem eines Kunden",
  finalQuestion: "Erkennen Sie Ihr Unternehmen in einem dieser Beiträge wieder?",
  finalLead: "Lassen Sie uns",
  finalAccent: "die Lösung bauen.",
  ctaLabel: "Kostenloses Audit anfragen",
  finalNote: (m) => `Kostenloses ${m}-Minuten-Audit. Eine schriftliche Diagnose. Ein klarer nächster Schritt.`,
  circuitLabel: "Ihr nächstes Kapitel",
  footerCenter: "Praxisnotizen direkt aus dem Projekt.",
  backToTop: "Nach oben",
  motion: {
    pause: "Animation pausieren",
    paused: "Animation pausiert",
    reduced: "Reduzierte Bewegung",
    pauseAria: "Diagramm-Animation pausieren",
    resumeAria: "Diagramm-Animation fortsetzen",
    reducedAria: "Bewegung durch Ihre Geräteeinstellung reduziert",
  },
};

/** Arabic counting: 1 مقالة واحدة · 2 مقالتان · 3–10 مقالات · 11+ مقالة. */
const arPosts = (n: number) => (n === 1 ? "مقالة واحدة" : n === 2 ? "مقالتان" : `${n} ${n >= 3 && n <= 10 ? "مقالات" : "مقالة"}`);

const AR: BlogIndexCopy = {
  home: "الرئيسية",
  edition: "Savin Group / ملاحظات ميدانية",
  heroPrimary: "اقرأ اختيار المحرر",
  heroNote: (n, date) => `${arPosts(n)} مطوّلة · آخر نشر ${date}`,
  figureTitle: "الورشة",
  figureAlt: "رسم توضيحي: ملاحظات ميدانية من مشاريع العملاء تمر عبر مكتب التحرير وتتحول إلى مقالات منشورة تصل إلى القرّاء.",
  legend: ["ملاحظات ميدانية", "مكتب التحرير", "منشور"],
  bandLabel: ["المكتبة", "حسب الموضوع."],
  featuredCount: (n) => `المقالات المميزة: ${n}`,
  editorsPick: "اختيار المحرر",
  fillerTitle: "كل المقالات، مصنّفة حسب المشكلة التي تحلّها.",
  fillerLink: "تصفّح المكتبة",
  latestAll: "عرض كل المقالات",
  clusterLabel: "مجموعة",
  postsCount: arPosts,
  whyByline: "Kanha Singh · المؤسس",
  whyTeamLink: "المزيد عن الفريق",
  numbersTitle: "المدونة بالأرقام",
  libraryIntro: "صفِّ المقالات حسب الموضوع أو ابحث بالعنوان والوسم. كل مقالة تقودك إلى التالية التي تستحق القراءة.",
  viewCategory: "افتح صفحة الموضوع",
  searchLabel: "ابحث في المقالات",
  searchPlaceholder: "العناوين، المواضيع، الوسوم",
  results: "{n} من {total}",
  empty: "لا توجد مقالات مطابقة. جرّب كلمة أعم أو موضوعًا آخر.",
  clear: "عرض كل المقالات",
  authorName: "Kanha Singh",
  authorRole: "المؤسس · Savin Group",
  authorBio:
    "يدير كانها Savin Group. يكتب هذه المدونة كما يكتب ملاحظات المراجعة الداخلية: محددة، صريحة الرأي، ومستمدة غالبًا من مشروع العميل الذي سُلِّم الأسبوع الماضي. قبل أن يتفرغ لبناء أنظمة الإيرادات للشركات الصغيرة والمتوسطة، أمضى سنوات في التجارة المباشرة للمستهلك وتقنيات العقارات واستشارات الأتمتة.",
  faqBody: "إجابات قصيرة عن طريقة كتابة المدونة ونشرها. لأي سؤال عن عملك، تواصل معنا مباشرة.",
  faqLink: "اطرح علينا سؤالًا",
  finalEyebrow: "كل مقالة بدأت بمشكلة لدى أحد العملاء",
  finalQuestion: "هل ترى عملك في إحدى هذه المقالات؟",
  finalLead: "لنصمّم",
  finalAccent: "الحل معًا.",
  ctaLabel: "اطلب تدقيقك المجاني",
  finalNote: (m) => `تدقيق مجاني لمدة ${m} دقيقة. تشخيص مكتوب. خطوة تالية واضحة.`,
  circuitLabel: "فصلك التالي",
  footerCenter: "ملاحظات ميدانية من قلب العمل.",
  backToTop: "العودة إلى الأعلى",
  motion: {
    pause: "إيقاف الحركة",
    paused: "الحركة متوقفة",
    reduced: "حركة مخفّضة",
    pauseAria: "إيقاف حركة الرسوم التوضيحية",
    resumeAria: "استئناف حركة الرسوم التوضيحية",
    reducedAria: "الحركة مخفّضة وفق إعدادات جهازك",
  },
};

const HI: BlogIndexCopy = {
  home: "होम",
  edition: "Savin Group / Field notes",
  heroPrimary: "Editor की पसंद पढ़ें",
  heroNote: (n, date) => `${n} long-form posts · आख़िरी post ${date}`,
  figureTitle: "Workshop",
  figureAlt: "Illustration: client engagements से आए field notes editorial desk से गुज़रकर published articles बनते हैं, जो readers तक पहुँचते हैं।",
  legend: ["Field notes", "Editorial desk", "Published"],
  bandLabel: ["Library", "Topic के हिसाब से।"],
  featuredCount: (n) => `${n} featured`,
  editorsPick: "Editor की पसंद",
  fillerTitle: "हर post, उस problem के हिसाब से जो वो solve करती है।",
  fillerLink: "Library देखें",
  latestAll: "सभी posts देखें",
  clusterLabel: "Cluster",
  postsCount: (n) => `${n} ${n === 1 ? "post" : "posts"}`,
  whyByline: "Kanha Singh · Founder",
  whyTeamLink: "Team के बारे में और",
  numbersTitle: "Blog, numbers में",
  libraryIntro: "Topic से filter करें या title और tag से search करें। हर post अगली पढ़ने लायक post से जुड़ी है।",
  viewCategory: "Topic page खोलें",
  searchLabel: "Posts search करें",
  searchPlaceholder: "Titles, topics, tags",
  results: "{total} में से {n} posts",
  empty: "कोई post match नहीं हुई। कोई broader शब्द या दूसरा topic try करें।",
  clear: "सभी posts दिखाएँ",
  authorName: "Kanha Singh",
  authorRole: "Founder · Savin Group",
  authorBio:
    "Kanha, Savin Group चलाते हैं। वो यह blog वैसे ही लिखते हैं जैसे internal retro notes — specific, opinionated, और ज़्यादातर पिछले हफ़्ते ship हुए client project से। SMEs के लिए full-time revenue systems बनाने से पहले उन्होंने D2C, real estate tech और automation consulting में सालों काम किया।",
  faqBody: "Blog कैसे लिखा और publish होता है, इस पर छोटे जवाब। अपने business के बारे में कुछ भी हो, हमसे सीधे पूछें।",
  faqLink: "हमसे सवाल पूछें",
  finalEyebrow: "हर post किसी client की problem से शुरू हुई",
  finalQuestion: "क्या इनमें से किसी post में आपको अपना business दिखता है?",
  finalLead: "चलिए,",
  finalAccent: "fix engineer करते हैं।",
  ctaLabel: "Free audit request करें",
  finalNote: (m) => `Free ${m}-मिनट audit। Written diagnosis। Clear next step।`,
  circuitLabel: "आपका अगला chapter",
  footerCenter: "Build से field notes।",
  backToTop: "ऊपर जाएँ",
  motion: {
    pause: "Motion रोकें",
    paused: "Motion रुका है",
    reduced: "Reduced motion",
    pauseAria: "Diagram motion रोकें",
    resumeAria: "Diagram motion फिर चलाएँ",
    reducedAria: "आपके device preference से motion कम है",
  },
};

const ZH: BlogIndexCopy = {
  home: "首页",
  edition: "Savin Group / 实战笔记",
  heroPrimary: "阅读编辑精选",
  heroNote: (n, date) => `${n} 篇深度文章 · 最近发布于 ${date}`,
  figureTitle: "工作坊",
  figureAlt: "插图：来自客户项目的实战笔记经过编辑台，成为发布的文章并送达读者。",
  legend: ["实战笔记", "编辑台", "已发布"],
  bandLabel: ["文章库", "按主题浏览。"],
  featuredCount: (n) => `${n} 篇精选`,
  editorsPick: "编辑精选",
  fillerTitle: "每篇文章，都按它解决的问题归类。",
  fillerLink: "浏览文章库",
  latestAll: "查看全部文章",
  clusterLabel: "主题集群",
  postsCount: (n) => `${n} 篇文章`,
  whyByline: "Kanha Singh · 创始人",
  whyTeamLink: "了解我们的团队",
  numbersTitle: "博客数据一览",
  libraryIntro: "按主题筛选，或按标题和标签搜索。每篇文章都会链接到下一篇值得读的内容。",
  viewCategory: "打开主题页面",
  searchLabel: "搜索文章",
  searchPlaceholder: "搜索标题、主题、标签",
  results: "共 {total} 篇，显示 {n} 篇",
  empty: "没有匹配的文章。试试更宽泛的词或其他主题。",
  clear: "显示全部文章",
  authorName: "Kanha Singh",
  authorRole: "创始人 · Savin Group",
  authorBio:
    "Kanha 负责运营 Savin Group。他写这个博客的方式和写内部复盘笔记一样：具体、有观点，而且大多来自上周刚交付的客户项目。在全职为中小企业搭建营收系统之前，他在 D2C、房地产科技和自动化咨询领域工作多年。",
  faqBody: "关于博客如何撰写和发布的简短回答。关于您自身业务的任何问题，欢迎直接联系我们。",
  faqLink: "向我们提问",
  finalEyebrow: "每篇文章都始于一个客户问题",
  finalQuestion: "在这些文章里看到了您的业务吗？",
  finalLead: "让我们",
  finalAccent: "把解决方案做出来。",
  ctaLabel: "申请免费审核",
  finalNote: (m) => `免费 ${m} 分钟审核。一份书面诊断。一个清晰的下一步。`,
  circuitLabel: "您的下一章",
  footerCenter: "来自一线的实战笔记。",
  backToTop: "返回顶部",
  motion: {
    pause: "暂停动画",
    paused: "动画已暂停",
    reduced: "已减少动态效果",
    pauseAria: "暂停图示动画",
    resumeAria: "继续图示动画",
    reducedAria: "已根据您的设备偏好减少动态效果",
  },
};

const GU: BlogIndexCopy = {
  home: "હોમ",
  edition: "Savin Group / ફિલ્ડ નોટ્સ",
  heroPrimary: "એડિટરની પસંદ વાંચો",
  heroNote: (n, date) => `${n} લાંબા લેખ · છેલ્લો લેખ ${date}`,
  figureTitle: "વર્કશોપ",
  figureAlt: "ચિત્ર: ક્લાયન્ટ પ્રોજેક્ટ્સની ફિલ્ડ નોટ્સ એડિટોરિયલ ડેસ્કમાંથી પસાર થઈને પ્રકાશિત લેખ બને છે, જે વાચકો સુધી પહોંચે છે.",
  legend: ["ફિલ્ડ નોટ્સ", "એડિટોરિયલ ડેસ્ક", "પ્રકાશિત"],
  bandLabel: ["લાઇબ્રેરી", "વિષય પ્રમાણે."],
  featuredCount: (n) => `${n} ફીચર્ડ`,
  editorsPick: "એડિટરની પસંદ",
  fillerTitle: "દરેક લેખ, તે જે સમસ્યા ઉકેલે છે તે પ્રમાણે ગોઠવેલો.",
  fillerLink: "લાઇબ્રેરી જુઓ",
  latestAll: "બધા લેખ જુઓ",
  clusterLabel: "ક્લસ્ટર",
  postsCount: (n) => `${n} લેખ`,
  whyByline: "Kanha Singh · સ્થાપક",
  whyTeamLink: "ટીમ વિશે વધુ",
  numbersTitle: "બ્લોગ, આંકડામાં",
  libraryIntro: "વિષય પ્રમાણે ફિલ્ટર કરો અથવા શીર્ષક અને ટૅગથી શોધો. દરેક લેખ વાંચવા જેવા આગલા લેખ સાથે જોડાયેલો છે.",
  viewCategory: "વિષયનું પેજ ખોલો",
  searchLabel: "લેખ શોધો",
  searchPlaceholder: "શીર્ષક, વિષય, ટૅગ",
  results: "{total} માંથી {n} લેખ",
  empty: "કોઈ લેખ મેળ ખાતો નથી. વધુ વ્યાપક શબ્દ અથવા બીજો વિષય અજમાવો.",
  clear: "બધા લેખ બતાવો",
  authorName: "Kanha Singh",
  authorRole: "સ્થાપક · Savin Group",
  authorBio:
    "Kanha, Savin Group ચલાવે છે. તેઓ આ બ્લોગ એ જ રીતે લખે છે જે રીતે આંતરિક રેટ્રો નોટ્સ લખે છે — ચોક્કસ, સ્પષ્ટ અભિપ્રાય સાથે અને મોટે ભાગે ગયા અઠવાડિયે પૂરા થયેલા ક્લાયન્ટ પ્રોજેક્ટ પરથી. SMEs માટે પૂર્ણ સમય રેવન્યુ સિસ્ટમ્સ બનાવતા પહેલાં તેમણે D2C, રિયલ એસ્ટેટ ટેક અને ઓટોમેશન કન્સલ્ટિંગમાં વર્ષો કામ કર્યું.",
  faqBody: "બ્લોગ કેવી રીતે લખાય અને પ્રકાશિત થાય છે તે વિશે ટૂંકા જવાબ. તમારા વ્યવસાય વિશે કંઈ પણ હોય, અમને સીધું પૂછો.",
  faqLink: "અમને પ્રશ્ન પૂછો",
  finalEyebrow: "દરેક લેખ કોઈ ક્લાયન્ટની સમસ્યાથી શરૂ થયો",
  finalQuestion: "શું આમાંના કોઈ લેખમાં તમને તમારો વ્યવસાય દેખાય છે?",
  finalLead: "ચાલો",
  finalAccent: "ઉકેલ ઘડીએ.",
  ctaLabel: "મફત ઓડિટની વિનંતી કરો",
  finalNote: (m) => `મફત ${m}-મિનિટ ઓડિટ. લેખિત નિદાન. સ્પષ્ટ આગલું પગલું.`,
  circuitLabel: "તમારો આગલો અધ્યાય",
  footerCenter: "કામમાંથી સીધી ફિલ્ડ નોટ્સ.",
  backToTop: "ઉપર જાઓ",
  motion: {
    pause: "મોશન રોકો",
    paused: "મોશન રોકાયેલું છે",
    reduced: "ઘટાડેલું મોશન",
    pauseAria: "ડાયાગ્રામ મોશન રોકો",
    resumeAria: "ડાયાગ્રામ મોશન ફરી શરૂ કરો",
    reducedAria: "તમારા ડિવાઇસની પસંદગી મુજબ મોશન ઘટાડેલું છે",
  },
};

const TABLE: Partial<Record<Locale, BlogIndexCopy>> = { en: EN, es: ES, fr: FR, de: DE, ar: AR, hi: HI, zh: ZH, gu: GU };

export function getBlogIndexCopy(locale: string): BlogIndexCopy {
  return TABLE[locale as Locale] ?? EN;
}
