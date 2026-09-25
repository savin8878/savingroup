"use client";

import SystemExperience from "./SystemExperience";
import { MACHINE_EXPERIENCE } from "./experience-data";
import { MachineScene } from "./scenes/MachineScene";

export default function MachineExperience({ onClose }: { onClose: () => void }) {
  return <SystemExperience experience={MACHINE_EXPERIENCE} Scene={MachineScene} onClose={onClose} />;
}
