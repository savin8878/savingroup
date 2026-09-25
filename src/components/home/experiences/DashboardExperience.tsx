"use client";

import SystemExperience from "./SystemExperience";
import { DASHBOARD_EXPERIENCE } from "./experience-data";
import { DashboardScene } from "./scenes/DashboardScene";

export default function DashboardExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={DASHBOARD_EXPERIENCE} Scene={DashboardScene} onClose={onClose} />;
}
