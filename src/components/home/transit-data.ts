import { TRANSPORT, type TransportMode } from "./procurement-data";

export type TransitStep = {
  label: string;
  title: string;
  detail: string;
  scene: string;
  document: string;
  code: string;
  status: string;
  fields: [string, string][];
};

export type RouteSpec = {
  /** Vehicle path in the 780×410 scene. The vehicle's origin is translated along it. */
  path: string;
  /** Server-rendered start point (progress 0), so the first paint needs no JS. */
  start: [number, number];
  scale: number;
  /** Route fractions (0–1) of the e-way-bill checkpoint and the hold. */
  checkpoints: [number, number];
  /** Static scene coordinates of those checkpoints, for the stamp and hold notes. */
  checkPoint: [number, number];
  holdPoint: [number, number];
  ledger: [string, string, string, string];
  hold: string;
  /** Bottom-left / bottom-right captions on the scene. */
  ends: [string, string];
};

export const ROUTES: Record<TransportMode, RouteSpec> = {
  road: { path: "M180 305H625", start: [180, 305], scale: 0.55, checkpoints: [0.32, 0.62], checkPoint: [322, 305], holdPoint: [456, 305], ledger: ["SUPPLIER DOCK", "EWB CHECK", "TOLL PLAZA", "PLANT GATE"], hold: "Toll plaza", ends: ["SUPPLIER DOCK", "PLANT GATE"] },
  sea: { path: "M200 292H600", start: [200, 292], scale: 0.5, checkpoints: [0.1, 0.62], checkPoint: [240, 292], holdPoint: [448, 292], ledger: ["ORIGIN PORT", "CUSTOMS", "ANCHORAGE", "DESTINATION PORT"], hold: "Port anchorage", ends: ["ORIGIN PORT", "DESTINATION PORT"] },
  air: { path: "M150 267H215Q390 20 585 267H625", start: [150, 267], scale: 0.45, checkpoints: [0.06, 0.62], checkPoint: [184, 267], holdPoint: [453, 155], ledger: ["CARGO TERMINAL", "EWB CHECK", "HOLDING", "ARRIVAL TERMINAL"], hold: "Holding pattern", ends: ["CARGO TERMINAL", "ARRIVAL TERMINAL"] },
};

/**
 * Continuous route position (0–1) for a scene position s = progress × 7.
 * The vehicle waits at the dock through the plan and the scan, drives to the
 * checkpoint, moves in transit, is held, then arrives and stays at the gate.
 */
export function routeAt(s: number, [check, hold]: [number, number]) {
  const keys: [number, number][] = [[0, 0], [1.8, 0], [2.55, check], [3, check], [4, hold], [4.6, hold], [5, hold + (1 - hold) * 0.4], [5.45, 1], [7, 1]];
  if (s <= 0) return 0;
  for (let i = 1; i < keys.length; i++) {
    const [s0, r0] = keys[i - 1];
    const [s1, r1] = keys[i];
    if (s <= s1) return r0 + ((s - s0) / (s1 - s0)) * (r1 - r0);
  }
  return 1;
}

/** True when the route position is changing at s, so wheels only turn while the vehicle moves. */
export function movingAt(s: number, checkpoints: [number, number]) {
  return routeAt(s + 0.01, checkpoints) - routeAt(s - 0.01, checkpoints) > 0.0001;
}

export function transitSteps(mode: TransportMode): TransitStep[] {
  const transport = TRANSPORT[mode];
  const route = ROUTES[mode];
  return [
    { label: "Dispatch plan", title: "The order becomes a shipment.", detail: "SHP-0089 is planned against PO-0089: 24 units on two pallets. The transporter is booked from the same record, so the plan and the order can never disagree.", scene: "LOGISTICS / DISPATCH PLAN", document: "Shipment plan", code: "SHP-0089", status: "Ready for dispatch", fields: [["Linked order", "PO-0089"], ["Load", transport.load], ["Booking", `${transport.booking} · ${transport.vehicle}`]] },
    { label: "Pickup scan", title: "Scanned at the dock. Dispatched.", detail: "The driver scans both pallet labels at the supplier's dock. The dispatch note is issued and PO-0089 moves to \"dispatched\" — nobody types anything.", scene: "SUPPLIER DOCK / PICKUP SCAN", document: "Dispatch note", code: "DN-0089", status: "Dispatched · 09:12", fields: [["Scanned", "2 / 2 pallets"], ["Carrier", transport.booking], ["Papers", transport.document]] },
    { label: "E-way bill verified", title: "Checked once. Stamped on the record.", detail: "The e-way bill travels with the consignment. At the checkpoint it is verified against the invoice and the shipment record carries the stamp from then on.", scene: "CHECKPOINT / E-WAY BILL", document: "E-way bill", code: "EWB-3312", status: "Verified", fields: [["Consignment", "SHP-0089"], ["Declared value", "₹1,56,000"], ["Valid until", "26 Sep · 23:59"]] },
    { label: "In transit", title: "Moving. Every milestone reported.", detail: "Location pings update the shipment as it moves. Receiving sees the same ETA the carrier sees — no call, no forwarded email.", scene: "ROUTE / IN TRANSIT", document: "Shipment tracking", code: "SHP-0089", status: "In transit", fields: [["Route", transport.route], ["ETA", "14:40"], ["Last ping", "12:05 · milestone 2 of 4"]] },
    { label: "Delay handled", title: "Held 40 minutes. Handled in the record.", detail: `A hold at the ${route.hold.toLowerCase()} pushes the ETA. The system re-estimates it and notifies receiving automatically — the unloading slot moves with it.`, scene: "EXCEPTION / ETA RE-ESTIMATED", document: "Exception", code: "EXC-0089-1", status: "Resolved automatically", fields: [["Hold", `40 min · ${route.hold}`], ["ETA revised", "14:40 → 15:20"], ["Receiving notified", "Automatic · 13:02"]] },
    { label: "Arrival gate", title: "At the gate. Expected.", detail: "The gate scan matches the vehicle to SHP-0089. The goods receipt note is prepared from the purchase order before the pallets are off the vehicle.", scene: "PLANT GATE / ARRIVAL", document: "Gate entry", code: "GATE-0713", status: "Vehicle admitted · 15:18", fields: [["Vehicle", transport.booking], ["Against", "PO-0089"], ["GRN prepared", "GRN-0058 (draft)"]] },
    { label: "Goods receipt", title: "24 of 24. The loop closes.", detail: "Receiving counts and accepts all 24 units. GRN-0058 posts, inventory moves from 6 to 30, and the trail from request to receipt is complete.", scene: "RECEIVING / GOODS RECEIPT", document: "Goods receipt note", code: "GRN-0058", status: "Received & accepted", fields: [["Accepted", "24 / 24 units"], ["Inventory", "6 → 30 units"], ["Trail", "PR-0241 → PO-0089 → GRN-0058"]] },
  ];
}
