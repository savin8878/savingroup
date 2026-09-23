import type { Locale } from "@/lib/i18n";

type FooterCopy = {
  start: string; auditNote: string; audit: string; mission: string;
  journal: string; cities: string; allCities: string; call: string;
  legal: string; privacy: string; terms: string;
};

/** Existing navigation and policy translations remain in the page dictionary. */
export const FOOTER_COPY: Record<Locale, FooterCopy> = {
  en: {
    start: "A clear next step.", auditNote: "A free {minutes}-minute conversation about your systems.", audit: "Request your free audit",
    mission: "We connect software, machines, data, and people — so your business can work as one.",
    journal: "Insights & field notes", cities: "Across India", allCities: "All locations", call: "Call", legal: "Legal", privacy: "Privacy", terms: "Terms",
  },
  hi: {
    start: "अगला कदम, पूरी स्पष्टता के साथ।", auditNote: "आपके सिस्टम पर {minutes} मिनट की मुफ़्त बातचीत।", audit: "मुफ़्त ऑडिट का अनुरोध करें",
    mission: "हम सॉफ़्टवेयर, मशीनों, डेटा और लोगों को जोड़ते हैं — ताकि आपका व्यवसाय एक साथ काम कर सके।",
    journal: "लेख और अनुभव", cities: "भारत भर में", allCities: "सभी स्थान", call: "कॉल करें", legal: "कानूनी जानकारी", privacy: "गोपनीयता", terms: "शर्तें",
  },
  gu: {
    start: "સ્પષ્ટતા સાથે આગળનું પગલું.", auditNote: "તમારી સિસ્ટમ વિશે {minutes} મિનિટની મફત વાતચીત.", audit: "મફત ઓડિટ માટે વિનંતી કરો",
    mission: "અમે સોફ્ટવેર, મશીનો, ડેટા અને લોકોને જોડીએ છીએ — જેથી તમારો વ્યવસાય એકસાથે કામ કરી શકે.",
    journal: "લેખો અને અનુભવો", cities: "સમગ્ર ભારતમાં", allCities: "બધાં સ્થળો", call: "કૉલ કરો", legal: "કાનૂની માહિતી", privacy: "ગોપનીયતા", terms: "શરતો",
  },
  ar: {
    start: "خطوة تالية واضحة.", auditNote: "محادثة مجانية لمدة {minutes} دقيقة حول أنظمتك.", audit: "اطلب تدقيقك المجاني",
    mission: "نربط البرمجيات والآلات والبيانات والأشخاص، ليعمل نشاطك التجاري كمنظومة واحدة.",
    journal: "رؤى وملاحظات عملية", cities: "في أنحاء الهند", allCities: "جميع المواقع", call: "اتصال", legal: "معلومات قانونية", privacy: "الخصوصية", terms: "الشروط",
  },
  de: {
    start: "Ein klarer nächster Schritt.", auditNote: "Ein kostenloses Gespräch über Ihre Systeme: {minutes} Minuten.", audit: "Kostenloses Audit anfragen",
    mission: "Wir verbinden Software, Maschinen, Daten und Menschen, damit Ihr Unternehmen als Ganzes zusammenarbeitet.",
    journal: "Einblicke & Praxiswissen", cities: "In ganz Indien", allCities: "Alle Standorte", call: "Anrufen", legal: "Rechtliches", privacy: "Datenschutz", terms: "AGB",
  },
  es: {
    start: "Un siguiente paso claro.", auditNote: "Una conversación gratuita de {minutes} minutos sobre tus sistemas.", audit: "Solicita tu auditoría gratuita",
    mission: "Conectamos software, máquinas, datos y personas para que tu empresa trabaje como un solo equipo.",
    journal: "Ideas y notas de campo", cities: "En toda la India", allCities: "Todas las ubicaciones", call: "Llamar", legal: "Información legal", privacy: "Privacidad", terms: "Términos",
  },
  fr: {
    start: "Une prochaine étape claire.", auditNote: "Un échange gratuit de {minutes} minutes sur vos systèmes.", audit: "Demander votre audit gratuit",
    mission: "Nous relions logiciels, machines, données et équipes pour que votre entreprise fonctionne comme un tout.",
    journal: "Idées et retours de terrain", cities: "Partout en Inde", allCities: "Toutes les villes", call: "Appeler", legal: "Informations juridiques", privacy: "Confidentialité", terms: "Conditions",
  },
  zh: {
    start: "明确下一步。", auditNote: "用 {minutes} 分钟，免费交流您的系统需求。", audit: "申请免费审核",
    mission: "我们连接软件、设备、数据和人员，让您的企业协同运作。",
    journal: "洞察与实践", cities: "印度各地", allCities: "所有城市", call: "致电", legal: "法律信息", privacy: "隐私", terms: "条款",
  },
};
