import type { Locale } from "@/lib/i18n";

export type CapabilityId = "ai" | "automation" | "erp" | "industrial" | "software" | "integrations" | "data" | "platforms";
export interface Capability {
  id: CapabilityId;
  name: string;
  problem: string;
  build: string;
  how: string;
  outcome: string;
  flow: [string, string, string];
}
export interface ServicesCopy {
  meta: string;
  hero: [string, string];
  intro: string;
  explore: string;
  heroNote: string;
  story: string[];
  chapters: string[];
  ecosystem: [string, string];
  ecosystemIntro: string;
  selectHint: string;
  detailLabels: [string, string, string, string];
  diagramLabel: string;
  capabilities: Capability[];
  aiTitle: [string, string];
  aiIntro: string;
  aiLabels: string[];
  aiNotes: string[];
  modelNote: string;
  aiFoot: string;
  industrialTitle: [string, string];
  industrialIntro: string;
  industrialSteps: string[];
  industrialNotes: { title: string; body: string }[];
  industrialFoot: string;
  catalogTitle: [string, string];
  catalogIntro: string;
  deliverables: string;
  investment: string;
  discuss: string;
  pathTitle: [string, string];
  pathIntro: string;
  path: string[];
  cta: [string, string];
  ctaIntro: string;
  audit: string;
  aboutLink: string;
  pause: string;
  resume: string;
  reduced: string;
}

export const SERVICES_EN: ServicesCopy = {
  meta: "Connected software, AI agents, automation, ERP and industrial IoT. Explore the systems we build around your business and the work they make possible.",
  hero: ["Individual capabilities.", "One connected business."],
  intro: "We build the software, connections and intelligence that turn scattered processes into a working system. Designed around the way your business actually runs.",
  explore: "Explore the ecosystem", heroNote: "From the first signal to the next useful action.",
  story: ["Business problem", "Connected system", "Automation", "Intelligence", "Business outcome"],
  chapters: ["The service ecosystem", "AI + automation", "Industrial connectivity", "Our service systems", "Built around you", "The next step"],
  ecosystem: ["Start with the bottleneck.", "Connect the right capabilities."],
  ecosystemIntro: "Explore what each capability changes. The real value comes from how they work together.",
  selectHint: "Choose a capability", detailLabels: ["The business problem", "What we build", "How it works", "What changes"], diagramLabel: "A connected system, in practice",
  capabilities: [
    { id: "ai", name: "AI & intelligent agents", problem: "Your team spends time searching, interpreting and preparing the same information.", build: "AI assistants and agents that work with approved business context and tools.", how: "A request connects to relevant data, permitted APIs and a human review step.", outcome: "Useful answers and prepared actions inside the daily workflow.", flow: ["Business question", "Context + AI agent", "Reviewed action"] },
    { id: "automation", name: "Business & workflow automation", problem: "Routine follow-ups, approvals and handoffs depend on someone remembering.", build: "Rule-based workflows, CRM automations and connected approval processes.", how: "An event starts a defined sequence, with exceptions routed to the right person.", outcome: "Less chasing. Clear ownership. Work that moves forward.", flow: ["Business event", "Rules + workflow", "Next task completed"] },
    { id: "erp", name: "ERP & business systems", problem: "Purchasing, inventory, orders and finance work from different versions of the truth.", build: "OperateOS: ERP modules, operational dashboards and vendor or customer portals.", how: "Shared records connect departments, permissions and approval workflows.", outcome: "One operational picture, from the order to the delivery.", flow: ["Orders + stock", "OperateOS / ERP", "Connected operation"] },
    { id: "industrial", name: "Industrial IoT", problem: "Machine events and production updates stay disconnected from business decisions.", build: "Sensor integrations, equipment connectivity and operational monitoring.", how: "Signals pass through an edge connection into software, rules and operator workflows.", outcome: "The shop floor becomes visible and actionable.", flow: ["Machine signal", "IoT + connected data", "Operator action"] },
    { id: "software", name: "Custom software", problem: "Your process has outgrown spreadsheets and the limits of off-the-shelf tools.", build: "Internal applications, field tools and software shaped around your operation.", how: "Roles, data and business rules become a maintainable application.", outcome: "A tool that fits the work your team actually does.", flow: ["Your process", "Purpose-built software", "Simpler daily work"] },
    { id: "integrations", name: "APIs & system integrations", problem: "People copy information between applications that cannot talk to each other.", build: "API connections, data exchanges and integration layers between existing systems.", how: "Map, validate and route information with clear ownership and exception handling.", outcome: "Less re-entry. Consistent information across your tools.", flow: ["Existing tools", "APIs + integration", "Shared context"] },
    { id: "data", name: "Data & analytics", problem: "Reports arrive late and decisions rely on fragments of the whole picture.", build: "Connected datasets, operational dashboards and useful management reporting.", how: "Bring sources together, define the measures and surface the signals that matter.", outcome: "A clearer view of performance and the next decision.", flow: ["Scattered data", "Analytics + dashboards", "Informed decision"] },
    { id: "platforms", name: "Custom digital platforms", problem: "Customer, vendor and internal journeys break at the boundaries of separate tools.", build: "Web platforms, self-service portals and connected digital experiences.", how: "Join the user experience to CRM, ERP, content and business workflows.", outcome: "A smoother journey, with the operation connected behind it.", flow: ["Customer need", "Platform + business systems", "Connected experience"] },
  ],
  aiTitle: ["Intelligence with context.", "Automation with control."], aiIntro: "A useful AI system has more than a model. It needs the right information, defined tools and a clear route from recommendation to action.",
  aiLabels: ["A business request", "AI agent", "Approved tools", "Human review", "Business action"],
  aiNotes: ["A question or a task", "Understands the context", "MCP + APIs", "Approvals where needed", "A recorded outcome"],
  modelNote: "OpenAI · Claude · Grok / xAI — selected for the task", aiFoot: "ERP, IoT and analytics supply the context. Workflows carry the action. Your permissions define the boundary.",
  industrialTitle: ["From the machine floor", "to the next decision."], industrialIntro: "Connect the physical operation to the software running the business. A signal becomes useful when someone can act on it.",
  industrialSteps: ["Machines", "Sensors", "Data", "Systems", "Automation", "Intelligence", "Action"],
  industrialNotes: [{ title: "Capture the event", body: "Bring equipment status and production signals into a shared view." }, { title: "Add the context", body: "Connect the event to a work order, inventory record or maintenance workflow." }, { title: "Enable the response", body: "Notify the operator, prepare a task and record the next action." }], industrialFoot: "Illustrative architecture. Connections depend on your equipment, protocols and infrastructure.",
  catalogTitle: ["The capabilities connect.", "The scope stays clear."], catalogIntro: "Our existing service systems give the engagement a practical starting point. Explore the deliverables, then shape the right combination for your business.", deliverables: "Included in the system", investment: "Published investment", discuss: "Discuss this system",
  pathTitle: ["Your business is the blueprint.", "We connect the pieces."], pathIntro: "Start with one constraint. Build a useful system. Extend it as the operation grows.", path: ["Your business", "Find the bottleneck", "Design the system", "Connect the data", "Automate operations", "Add intelligence", "Scale"],
  cta: ["What could work better?", "Let’s build from there."], ctaIntro: "Bring us the process, the disconnected tool or the idea. We’ll help make the next step clear.", audit: "Free {minutes}-minute audit. A written diagnosis. A practical starting point.", aboutLink: "How we think and work", pause: "Pause motion", resume: "Resume motion", reduced: "Reduced motion",
};

export function resolveServicesLocale(value: string): Locale {
  return ["en", "es", "fr", "de", "ar", "hi", "gu", "zh"].includes(value) ? value as Locale : "en";
}
