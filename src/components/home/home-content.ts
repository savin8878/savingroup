import { AUDIT } from "@/lib/offer";

/** Shared by the rendered native disclosure list and its FAQ structured data. */
export const OPERATIONS_FAQ = [
  {
    q: "Can we connect the software we already use?",
    a: "We start with your existing tools, data and processes. We map the available APIs and integration options, then scope what to connect, extend or replace. The goal is a working system around your business, with a clear plan before development.",
  },
  {
    q: "Where should we start?",
    a: `Start with one process that creates repeated work or delays. Our free ${AUDIT.duration} revenue audit gives you a written diagnosis. If a build makes sense, we agree the scope, timeline and measures of success before moving forward.`,
  },
  {
    q: "How do people stay in control of AI workflows?",
    a: "Define the data an agent can access, the tools it can use and the actions that require approval. In the example above, the agent prepares a draft purchase order and stops for human review. Permissions, validation and activity records belong in the design from the start.",
  },
  {
    q: "How will we know the system is making a difference?",
    a: "Agree a baseline before the build: time spent on manual work, turnaround times, error rates or visibility into operations. Measure the same things after rollout. Project results depend on your process and scope; the case studies show individual engagements.",
  },
] as const;
