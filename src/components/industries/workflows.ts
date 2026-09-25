/**
 * Industry workflows + impact estimators — the data behind the "See it run"
 * simulator and the "Estimate your impact" calculator on each industry page.
 *
 * CONTRACT with IndustryFigures: every stage `id` below is also a
 * `<g data-stage="…">` region in that industry's drawing. When any ancestor
 * carries `data-active-stage="<id>"`, the figure highlights that region.
 *
 * All transactions are illustrative sample data (clearly labelled on the
 * page). Estimator rates are deliberately conservative and sit at or below
 * the outcome ranges published in src/lib/industry-data.ts.
 */

import type { IndustryKey } from "@/lib/country-content";

export interface WorkflowRecord {
  /** Document / record type, e.g. "Sales order". */
  doc: string;
  /** Sample record code, e.g. "SO-1042". */
  code: string;
  status: string;
  fields: [label: string, value: string][];
}

export interface WorkflowStage {
  /** Figure region id (see contract above). */
  id: string;
  label: string;
  title: string;
  detail: string;
  /** Event-log line written when the stage completes. */
  event: string;
  /** Who hands off to whom. */
  owner: string;
  record: WorkflowRecord;
  /** Autoplay time on this stage. */
  durationMs: number;
}

export interface IndustryWorkflow {
  eyebrow: string;
  title: string;
  description: string;
  /** The sample transaction the whole walkthrough follows. */
  sample: string;
  stages: WorkflowStage[];
}

export const INDUSTRY_WORKFLOWS: Record<IndustryKey, IndustryWorkflow> = {
  manufacturing: {
    eyebrow: "ERP / Order to dispatch",
    title: "One order, from the sales desk to the dispatch gate.",
    description: "Follow a single customer order through production, quality and dispatch — with the GST paperwork generated on the way out.",
    sample: "SO-1042 · 1,200 m dyed fabric · Surat buyer",
    stages: [
      { id: "order", label: "Sales order", title: "The order lands in one system.", detail: "Sales confirms 1,200 metres at the agreed rate. The order reserves finished stock first and shows the shortfall production must make.", event: "SO-1042 confirmed · 800 m to produce", owner: "Sales → Planning", record: { doc: "Sales order", code: "SO-1042", status: "Confirmed", fields: [["Quantity", "1,200 m"], ["In stock", "400 m"], ["To produce", "800 m"], ["Promised", "In 9 days"]] }, durationMs: 5500 },
      { id: "plan", label: "Production plan", title: "The plan knows the BOM and the machines.", detail: "The planner schedules 800 m on the dyeing line with free capacity on Thursday. The bill of materials works out the greige, dye and chemicals needed.", event: "WO-0318 scheduled · Line 2, Thursday", owner: "Planning → Stores", record: { doc: "Work order", code: "WO-0318", status: "Scheduled", fields: [["Line", "Dyeing line 2"], ["Machine load", "74% → 91%"], ["Start", "Thu, 7:00"], ["BOM", "3 materials"]] }, durationMs: 6000 },
      { id: "material", label: "Material issue", title: "Stores issues exactly what the work order needs.", detail: "Greige fabric and dye are issued against the work order from godown 2. Stock drops in real time, and a reorder is raised for the dye that fell below its minimum.", event: "Materials issued · reorder PR-0077 raised", owner: "Stores → Shop floor", record: { doc: "Material issue", code: "MI-0551", status: "Issued", fields: [["Greige", "840 m (5% allowance)"], ["Dye lot", "B-2291"], ["Godown", "G2 · Narol"], ["Reorder", "PR-0077"]] }, durationMs: 5500 },
      { id: "production", label: "Production", title: "The shop floor logs progress from a phone.", detail: "The supervisor records output, downtime and rejections on the mobile app — even on patchy factory 3G. Planners see WIP move without walking the floor.", event: "620 / 800 m logged · 25 min downtime noted", owner: "Supervisor → Quality", record: { doc: "Production log", code: "WO-0318", status: "In progress", fields: [["Output", "620 / 800 m"], ["Downtime", "25 min"], ["Rejection", "1.8%"], ["Shift", "Day"]] }, durationMs: 6500 },
      { id: "qc", label: "Quality check", title: "Quality passes the batch before it moves.", detail: "QC checks shade and GSM against the order's specification. The accepted quantity goes to finished goods; rejects are recorded with a reason, not lost.", event: "Batch accepted · 786 m to finished goods", owner: "Quality → Stores", record: { doc: "QC report", code: "QC-0912", status: "Accepted", fields: [["Accepted", "786 m"], ["Rejected", "14 m · shade"], ["GSM", "Within spec"], ["Batch", "B-2291"]] }, durationMs: 5500 },
      { id: "dispatch", label: "Dispatch", title: "Stock is packed against the order, not from memory.", detail: "The order's 1,200 m is picked from finished goods, packed with a packing list, and assigned to a transporter with the LR number recorded.", event: "Packed · LR 44817 · vehicle GJ-01", owner: "Stores → Transporter", record: { doc: "Delivery challan", code: "DC-0433", status: "Ready to ship", fields: [["Packed", "1,200 m · 24 rolls"], ["Transporter", "Shree Logistics"], ["LR no.", "44817"], ["Vehicle", "GJ-01-XX-4410"]] }, durationMs: 5500 },
      { id: "invoice", label: "E-invoice", title: "GST paperwork is generated on the way out.", detail: "The tax invoice gets its IRN from the invoice registration portal and the e-way bill is created from the same dispatch data — nobody types it twice.", event: "IRN generated · e-way bill created", owner: "Accounts → Customer", record: { doc: "Tax invoice", code: "INV-2026-0918", status: "IRN issued", fields: [["IRN", "Generated"], ["E-way bill", "Created"], ["GSTR-1", "Queued"], ["Copy to buyer", "WhatsApp + email"]] }, durationMs: 6000 },
      { id: "dashboard", label: "Daily P&L", title: "The founder sees today's margin, today.", detail: "The order's revenue, material cost and machine hours roll into the day's P&L on the founder's phone. An underpriced order would have been flagged before it shipped.", event: "Margin on SO-1042: 18.4% · P&L updated", owner: "System → Founder", record: { doc: "Daily P&L", code: "P&L · today", status: "Updated", fields: [["Revenue", "₹4.32 L"], ["Material cost", "₹2.61 L"], ["Gross margin", "18.4%"], ["Vs. quote", "+0.6 pts"]] }, durationMs: 6000 },
    ],
  },

  "real-estate": {
    eyebrow: "CRM / Lead to booking",
    title: "One enquiry, from a portal lead to a booked unit.",
    description: "Follow a single buyer from the first enquiry through scoring, a site visit and the booking — with attribution kept for every hand-off.",
    sample: "LD-2291 · 3 BHK enquiry · Prahladnagar project",
    stages: [
      { id: "capture", label: "Capture", title: "Every source lands in one list.", detail: "A 3 BHK enquiry arrives from a property portal at 9:42 pm. It lands next to WhatsApp, website and walk-in leads — de-duplicated, with the source recorded.", event: "LD-2291 created · source: portal", owner: "Portal → CRM", record: { doc: "Lead", code: "LD-2291", status: "New", fields: [["Interest", "3 BHK"], ["Budget", "₹85–95 L"], ["Source", "Property portal"], ["Received", "9:42 pm"]] }, durationMs: 5000 },
      { id: "score", label: "Score", title: "The lead is scored before anyone calls.", detail: "Budget fit, location match and timeline give the lead a score of 82. High scores go to the senior sales manager; the rest get an automated nurture.", event: "Scored 82 / 100 · routed to senior RM", owner: "CRM → Sales manager", record: { doc: "Lead score", code: "LD-2291", status: "Hot", fields: [["Score", "82 / 100"], ["Budget fit", "Strong"], ["Timeline", "Within 3 months"], ["Assigned", "Senior RM"]] }, durationMs: 5500 },
      { id: "respond", label: "First response", title: "A reply goes out in minutes, not tomorrow.", detail: "An approved WhatsApp template goes out within two minutes with the floor plan and price sheet. The RM gets a reminder to call before 10 am.", event: "Replied in 2 min · brochure sent", owner: "CRM → Buyer", record: { doc: "Conversation", code: "WA-5518", status: "Replied", fields: [["First response", "2 min"], ["Sent", "Floor plan, price sheet"], ["Call task", "Before 10 am"], ["Channel", "WhatsApp"]] }, durationMs: 5000 },
      { id: "visit", label: "Site visit", title: "The visit is booked into a real calendar slot.", detail: "The buyer picks Saturday 11 am from the live slot calendar. The site team gets the lead's history, and a reminder goes out the evening before.", event: "Site visit booked · Sat 11:00", owner: "Buyer → Site team", record: { doc: "Site visit", code: "SV-0764", status: "Scheduled", fields: [["Slot", "Sat · 11:00"], ["Host", "Site RM"], ["Reminder", "Fri evening"], ["Units to show", "B-1203, B-1403"]] }, durationMs: 5500 },
      { id: "negotiate", label: "Offer", title: "The offer and follow-ups stay on one record.", detail: "After the visit, the RM shares a cost sheet for B-1203. Follow-ups, objections and the approved discount are logged, so nothing depends on memory.", event: "Cost sheet shared · follow-up in 2 days", owner: "Sales → Buyer", record: { doc: "Cost sheet", code: "CS-1203", status: "Under discussion", fields: [["Unit", "B-1203 · 12th floor"], ["All-in price", "₹92.4 L"], ["Discount", "Approved by head"], ["Next follow-up", "In 2 days"]] }, durationMs: 6000 },
      { id: "book", label: "Booking", title: "The booking amount is paid and the unit is blocked.", detail: "The buyer pays the booking amount online. The unit is blocked on the inventory chart instantly, so two RMs can never sell the same flat.", event: "Booking received · B-1203 blocked", owner: "Buyer → Accounts", record: { doc: "Booking", code: "BK-0291", status: "Booked", fields: [["Unit", "B-1203"], ["Booking amount", "Received"], ["Inventory", "Blocked"], ["Attribution", "Portal → site visit"]] }, durationMs: 5500 },
      { id: "handover", label: "Allotment", title: "Allotment, payments and attribution close the loop.", detail: "The allotment letter and payment schedule go out automatically. The source is credited — portal or channel partner — so commission disputes don't start.", event: "Allotment issued · source credited", owner: "Accounts → Buyer, Partner", record: { doc: "Allotment letter", code: "AL-0291", status: "Issued", fields: [["Payment plan", "Construction-linked"], ["Next due", "On slab 14"], ["Credited to", "Property portal"], ["Documents", "Sent on WhatsApp"]] }, durationMs: 6000 },
    ],
  },

  healthcare: {
    eyebrow: "Clinic / Booking to recall",
    title: "One patient, from booking to their next visit.",
    description: "Follow a single appointment through booking, reminders, the waiting room and billing — and see how recall happens without a phone call.",
    sample: "APT-3308 · Dermatology follow-up · Dr. B",
    stages: [
      { id: "book", label: "Booking", title: "The patient books a slot without calling.", detail: "A returning patient picks Tuesday 11:30 with Dr. B from the booking link on Google. The slot is held instantly — the receptionist never picks up the phone.", event: "APT-3308 booked · Tue 11:30", owner: "Patient → Clinic", record: { doc: "Appointment", code: "APT-3308", status: "Booked", fields: [["Doctor", "Dr. B · Dermatology"], ["Slot", "Tue · 11:30"], ["Type", "Follow-up"], ["Source", "Google profile"]] }, durationMs: 5000 },
      { id: "remind", label: "Reminders", title: "Reminders go out on WhatsApp.", detail: "A reminder goes out the day before and again two hours ahead, with a one-tap confirm or reschedule. A freed slot is offered to the waitlist automatically.", event: "Reminder confirmed · no-show risk low", owner: "System → Patient", record: { doc: "Reminder", code: "RM-3308", status: "Confirmed", fields: [["Day before", "Sent · confirmed"], ["2 h before", "Scheduled"], ["Reschedule", "One tap"], ["Waitlist", "Auto-offered"]] }, durationMs: 5500 },
      { id: "arrive", label: "Check-in", title: "Check-in takes seconds at the desk.", detail: "The patient checks in by QR at the front desk. Their history and the previous prescription are already on the doctor's screen.", event: "Checked in · token T-14", owner: "Front desk → Queue", record: { doc: "Check-in", code: "T-14", status: "Waiting", fields: [["Token", "T-14"], ["Arrived", "11:22"], ["Records", "Loaded"], ["Forms", "Pre-filled"]] }, durationMs: 5000 },
      { id: "queue", label: "Queue", title: "The waiting room sees an honest wait time.", detail: "The queue screen and a WhatsApp message show the live position and estimated wait. The doctor running late pushes an update instead of a crowd at the desk.", event: "Called in · waited 9 min", owner: "Queue → Doctor", record: { doc: "Queue", code: "Room 2", status: "Called", fields: [["Position", "Next"], ["Estimated wait", "9 min"], ["Doctor", "Dr. B · Room 2"], ["Delay alert", "None"]] }, durationMs: 5500 },
      { id: "consult", label: "Consult", title: "Notes and the prescription are captured once.", detail: "The doctor writes notes and the prescription in the EMR. The follow-up interval is set in the same place, so recall is scheduled before the patient leaves.", event: "Prescription issued · follow-up in 6 weeks", owner: "Doctor → Billing", record: { doc: "Visit note", code: "EMR-3308", status: "Signed", fields: [["Diagnosis", "Recorded"], ["Prescription", "Shared on WhatsApp"], ["Follow-up", "In 6 weeks"], ["Procedures", "None today"]] }, durationMs: 6000 },
      { id: "bill", label: "Billing", title: "Billing and payment close in one step.", detail: "The consultation is billed automatically and paid by UPI at the desk. The receipt and prescription arrive on WhatsApp together.", event: "Paid by UPI · receipt sent", owner: "Billing → Patient", record: { doc: "Bill", code: "BL-3308", status: "Paid", fields: [["Consultation", "₹800"], ["Mode", "UPI"], ["Receipt", "WhatsApp"], ["GST", "Exempt (healthcare)"]] }, durationMs: 5000 },
      { id: "recall", label: "Recall", title: "The next visit books itself.", detail: "Five weeks later the patient gets a recall message with open slots for the follow-up — and a review request goes to happy patients after the visit.", event: "Recall sent · review requested", owner: "System → Patient", record: { doc: "Recall", code: "RC-3308", status: "Scheduled", fields: [["Recall", "Week 5"], ["Slots offered", "3"], ["Review request", "Sent"], ["Relationship", "Owned by the clinic"]] }, durationMs: 6000 },
    ],
  },

  ecommerce: {
    eyebrow: "D2C / Order to reorder",
    title: "One order, from browsing to the next purchase.",
    description: "Follow a single customer through the store, an abandoned cart, checkout and delivery — and into the reorder that makes the first order profitable.",
    sample: "ORD-50731 · Skincare bundle · Pune customer",
    stages: [
      { id: "browse", label: "Browse", title: "The shopper finds the product fast.", detail: "A shopper lands from search on a collection page that loads in under two seconds, filters by skin type and opens the bundle.", event: "Product viewed · from organic search", owner: "Search → Store", record: { doc: "Session", code: "S-88120", status: "Browsing", fields: [["Source", "Organic search"], ["Landing", "Collection page"], ["Load time", "1.6 s"], ["Viewed", "Skincare bundle"]] }, durationMs: 5000 },
      { id: "cart", label: "Cart", title: "The cart is saved against the customer.", detail: "The bundle goes into the cart with a verified phone number. When the shopper leaves at the shipping step, the cart is saved, not lost.", event: "Cart saved · ₹1,480", owner: "Store → Recovery", record: { doc: "Cart", code: "CT-20931", status: "Abandoned", fields: [["Items", "1 bundle"], ["Value", "₹1,480"], ["Left at", "Shipping step"], ["Contact", "Verified phone"]] }, durationMs: 5000 },
      { id: "recover", label: "Recovery", title: "A WhatsApp nudge brings the shopper back.", detail: "Forty minutes later a WhatsApp message shows the cart with a one-tap return link. The shopper comes back and continues to checkout.", event: "Cart recovered via WhatsApp", owner: "Recovery → Checkout", record: { doc: "Recovery message", code: "WA-7712", status: "Recovered", fields: [["Sent", "After 40 min"], ["Channel", "WhatsApp"], ["Offer", "None needed"], ["Result", "Returned to checkout"]] }, durationMs: 5500 },
      { id: "checkout", label: "Checkout", title: "Checkout is short and prepaid-first.", detail: "The address fills from the phone number and UPI is the default. A small prepaid incentive steers the order away from cash on delivery.", event: "ORD-50731 paid · UPI", owner: "Checkout → Fulfilment", record: { doc: "Order", code: "ORD-50731", status: "Paid", fields: [["Payment", "UPI · prepaid"], ["Total", "₹1,480"], ["COD risk", "Avoided"], ["Steps", "3"]] }, durationMs: 5500 },
      { id: "fulfil", label: "Fulfilment", title: "The order is packed and shipped the same day.", detail: "The order syncs to the warehouse, the courier with the best serviceability is chosen, and the AWB is generated automatically.", event: "Packed · AWB generated · shipped today", owner: "Warehouse → Courier", record: { doc: "Shipment", code: "AWB 41-2208", status: "Shipped", fields: [["Courier", "Auto-selected"], ["Dispatched", "Same day"], ["Stock", "Synced to marketplaces"], ["ETA", "2 days"]] }, durationMs: 5500 },
      { id: "deliver", label: "Delivery", title: "Tracking updates arrive before anyone asks.", detail: "Shipped, out-for-delivery and delivered updates go out on WhatsApp. Fewer 'where is my order' tickets, and fewer refused deliveries.", event: "Delivered · no support ticket", owner: "Courier → Customer", record: { doc: "Tracking", code: "AWB 41-2208", status: "Delivered", fields: [["Updates", "3 on WhatsApp"], ["Delivered", "Day 2"], ["Support tickets", "0"], ["RTO", "Avoided"]] }, durationMs: 5000 },
      { id: "reorder", label: "Reorder", title: "The reorder is prompted when the product runs out.", detail: "On day 30 — when a bundle usually runs out — the customer gets a reorder reminder. The second order costs nothing to acquire.", event: "Reorder placed · day 31", owner: "System → Customer", record: { doc: "Repeat order", code: "ORD-51902", status: "Paid", fields: [["Reminder", "Day 30"], ["Reordered", "Day 31"], ["Acquisition cost", "₹0"], ["Lifetime value", "2 orders"]] }, durationMs: 6000 },
    ],
  },

  edtech: {
    eyebrow: "Institute / Enquiry to results",
    title: "One student, from the first enquiry to test results.",
    description: "Follow a single admission through counselling, a demo class, batch allocation and fees — and see the parent dashboard that stops the status calls.",
    sample: "ENQ-4127 · JEE 2-year programme · Class 11",
    stages: [
      { id: "enquiry", label: "Enquiry", title: "The enquiry is captured wherever it starts.", detail: "A parent fills the JEE programme form from a Google search at night. The enquiry lands in the admissions pipeline with the course and class recorded.", event: "ENQ-4127 created · JEE, Class 11", owner: "Website → Admissions", record: { doc: "Enquiry", code: "ENQ-4127", status: "New", fields: [["Course", "JEE · 2 years"], ["Class", "11"], ["Source", "Google search"], ["Received", "10:18 pm"]] }, durationMs: 5000 },
      { id: "counsel", label: "Counselling", title: "A counsellor calls with the full context.", detail: "The counsellor gets a call task for the morning with the enquiry details. The call, the concerns and the next step are logged on the record.", event: "Counselled · demo requested", owner: "Admissions → Counsellor", record: { doc: "Counselling", code: "CN-4127", status: "Done", fields: [["Call", "Next morning"], ["Concern", "Batch timing"], ["Next step", "Demo class"], ["Counsellor", "Assigned"]] }, durationMs: 5500 },
      { id: "demo", label: "Demo class", title: "The demo class is booked and followed up.", detail: "The student attends Saturday's physics demo. A feedback form and the fee plan go out the same evening, while interest is highest.", event: "Demo attended · fee plan sent", owner: "Faculty → Admissions", record: { doc: "Demo", code: "DM-0931", status: "Attended", fields: [["Subject", "Physics"], ["Date", "Saturday"], ["Feedback", "4.6 / 5"], ["Fee plan", "Sent same day"]] }, durationMs: 5500 },
      { id: "enrol", label: "Enrolment", title: "Admission and the first instalment close online.", detail: "The parent pays the first instalment by UPI from the fee link. The admission is confirmed without a trip to the front desk.", event: "Enrolled · instalment 1 paid", owner: "Parent → Accounts", record: { doc: "Admission", code: "AD-2026-0412", status: "Confirmed", fields: [["Programme", "JEE · 2 years"], ["Instalment 1", "Paid · UPI"], ["Plan", "4 instalments"], ["Documents", "Uploaded"]] }, durationMs: 5500 },
      { id: "batch", label: "Batch", title: "The student is placed in a batch with seats.", detail: "Batch allocation checks timing preference and seats — the evening batch has 6 left. Timetable and study material access go out automatically.", event: "Allotted · Batch E2 (24 / 30)", owner: "Academics → Student", record: { doc: "Batch allocation", code: "E2", status: "Allotted", fields: [["Batch", "Evening · E2"], ["Seats", "24 / 30"], ["Timetable", "Shared"], ["Portal access", "Created"]] }, durationMs: 5000 },
      { id: "attend", label: "Attendance", title: "Attendance reaches parents without a call.", detail: "Attendance is marked per class, and the parent dashboard shows it the same day. Two missed classes trigger an alert to the counsellor.", event: "Attendance 94% · parent dashboard live", owner: "Faculty → Parent", record: { doc: "Attendance", code: "E2 · week 6", status: "94%", fields: [["This month", "94%"], ["Alerts", "None"], ["Parent view", "Live dashboard"], ["Status calls", "Not needed"]] }, durationMs: 5500 },
      { id: "fees", label: "Fees", title: "Instalments collect themselves.", detail: "Reminders go out before each due date with a payment link. Accounts sees what's due, paid and overdue without a spreadsheet.", event: "Instalment 2 collected on time", owner: "System → Parent", record: { doc: "Fee ledger", code: "AD-2026-0412", status: "On track", fields: [["Paid", "2 of 4"], ["Next due", "In 60 days"], ["Reminders", "Automatic"], ["Overdue", "₹0"]] }, durationMs: 5000 },
      { id: "results", label: "Results", title: "Test results close the loop — and bring referrals.", detail: "Mock test scores and ranks are published to the student and parent. Strong results feed a referral request and the institute's local pages.", event: "Mock test 3 published · referral requested", owner: "Academics → Parent", record: { doc: "Test report", code: "MT-3", status: "Published", fields: [["Score", "212 / 300"], ["Batch rank", "5"], ["Trend", "+18 since MT-1"], ["Referral", "Requested"]] }, durationMs: 6000 },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*                              Impact estimators                             */
/* -------------------------------------------------------------------------- */

export interface EstimatorInput {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Shown after the value, e.g. "people", "%", "₹". Prefix units start with "₹". */
  unit: string;
}

export interface EstimatorOutput {
  label: string;
  value: string;
  note: string;
}

export interface IndustryEstimator {
  title: string;
  intro: string;
  inputs: EstimatorInput[];
  compute: (values: Record<string, number>) => EstimatorOutput[];
  /** Plain-language assumptions shown under the result. */
  assumptions: string[];
}

const WORKING_DAYS = 26;

/** Indian grouping: 1,23,456 · with ₹ lakh / crore for large amounts. */
export function formatInr(amount: number): string {
  const n = Math.max(0, Math.round(amount));
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(n >= 10_00_00_000 ? 0 : 1)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(n >= 10_00_000 ? 0 : 1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatCount(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString("en-IN");
}

export const INDUSTRY_ESTIMATORS: Record<IndustryKey, IndustryEstimator> = {
  manufacturing: {
    title: "What re-keying is costing you",
    intro: "Move the sliders to match your office and shop floor. The estimate uses the lower end of what our manufacturing builds deliver.",
    inputs: [
      { id: "staff", label: "People entering or reconciling data", min: 1, max: 40, step: 1, default: 6, unit: "people" },
      { id: "hours", label: "Hours each spends on it per day", min: 0.5, max: 6, step: 0.5, default: 2, unit: "h / day" },
      { id: "salary", label: "Average monthly cost per person", min: 15000, max: 80000, step: 1000, default: 25000, unit: "₹" },
      { id: "leadDays", label: "Current quote-to-dispatch time", min: 3, max: 45, step: 1, default: 14, unit: "days" },
    ],
    compute: ({ staff, hours, salary, leadDays }) => {
      const hoursSaved = staff * hours * WORKING_DAYS * 0.8;
      const hourlyCost = salary / (WORKING_DAYS * 8);
      return [
        { label: "Hours freed each month", value: formatCount(hoursSaved), note: "at −80% manual data entry" },
        { label: "Staff time recovered", value: `${formatInr(hoursSaved * hourlyCost)} / mo`, note: "at your cost per person" },
        { label: "Quote-to-dispatch", value: `${Math.max(1, Math.round(leadDays * 0.6))} days`, note: `from ${leadDays} days · −40%` },
      ];
    },
    assumptions: ["26 working days and 8-hour days", "80% of data entry and reconciliation removed by one connected ERP", "40% shorter quote-to-dispatch once orders, production and dispatch share one record"],
  },
  "real-estate": {
    title: "What slow follow-up is costing you",
    intro: "Enter your monthly funnel. The estimate assumes a 1.5× lift in site-visit-to-booking — below the 2× our real-estate builds reach.",
    inputs: [
      { id: "leads", label: "Qualified leads per month", min: 20, max: 2000, step: 10, default: 300, unit: "leads" },
      { id: "visitRate", label: "Leads that book a site visit", min: 5, max: 40, step: 1, default: 15, unit: "%" },
      { id: "bookRate", label: "Site visits that book a unit", min: 2, max: 30, step: 1, default: 8, unit: "%" },
      { id: "ticket", label: "Average unit value", min: 2500000, max: 50000000, step: 500000, default: 7500000, unit: "₹" },
    ],
    compute: ({ leads, visitRate, bookRate, ticket }) => {
      const visits = leads * (visitRate / 100);
      const extraBookings = visits * (bookRate / 100) * 0.5;
      return [
        { label: "Extra bookings each month", value: extraBookings < 10 ? extraBookings.toFixed(1) : formatCount(extraBookings), note: `from ${formatCount(visits)} site visits` },
        { label: "Added sales value", value: `${formatInr(extraBookings * ticket)} / mo`, note: "at your average unit value" },
        { label: "First response", value: "Under 5 min", note: "every lead, every source" },
      ];
    },
    assumptions: ["Site-visit-to-booking improves 1.5× with instant response, scoring and structured follow-up", "Lead volume stays the same — organic growth is not included", "Sales value, not collected revenue"],
  },
  healthcare: {
    title: "What no-shows and phone calls are costing you",
    intro: "Enter a typical day at your clinic. The estimate uses the −25% no-show and −60% call-volume outcomes from our clinic builds.",
    inputs: [
      { id: "appointments", label: "Appointments per day", min: 10, max: 300, step: 5, default: 60, unit: "per day" },
      { id: "noShow", label: "Current no-show rate", min: 5, max: 40, step: 1, default: 18, unit: "%" },
      { id: "fee", label: "Average consultation value", min: 300, max: 5000, step: 100, default: 800, unit: "₹" },
      { id: "calls", label: "Calls to reception per day", min: 20, max: 500, step: 10, default: 120, unit: "per day" },
    ],
    compute: ({ appointments, noShow, fee, calls }) => {
      const recovered = appointments * WORKING_DAYS * (noShow / 100) * 0.25;
      return [
        { label: "Appointments recovered / month", value: formatCount(recovered), note: `no-shows ${noShow}% → ${Math.round(noShow * 0.75)}%` },
        { label: "Revenue recovered", value: `${formatInr(recovered * fee)} / mo`, note: "at your consultation value" },
        { label: "Reception calls avoided", value: `${formatCount(calls * 0.6)} / day`, note: "at −60% call volume" },
      ];
    },
    assumptions: ["26 clinic days a month", "No-shows fall 25% with WhatsApp reminders and one-tap rescheduling", "60% of calls replaced by online booking, reminders and status messages"],
  },
  ecommerce: {
    title: "What abandoned carts and one-time buyers cost you",
    intro: "Enter your store's numbers. The estimate uses the low end of our D2C outcomes: 15% cart recovery and a 1.5× repeat rate.",
    inputs: [
      { id: "carts", label: "Abandoned carts per month", min: 100, max: 20000, step: 100, default: 2000, unit: "carts" },
      { id: "aov", label: "Average order value", min: 300, max: 5000, step: 50, default: 1200, unit: "₹" },
      { id: "gmv", label: "Monthly GMV", min: 1000000, max: 20000000, step: 500000, default: 4000000, unit: "₹" },
      { id: "repeat", label: "Revenue from repeat customers", min: 5, max: 40, step: 1, default: 15, unit: "%" },
    ],
    compute: ({ carts, aov, gmv, repeat }) => {
      const recoveredOrders = carts * 0.15;
      const repeatUplift = gmv * (repeat / 100) * 0.5;
      return [
        { label: "Orders recovered / month", value: formatCount(recoveredOrders), note: "at 15% cart recovery" },
        { label: "Recovered revenue", value: `${formatInr(recoveredOrders * aov)} / mo`, note: "at your average order value" },
        { label: "Added repeat revenue", value: `${formatInr(repeatUplift)} / mo`, note: `repeat share ${repeat}% → ${Math.round(repeat * 1.5)}%` },
      ];
    },
    assumptions: ["15% of abandoned carts recovered through WhatsApp and email", "Repeat revenue grows 1.5× with reorder reminders over about 6 months", "GMV before returns"],
  },
  edtech: {
    title: "What leaky admissions are costing you",
    intro: "Enter your admissions funnel. The estimate uses a 40% lift in inquiry-to-enrolment — the low end of our institute builds.",
    inputs: [
      { id: "enquiries", label: "Enquiries per month", min: 50, max: 5000, step: 50, default: 600, unit: "enquiries" },
      { id: "conversion", label: "Enquiries that enrol today", min: 3, max: 40, step: 1, default: 12, unit: "%" },
      { id: "fee", label: "Average programme fee", min: 5000, max: 300000, step: 5000, default: 60000, unit: "₹" },
      { id: "calls", label: "Parent status calls per day", min: 10, max: 400, step: 10, default: 80, unit: "per day" },
    ],
    compute: ({ enquiries, conversion, fee, calls }) => {
      const extra = enquiries * (conversion / 100) * 0.4;
      return [
        { label: "Extra enrolments / month", value: formatCount(extra), note: `conversion ${conversion}% → ${(conversion * 1.4).toFixed(1)}%` },
        { label: "Added fee value", value: `${formatInr(extra * fee)} / mo`, note: "at your average fee" },
        { label: "Parent calls avoided", value: `${formatCount(calls * 0.7)} / day`, note: "with a live parent dashboard" },
      ];
    },
    assumptions: ["Inquiry-to-enrolment improves 40% with instant capture, counselling tasks and demo follow-up", "Fee value is the programme fee booked, not collected", "70% of status calls replaced by the parent dashboard"],
  },
};
