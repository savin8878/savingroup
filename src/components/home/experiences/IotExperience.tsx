"use client";

import SystemExperience from "./SystemExperience";
import { IOT_EXPERIENCE } from "./experience-data";
import { IotScene } from "./scenes/IotScene";

export default function IotExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={IOT_EXPERIENCE} Scene={IotScene} onClose={onClose} />;
}
