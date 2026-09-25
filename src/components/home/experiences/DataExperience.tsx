"use client";

import SystemExperience from "./SystemExperience";
import { DATA_EXPERIENCE } from "./experience-data";
import { DataScene } from "./scenes/DataScene";

export default function DataExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={DATA_EXPERIENCE} Scene={DataScene} onClose={onClose} />;
}
