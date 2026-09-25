"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ExperienceKey } from "./experience-data";

export type { ExperienceKey };

export type ExperienceDialogProps = { onClose: () => void };

/** Each node walkthrough is its own client-only chunk, loaded when the node is opened. */
export const EXPERIENCE_DIALOGS: Record<ExperienceKey, ComponentType<ExperienceDialogProps>> = {
  machine: dynamic(() => import("./MachineExperience"), { ssr: false }),
  iot: dynamic(() => import("./IotExperience"), { ssr: false }),
  data: dynamic(() => import("./DataExperience"), { ssr: false }),
  ai: dynamic(() => import("./AiExperience"), { ssr: false }),
  automation: dynamic(() => import("./AutomationExperience"), { ssr: false }),
  dashboard: dynamic(() => import("./DashboardExperience"), { ssr: false }),
  decision: dynamic(() => import("./DecisionExperience"), { ssr: false }),
};

export function isExperienceKey(value: string): value is ExperienceKey {
  return Object.prototype.hasOwnProperty.call(EXPERIENCE_DIALOGS, value);
}
