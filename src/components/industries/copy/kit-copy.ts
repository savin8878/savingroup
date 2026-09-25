/**
 * Industry kit — UI copy for the two interactive components on the industry
 * pages: <WorkflowSimulator> ("See it run") and <ImpactEstimator>.
 *
 * Only the chrome lives here (buttons, labels, hints, disclaimers). The
 * workflow stages and estimator inputs themselves come from
 * src/components/industries/workflows.ts. English is the source of truth;
 * every other locale is merged over it, so a missing key never renders blank.
 */

import type { Locale } from "@/lib/i18n";

export interface SimulatorCopy {
  /** Header box above the sample transaction. */
  sampleLabel: string;
  /** aria-label of the stage tab list. */
  stagesLabel: string;
  /** "Stage 3 of 8". */
  stageOf: (n: number, total: number) => string;
  /** Scene bar, start. */
  liveView: string;
  /** Label before "Sales → Planning". */
  handoff: string;
  /** Label before the linked record codes. */
  trail: string;
  /** Record panel footer: "Linked to SO-1042". */
  linkedTo: (code: string) => string;
  /** Record panel footer on the first stage. */
  origin: string;
  /** Status pill while the stage is still being worked on. */
  updating: string;
  /** Event log, inline end: "3 of 8 synced". */
  synced: (n: number, total: number) => string;
  play: string;
  pause: string;
  replay: string;
  /** Play button label when the device prefers reduced motion. */
  autoplayOff: string;
  /** Play button label when the page's "Pause motion" control is on. */
  motionPaused: string;
  playAria: string;
  pauseAria: string;
  replayAria: string;
  restartAria: string;
  prevAria: string;
  nextAria: string;
  next: string;
  complete: string;
  completeAnnouncement: (total: number) => string;
  reducedHint: string;
  pausedHint: string;
  drawingHint: string;
  disclaimer: string;
}

export interface EstimatorCopy {
  eyebrow: string;
  /** Heading of the inputs column (and form aria-label). */
  inputsLabel: string;
  /** Heading of the results column. */
  resultsLabel: string;
  /** aria-label of the exact-entry number field. */
  exact: (label: string) => string;
  /** Marker on the slider track at the default value. */
  typical: string;
  reset: string;
  assumptions: string;
  disclaimer: string;
  cta: string;
  ctaNote: (minutes: number) => string;
  /** Screen-reader prefix when results change. */
  updated: string;
  /** Sticky mini result bar on narrow screens. */
  peek: string;
  seeAll: string;
  /** Screen-reader range hint: "Range 1 to 40". */
  range: (min: string, max: string) => string;
}

export interface KitCopy {
  sim: SimulatorCopy;
  est: EstimatorCopy;
}

const EN: KitCopy = {
  sim: {
    sampleLabel: "Sample transaction",
    stagesLabel: "Workflow stages",
    stageOf: (n, total) => `Stage ${n} of ${total}`,
    liveView: "Live view",
    handoff: "Hand-off",
    trail: "Record trail",
    linkedTo: (code) => `Linked to ${code}`,
    origin: "Opens the record trail",
    updating: "Updating…",
    synced: (n, total) => `${n} of ${total} synced`,
    play: "Play",
    pause: "Pause",
    replay: "Replay",
    autoplayOff: "Autoplay off",
    motionPaused: "Motion paused",
    playAria: "Play the walkthrough",
    pauseAria: "Pause the walkthrough",
    replayAria: "Replay the walkthrough from the start",
    restartAria: "Restart from the first stage",
    prevAria: "Previous stage",
    nextAria: "Next stage",
    next: "Next",
    complete: "Workflow complete",
    completeAnnouncement: (total) => `Workflow complete. All ${total} stages are linked in one record trail.`,
    reducedHint: "Autoplay is off because your device prefers reduced motion. Step through with the stages or Next.",
    pausedHint: "Motion is paused on this page. Step through with the stages or Next.",
    drawingHint: "Tip: select a part of the drawing to jump to that stage.",
    disclaimer: "A simulated workflow with sample data. No live system is connected.",
  },
  est: {
    eyebrow: "Impact estimate",
    inputsLabel: "Your numbers",
    resultsLabel: "Estimated impact",
    exact: (label) => `${label} — exact value`,
    typical: "Typical",
    reset: "Reset to typical values",
    assumptions: "Assumptions",
    disclaimer: "Illustrative estimate — not a quote or a guarantee.",
    cta: "Get this checked on a free audit",
    ctaNote: (minutes) => `Free ${minutes}-minute audit. We check these numbers against your real data and put it in writing.`,
    updated: "Estimate updated",
    peek: "Live estimate",
    seeAll: "See all results",
    range: (min, max) => `Range ${min} to ${max}`,
  },
};

const ES: KitCopy = {
  sim: {
    sampleLabel: "Transacción de ejemplo",
    stagesLabel: "Etapas del flujo",
    stageOf: (n, total) => `Etapa ${n} de ${total}`,
    liveView: "Vista en vivo",
    handoff: "Traspaso",
    trail: "Rastro de registros",
    linkedTo: (code) => `Vinculado a ${code}`,
    origin: "Abre el rastro de registros",
    updating: "Actualizando…",
    synced: (n, total) => `${n} de ${total} sincronizadas`,
    play: "Reproducir",
    pause: "Pausar",
    replay: "Repetir",
    autoplayOff: "Autoplay desactivado",
    motionPaused: "Movimiento en pausa",
    playAria: "Reproducir el recorrido",
    pauseAria: "Pausar el recorrido",
    replayAria: "Repetir el recorrido desde el inicio",
    restartAria: "Reiniciar desde la primera etapa",
    prevAria: "Etapa anterior",
    nextAria: "Etapa siguiente",
    next: "Siguiente",
    complete: "Flujo completado",
    completeAnnouncement: (total) => `Flujo completado. Las ${total} etapas quedan vinculadas en un solo rastro de registros.`,
    reducedHint: "La reproducción automática está desactivada porque tu dispositivo prefiere menos movimiento. Avanza con las etapas o con Siguiente.",
    pausedHint: "El movimiento de esta página está en pausa. Avanza con las etapas o con Siguiente.",
    drawingHint: "Consejo: selecciona una parte del dibujo para saltar a esa etapa.",
    disclaimer: "Un flujo simulado con datos de ejemplo. No hay ningún sistema real conectado.",
  },
  est: {
    eyebrow: "Estimación de impacto",
    inputsLabel: "Tus cifras",
    resultsLabel: "Impacto estimado",
    exact: (label) => `${label} — valor exacto`,
    typical: "Típico",
    reset: "Volver a los valores típicos",
    assumptions: "Supuestos",
    disclaimer: "Estimación ilustrativa: no es una cotización ni una garantía.",
    cta: "Compruébalo en una auditoría gratuita",
    ctaNote: (minutes) => `Auditoría gratuita de ${minutes} minutos. Contrastamos estas cifras con tus datos reales y te lo entregamos por escrito.`,
    updated: "Estimación actualizada",
    peek: "Estimación en vivo",
    seeAll: "Ver todos los resultados",
    range: (min, max) => `Rango de ${min} a ${max}`,
  },
};

const FR: KitCopy = {
  sim: {
    sampleLabel: "Transaction d’exemple",
    stagesLabel: "Étapes du flux",
    stageOf: (n, total) => `Étape ${n} sur ${total}`,
    liveView: "Vue en direct",
    handoff: "Passation",
    trail: "Chaîne d’enregistrements",
    linkedTo: (code) => `Lié à ${code}`,
    origin: "Ouvre la chaîne d’enregistrements",
    updating: "Mise à jour…",
    synced: (n, total) => `${n} sur ${total} synchronisées`,
    play: "Lire",
    pause: "Pause",
    replay: "Rejouer",
    autoplayOff: "Lecture auto désactivée",
    motionPaused: "Animation en pause",
    playAria: "Lire la démonstration",
    pauseAria: "Mettre la démonstration en pause",
    replayAria: "Rejouer la démonstration depuis le début",
    restartAria: "Recommencer à la première étape",
    prevAria: "Étape précédente",
    nextAria: "Étape suivante",
    next: "Suivant",
    complete: "Flux terminé",
    completeAnnouncement: (total) => `Flux terminé. Les ${total} étapes sont reliées dans une seule chaîne d’enregistrements.`,
    reducedHint: "La lecture automatique est désactivée, car votre appareil préfère réduire les animations. Avancez avec les étapes ou Suivant.",
    pausedHint: "Les animations de cette page sont en pause. Avancez avec les étapes ou Suivant.",
    drawingHint: "Astuce : sélectionnez une partie du dessin pour aller à cette étape.",
    disclaimer: "Un flux simulé avec des données d’exemple. Aucun système réel n’est connecté.",
  },
  est: {
    eyebrow: "Estimation d’impact",
    inputsLabel: "Vos chiffres",
    resultsLabel: "Impact estimé",
    exact: (label) => `${label} — valeur exacte`,
    typical: "Typique",
    reset: "Revenir aux valeurs typiques",
    assumptions: "Hypothèses",
    disclaimer: "Estimation indicative — ni un devis ni une garantie.",
    cta: "Faites-le vérifier lors d’un audit gratuit",
    ctaNote: (minutes) => `Audit gratuit de ${minutes} minutes. Nous confrontons ces chiffres à vos données réelles et vous remettons le résultat par écrit.`,
    updated: "Estimation mise à jour",
    peek: "Estimation en direct",
    seeAll: "Voir tous les résultats",
    range: (min, max) => `Plage de ${min} à ${max}`,
  },
};

const DE: KitCopy = {
  sim: {
    sampleLabel: "Beispielvorgang",
    stagesLabel: "Ablaufphasen",
    stageOf: (n, total) => `Phase ${n} von ${total}`,
    liveView: "Live-Ansicht",
    handoff: "Übergabe",
    trail: "Belegkette",
    linkedTo: (code) => `Verknüpft mit ${code}`,
    origin: "Startet die Belegkette",
    updating: "Wird aktualisiert…",
    synced: (n, total) => `${n} von ${total} synchronisiert`,
    play: "Abspielen",
    pause: "Pausieren",
    replay: "Wiederholen",
    autoplayOff: "Autoplay aus",
    motionPaused: "Animation pausiert",
    playAria: "Rundgang abspielen",
    pauseAria: "Rundgang pausieren",
    replayAria: "Rundgang von vorn abspielen",
    restartAria: "Bei der ersten Phase neu beginnen",
    prevAria: "Vorherige Phase",
    nextAria: "Nächste Phase",
    next: "Weiter",
    complete: "Ablauf abgeschlossen",
    completeAnnouncement: (total) => `Ablauf abgeschlossen. Alle ${total} Phasen sind in einer Belegkette verknüpft.`,
    reducedHint: "Autoplay ist aus, weil Ihr Gerät reduzierte Bewegung bevorzugt. Gehen Sie über die Phasen oder „Weiter“ Schritt für Schritt vor.",
    pausedHint: "Die Animationen dieser Seite sind pausiert. Gehen Sie über die Phasen oder „Weiter“ Schritt für Schritt vor.",
    drawingHint: "Tipp: Wählen Sie einen Teil der Zeichnung, um zu dieser Phase zu springen.",
    disclaimer: "Ein simulierter Ablauf mit Beispieldaten. Es ist kein Live-System verbunden.",
  },
  est: {
    eyebrow: "Wirkungsschätzung",
    inputsLabel: "Ihre Zahlen",
    resultsLabel: "Geschätzte Wirkung",
    exact: (label) => `${label} – genauer Wert`,
    typical: "Typisch",
    reset: "Auf typische Werte zurücksetzen",
    assumptions: "Annahmen",
    disclaimer: "Beispielhafte Schätzung – kein Angebot und keine Garantie.",
    cta: "Im kostenlosen Audit prüfen lassen",
    ctaNote: (minutes) => `Kostenloses ${minutes}-Minuten-Audit. Wir gleichen diese Zahlen mit Ihren echten Daten ab – schriftlich.`,
    updated: "Schätzung aktualisiert",
    peek: "Live-Schätzung",
    seeAll: "Alle Ergebnisse ansehen",
    range: (min, max) => `Bereich ${min} bis ${max}`,
  },
};

const AR: KitCopy = {
  sim: {
    sampleLabel: "معاملة نموذجية",
    stagesLabel: "مراحل سير العمل",
    stageOf: (n, total) => `المرحلة ${n} من ${total}`,
    liveView: "عرض مباشر",
    handoff: "التسليم",
    trail: "مسار السجلات",
    linkedTo: (code) => `مرتبط بـ ${code}`,
    origin: "بداية مسار السجلات",
    updating: "جارٍ التحديث…",
    synced: (n, total) => `تمت مزامنة ${n} من ${total}`,
    play: "تشغيل",
    pause: "إيقاف مؤقت",
    replay: "إعادة التشغيل",
    autoplayOff: "التشغيل التلقائي متوقف",
    motionPaused: "الحركة متوقفة",
    playAria: "تشغيل الجولة",
    pauseAria: "إيقاف الجولة مؤقتًا",
    replayAria: "إعادة تشغيل الجولة من البداية",
    restartAria: "البدء من المرحلة الأولى",
    prevAria: "المرحلة السابقة",
    nextAria: "المرحلة التالية",
    next: "التالي",
    complete: "اكتمل سير العمل",
    completeAnnouncement: (total) => `اكتمل سير العمل. جميع المراحل (${total}) مرتبطة في مسار سجلات واحد.`,
    reducedHint: "التشغيل التلقائي متوقف لأن جهازك يفضّل تقليل الحركة. تنقّل بين المراحل أو اضغط «التالي».",
    pausedHint: "الحركة متوقفة في هذه الصفحة. تنقّل بين المراحل أو اضغط «التالي».",
    drawingHint: "تلميح: اختر جزءًا من الرسم للانتقال إلى تلك المرحلة.",
    disclaimer: "سير عمل محاكى ببيانات نموذجية. لا يوجد نظام فعلي متصل.",
  },
  est: {
    eyebrow: "تقدير الأثر",
    inputsLabel: "أرقامك",
    resultsLabel: "الأثر المقدّر",
    exact: (label) => `${label} — القيمة الدقيقة`,
    typical: "المعتاد",
    reset: "العودة إلى القيم المعتادة",
    assumptions: "الافتراضات",
    disclaimer: "تقدير توضيحي — ليس عرض سعر ولا ضمانًا.",
    cta: "تحقّق من هذه الأرقام في تدقيق مجاني",
    ctaNote: (minutes) => `تدقيق مجاني مدته ${minutes} دقيقة. نطابق هذه الأرقام مع بياناتك الفعلية ونقدّم النتيجة مكتوبة.`,
    updated: "تم تحديث التقدير",
    peek: "تقدير مباشر",
    seeAll: "عرض كل النتائج",
    range: (min, max) => `النطاق من ${min} إلى ${max}`,
  },
};

const HI: KitCopy = {
  sim: {
    sampleLabel: "नमूना लेन-देन",
    stagesLabel: "वर्कफ़्लो के चरण",
    stageOf: (n, total) => `चरण ${n} / ${total}`,
    liveView: "लाइव दृश्य",
    handoff: "हैंड-ऑफ़",
    trail: "रिकॉर्ड ट्रेल",
    linkedTo: (code) => `${code} से जुड़ा`,
    origin: "रिकॉर्ड ट्रेल की शुरुआत",
    updating: "अपडेट हो रहा है…",
    synced: (n, total) => `${n} / ${total} सिंक`,
    play: "चलाएँ",
    pause: "रोकें",
    replay: "फिर चलाएँ",
    autoplayOff: "ऑटोप्ले बंद",
    motionPaused: "मोशन रुका है",
    playAria: "वॉकथ्रू चलाएँ",
    pauseAria: "वॉकथ्रू रोकें",
    replayAria: "वॉकथ्रू शुरू से फिर चलाएँ",
    restartAria: "पहले चरण से दोबारा शुरू करें",
    prevAria: "पिछला चरण",
    nextAria: "अगला चरण",
    next: "अगला",
    complete: "वर्कफ़्लो पूरा",
    completeAnnouncement: (total) => `वर्कफ़्लो पूरा। सभी ${total} चरण एक ही रिकॉर्ड ट्रेल में जुड़े हैं।`,
    reducedHint: "आपके डिवाइस में कम मोशन चुना गया है, इसलिए ऑटोप्ले बंद है। चरणों या ‘अगला’ से आगे बढ़ें।",
    pausedHint: "इस पेज का मोशन रुका है। चरणों या ‘अगला’ से आगे बढ़ें।",
    drawingHint: "सुझाव: किसी चरण पर जाने के लिए ड्रॉइंग का वह हिस्सा चुनें।",
    disclaimer: "नमूना डेटा के साथ एक सिम्युलेटेड वर्कफ़्लो। कोई लाइव सिस्टम जुड़ा नहीं है।",
  },
  est: {
    eyebrow: "असर का अनुमान",
    inputsLabel: "आपके आँकड़े",
    resultsLabel: "अनुमानित असर",
    exact: (label) => `${label} — सटीक मान`,
    typical: "सामान्य",
    reset: "सामान्य मानों पर लौटें",
    assumptions: "मान्यताएँ",
    disclaimer: "केवल उदाहरण के लिए अनुमान — यह कोटेशन या गारंटी नहीं है।",
    cta: "मुफ़्त ऑडिट में इसकी जाँच करवाएँ",
    ctaNote: (minutes) => `मुफ़्त ${minutes} मिनट का ऑडिट। हम इन आँकड़ों को आपके असली डेटा से मिलाकर लिखित में देते हैं।`,
    updated: "अनुमान अपडेट हुआ",
    peek: "लाइव अनुमान",
    seeAll: "सभी नतीजे देखें",
    range: (min, max) => `सीमा ${min} से ${max}`,
  },
};

const ZH: KitCopy = {
  sim: {
    sampleLabel: "示例交易",
    stagesLabel: "流程阶段",
    stageOf: (n, total) => `第 ${n} 阶段，共 ${total} 个`,
    liveView: "实时视图",
    handoff: "交接",
    trail: "记录链",
    linkedTo: (code) => `关联 ${code}`,
    origin: "记录链的起点",
    updating: "更新中…",
    synced: (n, total) => `已同步 ${n} / ${total}`,
    play: "播放",
    pause: "暂停",
    replay: "重播",
    autoplayOff: "自动播放已关闭",
    motionPaused: "动效已暂停",
    playAria: "播放演示",
    pauseAria: "暂停演示",
    replayAria: "从头重播演示",
    restartAria: "从第一阶段重新开始",
    prevAria: "上一阶段",
    nextAria: "下一阶段",
    next: "下一步",
    complete: "流程完成",
    completeAnnouncement: (total) => `流程完成。全部 ${total} 个阶段已连成一条记录链。`,
    reducedHint: "您的设备偏好减少动态效果，因此自动播放已关闭。请通过阶段标签或“下一步”逐步查看。",
    pausedHint: "本页动效已暂停。请通过阶段标签或“下一步”逐步查看。",
    drawingHint: "提示：点击图中的某个区域即可跳转到对应阶段。",
    disclaimer: "使用示例数据的模拟流程，未连接任何真实系统。",
  },
  est: {
    eyebrow: "效果估算",
    inputsLabel: "您的数据",
    resultsLabel: "预计效果",
    exact: (label) => `${label}（精确值）`,
    typical: "典型值",
    reset: "恢复典型值",
    assumptions: "假设条件",
    disclaimer: "示意性估算——并非报价或保证。",
    cta: "通过免费审计核实这些数字",
    ctaNote: (minutes) => `免费 ${minutes} 分钟审计。我们会用您的真实数据核对这些数字，并给出书面结论。`,
    updated: "估算已更新",
    peek: "实时估算",
    seeAll: "查看全部结果",
    range: (min, max) => `范围 ${min} 至 ${max}`,
  },
};

const GU: KitCopy = {
  sim: {
    sampleLabel: "નમૂનાનો વ્યવહાર",
    stagesLabel: "વર્કફ્લોના તબક્કા",
    stageOf: (n, total) => `તબક્કો ${n} / ${total}`,
    liveView: "લાઇવ દૃશ્ય",
    handoff: "હેન્ડ-ઓફ",
    trail: "રેકોર્ડ ટ્રેલ",
    linkedTo: (code) => `${code} સાથે જોડાયેલું`,
    origin: "રેકોર્ડ ટ્રેલની શરૂઆત",
    updating: "અપડેટ થઈ રહ્યું છે…",
    synced: (n, total) => `${n} / ${total} સિંક`,
    play: "ચલાવો",
    pause: "રોકો",
    replay: "ફરી ચલાવો",
    autoplayOff: "ઑટોપ્લે બંધ",
    motionPaused: "મોશન રોકાયું છે",
    playAria: "વૉકથ્રૂ ચલાવો",
    pauseAria: "વૉકથ્રૂ રોકો",
    replayAria: "વૉકથ્રૂ શરૂઆતથી ફરી ચલાવો",
    restartAria: "પહેલા તબક્કાથી ફરી શરૂ કરો",
    prevAria: "પાછલો તબક્કો",
    nextAria: "આગલો તબક્કો",
    next: "આગળ",
    complete: "વર્કફ્લો પૂર્ણ",
    completeAnnouncement: (total) => `વર્કફ્લો પૂર્ણ. બધા ${total} તબક્કા એક જ રેકોર્ડ ટ્રેલમાં જોડાયેલા છે.`,
    reducedHint: "તમારા ડિવાઇસમાં ઓછું મોશન પસંદ કરેલું છે, તેથી ઑટોપ્લે બંધ છે. તબક્કાઓ અથવા ‘આગળ’ વડે આગળ વધો.",
    pausedHint: "આ પેજનું મોશન રોકાયું છે. તબક્કાઓ અથવા ‘આગળ’ વડે આગળ વધો.",
    drawingHint: "સૂચન: તે તબક્કા પર જવા માટે ડ્રોઇંગનો તે ભાગ પસંદ કરો.",
    disclaimer: "નમૂનાના ડેટા સાથેનો સિમ્યુલેટેડ વર્કફ્લો. કોઈ લાઇવ સિસ્ટમ જોડાયેલી નથી.",
  },
  est: {
    eyebrow: "અસરનો અંદાજ",
    inputsLabel: "તમારા આંકડા",
    resultsLabel: "અંદાજિત અસર",
    exact: (label) => `${label} — ચોક્કસ મૂલ્ય`,
    typical: "સામાન્ય",
    reset: "સામાન્ય મૂલ્યો પર પાછા જાઓ",
    assumptions: "ધારણાઓ",
    disclaimer: "ફક્ત ઉદાહરણરૂપ અંદાજ — આ ક્વોટ કે ગેરંટી નથી.",
    cta: "મફત ઑડિટમાં આની ચકાસણી કરાવો",
    ctaNote: (minutes) => `મફત ${minutes} મિનિટનું ઑડિટ. અમે આ આંકડાને તમારા સાચા ડેટા સાથે ચકાસીને લેખિતમાં આપીએ છીએ.`,
    updated: "અંદાજ અપડેટ થયો",
    peek: "લાઇવ અંદાજ",
    seeAll: "બધા પરિણામો જુઓ",
    range: (min, max) => `શ્રેણી ${min} થી ${max}`,
  },
};

const TABLE: Record<Locale, KitCopy> = { en: EN, es: ES, fr: FR, de: DE, ar: AR, hi: HI, zh: ZH, gu: GU };

/** Locale copy merged over English, so a missing key never renders blank. */
export function getKitCopy(locale: string): KitCopy {
  const table = TABLE[locale as Locale];
  if (!table || table === EN) return EN;
  return { sim: { ...EN.sim, ...table.sim }, est: { ...EN.est, ...table.est } };
}
