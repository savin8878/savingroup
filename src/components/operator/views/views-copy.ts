// components/operator/views/views-copy.ts
//
// UI copy for the Operator's artifact views (maps, simulations, estimates,
// X-Rays, audit briefs, sources). Only chrome lives here — every title,
// label and value inside an artifact comes from the conversation.
//
// English is the source of truth; each locale is merged over it two levels
// deep, so a missing key renders English rather than blank. Pure data (type
// imports only), so the brief formatter's tests can load real labels.
//
// Capability names are copied from services-translations.ts on purpose:
// the brief must name capabilities exactly as the services page does, but
// importing that 58 KB module into the site-wide panel chunk for eight
// strings is not worth it. Keep the two in step when either changes.

import type { Locale } from "@/lib/i18n";
import type { GraphEdgeMode, GraphNodeKind, SimActorKind, SimStepKind } from "@/lib/operator/protocol";
import type { BriefLabels, XRayLabels } from "./brief-format";

export interface ViewsCopy {
  eyebrows: { mapToday: string; mapConnected: string; simulation: string; estimate: string; xray: string; brief: string };
  graph: {
    today: string;
    connected: string;
    /** Group label of the Today / Connected toggle. */
    compare: string;
    listView: string;
    /** Shown when the diagram cannot fit and the list is used instead. */
    listNote: string;
    legend: string;
    friction: string;
    /** Screen-reader name of the × badge in the list view. */
    frictionPoint: string;
    /**
     * Screen-reader words around an edge's target in the list view: "to {to}".
     * A template, not a word, because Hindi and Gujarati put the postposition
     * AFTER the noun ("{to} की ओर"); a prefix would read backwards.
     */
    edgeTo: string;
    /** Screen-reader text of a friction handoff: "{from} to {to}" ("{from} से {to} तक"). */
    between: string;
    loopsBack: string;
    /** A node with no outgoing edges, in the list view. */
    end: string;
    /** Short tags drawn on manual, AI-assisted and approval edges. */
    tags: { manual: string; ai: string; approval: string };
    modes: Record<GraphEdgeMode, string>;
    kinds: Record<GraphNodeKind, string>;
  };
  sim: {
    disclaimer: string;
    steps: string;
    play: string;
    pause: string;
    restart: string;
    previous: string;
    next: string;
    /** "Step {n} of {total}". */
    stepOf: string;
    gateTitle: string;
    gateBody: string;
    approve: string;
    approved: string;
    consequential: string;
    record: string;
    noRecord: string;
    outcome: string;
    complete: string;
    manualHint: string;
    actorKinds: Record<SimActorKind, string>;
    stepKinds: Record<SimStepKind, string>;
  };
  impact: {
    perMonth: string;
    perYear: string;
    released: string;
    /** "At a {pct}% reduction". */
    reduction: string;
    assumed: string;
    yours: string;
    /** Unit after the big hour numerals. */
    hours: string;
    monthlyCost: string;
    releasedCost: string;
    /** "At {amount} per hour". */
    rate: string;
    assumedRate: string;
    breakdown: string;
    activity: string;
    people: string;
    time: string;
    frequency: string;
    hoursPerMonth: string;
    total: string;
    /** "{n} min". */
    minutes: string;
    /** "{n}× / day" … */
    per: { day: string; week: string; month: string };
    /** "{n} working days per month". */
    workingDays: string;
    /**
     * "{n} people", by Intl.PluralRules category of the locale. `other` is
     * required; a category a locale leaves out falls back to its `other`.
     */
    peopleCount: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
    /** An activity with assumed numbers: "{label}: {parts}", parts joined by listSeparator. */
    assumedActivity: string;
    /** An assumed duration: "{n} min each time". */
    assumedMinutes: string;
    listSeparator: string;
    /** "{pct}% of this time removed by the proposed change". */
    assumedReduction: string;
    /** "Staff cost of {amount} per hour". */
    assumedCost: string;
    /** Under the table when the rounded rows do not add up to the total exactly. */
    roundingNote: string;
    assumptions: string;
    disclaimer: string;
  };
  xray: XRayLabels & { statedNote: string; inferredNote: string };
  brief: BriefLabels & { notice: string; whatsapp: string; email: string; newTab: string; to: string };
  actions: { copy: string; copyText: string; copied: string; copyFailed: string; download: string };
  sources: { label: string };
  /** Stands in for a view that failed to render (ViewBoundary). */
  fallback: { unavailable: string };
}

type Patch<T> = { [K in keyof T]?: T[K] extends unknown[] ? T[K] : T[K] extends object ? Partial<T[K]> : T[K] };
type CopyPatch = { [S in keyof ViewsCopy]?: Patch<ViewsCopy[S]> };

const EN: ViewsCopy = {
  eyebrows: {
    mapToday: "Map · Today",
    mapConnected: "Map · Connected",
    simulation: "Simulation",
    estimate: "Estimate",
    xray: "Business X-Ray",
    brief: "Audit brief",
  },
  graph: {
    today: "Today",
    connected: "Connected",
    compare: "Compare today with a connected workflow",
    listView: "List view",
    listNote: "Shown as a list to fit this width.",
    legend: "Key",
    friction: "Friction",
    frictionPoint: "Friction point",
    edgeTo: "to {to}",
    between: "{from} to {to}",
    loopsBack: "loops back",
    end: "End of this path",
    tags: { manual: "Manual", ai: "AI", approval: "Approval" },
    modes: {
      manual: "Manual handoff",
      automated: "Automated",
      integration: "Integration",
      ai_assisted: "AI-assisted",
      approval: "Human approval",
      physical: "Physical",
    },
    kinds: {
      trigger: "Trigger",
      person: "Person",
      team: "Team",
      software: "Software",
      spreadsheet: "Spreadsheet",
      messaging: "Messaging",
      data: "Data",
      machine: "Machine",
      decision: "Decision",
      ai: "AI",
      action: "Action",
      result: "Result",
    },
  },
  sim: {
    disclaimer: "Illustrative scenario with sample data. No live system is connected.",
    steps: "Scenario steps",
    play: "Play the simulation",
    pause: "Pause the simulation",
    restart: "Restart the simulation",
    previous: "Previous step",
    next: "Next step",
    stepOf: "Step {n} of {total}",
    gateTitle: "Human approval required",
    gateBody: "The simulation waits here until a person approves this step.",
    approve: "Approve (simulated)",
    approved: "Approved (simulated)",
    consequential: "Consequential",
    record: "Sample record",
    noRecord: "No sample values at this step.",
    outcome: "Outcome",
    complete: "Simulation complete",
    manualHint: "Autoplay is off. Step through with Previous and Next.",
    actorKinds: { person: "Person", system: "System", ai: "AI", machine: "Machine", external: "External party" },
    stepKinds: { event: "Event", check: "Check", decision: "Decision", approval: "Approval", action: "Action", alert: "Alert", record: "Record" },
  },
  impact: {
    perMonth: "Staff-hours per month",
    perYear: "Staff-hours per year",
    released: "Hours that could be released per month",
    reduction: "At a {pct}% reduction",
    assumed: "Assumed",
    yours: "Your figure",
    hours: "h",
    monthlyCost: "Cost of this time per month",
    releasedCost: "Value of the released time per month",
    rate: "At {amount} per hour",
    assumedRate: "Assumed rate",
    breakdown: "Breakdown",
    activity: "Activity",
    people: "People",
    time: "Time",
    frequency: "Frequency",
    hoursPerMonth: "Hours / month",
    total: "Total",
    minutes: "{n} min",
    per: { day: "{n}× / day", week: "{n}× / week", month: "{n}× / month" },
    workingDays: "{n} working days per month",
    peopleCount: { one: "{n} person", other: "{n} people" },
    assumedActivity: "{label}: {parts}",
    assumedMinutes: "{n} min each time",
    listSeparator: ", ",
    assumedReduction: "{pct}% of this time removed by the proposed change",
    assumedCost: "Staff cost of {amount} per hour",
    roundingNote: "Rows are rounded to one decimal; the total is calculated before rounding.",
    assumptions: "Assumptions",
    disclaimer: "Estimate from the numbers in this conversation. Verify them before attaching a financial value — this is not a quote or a guarantee.",
  },
  xray: {
    sections: [
      "Current workflow",
      "Systems involved",
      "Human handoffs",
      "Identified friction",
      "Possible automation points",
      "Possible connected architecture",
      "Questions to verify",
      "Recommended first experiment",
    ],
    company: "Company",
    companyFields: { industry: "Industry", size: "Size", locations: "Locations", offering: "Offering" },
    stated: "Stated",
    inferred: "Inferred",
    statedNote: "you said this",
    inferredNote: "the Operator’s reading — check it",
    levels: [
      "Leave manual",
      "Workflow automation",
      "System integration",
      "Operational software / ERP",
      "AI-assisted workflow",
      "Agentic workflow",
      "Physical/digital integration",
    ],
    approach: "Approach",
    scope: "Scope",
    successMeasure: "Success measure",
    none: "None noted",
  },
  brief: {
    title: "Audit brief",
    greeting: "Hi Savin Group, here is a brief of our workflow. I would like to discuss it.",
    fields: {
      summary: "Summary",
      company: "Company",
      contact: "Contact",
      industry: "Industry",
      currentSystems: "Current systems",
      currentWorkflow: "Current workflow",
      primaryProblem: "Primary problem",
      observedFriction: "Observed friction",
      desiredOutcome: "Desired outcome",
      potentialArchitecture: "Potential architecture",
      unknowns: "Unknowns",
      urgency: "Urgency",
      relevantCapabilities: "Relevant capabilities",
    },
    contact: { name: "Name", role: "Role", email: "Email", phone: "Phone" },
    capabilities: {
      ai: "AI & intelligent agents",
      automation: "Business & workflow automation",
      erp: "ERP & business systems",
      industrial: "Industrial IoT",
      software: "Custom software",
      integrations: "APIs & system integrations",
      data: "Data & analytics",
      platforms: "Custom digital platforms",
    },
    truncated: "…(full brief: use Copy or Download)",
    sendTo: "Send to",
    notice: "Nothing has been sent. Review it, then send it to Savin yourself.",
    whatsapp: "Open in WhatsApp",
    email: "Open in email",
    newTab: "opens in a new tab",
    to: "To",
  },
  actions: {
    copy: "Copy",
    copyText: "Copy as text",
    copied: "Copied",
    copyFailed: "Could not copy. Select the text and copy it manually.",
    download: "Download .md",
  },
  sources: { label: "Sources" },
  fallback: { unavailable: "This visual could not be displayed." },
};

const TRANSLATIONS: Record<Exclude<Locale, "en">, CopyPatch> = {
  es: {
    eyebrows: { mapToday: "Mapa · Hoy", mapConnected: "Mapa · Conectado", simulation: "Simulación", estimate: "Estimación", xray: "Radiografía del negocio", brief: "Resumen para la auditoría" },
    graph: {
      today: "Hoy",
      connected: "Conectado",
      compare: "Comparar el flujo actual con uno conectado",
      listView: "Vista de lista",
      listNote: "Se muestra como lista para ajustarse a este ancho.",
      legend: "Leyenda",
      friction: "Fricción",
      frictionPoint: "Punto de fricción",
      edgeTo: "hacia {to}",
      between: "de {from} a {to}",
      loopsBack: "vuelve atrás",
      end: "Fin de este recorrido",
      tags: { manual: "Manual", ai: "IA", approval: "Aprobación" },
      modes: { manual: "Traspaso manual", automated: "Automatizado", integration: "Integración", ai_assisted: "Asistido por IA", approval: "Aprobación humana", physical: "Físico" },
      kinds: { trigger: "Disparador", person: "Persona", team: "Equipo", software: "Software", spreadsheet: "Hoja de cálculo", messaging: "Mensajería", data: "Datos", machine: "Máquina", decision: "Decisión", ai: "IA", action: "Acción", result: "Resultado" },
    },
    sim: {
      disclaimer: "Escenario ilustrativo con datos de ejemplo. No hay ningún sistema real conectado.",
      steps: "Pasos del escenario",
      play: "Reproducir la simulación",
      pause: "Pausar la simulación",
      restart: "Reiniciar la simulación",
      previous: "Paso anterior",
      next: "Paso siguiente",
      stepOf: "Paso {n} de {total}",
      gateTitle: "Se requiere aprobación humana",
      gateBody: "La simulación espera aquí hasta que una persona apruebe este paso.",
      approve: "Aprobar (simulado)",
      approved: "Aprobado (simulado)",
      consequential: "Con consecuencias",
      record: "Registro de ejemplo",
      noRecord: "Este paso no tiene valores de ejemplo.",
      outcome: "Resultado",
      complete: "Simulación completada",
      manualHint: "La reproducción automática está desactivada. Avanza con Anterior y Siguiente.",
      actorKinds: { person: "Persona", system: "Sistema", ai: "IA", machine: "Máquina", external: "Parte externa" },
      stepKinds: { event: "Evento", check: "Comprobación", decision: "Decisión", approval: "Aprobación", action: "Acción", alert: "Alerta", record: "Registro" },
    },
    impact: {
      perMonth: "Horas de personal al mes",
      perYear: "Horas de personal al año",
      released: "Horas que podrían liberarse al mes",
      reduction: "Con una reducción del {pct} %",
      assumed: "Supuesto",
      yours: "Tu dato",
      monthlyCost: "Coste de este tiempo al mes",
      releasedCost: "Valor del tiempo liberado al mes",
      rate: "A {amount} por hora",
      assumedRate: "Tarifa supuesta",
      breakdown: "Desglose",
      activity: "Actividad",
      people: "Personas",
      time: "Tiempo",
      frequency: "Frecuencia",
      hoursPerMonth: "Horas / mes",
      total: "Total",
      per: { day: "{n}× / día", week: "{n}× / semana", month: "{n}× / mes" },
      workingDays: "{n} días laborables al mes",
      peopleCount: { one: "{n} persona", other: "{n} personas" },
      assumedActivity: "{label}: {parts}",
      assumedMinutes: "{n} min cada vez",
      listSeparator: ", ",
      assumedReduction: "El cambio propuesto elimina el {pct} % de este tiempo",
      assumedCost: "Coste del personal de {amount} por hora",
      roundingNote: "Las filas se redondean a un decimal; el total se calcula antes de redondear.",
      assumptions: "Supuestos",
      disclaimer: "Estimación con las cifras de esta conversación. Compruébalas antes de asignarles un valor económico: no es un presupuesto ni una garantía.",
    },
    xray: {
      sections: ["Flujo de trabajo actual", "Sistemas implicados", "Traspasos entre personas", "Fricción identificada", "Posibles puntos de automatización", "Posible arquitectura conectada", "Preguntas por verificar", "Primer experimento recomendado"],
      company: "Empresa",
      companyFields: { industry: "Sector", size: "Tamaño", locations: "Ubicaciones", offering: "Oferta" },
      stated: "Declarado",
      inferred: "Inferido",
      statedNote: "lo dijiste tú",
      inferredNote: "interpretación del Operator; compruébala",
      levels: ["Dejar manual", "Automatización de flujos", "Integración de sistemas", "Software operativo / ERP", "Flujo asistido por IA", "Flujo con agentes", "Integración físico-digital"],
      approach: "Enfoque",
      scope: "Alcance",
      successMeasure: "Medida de éxito",
      none: "Nada indicado",
    },
    brief: {
      title: "Resumen para la auditoría",
      greeting: "Hola, Savin Group. Les envío un resumen de nuestro flujo de trabajo; me gustaría comentarlo.",
      fields: { summary: "Resumen", company: "Empresa", contact: "Contacto", industry: "Sector", currentSystems: "Sistemas actuales", currentWorkflow: "Flujo de trabajo actual", primaryProblem: "Problema principal", observedFriction: "Fricción observada", desiredOutcome: "Resultado deseado", potentialArchitecture: "Arquitectura posible", unknowns: "Incógnitas", urgency: "Urgencia", relevantCapabilities: "Capacidades relevantes" },
      contact: { name: "Nombre", role: "Cargo", email: "Correo", phone: "Teléfono" },
      capabilities: { ai: "IA y agentes inteligentes", automation: "Automatización de procesos", erp: "ERP y sistemas de negocio", industrial: "IoT industrial", software: "Software a medida", integrations: "APIs e integraciones", data: "Datos y analítica", platforms: "Plataformas digitales" },
      truncated: "…(resumen completo: usa Copiar o Descargar)",
      sendTo: "Enviar a",
      notice: "No se ha enviado nada. Revísalo y envíaselo tú mismo a Savin.",
      whatsapp: "Abrir en WhatsApp",
      email: "Abrir en el correo",
      newTab: "se abre en una pestaña nueva",
      to: "Para",
    },
    actions: { copy: "Copiar", copyText: "Copiar como texto", copied: "Copiado", copyFailed: "No se pudo copiar. Selecciona el texto y cópialo manualmente.", download: "Descargar .md" },
    sources: { label: "Fuentes" },
    fallback: { unavailable: "No se pudo mostrar este elemento visual." },
  },
  fr: {
    eyebrows: { mapToday: "Carte · Aujourd’hui", mapConnected: "Carte · Connectée", simulation: "Simulation", estimate: "Estimation", xray: "Radiographie de l’entreprise", brief: "Brief d’audit" },
    graph: {
      today: "Aujourd’hui",
      connected: "Connecté",
      compare: "Comparer le fonctionnement actuel à un flux connecté",
      listView: "Vue en liste",
      listNote: "Affiché en liste pour tenir dans cette largeur.",
      legend: "Légende",
      friction: "Frictions",
      frictionPoint: "Point de friction",
      edgeTo: "vers {to}",
      between: "de {from} vers {to}",
      loopsBack: "revient en arrière",
      end: "Fin de ce parcours",
      tags: { manual: "Manuel", ai: "IA", approval: "Validation" },
      modes: { manual: "Transmission manuelle", automated: "Automatisé", integration: "Intégration", ai_assisted: "Assisté par IA", approval: "Validation humaine", physical: "Physique" },
      kinds: { trigger: "Déclencheur", person: "Personne", team: "Équipe", software: "Logiciel", spreadsheet: "Tableur", messaging: "Messagerie", data: "Données", machine: "Machine", decision: "Décision", ai: "IA", action: "Action", result: "Résultat" },
    },
    sim: {
      disclaimer: "Scénario illustratif avec des données d’exemple. Aucun système réel n’est connecté.",
      steps: "Étapes du scénario",
      play: "Lancer la simulation",
      pause: "Mettre la simulation en pause",
      restart: "Recommencer la simulation",
      previous: "Étape précédente",
      next: "Étape suivante",
      stepOf: "Étape {n} sur {total}",
      gateTitle: "Validation humaine requise",
      gateBody: "La simulation attend ici qu’une personne valide cette étape.",
      approve: "Valider (simulation)",
      approved: "Validé (simulation)",
      consequential: "À conséquences",
      record: "Enregistrement d’exemple",
      noRecord: "Aucune valeur d’exemple à cette étape.",
      outcome: "Résultat",
      complete: "Simulation terminée",
      manualHint: "Lecture automatique désactivée. Avancez avec Précédent et Suivant.",
      actorKinds: { person: "Personne", system: "Système", ai: "IA", machine: "Machine", external: "Partie externe" },
      stepKinds: { event: "Événement", check: "Contrôle", decision: "Décision", approval: "Validation", action: "Action", alert: "Alerte", record: "Enregistrement" },
    },
    impact: {
      perMonth: "Heures de travail par mois",
      perYear: "Heures de travail par an",
      released: "Heures libérables par mois",
      reduction: "Avec une réduction de {pct} %",
      assumed: "Hypothèse",
      yours: "Votre chiffre",
      monthlyCost: "Coût de ce temps par mois",
      releasedCost: "Valeur du temps libéré par mois",
      rate: "À {amount} de l’heure",
      assumedRate: "Taux supposé",
      breakdown: "Détail",
      activity: "Activité",
      people: "Personnes",
      time: "Durée",
      frequency: "Fréquence",
      hoursPerMonth: "Heures / mois",
      total: "Total",
      per: { day: "{n}× / jour", week: "{n}× / semaine", month: "{n}× / mois" },
      workingDays: "{n} jours ouvrés par mois",
      peopleCount: { one: "{n} personne", other: "{n} personnes" },
      assumedActivity: "{label} : {parts}",
      assumedMinutes: "{n} min à chaque fois",
      listSeparator: ", ",
      assumedReduction: "{pct} % de ce temps supprimé par le changement proposé",
      assumedCost: "Coût du personnel de {amount} de l’heure",
      roundingNote: "Les lignes sont arrondies à une décimale ; le total est calculé avant arrondi.",
      assumptions: "Hypothèses",
      disclaimer: "Estimation fondée sur les chiffres de cette conversation. Vérifiez-les avant d’y associer une valeur financière : ce n’est ni un devis ni une garantie.",
    },
    xray: {
      sections: ["Fonctionnement actuel", "Systèmes concernés", "Transmissions entre personnes", "Frictions identifiées", "Automatisations possibles", "Architecture connectée possible", "Questions à vérifier", "Première expérimentation recommandée"],
      company: "Entreprise",
      companyFields: { industry: "Secteur", size: "Taille", locations: "Sites", offering: "Offre" },
      stated: "Déclaré",
      inferred: "Déduit",
      statedNote: "vous l’avez dit",
      inferredNote: "lecture de l’Operator, à vérifier",
      levels: ["Laisser manuel", "Automatisation des flux", "Intégration des systèmes", "Logiciel opérationnel / ERP", "Flux assisté par IA", "Flux agentique", "Intégration physique-numérique"],
      approach: "Approche",
      scope: "Périmètre",
      successMeasure: "Critère de réussite",
      none: "Rien de signalé",
    },
    brief: {
      title: "Brief d’audit",
      greeting: "Bonjour Savin Group, voici un résumé de notre fonctionnement. J’aimerais en discuter avec vous.",
      fields: { summary: "Résumé", company: "Entreprise", contact: "Contact", industry: "Secteur", currentSystems: "Systèmes actuels", currentWorkflow: "Fonctionnement actuel", primaryProblem: "Problème principal", observedFriction: "Frictions observées", desiredOutcome: "Résultat souhaité", potentialArchitecture: "Architecture envisageable", unknowns: "Points inconnus", urgency: "Urgence", relevantCapabilities: "Compétences concernées" },
      contact: { name: "Nom", role: "Fonction", email: "E-mail", phone: "Téléphone" },
      capabilities: { ai: "IA et agents intelligents", automation: "Automatisation métier", erp: "ERP et systèmes métier", industrial: "IoT industriel", software: "Logiciels sur mesure", integrations: "APIs et intégrations", data: "Données et analytique", platforms: "Plateformes numériques" },
      truncated: "…(brief complet : utilisez Copier ou Télécharger)",
      sendTo: "Envoyer à",
      notice: "Rien n’a été envoyé. Relisez-le, puis envoyez-le vous-même à Savin.",
      whatsapp: "Ouvrir dans WhatsApp",
      email: "Ouvrir dans la messagerie",
      newTab: "s’ouvre dans un nouvel onglet",
      to: "À",
    },
    actions: { copy: "Copier", copyText: "Copier le texte", copied: "Copié", copyFailed: "Copie impossible. Sélectionnez le texte et copiez-le manuellement.", download: "Télécharger .md" },
    sources: { label: "Sources" },
    fallback: { unavailable: "Impossible d’afficher ce visuel." },
  },
  de: {
    eyebrows: { mapToday: "Karte · Heute", mapConnected: "Karte · Vernetzt", simulation: "Simulation", estimate: "Schätzung", xray: "Business-Röntgenbild", brief: "Audit-Briefing" },
    graph: {
      today: "Heute",
      connected: "Vernetzt",
      compare: "Heutigen Ablauf mit einem vernetzten Ablauf vergleichen",
      listView: "Listenansicht",
      listNote: "Als Liste dargestellt, damit es in diese Breite passt.",
      legend: "Legende",
      friction: "Reibungspunkte",
      frictionPoint: "Reibungspunkt",
      edgeTo: "zu {to}",
      between: "von {from} zu {to}",
      loopsBack: "führt zurück",
      end: "Ende dieses Pfads",
      tags: { manual: "Manuell", ai: "KI", approval: "Freigabe" },
      modes: { manual: "Manuelle Übergabe", automated: "Automatisiert", integration: "Integration", ai_assisted: "KI-gestützt", approval: "Menschliche Freigabe", physical: "Physisch" },
      kinds: { trigger: "Auslöser", person: "Person", team: "Team", software: "Software", spreadsheet: "Tabelle", messaging: "Messaging", data: "Daten", machine: "Maschine", decision: "Entscheidung", ai: "KI", action: "Aktion", result: "Ergebnis" },
    },
    sim: {
      disclaimer: "Illustratives Szenario mit Beispieldaten. Es ist kein echtes System angebunden.",
      steps: "Schritte des Szenarios",
      play: "Simulation abspielen",
      pause: "Simulation pausieren",
      restart: "Simulation neu starten",
      previous: "Vorheriger Schritt",
      next: "Nächster Schritt",
      stepOf: "Schritt {n} von {total}",
      gateTitle: "Menschliche Freigabe erforderlich",
      gateBody: "Die Simulation wartet hier, bis eine Person diesen Schritt freigibt.",
      approve: "Freigeben (simuliert)",
      approved: "Freigegeben (simuliert)",
      consequential: "Folgenreich",
      record: "Beispieldatensatz",
      noRecord: "Für diesen Schritt gibt es keine Beispielwerte.",
      outcome: "Ergebnis",
      complete: "Simulation abgeschlossen",
      manualHint: "Automatische Wiedergabe ist aus. Mit „Vorheriger Schritt“ und „Nächster Schritt“ durch die Schritte gehen.",
      actorKinds: { person: "Person", system: "System", ai: "KI", machine: "Maschine", external: "Externe Partei" },
      stepKinds: { event: "Ereignis", check: "Prüfung", decision: "Entscheidung", approval: "Freigabe", action: "Aktion", alert: "Warnung", record: "Datensatz" },
    },
    impact: {
      perMonth: "Arbeitsstunden pro Monat",
      perYear: "Arbeitsstunden pro Jahr",
      released: "Stunden, die pro Monat frei werden könnten",
      reduction: "Bei {pct} % Reduktion",
      assumed: "Annahme",
      yours: "Ihre Angabe",
      monthlyCost: "Kosten dieser Zeit pro Monat",
      releasedCost: "Wert der frei werdenden Zeit pro Monat",
      rate: "Bei {amount} pro Stunde",
      assumedRate: "Angenommener Satz",
      breakdown: "Aufschlüsselung",
      activity: "Tätigkeit",
      people: "Personen",
      time: "Dauer",
      frequency: "Häufigkeit",
      hoursPerMonth: "Std. / Monat",
      total: "Summe",
      minutes: "{n} Min.",
      per: { day: "{n}× / Tag", week: "{n}× / Woche", month: "{n}× / Monat" },
      workingDays: "{n} Arbeitstage pro Monat",
      peopleCount: { one: "{n} Person", other: "{n} Personen" },
      assumedActivity: "{label}: {parts}",
      assumedMinutes: "jeweils {n} Min.",
      listSeparator: ", ",
      assumedReduction: "{pct} % dieser Zeit entfallen durch die vorgeschlagene Änderung",
      assumedCost: "Personalkosten von {amount} pro Stunde",
      roundingNote: "Die Zeilen sind auf eine Nachkommastelle gerundet; die Summe wird vor dem Runden berechnet.",
      assumptions: "Annahmen",
      disclaimer: "Schätzung auf Basis der Zahlen aus diesem Gespräch. Prüfen Sie sie, bevor Sie einen finanziellen Wert daraus ableiten – dies ist weder ein Angebot noch eine Garantie.",
    },
    xray: {
      sections: ["Aktueller Ablauf", "Beteiligte Systeme", "Übergaben zwischen Personen", "Erkannte Reibungspunkte", "Mögliche Automatisierungspunkte", "Mögliche vernetzte Architektur", "Zu klärende Fragen", "Empfohlenes erstes Experiment"],
      company: "Unternehmen",
      companyFields: { industry: "Branche", size: "Größe", locations: "Standorte", offering: "Angebot" },
      stated: "Genannt",
      inferred: "Abgeleitet",
      statedNote: "von Ihnen genannt",
      inferredNote: "Einschätzung des Operators – bitte prüfen",
      levels: ["Manuell belassen", "Workflow-Automatisierung", "Systemintegration", "Betriebssoftware / ERP", "KI-gestützter Workflow", "Agentischer Workflow", "Physisch-digitale Integration"],
      approach: "Ansatz",
      scope: "Umfang",
      successMeasure: "Erfolgskriterium",
      none: "Nichts angegeben",
    },
    brief: {
      title: "Audit-Briefing",
      greeting: "Hallo Savin Group, anbei eine Zusammenfassung unseres Ablaufs. Ich würde gern mit Ihnen darüber sprechen.",
      fields: { summary: "Zusammenfassung", company: "Unternehmen", contact: "Kontakt", industry: "Branche", currentSystems: "Aktuelle Systeme", currentWorkflow: "Aktueller Ablauf", primaryProblem: "Hauptproblem", observedFriction: "Beobachtete Reibungspunkte", desiredOutcome: "Gewünschtes Ergebnis", potentialArchitecture: "Mögliche Architektur", unknowns: "Offene Punkte", urgency: "Dringlichkeit", relevantCapabilities: "Relevante Leistungen" },
      contact: { name: "Name", role: "Funktion", email: "E-Mail", phone: "Telefon" },
      capabilities: { ai: "KI und intelligente Agenten", automation: "Geschäftsautomatisierung", erp: "ERP und Geschäftssysteme", industrial: "Industrielles IoT", software: "Individuelle Software", integrations: "APIs und Integrationen", data: "Daten und Analysen", platforms: "Digitale Plattformen" },
      truncated: "…(vollständiges Briefing: Kopieren oder Herunterladen nutzen)",
      sendTo: "Senden an",
      notice: "Es wurde nichts gesendet. Prüfen Sie es und senden Sie es dann selbst an Savin.",
      whatsapp: "In WhatsApp öffnen",
      email: "Im E-Mail-Programm öffnen",
      newTab: "öffnet in einem neuen Tab",
      to: "An",
    },
    actions: { copy: "Kopieren", copyText: "Als Text kopieren", copied: "Kopiert", copyFailed: "Kopieren fehlgeschlagen. Markieren Sie den Text und kopieren Sie ihn manuell.", download: ".md herunterladen" },
    sources: { label: "Quellen" },
    fallback: { unavailable: "Diese Darstellung konnte nicht angezeigt werden." },
  },
  ar: {
    eyebrows: { mapToday: "الخريطة · اليوم", mapConnected: "الخريطة · بعد الربط", simulation: "محاكاة", estimate: "تقدير", xray: "الأشعة السينية للأعمال", brief: "موجز التدقيق" },
    graph: {
      today: "اليوم",
      connected: "بعد الربط",
      compare: "قارن سير العمل الحالي بسير عمل مترابط",
      listView: "عرض القائمة",
      listNote: "معروض كقائمة ليتسع لهذا العرض.",
      legend: "دليل الرموز",
      friction: "نقاط الاحتكاك",
      frictionPoint: "نقطة احتكاك",
      edgeTo: "إلى {to}",
      between: "من {from} إلى {to}",
      loopsBack: "يعود إلى الخلف",
      end: "نهاية هذا المسار",
      tags: { manual: "يدوي", ai: "ذكاء اصطناعي", approval: "موافقة" },
      modes: { manual: "تسليم يدوي", automated: "مؤتمت", integration: "تكامل", ai_assisted: "بمساعدة الذكاء الاصطناعي", approval: "موافقة بشرية", physical: "نقل مادي" },
      kinds: { trigger: "مُحفِّز", person: "شخص", team: "فريق", software: "برنامج", spreadsheet: "جدول بيانات", messaging: "مراسلة", data: "بيانات", machine: "آلة", decision: "قرار", ai: "ذكاء اصطناعي", action: "إجراء", result: "نتيجة" },
    },
    sim: {
      disclaimer: "سيناريو توضيحي ببيانات نموذجية. لا يوجد أي نظام حقيقي متصل.",
      steps: "خطوات السيناريو",
      play: "تشغيل المحاكاة",
      pause: "إيقاف المحاكاة مؤقتًا",
      restart: "إعادة تشغيل المحاكاة",
      previous: "الخطوة السابقة",
      next: "الخطوة التالية",
      stepOf: "الخطوة {n} من {total}",
      gateTitle: "مطلوب موافقة بشرية",
      gateBody: "تتوقف المحاكاة هنا حتى يوافق شخص على هذه الخطوة.",
      approve: "موافقة (محاكاة)",
      approved: "تمت الموافقة (محاكاة)",
      consequential: "ذات عواقب",
      record: "سجل نموذجي",
      noRecord: "لا توجد قيم نموذجية في هذه الخطوة.",
      outcome: "النتيجة",
      complete: "اكتملت المحاكاة",
      manualHint: "التشغيل التلقائي متوقف. تنقّل بين الخطوات باستخدام السابق والتالي.",
      actorKinds: { person: "شخص", system: "نظام", ai: "ذكاء اصطناعي", machine: "آلة", external: "طرف خارجي" },
      stepKinds: { event: "حدث", check: "تحقق", decision: "قرار", approval: "موافقة", action: "إجراء", alert: "تنبيه", record: "سجل" },
    },
    impact: {
      perMonth: "ساعات عمل الموظفين شهريًا",
      perYear: "ساعات عمل الموظفين سنويًا",
      released: "ساعات يمكن توفيرها شهريًا",
      reduction: "عند تخفيض بنسبة {pct}%",
      assumed: "افتراض",
      yours: "رقمك",
      hours: "ساعة",
      monthlyCost: "تكلفة هذا الوقت شهريًا",
      releasedCost: "قيمة الوقت الموفَّر شهريًا",
      rate: "بسعر {amount} للساعة",
      assumedRate: "سعر مفترض",
      breakdown: "التفاصيل",
      activity: "النشاط",
      people: "الأشخاص",
      time: "المدة",
      frequency: "التكرار",
      hoursPerMonth: "ساعات / شهر",
      total: "الإجمالي",
      minutes: "{n} دقيقة",
      per: { day: "{n}× يوميًا", week: "{n}× أسبوعيًا", month: "{n}× شهريًا" },
      workingDays: "{n} يوم عمل في الشهر",
      // Arabic has all six plural forms; one and two are words, not "1 شخص".
      peopleCount: { zero: "{n} شخص", one: "شخص واحد", two: "شخصان", few: "{n} أشخاص", many: "{n} شخصًا", other: "{n} شخص" },
      assumedActivity: "{label}: {parts}",
      assumedMinutes: "{n} دقيقة في كل مرة",
      listSeparator: "، ",
      assumedReduction: "إزالة {pct}% من هذا الوقت بفضل التغيير المقترح",
      assumedCost: "تكلفة الموظفين {amount} للساعة",
      roundingNote: "الصفوف مقرَّبة إلى منزلة عشرية واحدة، ويُحسب الإجمالي قبل التقريب.",
      assumptions: "الافتراضات",
      disclaimer: "تقدير مبني على الأرقام الواردة في هذه المحادثة. تحقّق منها قبل ربطها بقيمة مالية — هذا ليس عرض سعر ولا ضمانًا.",
    },
    xray: {
      sections: ["سير العمل الحالي", "الأنظمة المعنية", "التسليم بين الأشخاص", "نقاط الاحتكاك المحددة", "نقاط الأتمتة الممكنة", "البنية المترابطة الممكنة", "أسئلة للتحقق", "التجربة الأولى المقترحة"],
      company: "الشركة",
      companyFields: { industry: "القطاع", size: "الحجم", locations: "المواقع", offering: "المنتجات والخدمات" },
      stated: "مُصرَّح به",
      inferred: "مُستنتَج",
      statedNote: "ذكرتَه أنت",
      inferredNote: "قراءة الـ Operator — تحقّق منها",
      levels: ["الإبقاء يدويًا", "أتمتة سير العمل", "تكامل الأنظمة", "برمجيات تشغيلية / ERP", "سير عمل بمساعدة الذكاء الاصطناعي", "سير عمل بالوكلاء", "تكامل مادي ورقمي"],
      approach: "النهج",
      scope: "النطاق",
      successMeasure: "مقياس النجاح",
      none: "لم يُذكر شيء",
    },
    brief: {
      title: "موجز التدقيق",
      greeting: "مرحبًا Savin Group، هذا موجز لسير العمل لدينا، وأودّ مناقشته معكم.",
      fields: { summary: "الملخص", company: "الشركة", contact: "جهة الاتصال", industry: "القطاع", currentSystems: "الأنظمة الحالية", currentWorkflow: "سير العمل الحالي", primaryProblem: "المشكلة الرئيسية", observedFriction: "نقاط الاحتكاك الملحوظة", desiredOutcome: "النتيجة المرجوة", potentialArchitecture: "البنية المحتملة", unknowns: "أمور غير معروفة", urgency: "مدى الاستعجال", relevantCapabilities: "القدرات ذات الصلة" },
      contact: { name: "الاسم", role: "الدور", email: "البريد الإلكتروني", phone: "الهاتف" },
      capabilities: { ai: "الذكاء الاصطناعي والوكلاء", automation: "أتمتة الأعمال والتدفقات", erp: "ERP وأنظمة الأعمال", industrial: "إنترنت الأشياء الصناعي", software: "برمجيات مخصصة", integrations: "APIs وتكامل الأنظمة", data: "البيانات والتحليلات", platforms: "منصات رقمية مخصصة" },
      truncated: "…(الموجز الكامل: استخدم النسخ أو التنزيل)",
      sendTo: "أرسِل إلى",
      notice: "لم يُرسَل أي شيء. راجِعه، ثم أرسله إلى Savin بنفسك.",
      whatsapp: "فتح في واتساب",
      email: "فتح في البريد",
      newTab: "يُفتح في علامة تبويب جديدة",
      to: "إلى",
    },
    actions: { copy: "نسخ", copyText: "نسخ كنص", copied: "تم النسخ", copyFailed: "تعذّر النسخ. حدّد النص وانسخه يدويًا.", download: "تنزيل ملف Markdown" },
    sources: { label: "المصادر" },
    fallback: { unavailable: "تعذّر عرض هذا العنصر المرئي." },
  },
  hi: {
    eyebrows: { mapToday: "नक्शा · आज", mapConnected: "नक्शा · जुड़ा हुआ", simulation: "सिमुलेशन", estimate: "अनुमान", xray: "बिज़नेस एक्स-रे", brief: "ऑडिट ब्रीफ़" },
    graph: {
      today: "आज",
      connected: "जुड़ा हुआ",
      compare: "आज के वर्कफ़्लो की तुलना जुड़े हुए वर्कफ़्लो से करें",
      listView: "सूची दृश्य",
      listNote: "इस चौड़ाई में समाने के लिए सूची के रूप में दिखाया गया है।",
      legend: "संकेत",
      friction: "रुकावटें",
      frictionPoint: "रुकावट का बिंदु",
      edgeTo: "{to} की ओर",
      between: "{from} से {to} तक",
      loopsBack: "वापस लौटता है",
      end: "इस रास्ते का अंत",
      tags: { manual: "मैनुअल", ai: "AI", approval: "मंज़ूरी" },
      modes: { manual: "मैनुअल हैंडऑफ़", automated: "स्वचालित", integration: "इंटीग्रेशन", ai_assisted: "AI-सहायता से", approval: "मानवीय मंज़ूरी", physical: "भौतिक" },
      kinds: { trigger: "ट्रिगर", person: "व्यक्ति", team: "टीम", software: "सॉफ़्टवेयर", spreadsheet: "स्प्रेडशीट", messaging: "मैसेजिंग", data: "डेटा", machine: "मशीन", decision: "निर्णय", ai: "AI", action: "कार्रवाई", result: "परिणाम" },
    },
    sim: {
      disclaimer: "नमूना डेटा के साथ एक उदाहरण परिदृश्य। कोई वास्तविक सिस्टम जुड़ा नहीं है।",
      steps: "परिदृश्य के चरण",
      play: "सिमुलेशन चलाएँ",
      pause: "सिमुलेशन रोकें",
      restart: "सिमुलेशन फिर से शुरू करें",
      previous: "पिछला चरण",
      next: "अगला चरण",
      stepOf: "चरण {n} / {total}",
      gateTitle: "मानवीय मंज़ूरी ज़रूरी है",
      gateBody: "जब तक कोई व्यक्ति इस चरण को मंज़ूरी नहीं देता, सिमुलेशन यहीं रुका रहेगा।",
      approve: "मंज़ूरी दें (सिमुलेटेड)",
      approved: "मंज़ूर (सिमुलेटेड)",
      consequential: "गंभीर असर वाला",
      record: "नमूना रिकॉर्ड",
      noRecord: "इस चरण में कोई नमूना मान नहीं है।",
      outcome: "परिणाम",
      complete: "सिमुलेशन पूरा हुआ",
      manualHint: "ऑटोप्ले बंद है। पिछला और अगला बटन से आगे बढ़ें।",
      actorKinds: { person: "व्यक्ति", system: "सिस्टम", ai: "AI", machine: "मशीन", external: "बाहरी पक्ष" },
      stepKinds: { event: "घटना", check: "जाँच", decision: "निर्णय", approval: "मंज़ूरी", action: "कार्रवाई", alert: "अलर्ट", record: "रिकॉर्ड" },
    },
    impact: {
      perMonth: "प्रति माह स्टाफ़-घंटे",
      perYear: "प्रति वर्ष स्टाफ़-घंटे",
      released: "प्रति माह बचाए जा सकने वाले घंटे",
      reduction: "{pct}% कमी पर",
      assumed: "मान लिया गया",
      yours: "आपका आँकड़ा",
      hours: "घंटे",
      monthlyCost: "इस समय की मासिक लागत",
      releasedCost: "बचे हुए समय का मासिक मूल्य",
      rate: "{amount} प्रति घंटे की दर से",
      assumedRate: "मान ली गई दर",
      breakdown: "विवरण",
      activity: "गतिविधि",
      people: "लोग",
      time: "समय",
      frequency: "आवृत्ति",
      hoursPerMonth: "घंटे / माह",
      total: "कुल",
      minutes: "{n} मिनट",
      per: { day: "{n}× / दिन", week: "{n}× / सप्ताह", month: "{n}× / माह" },
      workingDays: "प्रति माह {n} कार्यदिवस",
      peopleCount: { one: "{n} व्यक्ति", other: "{n} लोग" },
      assumedActivity: "{label}: {parts}",
      assumedMinutes: "हर बार {n} मिनट",
      listSeparator: ", ",
      assumedReduction: "प्रस्तावित बदलाव से इस समय का {pct}% कम होगा",
      assumedCost: "स्टाफ़ की लागत {amount} प्रति घंटा",
      roundingNote: "पंक्तियाँ एक दशमलव तक पूर्णांकित हैं; कुल योग पूर्णांकन से पहले निकाला गया है।",
      assumptions: "मान्यताएँ",
      disclaimer: "इस बातचीत में दिए गए आँकड़ों पर आधारित अनुमान। कोई वित्तीय मूल्य जोड़ने से पहले इन्हें जाँच लें — यह कोटेशन या गारंटी नहीं है।",
    },
    xray: {
      sections: ["मौजूदा वर्कफ़्लो", "शामिल सिस्टम", "लोगों के बीच हैंडऑफ़", "पहचानी गई रुकावटें", "संभावित ऑटोमेशन बिंदु", "संभावित जुड़ी हुई संरचना", "जाँचने योग्य प्रश्न", "सुझाया गया पहला प्रयोग"],
      company: "कंपनी",
      companyFields: { industry: "उद्योग", size: "आकार", locations: "स्थान", offering: "पेशकश" },
      stated: "बताया गया",
      inferred: "अनुमानित",
      statedNote: "यह आपने बताया",
      inferredNote: "Operator का आकलन — इसे जाँच लें",
      levels: ["मैनुअल ही रहने दें", "वर्कफ़्लो ऑटोमेशन", "सिस्टम इंटीग्रेशन", "ऑपरेशनल सॉफ़्टवेयर / ERP", "AI-सहायता वाला वर्कफ़्लो", "एजेंटिक वर्कफ़्लो", "भौतिक/डिजिटल इंटीग्रेशन"],
      approach: "तरीका",
      scope: "दायरा",
      successMeasure: "सफलता का पैमाना",
      none: "कुछ नहीं बताया गया",
    },
    brief: {
      title: "ऑडिट ब्रीफ़",
      greeting: "नमस्ते Savin Group, यह हमारे वर्कफ़्लो का संक्षिप्त विवरण है। हम इस पर चर्चा करना चाहते हैं।",
      fields: { summary: "सारांश", company: "कंपनी", contact: "संपर्क", industry: "उद्योग", currentSystems: "मौजूदा सिस्टम", currentWorkflow: "मौजूदा वर्कफ़्लो", primaryProblem: "मुख्य समस्या", observedFriction: "देखी गई रुकावटें", desiredOutcome: "अपेक्षित परिणाम", potentialArchitecture: "संभावित संरचना", unknowns: "अज्ञात बातें", urgency: "तात्कालिकता", relevantCapabilities: "संबंधित क्षमताएँ" },
      contact: { name: "नाम", role: "भूमिका", email: "ईमेल", phone: "फ़ोन" },
      capabilities: { ai: "AI और बुद्धिमान एजेंट", automation: "व्यवसाय और वर्कफ़्लो स्वचालन", erp: "ERP और व्यावसायिक सिस्टम", industrial: "औद्योगिक IoT", software: "कस्टम सॉफ़्टवेयर", integrations: "APIs और सिस्टम इंटीग्रेशन", data: "डेटा और एनालिटिक्स", platforms: "कस्टम डिजिटल प्लेटफ़ॉर्म" },
      truncated: "…(पूरा ब्रीफ़: कॉपी या डाउनलोड करें)",
      sendTo: "इन्हें भेजें",
      notice: "कुछ भी नहीं भेजा गया है। इसे जाँच लें, फिर ख़ुद Savin को भेजें।",
      whatsapp: "WhatsApp में खोलें",
      email: "ईमेल में खोलें",
      newTab: "नए टैब में खुलता है",
      to: "प्राप्तकर्ता",
    },
    actions: { copy: "कॉपी करें", copyText: "टेक्स्ट के रूप में कॉपी करें", copied: "कॉपी हो गया", copyFailed: "कॉपी नहीं हो सका। टेक्स्ट चुनकर ख़ुद कॉपी करें।", download: ".md डाउनलोड करें" },
    sources: { label: "स्रोत" },
    fallback: { unavailable: "यह विज़ुअल दिखाया नहीं जा सका।" },
  },
  zh: {
    eyebrows: { mapToday: "流程图 · 现状", mapConnected: "流程图 · 互联后", simulation: "模拟", estimate: "估算", xray: "业务透视", brief: "诊断简报" },
    graph: {
      today: "现状",
      connected: "互联后",
      compare: "对比现有流程与互联流程",
      listView: "列表视图",
      listNote: "为适应当前宽度，以列表显示。",
      legend: "图例",
      friction: "摩擦点",
      frictionPoint: "摩擦点",
      edgeTo: "至 {to}",
      between: "从 {from} 至 {to}",
      loopsBack: "返回前面的环节",
      end: "此路径结束",
      tags: { manual: "人工", ai: "AI", approval: "审批" },
      modes: { manual: "人工交接", automated: "自动化", integration: "系统集成", ai_assisted: "AI 辅助", approval: "人工审批", physical: "实物流转" },
      kinds: { trigger: "触发", person: "人员", team: "团队", software: "软件", spreadsheet: "电子表格", messaging: "消息", data: "数据", machine: "机器", decision: "决策", ai: "AI", action: "操作", result: "结果" },
    },
    sim: {
      disclaimer: "使用示例数据的示意场景，未连接任何真实系统。",
      steps: "场景步骤",
      play: "播放模拟",
      pause: "暂停模拟",
      restart: "重新开始模拟",
      previous: "上一步",
      next: "下一步",
      stepOf: "第 {n} 步，共 {total} 步",
      gateTitle: "需要人工审批",
      gateBody: "模拟将在此暂停，直到有人批准这一步。",
      approve: "批准（模拟）",
      approved: "已批准（模拟）",
      consequential: "影响重大",
      record: "示例记录",
      noRecord: "此步骤没有示例数据。",
      outcome: "结果",
      complete: "模拟完成",
      manualHint: "自动播放已关闭，请使用“上一步”和“下一步”逐步查看。",
      actorKinds: { person: "人员", system: "系统", ai: "AI", machine: "机器", external: "外部方" },
      stepKinds: { event: "事件", check: "检查", decision: "决策", approval: "审批", action: "操作", alert: "提醒", record: "记录" },
    },
    impact: {
      perMonth: "每月人工工时",
      perYear: "每年人工工时",
      released: "每月可释放的工时",
      reduction: "按减少 {pct}% 计算",
      assumed: "假设",
      yours: "您提供的数据",
      hours: "小时",
      monthlyCost: "这些工时的每月成本",
      releasedCost: "释放工时的每月价值",
      rate: "按每小时 {amount} 计算",
      assumedRate: "假设费率",
      breakdown: "明细",
      activity: "工作内容",
      people: "人数",
      time: "耗时",
      frequency: "频率",
      hoursPerMonth: "小时 / 月",
      total: "合计",
      minutes: "{n} 分钟",
      per: { day: "每天 {n} 次", week: "每周 {n} 次", month: "每月 {n} 次" },
      workingDays: "每月 {n} 个工作日",
      peopleCount: { other: "{n} 人" },
      assumedActivity: "{label}：{parts}",
      assumedMinutes: "每次 {n} 分钟",
      listSeparator: "，",
      assumedReduction: "拟议的改变可减少其中 {pct}% 的时间",
      assumedCost: "人工成本每小时 {amount}",
      roundingNote: "各行已四舍五入到一位小数；合计按四舍五入前的数值计算。",
      assumptions: "假设条件",
      disclaimer: "此估算基于本次对话中的数字。在据此评估财务价值之前请先核实——这不是报价，也不是保证。",
    },
    xray: {
      sections: ["当前流程", "涉及的系统", "人工交接", "已识别的摩擦点", "可能的自动化环节", "可能的互联架构", "待确认的问题", "建议的首个试验"],
      company: "公司",
      companyFields: { industry: "行业", size: "规模", locations: "地点", offering: "业务内容" },
      stated: "已说明",
      inferred: "推断",
      statedNote: "由您提供",
      inferredNote: "Operator 的推断，请核实",
      levels: ["保持人工", "工作流自动化", "系统集成", "运营软件 / ERP", "AI 辅助工作流", "智能体工作流", "实体与数字集成"],
      approach: "方法",
      scope: "范围",
      successMeasure: "成功标准",
      none: "未提及",
    },
    brief: {
      title: "诊断简报",
      greeting: "您好，Savin Group：以下是我们工作流程的简要说明，希望与您进一步沟通。",
      fields: { summary: "摘要", company: "公司", contact: "联系人", industry: "行业", currentSystems: "现有系统", currentWorkflow: "当前流程", primaryProblem: "主要问题", observedFriction: "观察到的摩擦点", desiredOutcome: "期望结果", potentialArchitecture: "可能的架构", unknowns: "待确认事项", urgency: "紧迫程度", relevantCapabilities: "相关能力" },
      contact: { name: "姓名", role: "职位", email: "邮箱", phone: "电话" },
      capabilities: { ai: "AI 与智能体", automation: "业务与工作流自动化", erp: "ERP 与业务系统", industrial: "工业物联网", software: "定制软件", integrations: "APIs 与系统集成", data: "数据与分析", platforms: "定制数字平台" },
      truncated: "…（完整简报请使用“复制”或“下载”）",
      sendTo: "发送至",
      notice: "尚未发送任何内容。请先检查，再由您自己发送给 Savin。",
      whatsapp: "在 WhatsApp 中打开",
      email: "在邮件中打开",
      newTab: "在新标签页中打开",
      to: "收件方",
    },
    actions: { copy: "复制", copyText: "复制为文本", copied: "已复制", copyFailed: "无法复制，请选中文本后手动复制。", download: "下载 .md" },
    sources: { label: "来源" },
    fallback: { unavailable: "无法显示此可视内容。" },
  },
  gu: {
    eyebrows: { mapToday: "નકશો · આજે", mapConnected: "નકશો · જોડાયેલું", simulation: "સિમ્યુલેશન", estimate: "અંદાજ", xray: "બિઝનેસ એક્સ-રે", brief: "ઑડિટ બ્રીફ" },
    graph: {
      today: "આજે",
      connected: "જોડાયેલું",
      compare: "આજના વર્કફ્લોની તુલના જોડાયેલા વર્કફ્લો સાથે કરો",
      listView: "યાદી દૃશ્ય",
      listNote: "આ પહોળાઈમાં સમાય તે માટે યાદી રૂપે બતાવ્યું છે.",
      legend: "સંકેતો",
      friction: "અવરોધો",
      frictionPoint: "અવરોધનું બિંદુ",
      edgeTo: "{to} તરફ",
      between: "{from}થી {to} સુધી",
      loopsBack: "પાછું ફરે છે",
      end: "આ માર્ગનો અંત",
      tags: { manual: "મેન્યુઅલ", ai: "AI", approval: "મંજૂરી" },
      modes: { manual: "મેન્યુઅલ હૅન્ડઑફ", automated: "સ્વચાલિત", integration: "ઇન્ટિગ્રેશન", ai_assisted: "AI-સહાયિત", approval: "માનવ મંજૂરી", physical: "ભૌતિક" },
      kinds: { trigger: "ટ્રિગર", person: "વ્યક્તિ", team: "ટીમ", software: "સૉફ્ટવેર", spreadsheet: "સ્પ્રેડશીટ", messaging: "મેસેજિંગ", data: "ડેટા", machine: "મશીન", decision: "નિર્ણય", ai: "AI", action: "કાર્યવાહી", result: "પરિણામ" },
    },
    sim: {
      disclaimer: "નમૂના ડેટા સાથેનું ઉદાહરણરૂપ દૃશ્ય. કોઈ વાસ્તવિક સિસ્ટમ જોડાયેલી નથી.",
      steps: "દૃશ્યનાં પગલાં",
      play: "સિમ્યુલેશન ચલાવો",
      pause: "સિમ્યુલેશન થોભાવો",
      restart: "સિમ્યુલેશન ફરી શરૂ કરો",
      previous: "પાછલું પગલું",
      next: "આગલું પગલું",
      stepOf: "પગલું {n} / {total}",
      gateTitle: "માનવ મંજૂરી જરૂરી છે",
      gateBody: "કોઈ વ્યક્તિ આ પગલાને મંજૂરી ન આપે ત્યાં સુધી સિમ્યુલેશન અહીં રાહ જોશે.",
      approve: "મંજૂરી આપો (સિમ્યુલેટેડ)",
      approved: "મંજૂર (સિમ્યુલેટેડ)",
      consequential: "ગંભીર અસરવાળું",
      record: "નમૂના રેકોર્ડ",
      noRecord: "આ પગલામાં કોઈ નમૂના મૂલ્યો નથી.",
      outcome: "પરિણામ",
      complete: "સિમ્યુલેશન પૂર્ણ થયું",
      manualHint: "ઑટોપ્લે બંધ છે. પાછલું અને આગલું બટનથી આગળ વધો.",
      actorKinds: { person: "વ્યક્તિ", system: "સિસ્ટમ", ai: "AI", machine: "મશીન", external: "બાહ્ય પક્ષ" },
      stepKinds: { event: "ઘટના", check: "ચકાસણી", decision: "નિર્ણય", approval: "મંજૂરી", action: "કાર્યવાહી", alert: "ચેતવણી", record: "રેકોર્ડ" },
    },
    impact: {
      perMonth: "દર મહિને સ્ટાફ-કલાકો",
      perYear: "દર વર્ષે સ્ટાફ-કલાકો",
      released: "દર મહિને બચાવી શકાય તેવા કલાકો",
      reduction: "{pct}% ઘટાડા પર",
      assumed: "ધારણા",
      yours: "તમારો આંકડો",
      hours: "કલાક",
      monthlyCost: "આ સમયનો માસિક ખર્ચ",
      releasedCost: "બચેલા સમયનું માસિક મૂલ્ય",
      rate: "કલાકદીઠ {amount}ના દરે",
      assumedRate: "ધારેલો દર",
      breakdown: "વિગત",
      activity: "પ્રવૃત્તિ",
      people: "લોકો",
      time: "સમય",
      frequency: "આવર્તન",
      hoursPerMonth: "કલાક / મહિનો",
      total: "કુલ",
      minutes: "{n} મિનિટ",
      per: { day: "{n}× / દિવસ", week: "{n}× / અઠવાડિયું", month: "{n}× / મહિનો" },
      workingDays: "દર મહિને {n} કામકાજના દિવસો",
      peopleCount: { one: "{n} વ્યક્તિ", other: "{n} લોકો" },
      assumedActivity: "{label}: {parts}",
      assumedMinutes: "દર વખતે {n} મિનિટ",
      listSeparator: ", ",
      assumedReduction: "સૂચિત ફેરફારથી આ સમયમાંથી {pct}% ઘટશે",
      assumedCost: "સ્ટાફનો ખર્ચ કલાકદીઠ {amount}",
      roundingNote: "પંક્તિઓ એક દશાંશ સુધી રાઉન્ડ કરેલી છે; કુલ રાઉન્ડિંગ પહેલાં ગણાયેલો છે.",
      assumptions: "ધારણાઓ",
      disclaimer: "આ વાતચીતના આંકડાઓ પર આધારિત અંદાજ. તેને નાણાકીય મૂલ્ય સાથે જોડતાં પહેલાં ચકાસી લો — આ ક્વોટ કે ગેરંટી નથી.",
    },
    xray: {
      sections: ["હાલનો વર્કફ્લો", "સંકળાયેલી સિસ્ટમો", "લોકો વચ્ચેના હૅન્ડઑફ", "ઓળખાયેલા અવરોધો", "સંભવિત ઑટોમેશન બિંદુઓ", "સંભવિત જોડાયેલું આર્કિટેક્ચર", "ચકાસવાના પ્રશ્નો", "સૂચવેલો પહેલો પ્રયોગ"],
      company: "કંપની",
      companyFields: { industry: "ઉદ્યોગ", size: "કદ", locations: "સ્થળો", offering: "ઑફરિંગ" },
      stated: "જણાવેલું",
      inferred: "અનુમાનિત",
      statedNote: "આ તમે જણાવ્યું",
      inferredNote: "Operatorનું અનુમાન — ચકાસી લો",
      levels: ["મેન્યુઅલ જ રાખો", "વર્કફ્લો ઑટોમેશન", "સિસ્ટમ ઇન્ટિગ્રેશન", "ઑપરેશનલ સૉફ્ટવેર / ERP", "AI-સહાયિત વર્કફ્લો", "એજન્ટિક વર્કફ્લો", "ભૌતિક/ડિજિટલ ઇન્ટિગ્રેશન"],
      approach: "અભિગમ",
      scope: "વ્યાપ",
      successMeasure: "સફળતાનું માપ",
      none: "કંઈ નોંધાયું નથી",
    },
    brief: {
      title: "ઑડિટ બ્રીફ",
      greeting: "નમસ્તે Savin Group, આ અમારા વર્કફ્લોનો ટૂંકો સાર છે. અમે તેના વિશે ચર્ચા કરવા માંગીએ છીએ.",
      fields: { summary: "સારાંશ", company: "કંપની", contact: "સંપર્ક", industry: "ઉદ્યોગ", currentSystems: "હાલની સિસ્ટમો", currentWorkflow: "હાલનો વર્કફ્લો", primaryProblem: "મુખ્ય સમસ્યા", observedFriction: "જોવા મળેલા અવરોધો", desiredOutcome: "ઇચ્છિત પરિણામ", potentialArchitecture: "સંભવિત આર્કિટેક્ચર", unknowns: "અજાણી બાબતો", urgency: "તાકીદ", relevantCapabilities: "સંબંધિત ક્ષમતાઓ" },
      contact: { name: "નામ", role: "ભૂમિકા", email: "ઇમેઇલ", phone: "ફોન" },
      capabilities: { ai: "AI અને બુદ્ધિશાળી એજન્ટ", automation: "વ્યવસાય અને વર્કફ્લો સ્વચાલન", erp: "ERP અને વ્યવસાયિક સિસ્ટમો", industrial: "ઔદ્યોગિક IoT", software: "કસ્ટમ સૉફ્ટવેર", integrations: "APIs અને સિસ્ટમ એકીકરણ", data: "માહિતી અને એનાલિટિક્સ", platforms: "કસ્ટમ ડિજિટલ પ્લેટફૉર્મ" },
      truncated: "…(સંપૂર્ણ બ્રીફ: કૉપિ અથવા ડાઉનલોડ કરો)",
      sendTo: "આમને મોકલો",
      notice: "કંઈ પણ મોકલાયું નથી. તેને તપાસો, પછી જાતે Savinને મોકલો.",
      whatsapp: "WhatsAppમાં ખોલો",
      email: "ઇમેઇલમાં ખોલો",
      newTab: "નવા ટૅબમાં ખૂલે છે",
      to: "પ્રાપ્તકર્તા",
    },
    actions: { copy: "કૉપિ કરો", copyText: "ટેક્સ્ટ તરીકે કૉપિ કરો", copied: "કૉપિ થયું", copyFailed: "કૉપિ થઈ શક્યું નહીં. ટેક્સ્ટ પસંદ કરીને જાતે કૉપિ કરો.", download: ".md ડાઉનલોડ કરો" },
    sources: { label: "સ્ત્રોતો" },
    fallback: { unavailable: "આ વિઝ્યુઅલ બતાવી શકાયું નહીં." },
  },
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** English under the locale, two levels deep (section → key → nested map). */
function merge(patch: CopyPatch): ViewsCopy {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [section, base] of Object.entries(EN) as Array<[string, Record<string, unknown>]>) {
    const over = ((patch as Record<string, Record<string, unknown> | undefined>)[section]) ?? {};
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(over)) {
      if (value === undefined) continue;
      merged[key] = isPlainObject(base[key]) && isPlainObject(value) ? { ...base[key], ...value } : value;
    }
    out[section] = merged;
  }
  return out as unknown as ViewsCopy;
}

const cache = new Map<string, ViewsCopy>();

/** Copy for `locale`; any unknown locale gets English. Merged once per locale. */
export function getViewsCopy(locale: string): ViewsCopy {
  const key = Object.prototype.hasOwnProperty.call(TRANSLATIONS, locale) ? locale : "en";
  let copy = cache.get(key);
  if (!copy) {
    copy = key === "en" ? EN : merge(TRANSLATIONS[key as Exclude<Locale, "en">]);
    cache.set(key, copy);
  }
  return copy;
}

/** "Step {n} of {total}" + { n: 3, total: 8 } → "Step 3 of 8". Unknown placeholders stay as written. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

/**
 * The text before and after one placeholder: "to {to}" → ["to ", ""],
 * "{to} की ओर" → ["", " की ओर"]. Lets a visible label stay a single node
 * while screen-reader-only words sit on whichever side the language puts
 * them. A template without the placeholder reads as a prefix.
 */
export function splitAround(template: string, name: string): [string, string] {
  const token = `{${name}}`;
  const at = template.indexOf(token);
  return at < 0 ? [`${template} `, ""] : [template.slice(0, at), template.slice(at + token.length)];
}
