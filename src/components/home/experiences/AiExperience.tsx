"use client";

import SystemExperience from "./SystemExperience";
import { AI_EXPERIENCE } from "./experience-data";
import { AiScene } from "./scenes/AiScene";

export default function AiExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={AI_EXPERIENCE} Scene={AiScene} onClose={onClose} />;
}
