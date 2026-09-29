// components/operator/operator-copy.ts
//
// Every UI string of the Savin Operator panel, per locale. The launcher's
// four strings live in launcher-copy.ts instead: the launcher is in every
// page's initial bundle, and this table (all eight locales) should only
// arrive with the panel's own chunk.
//
// Only chrome lives here: labels, statuses, errors, the page-aware opening
// line and the starter prompts. Replies are written by the model in the
// visitor's language and never pass through this file.
//
// Openers and starters are UI only. The opener is never sent as a turn; a
// starter becomes the visitor's own first message when clicked, which is why
// starters are phrased in the visitor's voice ("We track orders in Excel…").
// Neither may state a Savin fact the knowledge index does not hold; the only
// offer they name is the free audit (lib/offer.ts#AUDIT).
//
// English is the source of truth and every other locale is merged over it,
// so a missing key never renders blank.

import type { Locale } from "@/lib/i18n";
import type { OperatorErrorCode, OperatorStatus } from "@/lib/operator/protocol";
import type { PageContext } from "@/lib/operator/page-context";

/** The industry pages that get their own opener and starters. */
export const OPENER_INDUSTRIES = ["manufacturing", "real-estate", "healthcare", "ecommerce", "edtech"] as const;
export type OpenerIndustry = (typeof OPENER_INDUSTRIES)[number];

/**
 * One opener + three starters per key. PageTopic is folded down to these:
 * both city topics share "city", blog / newsroom / legal / other share
 * "general", and an industry page without its own entry uses "industries".
 */
export type OpenerKey =
  | "home"
  | "services"
  | "industries"
  | OpenerIndustry
  | "case-studies"
  | "pricing"
  | "about"
  | "contact"
  | "city"
  | "general";

type Starters = readonly [string, string, string];

export interface OperatorCopy {
  title: string;
  subtitle: string;
  newChat: string;
  /** Second-click confirmation of "new conversation" (no window.confirm). */
  confirmClear: string;
  expand: string;
  collapse: string;
  close: string;
  /** Accessible name of the message log. */
  conversation: string;
  /** Screen-reader prefix of the visitor's own messages. */
  you: string;
  operator: string;
  startersLabel: string;
  openers: Record<OpenerKey, string>;
  starters: Record<OpenerKey, Starters>;
  status: Record<OperatorStatus, string>;
  errors: Record<OperatorErrorCode, string>;
  retry: string;
  startOver: string;
  reachDirectly: string;
  whatsapp: string;
  email: string;
  retryInSeconds: (seconds: number) => string;
  retryInMinutes: (minutes: number) => string;
  /** Marker after a reply the visitor stopped, parentheses included. */
  stopped: string;
  inputLabel: string;
  placeholder: string;
  send: string;
  stop: string;
  charCount: (used: number, max: number) => string;
  disclosure: string;
  privacy: string;
  /** Screen-reader prefix when a reply completes. */
  replied: string;
  replyStopped: string;
}

const EN: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "Finds where work gets stuck in your operations.",
  newChat: "New conversation",
  confirmClear: "Click again to clear",
  expand: "Expand panel",
  collapse: "Collapse panel",
  close: "Close the Operator",
  conversation: "Conversation with the Operator",
  you: "You",
  operator: "Operator",
  startersLabel: "Or start with one of these",
  openers: {
    home: "Tell me about one process in your company that involves too much Excel, WhatsApp, calling, copying, waiting or chasing people.",
    services: "Which process would you connect first? Tell me how it runs today and I'll map what could change.",
    industries: "Pick the process that breaks first when your volume goes up. Walk me through how it runs today.",
    manufacturing: "When an order changes after production has started, which systems or people need to be updated by hand?",
    "real-estate": "Between the first enquiry, the site visit and the booking, where does a lead's information get re-typed or lost?",
    healthcare: "From booking to billing, how many times is the same patient information entered or checked by hand?",
    ecommerce: "When an order comes in, what still happens by hand before it ships: stock checks, confirmations, courier bookings or customer updates?",
    edtech: "From the first enquiry to enrolment and fee collection, which steps does your team still chase over calls or WhatsApp?",
    "case-studies": "Which of these results looks closest to your situation? Tell me how that process runs in your company today.",
    pricing: "Prices depend on what needs connecting. Tell me the process that costs you the most time, and I'll help you scope it before you look at tiers.",
    about: "Want to see how we think? Describe one process from start to finish and I'll show you where it loses time.",
    contact: "Before you get in touch, I can map the process you want to fix, so the audit starts ahead. Which process is it?",
    city: "Running sites, suppliers or field teams here? Tell me which handoff still happens by phone, paper or WhatsApp.",
    general: "Tell me about one process in your company that still runs on spreadsheets, messages or someone remembering to follow up.",
  },
  starters: {
    home: [
      "We track orders in Excel and update customers on WhatsApp.",
      "Approvals happen over calls, and nobody knows where things stand.",
      "Map our enquiry-to-invoice process and show where it leaks time.",
    ],
    services: [
      "Which of our processes should we automate first?",
      "Our sales, stock and accounts sit in three systems that don't talk.",
      "How could AI help with approvals without us losing control?",
    ],
    industries: [
      "We run on Tally, Excel and WhatsApp. Where do we start?",
      "Which processes in my industry are usually worth connecting first?",
      "Help me estimate what manual follow-ups cost us each month.",
    ],
    manufacturing: [
      "Order changes reach the shop floor late because updates go over WhatsApp.",
      "We re-type sales orders from Excel into Tally by hand.",
      "Simulate what happens when a machine goes down mid-order.",
    ],
    "real-estate": [
      "Leads come in from portals and WhatsApp, and follow-ups get missed.",
      "Site-visit feedback never gets back to the sales team.",
      "Map our enquiry-to-booking process.",
    ],
    healthcare: [
      "Appointments are booked by phone and entered into two systems.",
      "Reports reach patients late because someone sends them by hand.",
      "Map the patient journey from booking to billing.",
    ],
    ecommerce: [
      "Stock on our website and marketplaces doesn't match.",
      "Order confirmations and courier updates are sent by hand.",
      "Estimate how much time returns and refunds take us each month.",
    ],
    edtech: [
      "Enquiries come from ads and WhatsApp, and counsellors lose track.",
      "Fee reminders and receipts are done by hand every month.",
      "Map our enquiry-to-enrolment process.",
    ],
    "case-studies": [
      "Our situation is closest to the manufacturing ERP case.",
      "We're a D2C brand and our order flow is slow and manual.",
      "What changed in the process in these projects, before and after?",
    ],
    pricing: [
      "Help me work out what I actually need before I pick a tier.",
      "What happens in the free audit?",
      "Our quotes take days to prepare. What would it take to fix that?",
    ],
    about: [
      "How do you work with a company that has never automated anything?",
      "What happens in the free audit?",
      "Map one of our processes so I can see how you think.",
    ],
    contact: [
      "Map my process first so I can send a clear brief.",
      "Help me put the problem into words before I get in touch.",
      "What should I prepare for the free audit?",
    ],
    city: [
      "We coordinate suppliers and site teams over phone and WhatsApp.",
      "Each branch reports its numbers in a separate spreadsheet.",
      "Map how a customer order moves through our team.",
    ],
    general: [
      "We run most of our operations on Excel and WhatsApp.",
      "Too much of my team's day goes into chasing updates.",
      "Show me where one of our processes is losing time.",
    ],
  },
  status: {
    thinking: "Thinking",
    searching: "Checking Savin's published information",
    calculating: "Calculating from your numbers",
    mapping: "Mapping the workflow",
    simulating: "Running an illustrative simulation",
    drafting: "Drafting your brief",
  },
  errors: {
    bad_request: "That message couldn't be processed. Try rephrasing it.",
    too_large: "This conversation is too long to continue. Start a new one to keep going.",
    forbidden: "This request was blocked. Reload the page and try again.",
    rate_limited: "Too many messages in a short time. Please wait a moment before trying again.",
    unavailable: "The Operator isn't available right now.",
    overloaded: "The AI service is busy at the moment. Try again shortly.",
    refusal: "The Operator can't help with that request. Try describing a process in your business.",
    truncated: "The reply was cut off before it finished. Try again, or ask for a shorter answer.",
    upstream: "The connection was interrupted before the reply finished. Try again.",
    internal: "Something went wrong on our side. Try again.",
  },
  retry: "Try again",
  startOver: "Start a new conversation",
  reachDirectly: "You can also reach Savin directly:",
  whatsapp: "WhatsApp",
  email: "Email",
  retryInSeconds: (seconds) => `You can try again in about ${seconds} seconds.`,
  retryInMinutes: (minutes) => `You can try again in about ${minutes} minutes.`,
  stopped: "(stopped)",
  inputLabel: "Message the Operator",
  placeholder: "Describe a process: who does what, in which tool, and where it waits…",
  send: "Send",
  stop: "Stop",
  charCount: (used, max) => `${used} / ${max} characters`,
  disclosure: "Replies are generated by AI (Anthropic's Claude) and can be wrong. Don't share passwords or sensitive personal data.",
  privacy: "Privacy",
  replied: "The Operator replied",
  replyStopped: "Reply stopped",
};

const ES: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "Detecta dónde se atasca el trabajo en tu operación.",
  newChat: "Nueva conversación",
  confirmClear: "Haz clic otra vez para borrar",
  expand: "Ampliar panel",
  collapse: "Reducir panel",
  close: "Cerrar el Operator",
  conversation: "Conversación con el Operator",
  you: "Tú",
  operator: "Operator",
  startersLabel: "O empieza con una de estas",
  openers: {
    home: "Cuéntame un proceso de tu empresa que dependa demasiado de Excel, WhatsApp, llamadas, copiar y pegar, esperas o de ir detrás de la gente.",
    services: "¿Qué proceso conectarías primero? Cuéntame cómo funciona hoy y te mostraré qué podría cambiar.",
    industries: "Elige el proceso que primero se rompe cuando sube el volumen. Explícame cómo funciona hoy.",
    manufacturing: "Cuando un pedido cambia con la producción ya en marcha, ¿qué sistemas o personas hay que actualizar a mano?",
    "real-estate": "Entre la primera consulta, la visita al inmueble y la reserva, ¿en qué punto se vuelve a teclear o se pierde la información del cliente?",
    healthcare: "Desde la cita hasta la facturación, ¿cuántas veces se introduce o se comprueba a mano la misma información del paciente?",
    ecommerce: "Cuando entra un pedido, ¿qué se sigue haciendo a mano antes del envío: revisar el stock, confirmar, reservar la mensajería o avisar al cliente?",
    edtech: "Desde la primera consulta hasta la matrícula y el cobro de las cuotas, ¿qué pasos sigue persiguiendo tu equipo por teléfono o WhatsApp?",
    "case-studies": "¿Cuál de estos resultados se parece más a tu situación? Cuéntame cómo funciona hoy ese proceso en tu empresa.",
    pricing: "El precio depende de lo que haya que conectar. Cuéntame el proceso que más tiempo te cuesta y te ayudo a acotarlo antes de mirar los planes.",
    about: "¿Quieres ver cómo pensamos? Describe un proceso de principio a fin y te mostraré dónde pierde tiempo.",
    contact: "Antes de escribirnos, puedo mapear el proceso que quieres arreglar para que la auditoría empiece con ventaja. ¿Qué proceso es?",
    city: "¿Gestionas centros, proveedores o equipos de campo aquí? Cuéntame qué traspaso se sigue haciendo por teléfono, en papel o por WhatsApp.",
    general: "Cuéntame un proceso de tu empresa que todavía dependa de hojas de cálculo, mensajes o de que alguien se acuerde de hacer seguimiento.",
  },
  starters: {
    home: [
      "Llevamos los pedidos en Excel y avisamos a los clientes por WhatsApp.",
      "Las aprobaciones se hacen por teléfono y nadie sabe en qué punto está cada cosa.",
      "Mapea nuestro proceso de la consulta a la factura y muéstrame dónde pierde tiempo.",
    ],
    services: [
      "¿Qué procesos deberíamos automatizar primero?",
      "Ventas, inventario y contabilidad están en tres sistemas que no se hablan.",
      "¿Cómo podría ayudar la IA con las aprobaciones sin que perdamos el control?",
    ],
    industries: [
      "Trabajamos con Tally, Excel y WhatsApp. ¿Por dónde empezamos?",
      "¿Qué procesos de mi sector suele merecer la pena conectar primero?",
      "Ayúdame a estimar cuánto nos cuestan al mes los seguimientos manuales.",
    ],
    manufacturing: [
      "Los cambios de pedido llegan tarde a planta porque se avisan por WhatsApp.",
      "Pasamos a mano los pedidos de venta de Excel a Tally.",
      "Simula qué pasa cuando una máquina se para a mitad de un pedido.",
    ],
    "real-estate": [
      "Los contactos llegan de portales y de WhatsApp, y se nos escapan seguimientos.",
      "Lo que se comenta en las visitas nunca vuelve al equipo de ventas.",
      "Mapea nuestro proceso de la consulta a la reserva.",
    ],
    healthcare: [
      "Las citas se piden por teléfono y se registran en dos sistemas.",
      "Los informes llegan tarde a los pacientes porque alguien los envía a mano.",
      "Mapea el recorrido del paciente desde la cita hasta la factura.",
    ],
    ecommerce: [
      "El stock de nuestra web y el de los marketplaces no coincide.",
      "Las confirmaciones de pedido y los avisos de envío se mandan a mano.",
      "Estima cuánto tiempo nos llevan al mes las devoluciones y los reembolsos.",
    ],
    edtech: [
      "Las consultas llegan por anuncios y WhatsApp, y los asesores pierden el hilo.",
      "Los recordatorios de pago y los recibos se hacen a mano cada mes.",
      "Mapea nuestro proceso de la consulta a la matrícula.",
    ],
    "case-studies": [
      "Nuestra situación se parece más al caso del ERP de fabricación.",
      "Somos una marca D2C y nuestro flujo de pedidos es lento y manual.",
      "¿Qué cambió en el proceso en estos proyectos, antes y después?",
    ],
    pricing: [
      "Ayúdame a saber qué necesito de verdad antes de elegir un plan.",
      "¿Qué pasa en la auditoría gratuita?",
      "Preparar un presupuesto nos lleva días. ¿Qué haría falta para solucionarlo?",
    ],
    about: [
      "¿Cómo trabajan con una empresa que nunca ha automatizado nada?",
      "¿Qué pasa en la auditoría gratuita?",
      "Mapea uno de nuestros procesos para que vea cómo piensan.",
    ],
    contact: [
      "Mapea primero mi proceso para que pueda enviar un resumen claro.",
      "Ayúdame a explicar el problema antes de ponerme en contacto.",
      "¿Qué debería preparar para la auditoría gratuita?",
    ],
    city: [
      "Coordinamos proveedores y equipos de obra por teléfono y WhatsApp.",
      "Cada sucursal reporta sus cifras en una hoja de cálculo distinta.",
      "Mapea cómo avanza un pedido de cliente dentro de nuestro equipo.",
    ],
    general: [
      "Llevamos casi toda la operación con Excel y WhatsApp.",
      "Mi equipo pasa demasiado tiempo persiguiendo actualizaciones.",
      "Muéstrame dónde pierde tiempo uno de nuestros procesos.",
    ],
  },
  status: {
    thinking: "Pensando",
    searching: "Consultando la información publicada por Savin",
    calculating: "Calculando con tus cifras",
    mapping: "Mapeando el flujo de trabajo",
    simulating: "Ejecutando una simulación ilustrativa",
    drafting: "Redactando tu resumen",
  },
  errors: {
    bad_request: "No se pudo procesar ese mensaje. Prueba a reformularlo.",
    too_large: "Esta conversación es demasiado larga para continuar. Empieza una nueva para seguir.",
    forbidden: "Se ha bloqueado esta solicitud. Recarga la página e inténtalo de nuevo.",
    rate_limited: "Demasiados mensajes en poco tiempo. Espera un momento antes de volver a intentarlo.",
    unavailable: "El Operator no está disponible en este momento.",
    overloaded: "El servicio de IA está saturado ahora mismo. Vuelve a intentarlo en breve.",
    refusal: "El Operator no puede ayudarte con esa solicitud. Prueba a describir un proceso de tu empresa.",
    truncated: "La respuesta se cortó antes de terminar. Inténtalo de nuevo o pide una respuesta más breve.",
    upstream: "La conexión se interrumpió antes de que terminara la respuesta. Inténtalo de nuevo.",
    internal: "Algo ha fallado por nuestra parte. Inténtalo de nuevo.",
  },
  retry: "Reintentar",
  startOver: "Empezar una conversación nueva",
  reachDirectly: "También puedes contactar directamente con Savin:",
  whatsapp: "WhatsApp",
  email: "Correo",
  retryInSeconds: (seconds) => `Podrás volver a intentarlo en unos ${seconds} segundos.`,
  retryInMinutes: (minutes) => `Podrás volver a intentarlo en unos ${minutes} minutos.`,
  stopped: "(detenida)",
  inputLabel: "Escribe al Operator",
  placeholder: "Describe un proceso: quién hace qué, con qué herramienta y dónde se queda esperando…",
  send: "Enviar",
  stop: "Detener",
  charCount: (used, max) => `${used} / ${max} caracteres`,
  disclosure: "Las respuestas las genera una IA (Claude, de Anthropic) y pueden contener errores. No compartas contraseñas ni datos personales sensibles.",
  privacy: "Privacidad",
  replied: "El Operator ha respondido",
  replyStopped: "Respuesta detenida",
};

const FR: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "Repère où le travail se bloque dans vos opérations.",
  newChat: "Nouvelle conversation",
  confirmClear: "Cliquez à nouveau pour effacer",
  expand: "Agrandir le panneau",
  collapse: "Réduire le panneau",
  close: "Fermer l’Operator",
  conversation: "Conversation avec l’Operator",
  you: "Vous",
  operator: "Operator",
  startersLabel: "Ou commencez par l’une de ces pistes",
  openers: {
    home: "Parlez-moi d’un processus de votre entreprise qui passe trop par Excel, WhatsApp, les appels, le copier-coller, l’attente ou les relances.",
    services: "Quel processus connecteriez-vous en premier ? Dites-moi comment il fonctionne aujourd’hui et je vous montrerai ce qui pourrait changer.",
    industries: "Choisissez le processus qui cède en premier quand le volume augmente. Expliquez-moi comment il fonctionne aujourd’hui.",
    manufacturing: "Quand une commande change alors que la production a démarré, quels systèmes ou quelles personnes faut-il mettre à jour à la main ?",
    "real-estate": "Entre la première demande, la visite et la réservation, où les informations d’un prospect sont-elles ressaisies ou perdues ?",
    healthcare: "De la prise de rendez-vous à la facturation, combien de fois les mêmes informations patient sont-elles saisies ou vérifiées à la main ?",
    ecommerce: "Quand une commande arrive, que fait-on encore à la main avant l’expédition : vérification du stock, confirmations, réservation du transporteur, suivi client ?",
    edtech: "De la première demande à l’inscription et à l’encaissement des frais, quelles étapes votre équipe relance-t-elle encore par téléphone ou WhatsApp ?",
    "case-studies": "Lequel de ces résultats ressemble le plus à votre situation ? Dites-moi comment ce processus fonctionne aujourd’hui chez vous.",
    pricing: "Le prix dépend de ce qu’il faut connecter. Décrivez-moi le processus qui vous coûte le plus de temps, et je vous aide à le cadrer avant de comparer les formules.",
    about: "Envie de voir notre façon de penser ? Décrivez un processus du début à la fin et je vous montrerai où il perd du temps.",
    contact: "Avant de nous contacter, je peux cartographier le processus à corriger pour que l’audit démarre avec une longueur d’avance. De quel processus s’agit-il ?",
    city: "Vous gérez des sites, des fournisseurs ou des équipes terrain ici ? Dites-moi quelle passation se fait encore par téléphone, sur papier ou par WhatsApp.",
    general: "Parlez-moi d’un processus de votre entreprise qui repose encore sur des tableurs, des messages ou sur quelqu’un qui pense à relancer.",
  },
  starters: {
    home: [
      "Nous suivons les commandes sur Excel et informons les clients par WhatsApp.",
      "Les validations se font par téléphone et personne ne sait où en sont les choses.",
      "Cartographiez notre processus de la demande à la facture et montrez où il perd du temps.",
    ],
    services: [
      "Quels processus devrions-nous automatiser en premier ?",
      "Ventes, stock et comptabilité sont dans trois systèmes qui ne communiquent pas.",
      "Comment l’IA peut-elle aider pour les validations sans que nous perdions le contrôle ?",
    ],
    industries: [
      "Nous fonctionnons avec Tally, Excel et WhatsApp. Par où commencer ?",
      "Quels processus de mon secteur vaut-il mieux connecter en premier ?",
      "Aidez-moi à estimer ce que nous coûtent les relances manuelles chaque mois.",
    ],
    manufacturing: [
      "Les modifications de commande arrivent tard à l’atelier parce qu’elles passent par WhatsApp.",
      "Nous ressaisissons à la main les commandes clients d’Excel vers Tally.",
      "Simulez ce qui se passe quand une machine tombe en panne en pleine commande.",
    ],
    "real-estate": [
      "Les prospects arrivent des portails et de WhatsApp, et des relances passent à la trappe.",
      "Les retours des visites ne remontent jamais à l’équipe commerciale.",
      "Cartographiez notre processus de la demande à la réservation.",
    ],
    healthcare: [
      "Les rendez-vous se prennent par téléphone et sont saisis dans deux systèmes.",
      "Les comptes rendus arrivent tard aux patients parce que quelqu’un les envoie à la main.",
      "Cartographiez le parcours patient, du rendez-vous à la facturation.",
    ],
    ecommerce: [
      "Le stock de notre site et celui des marketplaces ne concordent pas.",
      "Les confirmations de commande et les suivis d’expédition sont envoyés à la main.",
      "Estimez le temps que nous passons chaque mois sur les retours et les remboursements.",
    ],
    edtech: [
      "Les demandes arrivent par la publicité et WhatsApp, et les conseillers s’y perdent.",
      "Les rappels de paiement et les reçus sont faits à la main chaque mois.",
      "Cartographiez notre processus de la demande à l’inscription.",
    ],
    "case-studies": [
      "Notre situation ressemble surtout au cas de l’ERP industriel.",
      "Nous sommes une marque D2C et notre traitement des commandes est lent et manuel.",
      "Qu’est-ce qui a changé dans le processus pour ces projets, avant et après ?",
    ],
    pricing: [
      "Aidez-moi à définir ce dont j’ai vraiment besoin avant de choisir une formule.",
      "Que se passe-t-il pendant l’audit gratuit ?",
      "Nos devis prennent des jours à préparer. Que faudrait-il pour régler ça ?",
    ],
    about: [
      "Comment travaillez-vous avec une entreprise qui n’a jamais rien automatisé ?",
      "Que se passe-t-il pendant l’audit gratuit ?",
      "Cartographiez l’un de nos processus pour que je voie votre façon de penser.",
    ],
    contact: [
      "Cartographiez d’abord mon processus pour que j’envoie une demande claire.",
      "Aidez-moi à formuler le problème avant de vous contacter.",
      "Que dois-je préparer pour l’audit gratuit ?",
    ],
    city: [
      "Nous coordonnons fournisseurs et équipes de chantier par téléphone et WhatsApp.",
      "Chaque agence remonte ses chiffres dans un tableur différent.",
      "Cartographiez le parcours d’une commande client dans notre équipe.",
    ],
    general: [
      "Nous gérons l’essentiel de nos opérations avec Excel et WhatsApp.",
      "Mon équipe passe trop de temps à courir après les mises à jour.",
      "Montrez-moi où l’un de nos processus perd du temps.",
    ],
  },
  status: {
    thinking: "Réflexion",
    searching: "Consultation des informations publiées par Savin",
    calculating: "Calcul à partir de vos chiffres",
    mapping: "Cartographie du flux de travail",
    simulating: "Simulation illustrative en cours",
    drafting: "Rédaction de votre synthèse",
  },
  errors: {
    bad_request: "Ce message n’a pas pu être traité. Essayez de le reformuler.",
    too_large: "Cette conversation est trop longue pour continuer. Commencez-en une nouvelle.",
    forbidden: "Cette requête a été bloquée. Rechargez la page et réessayez.",
    rate_limited: "Trop de messages en peu de temps. Patientez un instant avant de réessayer.",
    unavailable: "L’Operator n’est pas disponible pour le moment.",
    overloaded: "Le service d’IA est très sollicité en ce moment. Réessayez dans un instant.",
    refusal: "L’Operator ne peut pas répondre à cette demande. Essayez de décrire un processus de votre entreprise.",
    truncated: "La réponse a été coupée avant la fin. Réessayez, ou demandez une réponse plus courte.",
    upstream: "La connexion a été interrompue avant la fin de la réponse. Réessayez.",
    internal: "Un problème est survenu de notre côté. Réessayez.",
  },
  retry: "Réessayer",
  startOver: "Commencer une nouvelle conversation",
  reachDirectly: "Vous pouvez aussi contacter Savin directement :",
  whatsapp: "WhatsApp",
  email: "E-mail",
  retryInSeconds: (seconds) => `Vous pourrez réessayer dans environ ${seconds} secondes.`,
  retryInMinutes: (minutes) => `Vous pourrez réessayer dans environ ${minutes} minutes.`,
  stopped: "(arrêtée)",
  inputLabel: "Écrire à l’Operator",
  placeholder: "Décrivez un processus : qui fait quoi, avec quel outil, et où ça attend…",
  send: "Envoyer",
  stop: "Arrêter",
  charCount: (used, max) => `${used} / ${max} caractères`,
  disclosure: "Les réponses sont générées par une IA (Claude, d’Anthropic) et peuvent être erronées. Ne partagez ni mots de passe ni données personnelles sensibles.",
  privacy: "Confidentialité",
  replied: "L’Operator a répondu",
  replyStopped: "Réponse arrêtée",
};

const DE: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "Zeigt, wo Arbeit in Ihren Abläufen hängen bleibt.",
  newChat: "Neues Gespräch",
  confirmClear: "Zum Löschen erneut klicken",
  expand: "Bereich vergrößern",
  collapse: "Bereich verkleinern",
  close: "Operator schließen",
  conversation: "Gespräch mit dem Operator",
  you: "Sie",
  operator: "Operator",
  startersLabel: "Oder starten Sie mit einem dieser Beispiele",
  openers: {
    home: "Erzählen Sie mir von einem Prozess in Ihrem Unternehmen, der zu viel Excel, WhatsApp, Telefonieren, Abtippen, Warten oder Hinterherlaufen erfordert.",
    services: "Welchen Prozess würden Sie zuerst verbinden? Beschreiben Sie, wie er heute läuft, und ich zeige Ihnen, was sich ändern könnte.",
    industries: "Wählen Sie den Prozess, der als Erstes hakt, wenn das Volumen steigt. Erklären Sie mir, wie er heute abläuft.",
    manufacturing: "Wenn sich ein Auftrag ändert, nachdem die Produktion begonnen hat: Welche Systeme oder Personen müssen dann von Hand aktualisiert werden?",
    "real-estate": "Zwischen Erstanfrage, Besichtigung und Buchung: Wo werden die Daten eines Interessenten neu eingetippt oder gehen verloren?",
    healthcare: "Von der Terminbuchung bis zur Abrechnung: Wie oft werden dieselben Patientendaten von Hand erfasst oder geprüft?",
    ecommerce: "Wenn eine Bestellung eingeht, was passiert vor dem Versand noch von Hand: Bestandsprüfung, Bestätigungen, Versandbuchung oder Kundeninfos?",
    edtech: "Von der ersten Anfrage über die Anmeldung bis zum Gebühreneinzug: Welchen Schritten läuft Ihr Team noch per Telefon oder WhatsApp hinterher?",
    "case-studies": "Welches dieser Ergebnisse kommt Ihrer Situation am nächsten? Beschreiben Sie mir, wie dieser Prozess heute bei Ihnen läuft.",
    pricing: "Der Preis hängt davon ab, was verbunden werden muss. Nennen Sie mir den Prozess, der Sie die meiste Zeit kostet, und ich helfe Ihnen, ihn einzugrenzen, bevor Sie Pakete vergleichen.",
    about: "Möchten Sie sehen, wie wir denken? Beschreiben Sie einen Prozess von Anfang bis Ende, und ich zeige Ihnen, wo er Zeit verliert.",
    contact: "Bevor Sie uns schreiben, kann ich den Prozess abbilden, den Sie verbessern möchten, damit das Audit mit Vorsprung startet. Um welchen Prozess geht es?",
    city: "Sie koordinieren hier Standorte, Lieferanten oder Außendienstteams? Sagen Sie mir, welche Übergabe noch per Telefon, Papier oder WhatsApp läuft.",
    general: "Erzählen Sie mir von einem Prozess in Ihrem Unternehmen, der noch auf Tabellen, Nachrichten oder darauf beruht, dass jemand ans Nachfassen denkt.",
  },
  starters: {
    home: [
      "Wir verfolgen Aufträge in Excel und informieren Kunden per WhatsApp.",
      "Freigaben laufen telefonisch, und niemand weiß, wo etwas steht.",
      "Bilden Sie unseren Prozess von der Anfrage bis zur Rechnung ab und zeigen Sie, wo Zeit verloren geht.",
    ],
    services: [
      "Welche unserer Prozesse sollten wir zuerst automatisieren?",
      "Vertrieb, Lager und Buchhaltung liegen in drei Systemen, die nicht miteinander reden.",
      "Wie könnte KI bei Freigaben helfen, ohne dass wir die Kontrolle verlieren?",
    ],
    industries: [
      "Wir arbeiten mit Tally, Excel und WhatsApp. Wo fangen wir an?",
      "Welche Prozesse lohnt es sich in meiner Branche meist zuerst zu verbinden?",
      "Helfen Sie mir zu schätzen, was uns manuelles Nachfassen pro Monat kostet.",
    ],
    manufacturing: [
      "Auftragsänderungen erreichen die Fertigung zu spät, weil sie über WhatsApp laufen.",
      "Wir tippen Kundenaufträge von Hand aus Excel in Tally ab.",
      "Simulieren Sie, was passiert, wenn mitten im Auftrag eine Maschine ausfällt.",
    ],
    "real-estate": [
      "Leads kommen über Portale und WhatsApp, und Nachfassaktionen gehen unter.",
      "Das Feedback aus Besichtigungen kommt nie beim Vertrieb an.",
      "Bilden Sie unseren Prozess von der Anfrage bis zur Buchung ab.",
    ],
    healthcare: [
      "Termine werden telefonisch vereinbart und in zwei Systemen erfasst.",
      "Befunde erreichen Patienten spät, weil jemand sie von Hand verschickt.",
      "Bilden Sie den Patientenweg von der Terminbuchung bis zur Abrechnung ab.",
    ],
    ecommerce: [
      "Der Bestand in unserem Shop und auf den Marktplätzen stimmt nicht überein.",
      "Bestellbestätigungen und Versandinfos werden von Hand verschickt.",
      "Schätzen Sie, wie viel Zeit uns Retouren und Erstattungen pro Monat kosten.",
    ],
    edtech: [
      "Anfragen kommen über Anzeigen und WhatsApp, und die Berater verlieren den Überblick.",
      "Zahlungserinnerungen und Quittungen erstellen wir jeden Monat von Hand.",
      "Bilden Sie unseren Prozess von der Anfrage bis zur Anmeldung ab.",
    ],
    "case-studies": [
      "Unsere Lage ähnelt am ehesten dem ERP-Fall aus der Fertigung.",
      "Wir sind eine D2C-Marke, und unsere Auftragsabwicklung ist langsam und manuell.",
      "Was hat sich bei diesen Projekten im Prozess verändert, vorher und nachher?",
    ],
    pricing: [
      "Helfen Sie mir herauszufinden, was ich wirklich brauche, bevor ich ein Paket wähle.",
      "Was passiert im kostenlosen Audit?",
      "Unsere Angebote brauchen Tage. Was wäre nötig, um das zu ändern?",
    ],
    about: [
      "Wie arbeiten Sie mit einem Unternehmen, das noch nie etwas automatisiert hat?",
      "Was passiert im kostenlosen Audit?",
      "Bilden Sie einen unserer Prozesse ab, damit ich sehe, wie Sie denken.",
    ],
    contact: [
      "Bilden Sie zuerst meinen Prozess ab, damit ich ein klares Briefing schicken kann.",
      "Helfen Sie mir, das Problem in Worte zu fassen, bevor ich mich melde.",
      "Was sollte ich für das kostenlose Audit vorbereiten?",
    ],
    city: [
      "Wir koordinieren Lieferanten und Baustellenteams per Telefon und WhatsApp.",
      "Jede Filiale meldet ihre Zahlen in einer eigenen Tabelle.",
      "Bilden Sie ab, wie ein Kundenauftrag durch unser Team läuft.",
    ],
    general: [
      "Wir steuern den Großteil unseres Betriebs mit Excel und WhatsApp.",
      "Mein Team verbringt zu viel Zeit damit, Updates hinterherzulaufen.",
      "Zeigen Sie mir, wo einer unserer Prozesse Zeit verliert.",
    ],
  },
  status: {
    thinking: "Denkt nach",
    searching: "Prüft die von Savin veröffentlichten Informationen",
    calculating: "Rechnet mit Ihren Zahlen",
    mapping: "Bildet den Ablauf ab",
    simulating: "Führt eine beispielhafte Simulation aus",
    drafting: "Entwirft Ihr Briefing",
  },
  errors: {
    bad_request: "Diese Nachricht konnte nicht verarbeitet werden. Formulieren Sie sie bitte anders.",
    too_large: "Dieses Gespräch ist zu lang, um fortzufahren. Beginnen Sie ein neues.",
    forbidden: "Diese Anfrage wurde blockiert. Laden Sie die Seite neu und versuchen Sie es erneut.",
    rate_limited: "Zu viele Nachrichten in kurzer Zeit. Bitte warten Sie einen Moment und versuchen Sie es dann erneut.",
    unavailable: "Der Operator ist gerade nicht verfügbar.",
    overloaded: "Der KI-Dienst ist im Moment ausgelastet. Versuchen Sie es gleich noch einmal.",
    refusal: "Bei dieser Anfrage kann der Operator nicht helfen. Beschreiben Sie am besten einen Prozess aus Ihrem Unternehmen.",
    truncated: "Die Antwort wurde vor dem Ende abgeschnitten. Versuchen Sie es erneut oder bitten Sie um eine kürzere Antwort.",
    upstream: "Die Verbindung wurde unterbrochen, bevor die Antwort fertig war. Versuchen Sie es erneut.",
    internal: "Bei uns ist etwas schiefgelaufen. Versuchen Sie es erneut.",
  },
  retry: "Erneut versuchen",
  startOver: "Neues Gespräch beginnen",
  reachDirectly: "Sie erreichen Savin auch direkt:",
  whatsapp: "WhatsApp",
  email: "E-Mail",
  retryInSeconds: (seconds) => `Sie können es in etwa ${seconds} Sekunden erneut versuchen.`,
  retryInMinutes: (minutes) => `Sie können es in etwa ${minutes} Minuten erneut versuchen.`,
  stopped: "(angehalten)",
  inputLabel: "Nachricht an den Operator",
  placeholder: "Beschreiben Sie einen Prozess: Wer macht was, mit welchem Tool, und wo wartet es…",
  send: "Senden",
  stop: "Stopp",
  charCount: (used, max) => `${used} / ${max} Zeichen`,
  disclosure: "Die Antworten werden von einer KI (Claude von Anthropic) erzeugt und können falsch sein. Teilen Sie keine Passwörter oder sensiblen personenbezogenen Daten.",
  privacy: "Datenschutz",
  replied: "Der Operator hat geantwortet",
  replyStopped: "Antwort angehalten",
};

const AR: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "يكشف أين يتعثّر العمل في عملياتك.",
  newChat: "محادثة جديدة",
  confirmClear: "انقر مرة أخرى للمسح",
  expand: "توسيع اللوحة",
  collapse: "تصغير اللوحة",
  close: "إغلاق Operator",
  conversation: "المحادثة مع Operator",
  you: "أنت",
  operator: "Operator",
  startersLabel: "أو ابدأ بأحد هذه الأمثلة",
  openers: {
    home: "حدّثني عن عملية واحدة في شركتك تعتمد كثيرًا على Excel أو واتساب أو المكالمات أو النسخ اليدوي أو الانتظار أو ملاحقة الناس.",
    services: "ما العملية التي ستربطها أولًا؟ أخبرني كيف تسير اليوم، وسأوضح لك ما يمكن أن يتغيّر.",
    industries: "اختر العملية التي تتعطّل أولًا عندما يزيد حجم العمل. اشرح لي كيف تسير اليوم.",
    manufacturing: "عندما يتغيّر طلب بعد بدء الإنتاج، ما الأنظمة أو الأشخاص الذين يجب تحديثهم يدويًا؟",
    "real-estate": "بين الاستفسار الأول والزيارة الميدانية والحجز، أين تُعاد كتابة بيانات العميل المحتمل أو تضيع؟",
    healthcare: "من حجز الموعد حتى الفوترة، كم مرة تُدخَل بيانات المريض نفسها أو تُراجَع يدويًا؟",
    ecommerce: "عندما يصل طلب، ما الذي لا يزال يتم يدويًا قبل الشحن: فحص المخزون، أو التأكيدات، أو حجز شركة الشحن، أو إبلاغ العميل؟",
    edtech: "من الاستفسار الأول إلى التسجيل وتحصيل الرسوم، ما الخطوات التي لا يزال فريقك يلاحقها بالمكالمات أو واتساب؟",
    "case-studies": "أيّ هذه النتائج أقرب إلى وضعك؟ أخبرني كيف تسير هذه العملية في شركتك اليوم.",
    pricing: "يعتمد السعر على ما يحتاج إلى ربط. أخبرني بالعملية التي تستهلك معظم وقتك، وسأساعدك في تحديد نطاقها قبل أن تقارن الباقات.",
    about: "هل تريد أن ترى طريقة تفكيرنا؟ صف عملية واحدة من بدايتها إلى نهايتها، وسأريك أين تُهدر الوقت.",
    contact: "قبل أن تتواصل معنا، يمكنني رسم خريطة العملية التي تريد إصلاحها حتى يبدأ التدقيق بخطوة متقدّمة. ما هذه العملية؟",
    city: "هل تدير هنا مواقع أو موردين أو فرقًا ميدانية؟ أخبرني بأي تسليم لا يزال يتم بالهاتف أو الورق أو واتساب.",
    general: "حدّثني عن عملية في شركتك لا تزال تعتمد على جداول البيانات أو الرسائل أو على تذكّر أحدهم للمتابعة.",
  },
  starters: {
    home: [
      "نتابع الطلبات في Excel ونبلغ العملاء عبر واتساب.",
      "الموافقات تتم عبر المكالمات، ولا أحد يعرف أين وصلت الأمور.",
      "ارسم مسار عمليتنا من الاستفسار إلى الفاتورة، وبيّن أين يضيع الوقت.",
    ],
    services: [
      "ما العمليات التي يجب أن نؤتمتها أولًا؟",
      "المبيعات والمخزون والحسابات موزّعة على ثلاثة أنظمة لا تتواصل فيما بينها.",
      "كيف يمكن للذكاء الاصطناعي أن يساعد في الموافقات دون أن نفقد السيطرة؟",
    ],
    industries: [
      "نعمل على Tally وExcel وواتساب. من أين نبدأ؟",
      "ما العمليات التي يستحق ربطها أولًا عادةً في قطاعي؟",
      "ساعدني في تقدير كلفة المتابعات اليدوية علينا كل شهر.",
    ],
    manufacturing: [
      "تصل تعديلات الطلبات إلى أرض المصنع متأخرة لأنها تُرسل عبر واتساب.",
      "نعيد إدخال أوامر البيع يدويًا من Excel إلى Tally.",
      "حاكِ ما يحدث عندما تتعطّل آلة في منتصف تنفيذ طلب.",
    ],
    "real-estate": [
      "يصلنا العملاء المحتملون من المنصّات العقارية وواتساب، وتضيع المتابعات.",
      "ملاحظات الزيارات الميدانية لا تعود أبدًا إلى فريق المبيعات.",
      "ارسم مسار عمليتنا من الاستفسار إلى الحجز.",
    ],
    healthcare: [
      "تُحجز المواعيد بالهاتف وتُسجَّل في نظامين.",
      "تصل التقارير إلى المرضى متأخرة لأن أحدهم يرسلها يدويًا.",
      "ارسم رحلة المريض من الحجز إلى الفوترة.",
    ],
    ecommerce: [
      "المخزون على موقعنا وفي منصّات البيع الإلكترونية غير متطابق.",
      "تأكيدات الطلبات وتحديثات الشحن تُرسل يدويًا.",
      "قدّر الوقت الذي تستهلكه المرتجعات والمبالغ المستردة شهريًا.",
    ],
    edtech: [
      "تأتي الاستفسارات من الإعلانات وواتساب، ويفقد المستشارون متابعتها.",
      "تذكيرات الرسوم والإيصالات تتم يدويًا كل شهر.",
      "ارسم مسار عمليتنا من الاستفسار إلى التسجيل.",
    ],
    "case-studies": [
      "وضعنا أقرب إلى حالة نظام ERP في التصنيع.",
      "نحن علامة تجارية تبيع مباشرة للمستهلك، وتدفّق طلباتنا بطيء ويدوي.",
      "ما الذي تغيّر في العملية في هذه المشاريع، قبل وبعد؟",
    ],
    pricing: [
      "ساعدني في تحديد ما أحتاجه فعلًا قبل أن أختار باقة.",
      "ماذا يحدث في التدقيق المجاني؟",
      "إعداد عروض الأسعار يستغرق أيامًا. ما الذي يلزم لحل ذلك؟",
    ],
    about: [
      "كيف تعملون مع شركة لم تؤتمت أي شيء من قبل؟",
      "ماذا يحدث في التدقيق المجاني؟",
      "ارسم خريطة إحدى عملياتنا لأرى طريقة تفكيركم.",
    ],
    contact: [
      "ارسم خريطة عمليتي أولًا حتى أرسل ملخّصًا واضحًا.",
      "ساعدني في صياغة المشكلة قبل أن أتواصل معكم.",
      "ماذا يجب أن أجهّز للتدقيق المجاني؟",
    ],
    city: [
      "ننسّق مع الموردين وفرق المواقع بالهاتف وواتساب.",
      "كل فرع يرسل أرقامه في جدول بيانات منفصل.",
      "ارسم كيف ينتقل طلب العميل داخل فريقنا.",
    ],
    general: [
      "ندير معظم عملياتنا عبر Excel وواتساب.",
      "يضيع جزء كبير من يوم فريقي في ملاحقة التحديثات.",
      "أرني أين تُهدر إحدى عملياتنا الوقت.",
    ],
  },
  status: {
    thinking: "يفكّر",
    searching: "يراجع المعلومات التي نشرتها Savin",
    calculating: "يحسب بناءً على أرقامك",
    mapping: "يرسم مسار العمل",
    simulating: "يشغّل محاكاة توضيحية",
    drafting: "يصوغ ملخّصك",
  },
  errors: {
    bad_request: "تعذّرت معالجة هذه الرسالة. جرّب صياغتها بطريقة أخرى.",
    too_large: "أصبحت هذه المحادثة أطول من أن تستمر. ابدأ محادثة جديدة للمتابعة.",
    forbidden: "تم حظر هذا الطلب. أعد تحميل الصفحة وحاول مرة أخرى.",
    rate_limited: "أرسلت رسائل كثيرة في وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.",
    unavailable: "Operator غير متاح حاليًا.",
    overloaded: "خدمة الذكاء الاصطناعي مشغولة الآن. حاول مرة أخرى بعد قليل.",
    refusal: "لا يستطيع Operator المساعدة في هذا الطلب. جرّب أن تصف عملية في شركتك.",
    truncated: "انقطع الرد قبل أن يكتمل. حاول مرة أخرى، أو اطلب إجابة أقصر.",
    upstream: "انقطع الاتصال قبل اكتمال الرد. حاول مرة أخرى.",
    internal: "حدث خطأ من جهتنا. حاول مرة أخرى.",
  },
  retry: "حاول مرة أخرى",
  startOver: "ابدأ محادثة جديدة",
  reachDirectly: "يمكنك أيضًا التواصل مع Savin مباشرة:",
  whatsapp: "واتساب",
  email: "البريد الإلكتروني",
  retryInSeconds: (seconds) => `يمكنك المحاولة مجددًا بعد نحو ${seconds} ثانية.`,
  retryInMinutes: (minutes) => `يمكنك المحاولة مجددًا بعد نحو ${minutes} دقيقة.`,
  stopped: "(أُوقف)",
  inputLabel: "راسل Operator",
  placeholder: "صف عملية: من يفعل ماذا، وبأي أداة، وأين تتوقف في انتظار أحد…",
  send: "إرسال",
  stop: "إيقاف",
  charCount: (used, max) => `${used} / ${max} حرفًا`,
  disclosure: "الردود من إنتاج ذكاء اصطناعي (Claude من Anthropic) وقد تكون خاطئة. لا تشارك كلمات المرور أو البيانات الشخصية الحساسة.",
  privacy: "الخصوصية",
  replied: "ردّ Operator",
  replyStopped: "تم إيقاف الرد",
};

const HI: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "आपके ऑपरेशन में काम कहाँ अटकता है, यह पहचानता है।",
  newChat: "नई बातचीत",
  confirmClear: "मिटाने के लिए फिर से क्लिक करें",
  expand: "पैनल बड़ा करें",
  collapse: "पैनल छोटा करें",
  close: "Operator बंद करें",
  conversation: "Operator के साथ बातचीत",
  you: "आप",
  operator: "Operator",
  startersLabel: "या इनमें से किसी एक से शुरू करें",
  openers: {
    home: "अपनी कंपनी की कोई एक प्रोसेस बताइए जिसमें बहुत ज़्यादा Excel, WhatsApp, फ़ोन कॉल, कॉपी-पेस्ट, इंतज़ार या लोगों के पीछे भागना पड़ता है।",
    services: "आप सबसे पहले कौन-सी प्रोसेस जोड़ना चाहेंगे? बताइए कि वह आज कैसे चलती है, और मैं दिखाऊँगा कि क्या बदल सकता है।",
    industries: "वह प्रोसेस चुनिए जो काम बढ़ते ही सबसे पहले बिगड़ती है। बताइए कि वह आज कैसे चलती है।",
    manufacturing: "प्रोडक्शन शुरू होने के बाद जब कोई ऑर्डर बदलता है, तो किन सिस्टम या लोगों को हाथ से अपडेट करना पड़ता है?",
    "real-estate": "पहली पूछताछ, साइट विज़िट और बुकिंग के बीच, किसी लीड की जानकारी कहाँ दोबारा टाइप होती है या खो जाती है?",
    healthcare: "अपॉइंटमेंट बुकिंग से बिलिंग तक, मरीज़ की वही जानकारी कितनी बार हाथ से भरी या जाँची जाती है?",
    ecommerce: "ऑर्डर आने के बाद शिपिंग से पहले क्या अब भी हाथ से होता है: स्टॉक जाँचना, कन्फ़र्मेशन, कूरियर बुकिंग या ग्राहक को अपडेट देना?",
    edtech: "पहली पूछताछ से एडमिशन और फ़ीस वसूली तक, आपकी टीम किन कदमों के लिए अब भी कॉल या WhatsApp पर पीछे लगी रहती है?",
    "case-studies": "इनमें से कौन-सा नतीजा आपकी स्थिति से सबसे ज़्यादा मिलता है? बताइए कि आपकी कंपनी में वह प्रोसेस आज कैसे चलती है।",
    pricing: "कीमत इस पर निर्भर करती है कि क्या-क्या जोड़ना है। वह प्रोसेस बताइए जिसमें सबसे ज़्यादा समय जाता है, और प्लान देखने से पहले मैं उसका दायरा तय करने में मदद करूँगा।",
    about: "देखना चाहते हैं कि हम कैसे सोचते हैं? कोई एक प्रोसेस शुरू से आख़िर तक बताइए, और मैं दिखाऊँगा कि उसमें समय कहाँ बर्बाद होता है।",
    contact: "संपर्क करने से पहले, मैं उस प्रोसेस को मैप कर सकता हूँ जिसे आप ठीक करना चाहते हैं, ताकि ऑडिट एक कदम आगे से शुरू हो। वह कौन-सी प्रोसेस है?",
    city: "यहाँ साइट, सप्लायर या फ़ील्ड टीमें संभालते हैं? बताइए कौन-सा हैंडऑफ़ अब भी फ़ोन, कागज़ या WhatsApp पर होता है।",
    general: "अपनी कंपनी की कोई प्रोसेस बताइए जो अब भी स्प्रेडशीट, मैसेज या किसी के फ़ॉलो-अप याद रखने पर टिकी है।",
  },
  starters: {
    home: [
      "हम ऑर्डर Excel में ट्रैक करते हैं और ग्राहकों को WhatsApp पर अपडेट देते हैं।",
      "अप्रूवल फ़ोन कॉल पर होते हैं, और किसी को पता नहीं होता कि काम कहाँ तक पहुँचा।",
      "हमारी पूछताछ से इनवॉइस तक की प्रोसेस मैप करें और दिखाएँ कि समय कहाँ जाता है।",
    ],
    services: [
      "हमें सबसे पहले कौन-सी प्रोसेस ऑटोमेट करनी चाहिए?",
      "हमारी सेल्स, स्टॉक और अकाउंट्स तीन अलग सिस्टम में हैं जो आपस में जुड़े नहीं हैं।",
      "कंट्रोल खोए बिना AI अप्रूवल में कैसे मदद कर सकता है?",
    ],
    industries: [
      "हमारा काम Tally, Excel और WhatsApp पर चलता है। शुरुआत कहाँ से करें?",
      "मेरे सेक्टर में आम तौर पर कौन-सी प्रोसेस पहले जोड़ना फ़ायदेमंद होता है?",
      "अंदाज़ा लगाने में मदद करें कि हाथ से होने वाले फ़ॉलो-अप हमें हर महीने कितने महँगे पड़ते हैं।",
    ],
    manufacturing: [
      "ऑर्डर में बदलाव शॉप फ़्लोर तक देर से पहुँचते हैं क्योंकि अपडेट WhatsApp पर जाते हैं।",
      "हम सेल्स ऑर्डर Excel से Tally में हाथ से दोबारा भरते हैं।",
      "सिमुलेट करें कि ऑर्डर के बीच में मशीन बंद हो जाए तो क्या होता है।",
    ],
    "real-estate": [
      "लीड पोर्टल और WhatsApp से आती हैं, और फ़ॉलो-अप छूट जाते हैं।",
      "साइट विज़िट का फ़ीडबैक कभी सेल्स टीम तक वापस नहीं पहुँचता।",
      "हमारी पूछताछ से बुकिंग तक की प्रोसेस मैप करें।",
    ],
    healthcare: [
      "अपॉइंटमेंट फ़ोन पर बुक होते हैं और दो सिस्टम में दर्ज किए जाते हैं।",
      "रिपोर्ट मरीज़ों तक देर से पहुँचती हैं क्योंकि कोई उन्हें हाथ से भेजता है।",
      "बुकिंग से बिलिंग तक मरीज़ का सफ़र मैप करें।",
    ],
    ecommerce: [
      "हमारी वेबसाइट और मार्केटप्लेस का स्टॉक आपस में मेल नहीं खाता।",
      "ऑर्डर कन्फ़र्मेशन और कूरियर अपडेट हाथ से भेजे जाते हैं।",
      "अंदाज़ा लगाएँ कि रिटर्न और रिफ़ंड में हर महीने कितना समय जाता है।",
    ],
    edtech: [
      "पूछताछ विज्ञापनों और WhatsApp से आती है, और काउंसलर ट्रैक खो देते हैं।",
      "फ़ीस रिमाइंडर और रसीदें हर महीने हाथ से बनती हैं।",
      "हमारी पूछताछ से एडमिशन तक की प्रोसेस मैप करें।",
    ],
    "case-studies": [
      "हमारी स्थिति मैन्युफ़ैक्चरिंग ERP वाले केस से सबसे ज़्यादा मिलती है।",
      "हम एक D2C ब्रांड हैं और हमारा ऑर्डर फ़्लो धीमा और मैन्युअल है।",
      "इन प्रोजेक्ट्स में प्रोसेस पहले और बाद में क्या बदला?",
    ],
    pricing: [
      "प्लान चुनने से पहले यह समझने में मदद करें कि मुझे असल में क्या चाहिए।",
      "मुफ़्त ऑडिट में क्या होता है?",
      "हमारे कोटेशन बनने में कई दिन लगते हैं। इसे ठीक करने के लिए क्या करना होगा?",
    ],
    about: [
      "जिस कंपनी ने कभी कुछ ऑटोमेट नहीं किया, उसके साथ आप कैसे काम करते हैं?",
      "मुफ़्त ऑडिट में क्या होता है?",
      "हमारी कोई एक प्रोसेस मैप करें ताकि मैं देख सकूँ कि आप कैसे सोचते हैं।",
    ],
    contact: [
      "पहले मेरी प्रोसेस मैप करें ताकि मैं साफ़ ब्रीफ़ भेज सकूँ।",
      "संपर्क करने से पहले समस्या को शब्दों में ढालने में मदद करें।",
      "मुफ़्त ऑडिट के लिए मुझे क्या तैयार रखना चाहिए?",
    ],
    city: [
      "हम सप्लायर और साइट टीमों के साथ फ़ोन और WhatsApp पर तालमेल बिठाते हैं।",
      "हर ब्रांच अपने आँकड़े अलग स्प्रेडशीट में भेजती है।",
      "मैप करें कि ग्राहक का ऑर्डर हमारी टीम में कैसे आगे बढ़ता है।",
    ],
    general: [
      "हमारा ज़्यादातर काम Excel और WhatsApp पर चलता है।",
      "मेरी टीम का बहुत सारा समय अपडेट के पीछे भागने में जाता है।",
      "दिखाएँ कि हमारी कोई प्रोसेस कहाँ समय गँवा रही है।",
    ],
  },
  status: {
    thinking: "सोच रहा है",
    searching: "Savin की प्रकाशित जानकारी देख रहा है",
    calculating: "आपके आँकड़ों से गणना कर रहा है",
    mapping: "वर्कफ़्लो मैप कर रहा है",
    simulating: "उदाहरण के तौर पर सिमुलेशन चला रहा है",
    drafting: "आपका ब्रीफ़ तैयार कर रहा है",
  },
  errors: {
    bad_request: "यह संदेश प्रोसेस नहीं हो सका। इसे दूसरे शब्दों में लिखकर देखें।",
    too_large: "यह बातचीत आगे बढ़ाने के लिए बहुत लंबी हो गई है। जारी रखने के लिए नई बातचीत शुरू करें।",
    forbidden: "यह अनुरोध रोक दिया गया। पेज दोबारा लोड करके फिर कोशिश करें।",
    rate_limited: "कम समय में बहुत सारे संदेश भेजे गए। थोड़ी देर रुककर फिर कोशिश करें।",
    unavailable: "Operator अभी उपलब्ध नहीं है।",
    overloaded: "AI सेवा अभी व्यस्त है। थोड़ी देर में फिर कोशिश करें।",
    refusal: "Operator इस अनुरोध में मदद नहीं कर सकता। अपने बिज़नेस की किसी प्रोसेस के बारे में बताकर देखें।",
    truncated: "जवाब पूरा होने से पहले ही कट गया। फिर कोशिश करें, या छोटा जवाब माँगें।",
    upstream: "जवाब पूरा होने से पहले कनेक्शन टूट गया। फिर कोशिश करें।",
    internal: "हमारी तरफ़ से कुछ गड़बड़ हो गई। फिर कोशिश करें।",
  },
  retry: "फिर कोशिश करें",
  startOver: "नई बातचीत शुरू करें",
  reachDirectly: "आप Savin से सीधे भी संपर्क कर सकते हैं:",
  whatsapp: "WhatsApp",
  email: "ईमेल",
  retryInSeconds: (seconds) => `लगभग ${seconds} सेकंड बाद फिर कोशिश कर सकते हैं।`,
  retryInMinutes: (minutes) => `लगभग ${minutes} मिनट बाद फिर कोशिश कर सकते हैं।`,
  stopped: "(रोका गया)",
  inputLabel: "Operator को संदेश भेजें",
  placeholder: "कोई प्रोसेस बताइए: कौन क्या करता है, किस टूल में, और काम कहाँ रुकता है…",
  send: "भेजें",
  stop: "रोकें",
  charCount: (used, max) => `${used} / ${max} अक्षर`,
  disclosure: "जवाब AI (Anthropic का Claude) से बनते हैं और गलत भी हो सकते हैं। पासवर्ड या संवेदनशील निजी जानकारी साझा न करें।",
  privacy: "गोपनीयता",
  replied: "Operator ने जवाब दिया",
  replyStopped: "जवाब रोका गया",
};

const ZH: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "找出工作在运营中卡住的环节。",
  newChat: "新对话",
  confirmClear: "再次点击以清空",
  expand: "展开面板",
  collapse: "收起面板",
  close: "关闭 Operator",
  conversation: "与 Operator 的对话",
  you: "您",
  operator: "Operator",
  startersLabel: "或从以下示例开始",
  openers: {
    home: "说说贵公司里一个过于依赖 Excel、WhatsApp、打电话、复制粘贴、等待或反复催人的流程。",
    services: "您会先打通哪个流程？告诉我它现在如何运转，我来梳理可以改变什么。",
    industries: "选一个业务量一上来就最先出问题的流程，跟我讲讲它现在是怎么运转的。",
    manufacturing: "生产开始后订单发生变更时，哪些系统或人员需要手动更新？",
    "real-estate": "从首次咨询、看房到签约，客户信息在哪些环节被重复录入或丢失？",
    healthcare: "从预约到结算，同一份患者信息要手动录入或核对多少次？",
    ecommerce: "订单进来后，发货前还有哪些事靠手工完成：查库存、确认订单、预约快递，还是通知客户？",
    edtech: "从首次咨询到报名和收费，您的团队还有哪些环节要靠电话或 WhatsApp 反复跟进？",
    "case-studies": "这些成果中，哪一个最接近您的情况？说说这个流程在贵公司现在是怎么运转的。",
    pricing: "价格取决于需要打通什么。告诉我最耗时的那个流程，在您比较套餐之前，我先帮您把范围理清楚。",
    about: "想看看我们的思路？从头到尾描述一个流程，我来指出它在哪里浪费时间。",
    contact: "在联系我们之前，我可以先梳理您想改进的流程，让审计一开始就领先一步。是哪个流程？",
    city: "您在这里管理多个站点、供应商或外勤团队吗？告诉我哪个交接环节仍然靠电话、纸质单据或 WhatsApp。",
    general: "说说贵公司里一个仍然依赖电子表格、消息，或靠某人记得跟进的流程。",
  },
  starters: {
    home: [
      "我们用 Excel 跟踪订单，再通过 WhatsApp 通知客户。",
      "审批靠打电话，没人知道事情进展到哪一步。",
      "梳理我们从询价到开票的流程，并指出时间浪费在哪里。",
    ],
    services: [
      "我们应该先把哪些流程自动化？",
      "我们的销售、库存和财务分散在三个互不相通的系统里。",
      "AI 如何在不失控的前提下帮助处理审批？",
    ],
    industries: [
      "我们靠 Tally、Excel 和 WhatsApp 运转，应该从哪里开始？",
      "在我的行业里，通常哪些流程最值得优先打通？",
      "帮我估算一下人工跟进每月给我们带来多少成本。",
    ],
    manufacturing: [
      "订单变更通过 WhatsApp 传达，到车间时已经晚了。",
      "我们要把销售订单从 Excel 手工录入到 Tally。",
      "模拟一下订单生产到一半时机器停机会发生什么。",
    ],
    "real-estate": [
      "线索来自房产平台和 WhatsApp，跟进经常遗漏。",
      "看房后的反馈从来没有回到销售团队。",
      "梳理我们从咨询到签约的流程。",
    ],
    healthcare: [
      "预约通过电话进行，并要录入两个系统。",
      "检查报告要有人手动发送，患者收到得很晚。",
      "梳理患者从预约到结算的全流程。",
    ],
    ecommerce: [
      "我们官网和各电商平台的库存对不上。",
      "订单确认和物流通知都靠手动发送。",
      "估算一下我们每月在退货和退款上花多少时间。",
    ],
    edtech: [
      "咨询来自广告和 WhatsApp，课程顾问经常跟丢。",
      "每个月的缴费提醒和收据都靠手工完成。",
      "梳理我们从咨询到报名的流程。",
    ],
    "case-studies": [
      "我们的情况最接近制造业 ERP 那个案例。",
      "我们是一个 D2C 品牌，订单流程又慢又依赖人工。",
      "这些项目中，流程在前后发生了哪些变化？",
    ],
    pricing: [
      "在选套餐之前，帮我弄清楚我真正需要什么。",
      "免费审计包括哪些内容？",
      "我们准备一份报价要好几天，怎样才能解决？",
    ],
    about: [
      "对于从未做过任何自动化的公司，你们如何合作？",
      "免费审计包括哪些内容？",
      "梳理我们的一个流程，让我看看你们的思路。",
    ],
    contact: [
      "先梳理我的流程，这样我能发出一份清晰的需求简报。",
      "在联系之前，帮我把问题讲清楚。",
      "免费审计前我需要准备什么？",
    ],
    city: [
      "我们通过电话和 WhatsApp 协调供应商和现场团队。",
      "每个分店都用单独的电子表格上报数据。",
      "梳理客户订单在我们团队内部是如何流转的。",
    ],
    general: [
      "我们大部分运营都靠 Excel 和 WhatsApp。",
      "我的团队花太多时间追问进度。",
      "告诉我我们的某个流程在哪里浪费时间。",
    ],
  },
  status: {
    thinking: "思考中",
    searching: "正在查阅 Savin 公开发布的信息",
    calculating: "正在根据您的数据计算",
    mapping: "正在绘制工作流程",
    simulating: "正在运行示意性模拟",
    drafting: "正在起草您的需求简报",
  },
  errors: {
    bad_request: "无法处理这条消息，请换个说法再试。",
    too_large: "这段对话太长，无法继续。请开始新的对话。",
    forbidden: "此请求已被拦截。请刷新页面后重试。",
    rate_limited: "短时间内发送的消息过多，请稍候再试。",
    unavailable: "Operator 目前无法使用。",
    overloaded: "AI 服务当前繁忙，请稍后再试。",
    refusal: "Operator 无法协助处理这个请求。不妨描述一下贵公司的某个流程。",
    truncated: "回复在完成前被截断了。请重试，或要求更简短的回答。",
    upstream: "回复完成前连接中断了，请重试。",
    internal: "我们这边出了点问题，请重试。",
  },
  retry: "重试",
  startOver: "开始新的对话",
  reachDirectly: "您也可以直接联系 Savin：",
  whatsapp: "WhatsApp",
  email: "电子邮件",
  retryInSeconds: (seconds) => `大约 ${seconds} 秒后可以重试。`,
  retryInMinutes: (minutes) => `大约 ${minutes} 分钟后可以重试。`,
  stopped: "（已停止）",
  inputLabel: "给 Operator 发消息",
  placeholder: "描述一个流程：谁做什么、用什么工具、在哪里卡住等待……",
  send: "发送",
  stop: "停止",
  charCount: (used, max) => `${used} / ${max} 字符`,
  disclosure: "回复由 AI（Anthropic 的 Claude）生成，可能有误。请勿分享密码或敏感个人信息。",
  privacy: "隐私政策",
  replied: "Operator 已回复",
  replyStopped: "回复已停止",
};

const GU: OperatorCopy = {
  title: "Savin Operator",
  subtitle: "તમારા ઓપરેશન્સમાં કામ ક્યાં અટકે છે તે ઓળખે છે.",
  newChat: "નવી વાતચીત",
  confirmClear: "સાફ કરવા માટે ફરી ક્લિક કરો",
  expand: "પેનલ મોટી કરો",
  collapse: "પેનલ નાની કરો",
  close: "Operator બંધ કરો",
  conversation: "Operator સાથેની વાતચીત",
  you: "તમે",
  operator: "Operator",
  startersLabel: "અથવા આમાંથી કોઈ એકથી શરૂ કરો",
  openers: {
    home: "તમારી કંપનીની એક એવી પ્રોસેસ વિશે જણાવો જેમાં બહુ વધારે Excel, WhatsApp, ફોન કૉલ, કૉપી-પેસ્ટ, રાહ જોવી કે લોકોની પાછળ પડવું પડે છે.",
    services: "તમે સૌથી પહેલાં કઈ પ્રોસેસ જોડશો? તે આજે કેવી રીતે ચાલે છે તે જણાવો, અને હું બતાવીશ કે શું બદલાઈ શકે.",
    industries: "કામ વધતાં જ સૌથી પહેલાં બગડતી પ્રોસેસ પસંદ કરો. તે આજે કેવી રીતે ચાલે છે તે સમજાવો.",
    manufacturing: "પ્રોડક્શન શરૂ થયા પછી ઓર્ડર બદલાય, ત્યારે કઈ સિસ્ટમ કે કયા લોકોને હાથથી અપડેટ કરવા પડે છે?",
    "real-estate": "પહેલી પૂછપરછ, સાઇટ વિઝિટ અને બુકિંગ વચ્ચે, લીડની માહિતી ક્યાં ફરીથી ટાઇપ થાય છે અથવા ખોવાઈ જાય છે?",
    healthcare: "એપોઇન્ટમેન્ટ બુકિંગથી બિલિંગ સુધી, દર્દીની એ જ માહિતી કેટલી વાર હાથથી ભરાય છે કે ચકાસાય છે?",
    ecommerce: "ઓર્ડર આવ્યા પછી શિપિંગ પહેલાં હજુ શું હાથથી થાય છે: સ્ટોક તપાસ, કન્ફર્મેશન, કુરિયર બુકિંગ કે ગ્રાહકને અપડેટ?",
    edtech: "પહેલી પૂછપરછથી એડમિશન અને ફી વસૂલી સુધી, તમારી ટીમ કયાં પગલાં માટે હજુ કૉલ કે WhatsApp પર પાછળ પડે છે?",
    "case-studies": "આમાંથી કયું પરિણામ તમારી પરિસ્થિતિને સૌથી વધુ મળતું આવે છે? તમારી કંપનીમાં એ પ્રોસેસ આજે કેવી રીતે ચાલે છે તે જણાવો.",
    pricing: "કિંમત શું જોડવાનું છે તેના પર આધાર રાખે છે. જે પ્રોસેસમાં સૌથી વધુ સમય જાય છે તે જણાવો, અને પ્લાન જોતા પહેલાં હું તેનો વ્યાપ નક્કી કરવામાં મદદ કરીશ.",
    about: "અમે કેવી રીતે વિચારીએ છીએ તે જોવું છે? કોઈ એક પ્રોસેસ શરૂઆતથી અંત સુધી વર્ણવો, અને હું બતાવીશ કે તેમાં સમય ક્યાં વેડફાય છે.",
    contact: "સંપર્ક કરતા પહેલાં, તમે જે પ્રોસેસ સુધારવા માગો છો તેને હું મેપ કરી શકું છું, જેથી ઑડિટ એક ડગલું આગળથી શરૂ થાય. એ કઈ પ્રોસેસ છે?",
    city: "અહીં સાઇટ, સપ્લાયર કે ફીલ્ડ ટીમો સંભાળો છો? કયો હેન્ડઑફ હજુ ફોન, કાગળ કે WhatsApp પર થાય છે તે જણાવો.",
    general: "તમારી કંપનીની એવી પ્રોસેસ વિશે જણાવો જે હજુ સ્પ્રેડશીટ, મેસેજ કે કોઈના ફૉલો-અપ યાદ રાખવા પર ટકેલી છે.",
  },
  starters: {
    home: [
      "અમે ઓર્ડર Excelમાં ટ્રેક કરીએ છીએ અને ગ્રાહકોને WhatsApp પર અપડેટ આપીએ છીએ.",
      "મંજૂરીઓ ફોન કૉલ પર થાય છે, અને કોઈને ખબર નથી હોતી કે કામ ક્યાં પહોંચ્યું.",
      "અમારી પૂછપરછથી ઇન્વૉઇસ સુધીની પ્રોસેસ મેપ કરો અને બતાવો કે સમય ક્યાં જાય છે.",
    ],
    services: [
      "અમારે સૌથી પહેલાં કઈ પ્રોસેસ ઑટોમેટ કરવી જોઈએ?",
      "અમારું સેલ્સ, સ્ટોક અને એકાઉન્ટ્સ ત્રણ અલગ સિસ્ટમમાં છે જે એકબીજા સાથે જોડાયેલાં નથી.",
      "કંટ્રોલ ગુમાવ્યા વગર AI મંજૂરીઓમાં કેવી રીતે મદદ કરી શકે?",
    ],
    industries: [
      "અમારું કામ Tally, Excel અને WhatsApp પર ચાલે છે. શરૂઆત ક્યાંથી કરીએ?",
      "મારા ક્ષેત્રમાં સામાન્ય રીતે કઈ પ્રોસેસ પહેલાં જોડવી ફાયદાકારક હોય છે?",
      "હાથથી થતા ફૉલો-અપ અમને દર મહિને કેટલા મોંઘા પડે છે તેનો અંદાજ કાઢવામાં મદદ કરો.",
    ],
    manufacturing: [
      "ઓર્ડરના ફેરફારો શોપ ફ્લોર સુધી મોડા પહોંચે છે કારણ કે અપડેટ WhatsApp પર જાય છે.",
      "અમે સેલ્સ ઓર્ડર Excelમાંથી Tallyમાં હાથથી ફરી ભરીએ છીએ.",
      "ઓર્ડરની વચ્ચે મશીન બંધ થઈ જાય તો શું થાય તે સિમ્યુલેટ કરો.",
    ],
    "real-estate": [
      "લીડ પોર્ટલ અને WhatsApp પરથી આવે છે, અને ફૉલો-અપ છૂટી જાય છે.",
      "સાઇટ વિઝિટનો ફીડબેક ક્યારેય સેલ્સ ટીમ સુધી પાછો પહોંચતો નથી.",
      "અમારી પૂછપરછથી બુકિંગ સુધીની પ્રોસેસ મેપ કરો.",
    ],
    healthcare: [
      "એપોઇન્ટમેન્ટ ફોન પર બુક થાય છે અને બે સિસ્ટમમાં નોંધાય છે.",
      "રિપોર્ટ દર્દીઓ સુધી મોડા પહોંચે છે કારણ કે કોઈ તેને હાથથી મોકલે છે.",
      "બુકિંગથી બિલિંગ સુધીની દર્દીની સફર મેપ કરો.",
    ],
    ecommerce: [
      "અમારી વેબસાઇટ અને માર્કેટપ્લેસનો સ્ટોક મેળ ખાતો નથી.",
      "ઓર્ડર કન્ફર્મેશન અને કુરિયર અપડેટ હાથથી મોકલાય છે.",
      "રિટર્ન અને રિફંડમાં દર મહિને કેટલો સમય જાય છે તેનો અંદાજ કાઢો.",
    ],
    edtech: [
      "પૂછપરછ જાહેરાતો અને WhatsApp પરથી આવે છે, અને કાઉન્સેલરો ટ્રેક ગુમાવી દે છે.",
      "ફી રિમાઇન્ડર અને રસીદો દર મહિને હાથથી બને છે.",
      "અમારી પૂછપરછથી એડમિશન સુધીની પ્રોસેસ મેપ કરો.",
    ],
    "case-studies": [
      "અમારી પરિસ્થિતિ મેન્યુફેક્ચરિંગ ERP વાળા કેસને સૌથી વધુ મળતી આવે છે.",
      "અમે D2C બ્રાન્ડ છીએ અને અમારો ઓર્ડર ફ્લો ધીમો અને મેન્યુઅલ છે.",
      "આ પ્રોજેક્ટ્સમાં પ્રોસેસ પહેલાં અને પછી શું બદલાયું?",
    ],
    pricing: [
      "પ્લાન પસંદ કરતા પહેલાં મને ખરેખર શું જોઈએ છે તે સમજવામાં મદદ કરો.",
      "મફત ઑડિટમાં શું થાય છે?",
      "અમારા ક્વોટેશન તૈયાર થતાં ઘણા દિવસ લાગે છે. તેને સુધારવા શું કરવું પડે?",
    ],
    about: [
      "જે કંપનીએ ક્યારેય કંઈ ઑટોમેટ નથી કર્યું, તેની સાથે તમે કેવી રીતે કામ કરો છો?",
      "મફત ઑડિટમાં શું થાય છે?",
      "અમારી કોઈ એક પ્રોસેસ મેપ કરો જેથી હું જોઈ શકું કે તમે કેવી રીતે વિચારો છો.",
    ],
    contact: [
      "પહેલાં મારી પ્રોસેસ મેપ કરો જેથી હું સ્પષ્ટ બ્રીફ મોકલી શકું.",
      "સંપર્ક કરતા પહેલાં સમસ્યાને શબ્દોમાં મૂકવામાં મદદ કરો.",
      "મફત ઑડિટ માટે મારે શું તૈયાર રાખવું જોઈએ?",
    ],
    city: [
      "અમે સપ્લાયર અને સાઇટ ટીમો સાથે ફોન અને WhatsApp પર સંકલન કરીએ છીએ.",
      "દરેક બ્રાન્ચ પોતાના આંકડા અલગ સ્પ્રેડશીટમાં મોકલે છે.",
      "ગ્રાહકનો ઓર્ડર અમારી ટીમમાં કેવી રીતે આગળ વધે છે તે મેપ કરો.",
    ],
    general: [
      "અમારું મોટાભાગનું કામ Excel અને WhatsApp પર ચાલે છે.",
      "મારી ટીમનો ઘણો સમય અપડેટ માટે પાછળ પડવામાં જાય છે.",
      "અમારી કોઈ પ્રોસેસ ક્યાં સમય ગુમાવે છે તે બતાવો.",
    ],
  },
  status: {
    thinking: "વિચારી રહ્યું છે",
    searching: "Savinની પ્રકાશિત માહિતી તપાસી રહ્યું છે",
    calculating: "તમારા આંકડા પરથી ગણતરી કરી રહ્યું છે",
    mapping: "વર્કફ્લો મેપ કરી રહ્યું છે",
    simulating: "ઉદાહરણરૂપ સિમ્યુલેશન ચલાવી રહ્યું છે",
    drafting: "તમારું બ્રીફ તૈયાર કરી રહ્યું છે",
  },
  errors: {
    bad_request: "આ સંદેશ પ્રોસેસ થઈ શક્યો નહીં. તેને બીજા શબ્દોમાં લખી જુઓ.",
    too_large: "આ વાતચીત આગળ વધારવા માટે ખૂબ લાંબી થઈ ગઈ છે. ચાલુ રાખવા નવી વાતચીત શરૂ કરો.",
    forbidden: "આ વિનંતી અટકાવવામાં આવી. પેજ ફરી લોડ કરીને ફરી પ્રયાસ કરો.",
    rate_limited: "ઓછા સમયમાં ઘણા બધા સંદેશા મોકલાયા છે. થોડી વાર રાહ જોઈને ફરી પ્રયાસ કરો.",
    unavailable: "Operator હાલમાં ઉપલબ્ધ નથી.",
    overloaded: "AI સેવા અત્યારે વ્યસ્ત છે. થોડી વારમાં ફરી પ્રયાસ કરો.",
    refusal: "Operator આ વિનંતીમાં મદદ કરી શકતું નથી. તમારા બિઝનેસની કોઈ પ્રોસેસ વિશે જણાવી જુઓ.",
    truncated: "જવાબ પૂરો થાય તે પહેલાં જ કપાઈ ગયો. ફરી પ્રયાસ કરો, અથવા ટૂંકો જવાબ માગો.",
    upstream: "જવાબ પૂરો થાય તે પહેલાં કનેક્શન તૂટી ગયું. ફરી પ્રયાસ કરો.",
    internal: "અમારી બાજુએ કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.",
  },
  retry: "ફરી પ્રયાસ કરો",
  startOver: "નવી વાતચીત શરૂ કરો",
  reachDirectly: "તમે Savinનો સીધો સંપર્ક પણ કરી શકો છો:",
  whatsapp: "WhatsApp",
  email: "ઇમેઇલ",
  retryInSeconds: (seconds) => `લગભગ ${seconds} સેકન્ડ પછી ફરી પ્રયાસ કરી શકશો.`,
  retryInMinutes: (minutes) => `લગભગ ${minutes} મિનિટ પછી ફરી પ્રયાસ કરી શકશો.`,
  stopped: "(રોકાયેલું)",
  inputLabel: "Operatorને સંદેશ મોકલો",
  placeholder: "કોઈ પ્રોસેસ વર્ણવો: કોણ શું કરે છે, કયા ટૂલમાં, અને કામ ક્યાં અટકે છે…",
  send: "મોકલો",
  stop: "રોકો",
  charCount: (used, max) => `${used} / ${max} અક્ષર`,
  disclosure: "જવાબો AI (Anthropicનું Claude) દ્વારા બને છે અને ખોટા પણ હોઈ શકે છે. પાસવર્ડ અથવા સંવેદનશીલ અંગત માહિતી શેર કરશો નહીં.",
  privacy: "ગોપનીયતા",
  replied: "Operatorએ જવાબ આપ્યો",
  replyStopped: "જવાબ રોકાયો",
};

const TABLE: Record<Locale, OperatorCopy> = { en: EN, es: ES, fr: FR, de: DE, ar: AR, hi: HI, zh: ZH, gu: GU };

/** Locale copy merged over English, so a missing key never renders blank. */
export function getOperatorCopy(locale: string): OperatorCopy {
  const table = TABLE[locale as Locale];
  if (!table || table === EN) return EN;
  return {
    ...EN,
    ...table,
    openers: { ...EN.openers, ...table.openers },
    starters: { ...EN.starters, ...table.starters },
    status: { ...EN.status, ...table.status },
    errors: { ...EN.errors, ...table.errors },
  };
}

function isOpenerIndustry(slug: string | undefined): slug is OpenerIndustry {
  return (OPENER_INDUSTRIES as readonly string[]).includes(slug ?? "");
}

/** Which opener and starters a page gets. */
export function openerKey(page: PageContext): OpenerKey {
  switch (page.topic) {
    case "home":
    case "services":
    case "industries":
    case "case-studies":
    case "pricing":
    case "about":
    case "contact":
      return page.topic;
    case "industry":
      return isOpenerIndustry(page.slug) ? page.slug : "industries";
    case "cities":
    case "city":
      return "city";
    default:
      return "general";
  }
}
