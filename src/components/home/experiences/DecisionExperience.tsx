"use client";

import SystemExperience from "./SystemExperience";
import { DECISION_EXPERIENCE } from "./experience-data";
import { DecisionScene } from "./scenes/DecisionScene";

export default function DecisionExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={DECISION_EXPERIENCE} Scene={DecisionScene} onClose={onClose} />;
}
