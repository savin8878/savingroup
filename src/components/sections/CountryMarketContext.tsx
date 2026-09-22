import { Globe2, TrendingUp, Users, Clock } from "lucide-react";
import { Section } from "@/components/primitives/section";
import {
  getCountryMeta,
  getRegionLabel,
  formatLocalPrice,
  type MarketTier,
} from "@/lib/country-meta";
import { getCountryName } from "@/lib/geo";
import { interpolate, type Locale, type Messages } from "@/lib/i18n";

interface CountryMarketContextProps {
  t: Messages;
  country: string;
  locale: Locale;
  /** Page context — tunes the headline and paragraphs to the surrounding page. */
  pageKey?: "home" | "services" | "about" | "industries" | "caseStudies";
}

/* -------------------------------------------------------------------------- */
/*           Tier-specific messaging — drives genuinely different copy         */
/* -------------------------------------------------------------------------- */

interface TierCopy {
  headline: string;
  paragraph: string;
  bullets: string[];
}

const TIER_COPY: Record<Locale, Record<MarketTier, TierCopy>> = {
  en: {
    t1: {
      headline: "Revenue systems for mature {country} teams.",
      paragraph:
        "Businesses in {country} operate in one of the most competitive digital markets on the planet. CAC is high, attention is scarce, and a 'good' website is the floor — not the ceiling. We build revenue systems that compound: measurable conversion gains, automated follow-up, and organic channels that don't collapse when an ad platform changes its rules. Every engagement runs against {country}-specific benchmarks and the broader {region} market context.",
      bullets: [
        "Enterprise-grade performance — sub-second loads tuned for {country}'s browsing patterns.",
        "Revenue math in {currency} with clear payback horizons tracked against your P&L.",
        "Compliance-aware builds — privacy, data residency, and procurement standards honored.",
      ],
    },
    t2: {
      headline: "Revenue systems built for the {country} growth curve.",
      paragraph:
        "The digital economy in {country} is scaling faster than hiring can keep up — founders are buying productized systems, not junior agencies. We ship revenue infrastructure that gives {country}-based teams a multiplier: one embedded partner replaces three vendors, and every release ties back to topline or operating leverage. Pricing is in {currency} with transparent unit economics.",
      bullets: [
        "Playbooks informed by 50+ engagements across {region} — patterns that repeat, tactics that don't.",
        "WhatsApp-first automation where messaging beats email — unlocks 30%+ lead recovery.",
        "SEO built for {country} search intent, not translated boilerplate from other markets.",
      ],
    },
    t3: {
      headline: "Remote-first revenue partner for {country}.",
      paragraph:
        "We work with {country}-based founders and operators the same way we'd work with a team across the street: senior engineers on every call, weekly written changelog, fixed go-live dates. Distance isn't a problem — lack of clarity is. We bring both an outside perspective on the {region} market and hands-on execution in your timezone when it counts.",
      bullets: [
        "Transparent scope and pricing quoted in {currency} or USD, whichever simplifies procurement.",
        "Full ownership handed over — code, credentials, runbooks — so you're never locked in.",
        "Async-friendly cadence tuned to {country} business hours.",
      ],
    },
  },
  hi: {
    t1: {
      headline: "{country} की परिपक्व टीमों के लिए रेवेन्यू सिस्टम।",
      paragraph:
        "{country} की कंपनियां दुनिया के सबसे प्रतिस्पर्धी डिजिटल बाज़ारों में काम करती हैं। हम ऐसे रेवेन्यू सिस्टम बनाते हैं जो समय के साथ बढ़ते हैं — मापने योग्य कन्वर्शन, ऑटोमेटेड फॉलो-अप, और ऑर्गेनिक चैनल जो विज्ञापन प्लेटफॉर्म के नियम बदलने पर भी टिके रहते हैं। हर प्रोजेक्ट {country} के बेंचमार्क और {region} क्षेत्र की तुलना में मापा जाता है।",
      bullets: [
        "एंटरप्राइज़-ग्रेड परफॉरमेंस — {country} के ब्राउज़िंग पैटर्न के लिए ट्यून किया गया।",
        "{currency} में रेवेन्यू का गणित, साफ़ पेबैक समयसीमा के साथ।",
        "कंप्लायंस-अवेयर बिल्ड — प्राइवेसी और डेटा नियमों का पालन।",
      ],
    },
    t2: {
      headline: "{country} की ग्रोथ स्पीड के लिए बनी रेवेन्यू सिस्टम।",
      paragraph:
        "{country} की डिजिटल अर्थव्यवस्था भर्ती से तेज़ी से बढ़ रही है — संस्थापक प्रोडक्टाइज़्ड सिस्टम खरीद रहे हैं, जूनियर एजेंसियां नहीं। हम ऐसे रेवेन्यू इंफ्रास्ट्रक्चर बनाते हैं जो {country}-आधारित टीमों को गुणक देते हैं: एक एम्बेडेड पार्टनर तीन वेंडरों की जगह लेता है।",
      bullets: [
        "{region} में 50+ प्रोजेक्ट्स से बने प्लेबुक — दोहराए जाने वाले पैटर्न।",
        "व्हाट्सएप-फर्स्ट ऑटोमेशन — 30%+ लीड रिकवरी अनलॉक करता है।",
        "{country} सर्च इंटेंट के लिए बना SEO, बाहरी अनुवादित बॉयलरप्लेट नहीं।",
      ],
    },
    t3: {
      headline: "{country} के लिए रिमोट-फर्स्ट रेवेन्यू पार्टनर।",
      paragraph:
        "हम {country}-आधारित संस्थापकों के साथ ऐसे काम करते हैं जैसे वे बगल में हों: हर कॉल पर सीनियर इंजीनियर, साप्ताहिक चेंजलॉग, तय गो-लाइव तारीख। दूरी समस्या नहीं है — स्पष्टता की कमी है।",
      bullets: [
        "पारदर्शी स्कोप और {currency} या USD में कीमत।",
        "पूरा ओनरशिप आपको — कोड, क्रेडेंशियल, रनबुक — कोई लॉक-इन नहीं।",
        "{country} बिज़नेस आवर्स के अनुसार ट्यून किया गया एसिंक्रोनस कैडेंस।",
      ],
    },
  },
  es: {
    t1: {
      headline: "Sistemas de ingresos para equipos maduros en {country}.",
      paragraph:
        "Las empresas en {country} operan en uno de los mercados digitales más competitivos. Construimos sistemas de ingresos que se acumulan: mejoras de conversión medibles, seguimiento automatizado y canales orgánicos que no se derrumban cuando una plataforma publicitaria cambia sus reglas. Cada contrato se mide contra benchmarks de {country} y del mercado {region}.",
      bullets: [
        "Rendimiento empresarial — cargas en menos de un segundo optimizadas para {country}.",
        "Matemáticas de ingresos en {currency} con horizontes de recuperación claros.",
        "Implementaciones conscientes del cumplimiento — privacidad y estándares de compras.",
      ],
    },
    t2: {
      headline: "Sistemas de ingresos para la curva de crecimiento de {country}.",
      paragraph:
        "La economía digital en {country} crece más rápido de lo que se contrata — los fundadores compran sistemas productizados. Enviamos infraestructura de ingresos que da a los equipos en {country} un multiplicador: un socio integrado reemplaza tres proveedores. Precios en {currency} con economía unitaria transparente.",
      bullets: [
        "Playbooks informados por más de 50 contratos en {region}.",
        "Automatización WhatsApp-first donde la mensajería supera al correo.",
        "SEO construido para la intención de búsqueda de {country}.",
      ],
    },
    t3: {
      headline: "Socio de ingresos remoto para {country}.",
      paragraph:
        "Trabajamos con fundadores de {country} como si estuvieran al otro lado de la calle: ingenieros senior en cada llamada, changelog semanal escrito, fechas de go-live fijas. La distancia no es el problema — la falta de claridad lo es.",
      bullets: [
        "Alcance y precios transparentes en {currency} o USD.",
        "Propiedad total entregada — código, credenciales, runbooks.",
        "Cadencia asíncrona sintonizada con el horario comercial de {country}.",
      ],
    },
  },
  fr: {
    t1: {
      headline: "Systèmes de revenus pour les équipes matures en {country}.",
      paragraph:
        "Les entreprises en {country} opèrent dans l'un des marchés numériques les plus compétitifs. Nous construisons des systèmes de revenus qui se cumulent : gains de conversion mesurables, relances automatisées, canaux organiques qui ne s'effondrent pas quand une plateforme publicitaire change ses règles. Chaque engagement est mesuré face aux benchmarks de {country} et du marché {region}.",
      bullets: [
        "Performance d'entreprise — chargements en moins d'une seconde optimisés pour {country}.",
        "Mathématiques de revenus en {currency} avec horizons de récupération clairs.",
        "Constructions conscientes de la conformité — confidentialité et normes d'achat.",
      ],
    },
    t2: {
      headline: "Systèmes de revenus pour la courbe de croissance de {country}.",
      paragraph:
        "L'économie numérique en {country} croît plus vite que les embauches ne peuvent suivre — les fondateurs achètent des systèmes produits, pas des agences juniors. Prix en {currency} avec économie unitaire transparente.",
      bullets: [
        "Playbooks informés par plus de 50 engagements dans {region}.",
        "Automatisation WhatsApp-first qui débloque 30 %+ de récupération de leads.",
        "SEO construit pour l'intention de recherche de {country}.",
      ],
    },
    t3: {
      headline: "Partenaire de revenus à distance pour {country}.",
      paragraph:
        "Nous travaillons avec les fondateurs de {country} comme s'ils étaient de l'autre côté de la rue : ingénieurs seniors à chaque appel, changelog hebdomadaire écrit, dates de go-live fixes.",
      bullets: [
        "Périmètre et tarifs transparents en {currency} ou USD.",
        "Propriété totale remise — code, identifiants, runbooks.",
        "Cadence asynchrone ajustée aux heures de bureau de {country}.",
      ],
    },
  },
  de: {
    t1: {
      headline: "Revenue-Systeme für reife Teams in {country}.",
      paragraph:
        "Unternehmen in {country} agieren in einem der wettbewerbsintensivsten digitalen Märkte. Wir bauen Revenue-Systeme, die sich kumulieren: messbare Conversion-Gewinne, automatisiertes Follow-up und organische Kanäle, die nicht zusammenbrechen, wenn eine Werbeplattform ihre Regeln ändert. Jedes Engagement wird gegen {country}-spezifische Benchmarks und den breiteren {region}-Markt gemessen.",
      bullets: [
        "Enterprise-Grade-Performance — unter einer Sekunde Ladezeit, abgestimmt auf {country}.",
        "Revenue-Mathematik in {currency} mit klaren Amortisationshorizonten.",
        "Compliance-bewusste Implementierungen — Datenschutz und Beschaffungsstandards.",
      ],
    },
    t2: {
      headline: "Revenue-Systeme für die Wachstumskurve von {country}.",
      paragraph:
        "Die digitale Wirtschaft in {country} wächst schneller, als eingestellt werden kann — Gründer kaufen produktisierte Systeme. Preise in {currency} mit transparenter Stückkostenrechnung.",
      bullets: [
        "Playbooks basierend auf 50+ Engagements in {region}.",
        "WhatsApp-First-Automatisierung, die 30 %+ Lead-Recovery freisetzt.",
        "SEO, gebaut für die Suchintention von {country}.",
      ],
    },
    t3: {
      headline: "Remote-First Revenue-Partner für {country}.",
      paragraph:
        "Wir arbeiten mit Gründern in {country} so, als wären sie gegenüber ansässig: Senior-Engineers in jedem Call, wöchentliches schriftliches Changelog, feste Go-Live-Termine.",
      bullets: [
        "Transparenter Umfang und Preise in {currency} oder USD.",
        "Vollständige Übergabe — Code, Zugangsdaten, Runbooks.",
        "Asynchroner Rhythmus abgestimmt auf die Geschäftszeiten von {country}.",
      ],
    },
  },
  ar: {
    t1: {
      headline: "أنظمة إيرادات لفرق ناضجة في {country}.",
      paragraph:
        "تعمل الشركات في {country} في واحد من أكثر الأسواق الرقمية تنافسية في العالم. نحن نبني أنظمة إيرادات تتراكم: مكاسب تحويل قابلة للقياس، ومتابعة آلية، وقنوات عضوية لا تنهار عندما تغير منصة إعلانية قواعدها. يتم قياس كل ارتباط مقابل معايير {country} وسياق سوق {region} الأوسع.",
      bullets: [
        "أداء على مستوى المؤسسات — تحميل أقل من ثانية واحدة مضبوط لـ {country}.",
        "حسابات الإيرادات بـ {currency} مع آفاق استرداد واضحة.",
        "بناء متوافق مع الامتثال — الخصوصية ومعايير المشتريات.",
      ],
    },
    t2: {
      headline: "أنظمة إيرادات مبنية لمنحنى نمو {country}.",
      paragraph:
        "ينمو الاقتصاد الرقمي في {country} أسرع من قدرة التوظيف على المواكبة — المؤسسون يشترون أنظمة منتجة. التسعير بـ {currency} مع اقتصاديات وحدة شفافة.",
      bullets: [
        "كتب اللعب المستنيرة بأكثر من 50 ارتباطًا عبر {region}.",
        "أتمتة WhatsApp أولاً تفتح أكثر من 30% استرداد للعملاء المحتملين.",
        "SEO مبني لنية البحث في {country}.",
      ],
    },
    t3: {
      headline: "شريك إيرادات بعيد أولاً لـ {country}.",
      paragraph:
        "نعمل مع المؤسسين في {country} بنفس طريقة عملنا مع فريق عبر الشارع: مهندسون كبار في كل مكالمة، سجل تغييرات أسبوعي مكتوب، تواريخ إطلاق ثابتة.",
      bullets: [
        "نطاق وأسعار شفافة بـ {currency} أو USD.",
        "ملكية كاملة مسلمة — الكود، بيانات الاعتماد، أدلة التشغيل.",
        "إيقاع صديق للعمل غير المتزامن مضبوط لساعات عمل {country}.",
      ],
    },
  },
  zh: {
    t1: {
      headline: "为{country}成熟团队打造的收入系统。",
      paragraph:
        "{country}的企业在全球最具竞争力的数字市场之一运营。我们构建复合增长的收入系统：可衡量的转化提升、自动化跟进、即使广告平台规则变化也不会崩溃的自然流量渠道。每次合作都根据{country}特定基准和更广泛的{region}市场进行衡量。",
      bullets: [
        "企业级性能——针对{country}优化的亚秒级加载。",
        "以{currency}计算的收入数学，具有清晰的回报期。",
        "合规感知构建——尊重隐私和采购标准。",
      ],
    },
    t2: {
      headline: "为{country}增长曲线构建的收入系统。",
      paragraph:
        "{country}的数字经济增长速度超过了招聘速度——创始人购买产品化系统。以{currency}定价，具有透明的单位经济效益。",
      bullets: [
        "基于{region}50多个合作项目的剧本。",
        "WhatsApp优先自动化，解锁30%以上的线索回收。",
        "为{country}搜索意图构建的SEO。",
      ],
    },
    t3: {
      headline: "{country}的远程优先收入合作伙伴。",
      paragraph:
        "我们与{country}的创始人合作就像他们在街对面一样：每次通话都有高级工程师、每周书面变更日志、固定的上线日期。",
      bullets: [
        "以{currency}或USD报价的透明范围和价格。",
        "完整所有权移交——代码、凭据、运行手册。",
        "异步友好的节奏，调整到{country}的营业时间。",
      ],
    },
  },
  gu: {
    t1: {
      headline: "{country}ની પરિપક્વ ટીમો માટે રેવન્યુ સિસ્ટમ.",
      paragraph:
        "{country}ના વ્યવસાયો ગ્રહ પરના સૌથી વધુ સ્પર્ધાત્મક ડિજિટલ બજારોમાંના એકમાં કાર્ય કરે છે. અમે રેવન્યુ સિસ્ટમ બનાવીએ છીએ જે ગુણાત્મક રીતે વધે: માપી શકાય તેવી રૂપાંતરણ વૃદ્ધિ, સ્વચાલિત ફોલો-અપ, અને ઓર્ગેનિક ચેનલો જે જાહેરાત પ્લેટફોર્મના નિયમો બદલાય ત્યારે પણ ભંગાતી નથી. દરેક કાર્ય {country}-વિશિષ્ટ બેન્ચમાર્ક અને વિશાળ {region} બજાર સંદર્ભ સામે ચલાવવામાં આવે છે.",
      bullets: [
        "એન્ટરપ્રાઇઝ-ગ્રેડ પ્રદર્શન — {country}ની બ્રાઉઝિંગ પેટર્ન માટે ટ્યુન કરેલ સબ-સેકન્ડ લોડ્સ.",
        "{currency}માં રેવન્યુ ગણિત — તમારા P&L સામે ટ્રેક કરેલ સ્પષ્ટ પેબેક હોરાઇઝન સાથે.",
        "પાલન-જાગૃત બિલ્ડ્સ — ગોપનીયતા, ડેટા રેસિડેન્સી, અને પ્રાપ્તિ ધોરણોનું પાલન.",
      ],
    },
    t2: {
      headline: "{country}ની વૃદ્ધિ વળાંક માટે બનાવેલી રેવન્યુ સિસ્ટમ.",
      paragraph:
        "{country}માં ડિજિટલ અર્થતંત્ર ભરતી કરતા વધુ ઝડપથી વધી રહ્યું છે — સ્થાપકો ઉત્પાદકીય સિસ્ટમ્સ ખરીદે છે, જુનિયર એજન્સીઓ નહીં. અમે રેવન્યુ ઇન્ફ્રાસ્ટ્રક્ચર શિપ કરીએ છીએ જે {country}-આધારિત ટીમોને ગુણાકાર આપે: એક એમ્બેડેડ પાર્ટનર ત્રણ વેન્ડરોને બદલે છે, અને દરેક રિલીઝ ટોપલાઇન અથવા ઓપરેટિંગ લેવરેજ સાથે જોડાય છે. કિંમત {currency}માં પારદર્શક યુનિટ ઇકોનોમિક્સ સાથે છે.",
      bullets: [
        "{region}માં 50+ કાર્યો પરથી પ્લેબુક્સ — પેટર્ન જે પુનરાવર્તિત થાય, યુક્તિઓ જે નહીં.",
        "WhatsApp-પ્રથમ ઓટોમેશન જ્યાં મેસેજિંગ ઈમેલને હરાવે — 30%+ લીડ રિકવરી અનલોક કરે.",
        "{country} શોધ ઈરાદા માટે બનાવેલ SEO, અન્ય બજારોના અનુવાદિત બોઈલરપ્લેટ નહીં.",
      ],
    },
    t3: {
      headline: "{country} માટે રિમોટ-ફર્સ્ટ રેવન્યુ પાર્ટનર.",
      paragraph:
        "અમે {country}માં સ્થાપકો સાથે કામ કરીએ છીએ જાણે તેઓ શેરી ઉપર હોય: દરેક કોલ પર સિનિયર એન્જિનિયર્સ, સાપ્તાહિક લેખિત બદલાવ લોગ, અને નિશ્ચિત ગો-લાઈવ તારીખો. કોઈ રિલે રેસ નહીં, કોઈ સ્કેલિંગ ગતિશીલતા નહીં.",
      bullets: [
        "પારદર્શક અવકાશ અને ભાવ {currency} અથવા USDમાં ઉદ્ધૃત.",
        "પૂર્ણ માલિકી હસ્તાંતરણ — કોડ, ઓળખપત્રો, રન-બુક્સ — તમારા છે.",
        "{country}ના કામકાજના કલાકોમાં ટ્યુન કરેલ અસિંક્રોનસ-ફ્રેન્ડલી લય.",
      ],
    },
  },
};

const PAGE_EYEBROW: Record<Locale, Record<string, string>> = {
  en: {
    home: "Local context",
    services: "Market fit",
    about: "Our stance on {country}",
    industries: "Industry context",
    caseStudies: "Regional proof",
  },
  hi: {
    home: "स्थानीय संदर्भ",
    services: "बाज़ार अनुकूलता",
    about: "{country} पर हमारा दृष्टिकोण",
    industries: "उद्योग संदर्भ",
    caseStudies: "क्षेत्रीय प्रमाण",
  },
  es: {
    home: "Contexto local",
    services: "Ajuste al mercado",
    about: "Nuestra postura sobre {country}",
    industries: "Contexto de la industria",
    caseStudies: "Prueba regional",
  },
  fr: {
    home: "Contexte local",
    services: "Adéquation au marché",
    about: "Notre position sur {country}",
    industries: "Contexte sectoriel",
    caseStudies: "Preuve régionale",
  },
  de: {
    home: "Lokaler Kontext",
    services: "Marktanpassung",
    about: "Unsere Haltung zu {country}",
    industries: "Branchenkontext",
    caseStudies: "Regionaler Beweis",
  },
  ar: {
    home: "السياق المحلي",
    services: "ملاءمة السوق",
    about: "موقفنا من {country}",
    industries: "سياق الصناعة",
    caseStudies: "الدليل الإقليمي",
  },
  zh: {
    home: "本地背景",
    services: "市场契合",
    about: "我们对{country}的立场",
    industries: "行业背景",
    caseStudies: "区域证明",
  },
  gu: {
    home: "સ્થાનિક સંદર્ભ",
    services: "બજાર ફિટ",
    about: "{country} પર અમારું વલણ",
    industries: "ઉદ્યોગ સંદર્ભ",
    caseStudies: "પ્રાદેશિક પુરાવા",
  },
};

export function CountryMarketContext({
  t: _t,
  country,
  locale,
  pageKey = "home",
}: CountryMarketContextProps) {
  const meta = getCountryMeta(country);
  const countryName = getCountryName(country, locale);
  const regionLabel = getRegionLabel(meta.region, locale);
  const samplePrice = formatLocalPrice(country, locale);

  const copy = (TIER_COPY[locale] ?? TIER_COPY.en)[meta.tier];
  const eyebrowTpl =
    (PAGE_EYEBROW[locale] ?? PAGE_EYEBROW.en)[pageKey] ??
    (PAGE_EYEBROW[locale] ?? PAGE_EYEBROW.en).home;

  const vars = {
    country: countryName,
    region: regionLabel,
    currency: meta.currency,
  };

  const icons = [TrendingUp, Users, Clock];

  return (
    <Section className="pt-8 sm:pt-12">
      <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              <Globe2 size={11} />
              {interpolate(eyebrowTpl, vars)}
            </div>

            <h2 className="text-balance mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {interpolate(copy.headline, vars)}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {interpolate(copy.paragraph, vars)}
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-background/60 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {countryName} · {meta.currency} · {regionLabel}
              </div>

              <ul className="mt-5 space-y-4 text-sm text-foreground">
                {copy.bullets.map((b, i) => {
                  const Icon = icons[i] ?? Globe2;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                        <Icon size={12} strokeWidth={2} />
                      </span>
                      <span className="leading-relaxed text-muted-foreground">
                        {interpolate(b, vars)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Starting from {samplePrice}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
