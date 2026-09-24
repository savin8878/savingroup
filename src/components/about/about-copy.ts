import type { Locale } from "@/lib/i18n";

export interface AboutCopy {
  meta: string;
  hero: [string, string, string];
  intro: string;
  explore: string;
  blueprint: string;
  layers: [string, string, string];
  chapters: string[];
  identity: [string, string];
  identityBody: string[];
  teamLabel: string;
  teamTitle: string;
  roles: string[];
  teamNote: string;
  why: [string, string];
  whyBody: string;
  friction: string[];
  clarity: string;
  clarityNote: string;
  principlesTitle: [string, string];
  principlesIntro: string;
  principles: { title: string; body: string }[];
  processTitle: [string, string];
  processIntro: string;
  processHint: string;
  output: string;
  steps: { title: string; short: string; body: string; output: string }[];
  techTitle: [string, string];
  techIntro: string;
  techLayers: { title: string; purpose: string }[];
  technologies: string[][];
  techNote: string;
  transformationTitle: [string, string];
  transformationIntro: string;
  before: string;
  after: string;
  beforeLabels: string[];
  afterLabels: string[];
  transformationNote: string;
  workLink: string;
  cta: [string, string];
  ctaIntro: string;
  auditNote: string;
  servicesLink: string;
}

export const EN_ABOUT: AboutCopy = {
  meta: "Meet Savin Group: the systems partner connecting software, AI and operations around the people who run your business.",
  hero: ["Good businesses.", "Better connected.", "Built around people."],
  intro: "We’re Savin Group. We bring business understanding and systems engineering together to make complex operations work as one.",
  explore: "Meet our way of thinking",
  blueprint: "The thinking behind the system",
  layers: ["People & purpose", "Connected systems", "Business outcomes"],
  chapters: ["Who we are", "Why we exist", "What guides us", "How we work", "Our technology philosophy", "The transformation", "Your next chapter"],
  identity: ["An engineering partner.", "Part of your world."],
  identityBody: ["We design and connect custom software, ERP, AI workflows and industrial systems for manufacturers and growing businesses.", "Our team works alongside yours. The people building the system learn the process, question the handoffs and make the next step clear."],
  teamLabel: "Embedded by design",
  teamTitle: "Your business at the center.",
  roles: ["Business understanding", "Software engineering", "Systems integration"],
  teamNote: "One shared context. From the first conversation to the working system.",
  why: ["Growth adds complexity.", "We engineer clarity."],
  whyBody: "As businesses grow, work collects in the gaps between tools, teams and machines. We exist to close those gaps—so growth doesn’t mean more workarounds.",
  friction: ["Repetitive work", "Scattered information", "Disconnected decisions"],
  clarity: "Clarity.",
  clarityNote: "The right information. The right person. The right next step.",
  principlesTitle: ["A few convictions.", "In every decision."],
  principlesIntro: "Technology is useful when it changes how work gets done. These are the principles we build around.",
  principles: [
    { title: "Automate the repetitive. Protect the human.", body: "Let systems handle repeatable work. Keep people focused on judgment, relationships and the decisions that need their experience." },
    { title: "Connect before adding.", body: "Understand what already works. Bring data and processes together before introducing another tool for your team to manage." },
    { title: "Make AI earn its place.", body: "Start with a useful task, relevant context and clear permissions. Build in validation and human review. Measure the difference it makes." },
    { title: "Build for what comes next.", body: "Favor maintainable systems, clear interfaces and room to grow. Agree success measures early: time saved, fewer errors or faster decisions." },
  ],
  processTitle: ["Start with the work.", "Then engineer the system."],
  processIntro: "A connected business is built deliberately. Each step gives the next one a stronger foundation.",
  processHint: "Explore the five stages",
  output: "What you leave with",
  steps: [
    { title: "Understand", short: "Find the real constraint.", body: "Listen to the people doing the work. Map the process, identify the bottleneck and agree what a better outcome would look like.", output: "A clear problem and a measurable starting point." },
    { title: "Connect", short: "Create shared context.", body: "Map the data, tools and handoffs. Connect the systems that need to communicate, with clear ownership of the information moving between them.", output: "An integration blueprint around your existing operation." },
    { title: "Automate", short: "Give routine work a flow.", body: "Turn repeatable tasks into defined workflows. Test exceptions and approvals with your team before putting the process to work.", output: "A tested workflow, with rules and human checkpoints." },
    { title: "Intelligence", short: "Make context actionable.", body: "Add analytics or AI where they help people interpret information, prepare actions and make better-informed decisions.", output: "Useful intelligence inside the everyday workflow." },
    { title: "Scale", short: "Improve what works.", body: "Review outcomes against the baseline. Refine the system, document how it works and extend it as your operation grows.", output: "A maintainable system and a clear next improvement." },
  ],
  techTitle: ["Technology has a role.", "Your business sets it."],
  techIntro: "We choose the tools around the problem. Each layer serves the same goal: turning information into useful, accountable action.",
  techLayers: [
    { title: "Intelligence", purpose: "Interpret context. Assist a decision." },
    { title: "Orchestration", purpose: "Move work between systems." },
    { title: "Business systems", purpose: "Give the operation a shared record." },
    { title: "The physical world", purpose: "Connect what happens on the floor." },
  ],
  technologies: [["AI agents", "Analytics"], ["APIs", "Automation", "Integrations"], ["ERP", "CRM", "Custom software"], ["IoT", "Machines", "Sensors"]],
  techNote: "Designed around your process, permissions and infrastructure.",
  transformationTitle: ["Better systems.", "More room for people."],
  transformationIntro: "The change is felt in an ordinary working day: fewer things to chase and a clearer view of what matters.",
  before: "The work between the systems",
  after: "The system working with your team",
  beforeLabels: ["Re-enter the information", "Chase the next update", "Decide with part of the picture"],
  afterLabels: ["Capture once. Share the context.", "Let the workflow move it forward.", "See clearly. Decide with confidence."],
  transformationNote: "A direction we design toward. Success is measured against your own starting point.",
  workLink: "See systems in practice",
  cta: ["Your next chapter.", "Engineered together."],
  ctaIntro: "Tell us about the process that takes more effort than it should.",
  auditNote: "Free {minutes}-minute audit. A written diagnosis. A clearer next step.",
  servicesLink: "Explore what we build",
};

export function resolveAboutLocale(locale: string): Locale {
  return ["en", "es", "fr", "de", "ar", "hi", "gu", "zh"].includes(locale) ? locale as Locale : "en";
}
