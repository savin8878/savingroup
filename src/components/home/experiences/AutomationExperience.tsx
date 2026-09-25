"use client";

import SystemExperience from "./SystemExperience";
import { AUTOMATION_EXPERIENCE } from "./experience-data";
import { AutomationScene } from "./scenes/AutomationScene";

export default function AutomationExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={AUTOMATION_EXPERIENCE} Scene={AutomationScene} onClose={onClose} />;
}
