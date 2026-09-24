/**
 * Article-page chrome strings that `getBlogUi` doesn't already provide
 * (reading progress, share feedback, sidebar labels). English is the
 * fallback for any missing locale.
 */

export interface ArticleCopy {
  progress: string;
  read: string;
  minLeft: (min: number) => string;
  finished: string;
  contents: string;
  sections: string;
  published: string;
  words: string;
  readingTime: string;
  category: string;
  copyLink: string;
  copied: string;
  shareOn: (network: string) => string;
  ctaTitle: string;
  ctaBody: string;
  faqLabel: string;
  openContents: string;
  closeContents: string;
}

const EN: ArticleCopy = {
  progress: "Reading progress",
  read: "read",
  minLeft: (min) => (min <= 1 ? "Under a minute left" : `${min} min left`),
  finished: "Finished — thanks for reading",
  contents: "Contents",
  sections: "Sections",
  published: "Published",
  words: "Words",
  readingTime: "Read time",
  category: "Category",
  copyLink: "Copy link",
  copied: "Link copied",
  shareOn: (network) => `Share on ${network}`,
  ctaTitle: "Want this mapped for your business?",
  ctaBody: "A free audit of one workflow — a written diagnosis and a clear next step.",
  faqLabel: "FAQ",
  openContents: "Open contents",
  closeContents: "Close contents",
};

const COPY: Record<string, ArticleCopy> = {
  en: EN,
  es: {
    progress: "Progreso de lectura", read: "leído",
    minLeft: (min) => (min <= 1 ? "Queda menos de un minuto" : `Quedan ${min} min`),
    finished: "Terminado — gracias por leer", contents: "Contenido", sections: "Secciones",
    published: "Publicado", words: "Palabras", readingTime: "Lectura", category: "Categoría", copyLink: "Copiar enlace", copied: "Enlace copiado",
    shareOn: (n) => `Compartir en ${n}`, ctaTitle: "¿Quieres esto aplicado a tu negocio?",
    ctaBody: "Una auditoría gratuita de un flujo de trabajo: un diagnóstico escrito y un siguiente paso claro.",
    faqLabel: "Preguntas", openContents: "Abrir contenido", closeContents: "Cerrar contenido",
  },
  fr: {
    progress: "Progression de lecture", read: "lu",
    minLeft: (min) => (min <= 1 ? "Moins d’une minute restante" : `${min} min restantes`),
    finished: "Terminé — merci de votre lecture", contents: "Sommaire", sections: "Sections",
    published: "Publié", words: "Mots", readingTime: "Lecture", category: "Catégorie", copyLink: "Copier le lien", copied: "Lien copié",
    shareOn: (n) => `Partager sur ${n}`, ctaTitle: "Envie de l’appliquer à votre entreprise ?",
    ctaBody: "Un audit gratuit d’un processus : un diagnostic écrit et une prochaine étape claire.",
    faqLabel: "FAQ", openContents: "Ouvrir le sommaire", closeContents: "Fermer le sommaire",
  },
  de: {
    progress: "Lesefortschritt", read: "gelesen",
    minLeft: (min) => (min <= 1 ? "Weniger als eine Minute übrig" : `Noch ${min} Min.`),
    finished: "Fertig — danke fürs Lesen", contents: "Inhalt", sections: "Abschnitte",
    published: "Veröffentlicht", words: "Wörter", readingTime: "Lesezeit", category: "Kategorie", copyLink: "Link kopieren", copied: "Link kopiert",
    shareOn: (n) => `Auf ${n} teilen`, ctaTitle: "Soll das für Ihr Unternehmen aufgesetzt werden?",
    ctaBody: "Ein kostenloses Audit eines Prozesses – schriftliche Diagnose und ein klarer nächster Schritt.",
    faqLabel: "FAQ", openContents: "Inhalt öffnen", closeContents: "Inhalt schließen",
  },
  ar: {
    progress: "تقدّم القراءة", read: "مقروء",
    minLeft: (min) => (min <= 1 ? "أقل من دقيقة متبقية" : `${min} دقائق متبقية`),
    finished: "انتهيت — شكرًا للقراءة", contents: "المحتويات", sections: "الأقسام",
    published: "تاريخ النشر", words: "الكلمات", readingTime: "مدة القراءة", category: "الفئة", copyLink: "نسخ الرابط", copied: "تم نسخ الرابط",
    shareOn: (n) => `شارك على ${n}`, ctaTitle: "هل تريد تطبيق ذلك على عملك؟",
    ctaBody: "تدقيق مجاني لسير عمل واحد — تشخيص مكتوب وخطوة تالية واضحة.",
    faqLabel: "الأسئلة الشائعة", openContents: "فتح المحتويات", closeContents: "إغلاق المحتويات",
  },
  hi: {
    progress: "पढ़ने की प्रगति", read: "पढ़ा गया",
    minLeft: (min) => (min <= 1 ? "एक मिनट से कम बाकी" : `${min} मिनट बाकी`),
    finished: "पूरा हुआ — पढ़ने के लिए धन्यवाद", contents: "विषय-सूची", sections: "खंड",
    published: "प्रकाशित", words: "शब्द", readingTime: "पढ़ने का समय", category: "श्रेणी", copyLink: "लिंक कॉपी करें", copied: "लिंक कॉपी हो गया",
    shareOn: (n) => `${n} पर शेयर करें`, ctaTitle: "क्या आप इसे अपने बिज़नेस के लिए चाहते हैं?",
    ctaBody: "एक वर्कफ़्लो का मुफ़्त ऑडिट — लिखित निदान और स्पष्ट अगला कदम।",
    faqLabel: "सामान्य प्रश्न", openContents: "विषय-सूची खोलें", closeContents: "विषय-सूची बंद करें",
  },
  zh: {
    progress: "阅读进度", read: "已读",
    minLeft: (min) => (min <= 1 ? "剩余不到一分钟" : `剩余 ${min} 分钟`),
    finished: "已读完 — 感谢阅读", contents: "目录", sections: "章节",
    published: "发布于", words: "字数", readingTime: "阅读时长", category: "分类", copyLink: "复制链接", copied: "链接已复制",
    shareOn: (n) => `分享到 ${n}`, ctaTitle: "想把它落地到您的业务吗？",
    ctaBody: "免费审查一个流程——书面诊断与清晰的下一步。",
    faqLabel: "常见问题", openContents: "打开目录", closeContents: "关闭目录",
  },
  gu: {
    progress: "વાંચન પ્રગતિ", read: "વાંચ્યું",
    minLeft: (min) => (min <= 1 ? "એક મિનિટથી ઓછું બાકી" : `${min} મિનિટ બાકી`),
    finished: "પૂર્ણ — વાંચવા બદલ આભાર", contents: "વિષયસૂચિ", sections: "વિભાગો",
    published: "પ્રકાશિત", words: "શબ્દો", readingTime: "વાંચન સમય", category: "શ્રેણી", copyLink: "લિંક કૉપિ કરો", copied: "લિંક કૉપિ થઈ",
    shareOn: (n) => `${n} પર શેર કરો`, ctaTitle: "શું તમે આ તમારા વ્યવસાય માટે ઇચ્છો છો?",
    ctaBody: "એક વર્કફ્લોનું મફત ઑડિટ — લેખિત નિદાન અને સ્પષ્ટ આગળનું પગલું.",
    faqLabel: "પ્રશ્નો", openContents: "વિષયસૂચિ ખોલો", closeContents: "વિષયસૂચિ બંધ કરો",
  },
};

export function getArticleCopy(locale: string): ArticleCopy {
  return COPY[locale] ?? EN;
}
