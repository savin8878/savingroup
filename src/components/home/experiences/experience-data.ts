/**
 * Seven walkthroughs that follow ONE story across the "One flow" section:
 * a tool-wear stop on CNC-M2 (Line 2) while machining DRV-240 housings for
 * work order WO-0318. The ERP walkthrough (procurement-data.ts) already owns
 * PR-0241 → PO-0089 → GRN-0058; these stories reference it, never contradict it.
 * All values are illustrative sample data.
 */
export type ExperienceKey = "machine" | "iot" | "data" | "ai" | "automation" | "dashboard" | "decision";

export type ExperienceRecord = {
  doc: string;
  code: string;
  status: string;
  fields: [string, string][];
  /** The connected-record line under the fields. */
  link?: string;
  /** Footer note under the record. */
  note?: string;
};

export type ExperienceStage = {
  label: string;
  title: string;
  detail: string;
  event: string;
  owner: string;
  record: ExperienceRecord;
  durationMs: number;
  /** Left caption of the scene bar for this stage. */
  scene?: string;
};

export type Experience = {
  key: ExperienceKey;
  eyebrow: string;
  title: string;
  description: string;
  /** The one thing the story follows. Shown at the right of the scene bar. */
  sample: string;
  /** Mono tag shown at the right of the event log, e.g. "MACHINE EVENT". */
  eventTag: string;
  /** Linked-record trail under the scene: each code lights from its stage. */
  trail: { label: string; items: { code: string; from: number }[] };
  stages: ExperienceStage[];
};

export const MACHINE_EXPERIENCE: Experience = {
  key: "machine",
  eyebrow: "Machine / The physical world",
  title: "Where the work happens. Where the story starts.",
  description: "Follow one spindle on Line 2 from a normal cycle to the event it sends onward. Interactive example · sample data.",
  sample: "CNC-M2 / LINE 2 / WO-0318",
  eventTag: "MACHINE EVENT",
  trail: { label: "Signal trail", items: [{ code: "CYCLE", from: 0 }, { code: "VIB", from: 1 }, { code: "T07", from: 2 }, { code: "RC-14", from: 3 }, { code: "OEE", from: 4 }, { code: "EVT", from: 5 }] },
  stages: [
    { label: "Cycle running", title: "A normal cycle on Line 2.", detail: "CNC-M2 is machining DRV-240 housings for work order WO-0318. Spindle S1 turns at 6,200 rpm, vibration sits at 2.1 mm/s and the cycle counter reads 412. Everything is inside its operating window.", event: "Cycle 412 started · CNC-M2 · WO-0318", owner: "Line 2 → CNC-M2 (K. Patel, operator)", scene: "Machine running", durationMs: 6000,
      record: { doc: "Machine status", code: "CNC-M2", status: "Running · cycle 412", fields: [["Work order", "WO-0318 · DRV-240 housing"], ["Operation", "OP 20 · finish bore"], ["Spindle speed", "6,200 rpm"], ["Vibration", "2.1 mm/s"], ["Spindle temp", "46 °C"], ["Tool", "T07 · carbide insert"]], link: "WO-0318 → MRP-0032 → PR-0241", note: "Every value here is sample data from the illustrative line." } },
    { label: "Vibration rises", title: "The spindle starts to complain.", detail: "Over the next cycles, vibration on spindle S1 climbs from 2.1 to 4.8 mm/s and the bearing temperature rises to 61 °C. The part is still in tolerance, but the trend is not.", event: "Vibration 4.8 mm/s · spindle temp 61 °C · trend rising", owner: "CNC-M2 → condition monitor", scene: "Condition monitoring", durationMs: 6500,
      record: { doc: "Condition readings", code: "S1 / 07:09–07:12", status: "Trend rising", fields: [["Vibration", "2.1 → 4.8 mm/s"], ["Spindle temp", "46 → 61 °C"], ["Feed override", "100 %"], ["Tool wear (T07)", "78 → 89 %"], ["Sample interval", "250 ms"]], link: "Readings attached to cycle 412 · WO-0318", note: "Readings are tagged with the cycle and work order, so context is never lost." } },
    { label: "Threshold crossed", title: "Tool wear crosses the line.", detail: "The wear model for insert T07 passes 90 % and vibration stays above the 4.5 mm/s limit for three consecutive samples. The machine raises a tool-wear warning on the operator panel.", event: "Tool-wear warning · T07 at 92 % · vibration > 4.5 mm/s", owner: "CNC-M2 → operator panel (K. Patel)", scene: "Threshold monitoring", durationMs: 6500,
      record: { doc: "Tool-wear warning", code: "WRN-M2-0071", status: "Warning raised", fields: [["Tool", "T07 · CNMG-12 insert"], ["Wear estimate", "92 % (limit 90 %)"], ["Vibration", "4.8 mm/s (limit 4.5)"], ["Consecutive samples", "3 of 3"], ["Recommended", "Inspect insert"]], link: "WRN-M2-0071 → cycle 412 · WO-0318", note: "The threshold lives in the machine, so the warning is raised even when nothing else is connected." } },
    { label: "Minor stop", title: "A short stop, with a reason.", detail: "The operator pauses the cycle, inspects the insert and logs reason code RC-14 (tool wear) on the panel. The stop lasts 3 minutes 40 seconds before the cycle resumes at reduced feed.", event: "Minor stop 03:40 · reason RC-14 tool wear · feed 80 %", owner: "K. Patel (operator) → machine log", scene: "Stop & reason code", durationMs: 7000,
      record: { doc: "Stop record", code: "STP-M2-0219", status: "Closed · 03:40", fields: [["Reason code", "RC-14 · tool wear"], ["Started", "07:12:41"], ["Duration", "3 min 40 s"], ["Action", "Inspected · resumed at 80 % feed"], ["Logged by", "K. Patel"]], link: "STP-M2-0219 → WRN-M2-0071", note: "A reason code turns downtime into information the rest of the system can use." } },
    { label: "Counters updated", title: "The numbers move with the machine.", detail: "Cycle count, run time and downtime update in place. Availability for the shift drops slightly and OEE for Line 2 moves from 84.2 % to 83.6 %, attributed to the reason code.", event: "Cycle count 412 · downtime +03:40 · OEE 83.6 %", owner: "CNC-M2 → shift counters", scene: "Shift counters", durationMs: 6000,
      record: { doc: "Shift counters", code: "L2 / SHIFT A", status: "Updated 07:16", fields: [["Cycles today", "412"], ["Run time", "6 h 12 m"], ["Downtime", "14 m 10 s (+03:40)"], ["Availability", "96.3 %"], ["Performance", "91.4 %"], ["OEE", "84.2 → 83.6 %"]], link: "Downtime attributed to RC-14 · T07", note: "OEE is computed from the counters the machine keeps, not from a spreadsheet." } },
    { label: "Event emitted", title: "The machine speaks.", detail: "CNC-M2 emits one structured event: what happened, when, on which tool and for which work order. It leaves the machine for the edge gateway, where the IoT stage begins.", event: "EVT-M2-1187 emitted · TOOL_WEAR_STOP · 07:12:41.250", owner: "CNC-M2 → edge gateway EG-02", scene: "Event emitted", durationMs: 7000,
      record: { doc: "Machine event", code: "EVT-M2-1187", status: "Emitted", fields: [["Type", "TOOL_WEAR_STOP"], ["Machine", "CNC-M2 · Line 2"], ["Timestamp", "2026-09-25 07:12:41.250"], ["Tool", "T07 · wear 92 %"], ["Stop", "STP-M2-0219 · RC-14"], ["Work order", "WO-0318"]], link: "EVT-M2-1187 → IoT gateway EG-02", note: "Next stage: IoT captures the signal and carries it to the cloud." } },
  ],
};

export const IOT_EXPERIENCE: Experience = {
  key: "iot",
  eyebrow: "IoT / Capture the signal",
  title: "A signal leaves the shop floor intact.",
  description: "Follow EVT-M2-1187 from the PLC through an edge gateway to the cloud, including a dropped link. Interactive example · sample data.",
  sample: "EG-02 / LINE 2 / MQTT",
  eventTag: "SIGNAL CAPTURED",
  trail: { label: "Link trail", items: [{ code: "PLC", from: 0 }, { code: "BUFFER", from: 1 }, { code: "RESEND", from: 2 }, { code: "TLS", from: 3 }, { code: "HB", from: 4 }, { code: "CLOUD", from: 5 }] },
  stages: [
    { label: "Tags read", title: "The gateway reads the PLC.", detail: "Edge gateway EG-02 polls four tags on the CNC-M2 PLC every 250 ms: state, vibration, spindle temperature and tool wear. The event from the machine arrives as a fifth, structured message.", event: "4 tags polled · 250 ms · EVT-M2-1187 received at edge", owner: "PLC S7-1500 → edge gateway EG-02", scene: "Edge polling", durationMs: 6000,
      record: { doc: "Tag subscription", code: "EG-02 / M2", status: "Polling · 4 tags", fields: [["M2.State", "RUNNING"], ["M2.Vib", "4.8 mm/s"], ["M2.SpindleTemp", "61 °C"], ["T07.Wear", "92 %"], ["Poll interval", "250 ms"], ["Protocol", "S7 / OPC UA"]], link: "EVT-M2-1187 → queue EG-02", note: "The gateway speaks the PLC's language, so the machine does not need to change." } },
    { label: "Link drops", title: "The 3G link goes down. Nothing is lost.", detail: "At 07:12:52 the cellular link drops. The gateway keeps reading and stores every message in its local buffer, oldest first, with the original timestamps.", event: "Link lost 07:12:52 · buffering locally · 537 messages", owner: "EG-02 → local store", scene: "Store and forward", durationMs: 7000,
      record: { doc: "Link status", code: "EG-02 / CELL-1", status: "Offline · buffering", fields: [["Link", "3G · signal lost"], ["Down since", "07:12:52"], ["Buffered", "537 messages"], ["Buffer used", "12.4 MB of 512 MB"], ["Oldest message", "07:12:41.250"], ["Data loss", "None"]], link: "Buffer holds EVT-M2-1187 + readings", note: "Store-and-forward means a bad link delays the signal; it does not delete it." } },
    { label: "Link returns", title: "The buffer drains, in order.", detail: "After 2 minutes 14 seconds the link is back. The gateway resends the buffered messages in sequence, then returns to live streaming. Every message keeps its original timestamp.", event: "Link restored 07:15:06 · 537 messages resent · live", owner: "EG-02 → cloud broker", scene: "Replay", durationMs: 6500,
      record: { doc: "Replay report", code: "RPL-EG02-0042", status: "Complete · 537 / 537", fields: [["Outage", "2 min 14 s"], ["Resent", "537 messages"], ["Order", "Oldest first"], ["Timestamps", "Original preserved"], ["Replay time", "3.8 s"], ["Mode", "Live streaming"]], link: "RPL-EG02-0042 → broker plant/line2", note: "Duplicates from the resend are handled in the Data stage." } },
    { label: "Secure publish", title: "Published, encrypted, acknowledged.", detail: "Each message is published over MQTT with TLS 1.3 and a device certificate. QoS 1 means the broker acknowledges every message before the gateway forgets it.", event: "MQTT publish · plant/line2/m2/events · TLS 1.3 · QoS 1", owner: "EG-02 → MQTT broker", scene: "Secure transport", durationMs: 6500,
      record: { doc: "Publish envelope", code: "MQTT / QoS 1", status: "Acknowledged", fields: [["Topic", "plant/line2/m2/events"], ["Transport", "MQTT 5 · TLS 1.3"], ["Identity", "Device cert EG-02 · valid to 2027"], ["QoS", "1 · at least once"], ["Payload", "412 bytes · JSON"], ["Broker ack", "PUBACK 07:15:06.104"]], link: "EVT-M2-1187 → broker → topic subscribers", note: "Every device has its own certificate. A lost gateway can be revoked without touching the rest." } },
    { label: "Heartbeat", title: "The device reports on itself.", detail: "Every 30 seconds the gateway sends a heartbeat: uptime, CPU, temperature, buffer level and link quality. A missed heartbeat is itself a signal worth watching.", event: "Heartbeat 07:15:30 · uptime 41 d · buffer 0 % · RSSI −71 dBm", owner: "EG-02 → device registry", scene: "Device health", durationMs: 6000,
      record: { doc: "Device health", code: "EG-02 / HB", status: "Healthy", fields: [["Uptime", "41 d 6 h"], ["CPU", "12 %"], ["Board temp", "48 °C"], ["Buffer", "0 %"], ["Link", "4G · −71 dBm"], ["Last heartbeat", "07:15:30"]], link: "EG-02 → registry · 14 devices online", note: "Health data uses the same pipe as production data, so the fleet is visible from one place." } },
    { label: "Lands in cloud", title: "The signal lands with its timestamp.", detail: "EVT-M2-1187 is now in the cloud with the machine's original timestamp, the gateway's receive time and the broker's ack time. The Data stage takes it from here.", event: "EVT-M2-1187 stored · original ts 07:12:41.250 · latency 2 m 25 s", owner: "Broker → event store", scene: "Cloud receipt", durationMs: 7000,
      record: { doc: "Stored message", code: "EVT-M2-1187", status: "Stored", fields: [["Machine timestamp", "07:12:41.250"], ["Edge received", "07:12:41.402"], ["Broker ack", "07:15:06.104"], ["End-to-end", "2 min 25 s (outage)"], ["Integrity", "SHA-256 verified"], ["Next", "Data pipeline"]], link: "EVT-M2-1187 → data pipeline ingest", note: "Next stage: Data validates, de-duplicates and joins the signal to WO-0318." } },
  ],
};

export const DATA_EXPERIENCE: Experience = {
  key: "data",
  eyebrow: "Data / Make it usable",
  title: "From a raw payload to one reliable record.",
  description: "Follow the Line 2 messages through validation, de-duplication and joins until any system can ask for them. Interactive example · sample data.",
  sample: "PIPELINE / LINE 2 / 537 ROWS",
  eventTag: "RECORD SHAPED",
  trail: { label: "Row trail", items: [{ code: "INGEST", from: 0 }, { code: "VALID", from: 1 }, { code: "DEDUPE", from: 2 }, { code: "JOIN", from: 3 }, { code: "TIMELINE", from: 4 }, { code: "API", from: 5 }] },
  stages: [
    { label: "Raw payload", title: "It starts as JSON from a gateway.", detail: "537 messages arrive from EG-02, including the resend. Each is a small JSON payload with a machine id, readings and a timestamp. Nothing is trusted yet.", event: "537 rows ingested · source EG-02 · topic plant/line2/m2", owner: "Broker → ingest", scene: "Ingest", durationMs: 6000,
      record: { doc: "Ingest batch", code: "ING-0925-0712", status: "Received · 537 rows", fields: [["Source", "EG-02 · plant/line2/m2"], ["Rows", "537"], ["Window", "07:12:41 – 07:15:06"], ["Format", "JSON · 412 B avg"], ["Schema version", "m2-events v3"], ["Trust", "Unvalidated"]], link: "ING-0925-0712 → validation", note: "Raw rows are kept exactly as received, so any step can be replayed." } },
    { label: "Validated", title: "Units, timestamps, schema.", detail: "Each row is checked against the schema: vibration in mm/s, temperature in °C, timestamps in UTC with milliseconds. One row with a 41-minute clock skew goes to quarantine for review instead of poisoning the timeline.", event: "536 rows valid · 1 quarantined · clock skew 41 min", owner: "Validator → quarantine", scene: "Validation", durationMs: 7000,
      record: { doc: "Validation report", code: "VAL-0712", status: "536 / 537 passed", fields: [["Schema", "m2-events v3 ✓"], ["Units", "mm/s · °C · % ✓"], ["Timestamps", "UTC ± 2 s ✓"], ["Quarantined", "1 row · ts skew 41 min"], ["Rejected", "0"], ["Review", "Data steward"]], link: "Row 218 → quarantine Q-0712", note: "Quarantine keeps bad rows visible instead of silently dropping them." } },
    { label: "De-duplicated", title: "One event, once.", detail: "The resend after the 3G outage created 24 exact duplicates. They are removed by message id and timestamp, leaving 512 unique rows. EVT-M2-1187 appears exactly once.", event: "24 duplicates removed · 512 unique rows", owner: "Dedupe → timeline builder", scene: "De-duplication", durationMs: 6000,
      record: { doc: "Dedupe summary", code: "DDP-0712", status: "512 unique", fields: [["Input", "536 rows"], ["Duplicates", "24 (resend overlap)"], ["Key", "message_id + ts"], ["Unique", "512"], ["EVT-M2-1187", "1 copy"], ["Method", "Idempotent upsert"]], link: "DDP-0712 → join stage", note: "Idempotent writes mean a replay never doubles a downtime figure." } },
    { label: "Joined", title: "Joined to the work order and the machine.", detail: "Each row is joined to the machine master (CNC-M2, Line 2, tool T07) and to work order WO-0318 for DRV-240 housings. Now a vibration reading knows which part, which order and which customer it belongs to.", event: "512 rows joined · WO-0318 · asset CNC-M2 · tool T07", owner: "Join → operations model", scene: "Join to masters", durationMs: 7000,
      record: { doc: "Joined record", code: "EVT-M2-1187 (enriched)", status: "Joined", fields: [["Asset", "CNC-M2 · Line 2 · S7-1500"], ["Work order", "WO-0318 · DRV-240 · 30 units"], ["Tool", "T07 · CNMG-12 · installed 14 Sep"], ["Customer order", "SO-1142 · due 27 Sep"], ["Linked purchase", "PR-0241 → PO-0089"], ["Join keys", "asset_id · wo_id"]], link: "EVT-M2-1187 → WO-0318 → SO-1142", note: "The joins reuse the ERP masters, so there is one definition of a machine." } },
    { label: "Timeline", title: "Written to the timeline.", detail: "The enriched rows are appended to the Line 2 timeline: readings, the warning, the stop and the event, in order. The stop is now a 3 min 40 s interval with a reason code, not two loose messages.", event: "Timeline updated · 1 stop interval · 1 warning · 510 readings", owner: "Timeline → event store", scene: "Timeline write", durationMs: 6000,
      record: { doc: "Line 2 timeline", code: "TL-L2-0925", status: "Appended", fields: [["Readings", "510"], ["Warnings", "1 · WRN-M2-0071"], ["Stops", "1 · 03:40 · RC-14"], ["Events", "1 · EVT-M2-1187"], ["Retention", "5 years"], ["Version", "Immutable · append-only"]], link: "TL-L2 → OEE · maintenance · AI", note: "An append-only timeline is the audit trail for everything that follows." } },
    { label: "Served", title: "One API for every consumer.", detail: "ERP, the AI agent and the dashboard all read the same record through one API. Nobody re-keys, nobody exports, and every answer carries the same event id.", event: "GET /v1/events/EVT-M2-1187 · 200 · 3 consumers", owner: "API → ERP · AI · Dashboard", scene: "Served by API", durationMs: 6500,
      record: { doc: "API response", code: "GET /v1/events/EVT-M2-1187", status: "200 OK · 38 ms", fields: [["Consumers", "ERP · AI agent · Dashboard"], ["Auth", "OAuth 2 · scope events:read"], ["Latency", "38 ms (p95 61 ms)"], ["Cache", "ETag · 30 s"], ["Shape", "event + asset + work order"], ["Next", "AI agent reads context"]], link: "EVT-M2-1187 → AI agent context", note: "Next stage: the AI agent reads the event with its context." } },
  ],
};

export const AI_EXPERIENCE: Experience = {
  key: "ai",
  eyebrow: "AI / Understand the next step",
  title: "An agent that reads, plans and asks first.",
  description: "Watch an operations agent turn EVT-M2-1187 into a recommendation it is allowed to make. Interactive example · sample data.",
  sample: "AG-OPS / LINE 2 / EVT-M2-1187",
  eventTag: "AGENT STEP LOGGED",
  trail: { label: "Reasoning trail", items: [{ code: "READ", from: 0 }, { code: "PLAN", from: 1 }, { code: "TOOLS", from: 2 }, { code: "DRAFT", from: 3 }, { code: "APPROVE", from: 4 }, { code: "LOG", from: 5 }] },
  stages: [
    { label: "Reads context", title: "The agent reads the event, then the context around it.", detail: "AG-OPS receives EVT-M2-1187 and pulls what a good engineer would check: when T07 was last changed, how many inserts are in stock, and when WO-0318 is due.", event: "Context loaded · 4 sources · EVT-M2-1187", owner: "Event API → AG-OPS", scene: "Reading context", durationMs: 6500,
      record: { doc: "Agent context", code: "CTX-0412", status: "Loaded · 4 sources", fields: [["Event", "TOOL_WEAR_STOP · T07 · 92 %"], ["Maintenance history", "T07 changed 14 Sep (11 d ago)"], ["Tool stock", "4 inserts (min 12)"], ["Work order", "WO-0318 · 30 units · due 27 Sep"], ["Next changeover", "14:30 today"], ["Model", "Reasoning model via API"]], link: "CTX-0412 → EVT-M2-1187 · WO-0318", note: "The agent sees only the records its role is allowed to read." } },
    { label: "Plans", title: "A plan, inside the permitted tools.", detail: "The agent lays out a short plan and checks it against its permissions. It may check stock, read the calendar and draft a ticket. It may not submit a purchase or write to the machine.", event: "Plan drafted · 3 tools permitted · 1 denied", owner: "AG-OPS → policy check", scene: "Planning within policy", durationMs: 6000,
      record: { doc: "Agent plan", code: "PLN-0412", status: "Within policy", fields: [["Step 1", "stock.check(T07 insert)"], ["Step 2", "calendar.read(line2)"], ["Step 3", "ticket.draft(maintenance)"], ["Denied", "purchase.submit · machine.write"], ["Budget", "≤ 6 tool calls"], ["Policy", "ops-agent v2"]], link: "PLN-0412 → tool gateway (MCP)", note: "Permissions are enforced by the tool gateway, not by the prompt." } },
    { label: "Calls tools", title: "Two tool calls. Two facts.", detail: "Through the tool gateway the agent checks the insert stock and reads the Line 2 calendar. Both answers are recorded with their source and time.", event: "stock.check → 4 in stock · calendar.read → changeover 14:30", owner: "AG-OPS → tool gateway → ERP · calendar", scene: "Tool calls", durationMs: 6500,
      record: { doc: "Tool calls", code: "TC-0412-01 / 02", status: "2 of 2 succeeded", fields: [["stock.check", "T07 insert · 4 on hand · min 12"], ["Source", "ERP inventory · 07:19:02"], ["calendar.read", "Line 2 changeover · 14:30"], ["Source", "Production calendar · 07:19:03"], ["Latency", "210 ms · 95 ms"], ["Errors", "0"]], link: "TC-0412 → PLN-0412", note: "Every tool call is logged with its inputs and outputs." } },
    { label: "Drafts", title: "A recommendation, with reasons.", detail: "The agent drafts REC-0412: replace insert T07 at the 14:30 changeover instead of stopping now, and reorder 20 inserts because stock is below minimum. It states its confidence and what it did not check.", event: "REC-0412 drafted · replace at changeover · reorder 20", owner: "AG-OPS → review queue", scene: "Recommendation draft", durationMs: 7000,
      record: { doc: "Recommendation", code: "REC-0412", status: "Draft · awaiting review", fields: [["Action 1", "Replace T07 at 14:30 changeover"], ["Action 2", "Reorder 20 inserts (PR)"], ["Why", "Wear 92 %, 2.5 h to changeover, WO-0318 on time"], ["Risk", "Low · reduced feed until then"], ["Confidence", "0.86"], ["Not checked", "Supplier lead time"]], link: "REC-0412 → approval queue", note: "A draft is a proposal. Nothing has changed in the plant yet." } },
    { label: "Approval", title: "A person decides.", detail: "REC-0412 stops at the approval boundary. R. Iyer, the maintenance lead, reads the recommendation and the reasons, edits nothing and approves it at 07:26.", event: "REC-0412 approved · R. Iyer · 07:26", owner: "AG-OPS → R. Iyer (maintenance lead)", scene: "Human approval", durationMs: 6000,
      record: { doc: "Approval", code: "APR-0412", status: "Approved 07:26", fields: [["Reviewer", "R. Iyer · Maintenance lead"], ["Read time", "1 min 40 s"], ["Edits", "None"], ["Decision", "Approve both actions"], ["Boundary", "Human approval for maintenance + spend"], ["Channel", "Review queue"]], link: "APR-0412 → REC-0412", note: "The approval boundary is a rule of the workflow, not a courtesy." } },
    { label: "Logged", title: "The decision is logged with its reasoning.", detail: "DEC-0412 records what was recommended, why, what was checked and who approved it, linked to EVT-M2-1187 and WO-0318. The Automation stage picks it up.", event: "DEC-0412 logged · reasoning + tool calls attached", owner: "AG-OPS → decision log → automation", scene: "Decision log", durationMs: 6500,
      record: { doc: "Decision log", code: "DEC-0412", status: "Logged · handed off", fields: [["Recommendation", "REC-0412"], ["Approved by", "R. Iyer · 07:26"], ["Evidence", "CTX-0412 · TC-0412-01/02"], ["Linked", "EVT-M2-1187 · WO-0318"], ["Model / policy", "ops-agent v2"], ["Next", "Automation trigger"]], link: "DEC-0412 → automation trigger", note: "Next stage: Automation puts the approved decision into motion." } },
  ],
};

export const AUTOMATION_EXPERIENCE: Experience = {
  key: "automation",
  eyebrow: "Automation / Put a workflow in motion",
  title: "One approved decision. Four things happen.",
  description: "Follow DEC-0412 through rules, a ticket, a requisition and a message, to a recorded completion. Interactive example · sample data.",
  sample: "WF-14 / RUN-0931 / LINE 2",
  eventTag: "WORKFLOW STEP",
  trail: { label: "Workflow trail", items: [{ code: "TRIGGER", from: 0 }, { code: "RULES", from: 1 }, { code: "MT", from: 2 }, { code: "PR", from: 3 }, { code: "MSG", from: 4 }, { code: "SLA", from: 5 }, { code: "DONE", from: 6 }] },
  stages: [
    { label: "Trigger", title: "An approved decision fires the workflow.", detail: "DEC-0412 arrives on the workflow engine as a trigger. Workflow WF-14 (tool-wear response) starts with the event, the machine and the work order already attached.", event: "WF-14 started · trigger DEC-0412 · 07:26:12", owner: "Decision log → workflow engine", scene: "Trigger", durationMs: 5500,
      record: { doc: "Workflow run", code: "WF-14 / RUN-0931", status: "Started", fields: [["Trigger", "DEC-0412 approved"], ["Context", "EVT-M2-1187 · CNC-M2 · WO-0318"], ["Started", "07:26:12"], ["Rules to evaluate", "3"], ["Owner", "Operations workflow"], ["Mode", "Automatic, with approvals"]], link: "RUN-0931 → DEC-0412", note: "The trigger carries context, so no step has to look it up again." } },
    { label: "Rules", title: "Three rules. Three routes.", detail: "The engine evaluates the rules for a tool-wear stop: create a maintenance ticket, raise a requisition if stock is below minimum, and notify the shift supervisor if severity is 2 or higher. All three are true.", event: "3 rules evaluated · 3 routes opened", owner: "Workflow engine → rule set", scene: "Rule evaluation", durationMs: 6500,
      record: { doc: "Rule evaluation", code: "RUN-0931 / RULES", status: "3 of 3 true", fields: [["R-12", "tool_wear_stop → maintenance ticket"], ["R-18", "stock 4 < min 12 → requisition"], ["R-22", "severity 2 → notify supervisor"], ["Evaluated in", "31 ms"], ["Skipped", "0"], ["Version", "rules v7"]], link: "RUN-0931 → MT · PR · notify", note: "Rules are versioned. The run records which version decided." } },
    { label: "Ticket", title: "A ticket, created and assigned.", detail: "Maintenance ticket MT-0777 is created: replace insert T07 on CNC-M2 at the 14:30 changeover. It is assigned to V. Naik, the technician on shift, with the tool and the machine already attached.", event: "MT-0777 created · assigned V. Naik · due 14:30", owner: "Workflow → maintenance (V. Naik)", scene: "Maintenance ticket", durationMs: 6500,
      record: { doc: "Maintenance ticket", code: "MT-0777", status: "Assigned", fields: [["Task", "Replace insert T07 · CNC-M2"], ["When", "14:30 changeover"], ["Assigned to", "V. Naik · Technician"], ["Parts", "1 × CNMG-12 insert (from stock)"], ["Priority", "2 · planned"], ["Linked", "DEC-0412 · EVT-M2-1187"]], link: "MT-0777 → CNC-M2 · WO-0318", note: "The technician opens one ticket and sees the whole story." } },
    { label: "Requisition", title: "Stock below minimum raises a requisition.", detail: "Because only 4 inserts remain against a minimum of 12, the workflow raises purchase requisition PR-0242 for 20 inserts. It goes to purchasing the same way PR-0241 did for the drive assemblies.", event: "PR-0242 raised · 20 × CNMG-12 insert · to purchasing", owner: "Workflow → ERP purchasing", scene: "Purchase requisition", durationMs: 6500,
      record: { doc: "Purchase requisition", code: "PR-0242", status: "Submitted", fields: [["Item", "Carbide insert CNMG-12"], ["Quantity", "20 units"], ["On hand / minimum", "4 / 12"], ["Reason", "Below minimum · MT-0777"], ["Approval", "Purchasing lead"], ["Related", "PR-0241 · DRV-240 (in progress)"]], link: "PR-0242 → ERP purchasing → RFQ", note: "Same requisition path as the ERP walkthrough, raised by a rule instead of by hand." } },
    { label: "Notify", title: "The supervisor hears about it on WhatsApp.", detail: "Shift supervisor M. Deshmukh gets one message: what happened on CNC-M2, what is planned for 14:30, that PR-0242 was raised, and a link to the ticket. Delivered and read by 07:28.", event: "WhatsApp sent · M. Deshmukh · delivered 07:27 · read 07:28", owner: "Workflow → WhatsApp Business API", scene: "Notification", durationMs: 6000,
      record: { doc: "Notification", code: "MSG-0931-01", status: "Read 07:28", fields: [["To", "M. Deshmukh · Shift supervisor"], ["Channel", "WhatsApp Business"], ["Sent", "07:27:04"], ["Delivered / read", "07:27:06 / 07:28:11"], ["Content", "Stop · plan 14:30 · PR-0242 · ticket link"], ["Reply", "Acknowledged"]], link: "MSG-0931-01 → MT-0777", note: "One message with the context, instead of three phone calls." } },
    { label: "SLA timer", title: "The clock is watching.", detail: "MT-0777 carries a service level: the insert must be replaced by 14:45. The timer runs in the workflow and escalates to the maintenance lead if the ticket is not started by 14:20.", event: "SLA timer running · due 14:45 · escalation 14:20", owner: "Workflow → SLA monitor", scene: "SLA monitor", durationMs: 5500,
      record: { doc: "Service level", code: "MT-0777 / SLA", status: "On track · 7 h 17 m left", fields: [["Target", "Replaced by 14:45"], ["Escalate if not started", "14:20 → R. Iyer"], ["Elapsed", "0 h 02 m"], ["Remaining", "7 h 17 m"], ["Status", "On track"], ["Checks", "Every 60 s"]], link: "SLA → MT-0777 → R. Iyer", note: "Escalation is a rule too, so nobody has to remember to chase." } },
    { label: "Completed", title: "Done, and recorded.", detail: "At 14:36 V. Naik replaces the insert and closes MT-0777 from the shop-floor tablet. The workflow records the completion, stops the SLA timer and posts the result back to the timeline.", event: "MT-0777 completed 14:36 · SLA met · WF-14 finished", owner: "V. Naik → workflow → timeline", scene: "Completion", durationMs: 6500,
      record: { doc: "Completion", code: "MT-0777", status: "Completed 14:36", fields: [["Completed by", "V. Naik"], ["Duration", "11 min (planned 15)"], ["SLA", "Met · 9 min early"], ["Part used", "1 × CNMG-12 · stock now 3"], ["Result", "CNC-M2 vibration 1.9 mm/s"], ["Run", "RUN-0931 finished"]], link: "MT-0777 → TL-L2 → dashboard", note: "Next stage: the dashboard shows what all of this meant." } },
  ],
};

export const DASHBOARD_EXPERIENCE: Experience = {
  key: "dashboard",
  eyebrow: "Dashboard / See what matters",
  title: "The same event, on the founder's screen.",
  description: "See how one stop on Line 2 shows up as numbers, trends and money, on a desk and on a phone. Interactive example · sample data.",
  sample: "OPS DASHBOARD / 25 SEP",
  eventTag: "VIEW UPDATED",
  trail: { label: "View trail", items: [{ code: "OEE", from: 0 }, { code: "LINE 2", from: 1 }, { code: "TREND", from: 2 }, { code: "P&L", from: 3 }, { code: "MOBILE", from: 4 }, { code: "READ", from: 5 }] },
  stages: [
    { label: "Tiles update", title: "The tiles move without anyone typing.", detail: "The OEE tile for Line 2 ticks from 84.2 % to 83.6 %, the downtime bar grows by 3 min 40 s and an alert badge appears, all from the same event.", event: "OEE 83.6 % · downtime 14:10 · 1 alert", owner: "Timeline → dashboard tiles", scene: "Live tiles", durationMs: 6000,
      record: { doc: "Line 2 tiles", code: "DASH / L2", status: "Live · 07:16", fields: [["OEE (shift)", "83.6 % (−0.6)"], ["Downtime today", "14 min 10 s"], ["Alerts", "1 · tool wear · CNC-M2"], ["Cycles", "412"], ["Refresh", "Every 15 s"], ["Source", "Timeline TL-L2"]], link: "Tiles → TL-L2 → EVT-M2-1187", note: "Every number on a tile links back to the event that moved it." } },
    { label: "Drill down", title: "From the line to the machine.", detail: "Clicking the alert opens Line 2. Four machines; CNC-M2 shows the stop, the reason code and the planned replacement at 14:30.", event: "Drill-down · Line 2 → CNC-M2 · RC-14", owner: "A. Mehta → Line 2 view", scene: "Drill-down", durationMs: 6500,
      record: { doc: "Line 2 detail", code: "DASH / L2 / M2", status: "Stop · planned fix 14:30", fields: [["CNC-M1", "Running · OEE 88 %"], ["CNC-M2", "Minor stop 03:40 · RC-14"], ["CNC-M3", "Running · OEE 86 %"], ["CNC-M4", "Changeover · OEE 79 %"], ["Planned", "MT-0777 · 14:30"], ["Ticket", "V. Naik · on track"]], link: "CNC-M2 → MT-0777 → DEC-0412", note: "The drill-down reads the same records as the technician's ticket." } },
    { label: "Trend", title: "This week against last week.", detail: "The downtime trend for Line 2 is drawn against the same days last week. Tool-wear stops are down 40 % since the wear threshold was introduced.", event: "Trend · downtime −40 % vs last week · 7 days", owner: "Timeline → trend view", scene: "7-day trend", durationMs: 6500,
      record: { doc: "Trend", code: "L2 / DOWNTIME / 7D", status: "Improving", fields: [["This week", "1 h 52 m"], ["Last week", "3 h 06 m"], ["Change", "−40 %"], ["Top reason", "RC-14 tool wear"], ["Second", "RC-03 material wait"], ["Period", "19–25 Sep"]], link: "Trend → TL-L2 (7 days)", note: "The trend is computed from stop intervals with reason codes, nothing hand-entered." } },
    { label: "P&L impact", title: "What it means in money, today.", detail: "The stop and the planned replacement are costed: ₹1,800 for the insert and time, against ₹42,000 if the tool had failed mid-order. The tile shows the daily impact against plan.", event: "Daily impact · ₹1,800 spent · ₹40,200 avoided", owner: "Finance model → impact tile", scene: "Daily P&L impact", durationMs: 6500,
      record: { doc: "Daily P&L impact", code: "L2 / 25 SEP", status: "On plan", fields: [["Planned output", "30 DRV-240 housings"], ["Actual (to 07:30)", "On schedule"], ["Cost of stop", "₹1,800"], ["Avoided risk", "₹40,200 (scrap + unplanned stop)"], ["Margin impact", "−0.2 % today"], ["WO-0318", "Due 27 Sep · on time"]], link: "Impact → WO-0318 → SO-1142", note: "Sample figures. The model uses your rates and your part costs." } },
    { label: "Mobile", title: "The same view, on a phone.", detail: "The dashboard reflows to a phone: three tiles, the alert and the trend. Nothing is a separate report; it is the same data on a smaller screen.", event: "Mobile view · 3 tiles · alert · trend", owner: "Dashboard → mobile", scene: "Mobile view", durationMs: 5500,
      record: { doc: "Mobile view", code: "DASH / MOBILE", status: "Synced", fields: [["Layout", "3 tiles · alert · 7-day trend"], ["Data", "Same as desktop"], ["Alerts", "Push · tool wear · CNC-M2"], ["Offline", "Last 24 h cached"], ["Sign-in", "SSO · role: owner"], ["Updated", "07:29"]], link: "Mobile → DASH / L2", note: "One dashboard, every screen." } },
    { label: "Read at 07:30", title: "Read at 7:30 am, with coffee.", detail: "A. Mehta opens the morning brief at 07:30: Line 2 had a short stop, the fix is planned for 14:30, the requisition is raised and the order is on time. Nothing needs a phone call.", event: "Morning brief read · A. Mehta · 07:31", owner: "Dashboard → A. Mehta (founder)", scene: "Morning brief", durationMs: 6500,
      record: { doc: "Morning brief", code: "BRIEF / 25 SEP", status: "Read 07:31", fields: [["Line 2", "1 minor stop · fix at 14:30"], ["Orders", "WO-0318 on time"], ["Purchasing", "PO-0089 in transit · PR-0242 raised"], ["People", "M. Deshmukh acknowledged"], ["Needs a decision", "1 · see Decision stage"], ["Read by", "A. Mehta · 07:31"]], link: "Brief → Decision stage", note: "Next stage: a person decides with everything in front of them." } },
  ],
};

export const DECISION_EXPERIENCE: Experience = {
  key: "decision",
  eyebrow: "Decision / Act with context",
  title: "One call, made with the whole picture.",
  description: "Follow the tool-wear alert to a recorded decision, its outcome, and the rule that makes it automatic next time. Interactive example · sample data.",
  sample: "DEC-0412 / LINE 2 / CNC-M2",
  eventTag: "DECISION RECORD",
  trail: { label: "Decision trail", items: [{ code: "ALERT", from: 0 }, { code: "OPTIONS", from: 1 }, { code: "DECIDED", from: 2 }, { code: "DISPATCH", from: 3 }, { code: "OUTCOME", from: 4 }, { code: "RULE", from: 5 }] },
  stages: [
    { label: "Alert", title: "An alert that already knows its context.", detail: "The alert for CNC-M2 arrives with everything attached: tool wear 92 %, 4 inserts in stock, WO-0318 due in two days, the next changeover at 14:30 and the agent's recommendation.", event: "Alert ALT-0412 · CNC-M2 · context attached", owner: "Dashboard → R. Iyer (maintenance lead)", scene: "Alert with context", durationMs: 6000,
      record: { doc: "Alert", code: "ALT-0412", status: "Needs a decision", fields: [["Machine", "CNC-M2 · Line 2"], ["Tool wear", "92 % (limit 90)"], ["Inserts in stock", "4 (min 12)"], ["WO-0318", "30 units · due 27 Sep"], ["Next changeover", "14:30 today"], ["Recommendation", "REC-0412"]], link: "ALT-0412 → EVT-M2-1187 → REC-0412", note: "The decision-maker never has to go looking for the facts." } },
    { label: "Options", title: "Three options, priced honestly.", detail: "Run to failure, replace now, or replace at the 14:30 changeover. Each is shown with its cost, its downtime and its risk to WO-0318, using the plant's own rates.", event: "3 options compared · cost · downtime · risk", owner: "Decision support → R. Iyer", scene: "Option comparison", durationMs: 7500,
      record: { doc: "Option comparison", code: "CMP-0412", status: "3 options", fields: [["A · Run to failure", "₹0 now · risk ₹42,000 · high"], ["B · Replace now", "₹9,500 · 25 min stop · low"], ["C · Replace at 14:30", "₹1,800 · 0 min stop · low"], ["WO-0318 on time", "A: at risk · B: yes · C: yes"], ["Recommended", "C"], ["Rates", "Sample · plant cost model"]], link: "CMP-0412 → REC-0412", note: "The comparison uses the same cost model as the P&L tile." } },
    { label: "Decided", title: "Recorded: what, who and why.", detail: "R. Iyer chooses option C and records the reason: wear is above limit but stable at reduced feed, the changeover is 2.5 hours away and the order stays on time. S. Rao, plant head, is informed automatically.", event: "DEC-0412 · option C · R. Iyer · 07:26", owner: "R. Iyer → decision log → S. Rao (informed)", scene: "Decision recorded", durationMs: 7000,
      record: { doc: "Decision record", code: "DEC-0412", status: "Decided · 07:26", fields: [["Chosen", "C · Replace at 14:30 changeover"], ["Owner", "R. Iyer · Maintenance lead"], ["Reasoning", "Stable at 80 % feed · 2.5 h to changeover · WO-0318 on time"], ["Informed", "S. Rao · Plant head"], ["Rejected", "A (risk) · B (avoidable stop)"], ["Evidence", "CMP-0412 · CTX-0412"]], link: "DEC-0412 → ALT-0412 → EVT-M2-1187", note: "A decision with a written reason can be reviewed, learned from and defended." } },
    { label: "Dispatched", title: "The decision becomes work.", detail: "The recorded decision dispatches the actions: maintenance ticket MT-0777 and requisition PR-0242, both already carrying the reason and the owner.", event: "Dispatched · MT-0777 · PR-0242 · WhatsApp to supervisor", owner: "Decision log → workflow WF-14", scene: "Action dispatched", durationMs: 6000,
      record: { doc: "Dispatch", code: "DEC-0412 / ACTIONS", status: "2 actions dispatched", fields: [["Ticket", "MT-0777 · V. Naik · 14:30"], ["Requisition", "PR-0242 · 20 inserts"], ["Notified", "M. Deshmukh · WhatsApp"], ["SLA", "Replace by 14:45"], ["Dispatched", "07:26:12"], ["Workflow", "WF-14 · RUN-0931"]], link: "DEC-0412 → MT-0777 · PR-0242", note: "Dispatch is the Automation stage, seen from the decision's side." } },
    { label: "Outcome", title: "Did it work? The record says yes.", detail: "By 14:36 the insert is replaced, vibration is back to 1.9 mm/s, WO-0318 ships on time and the spend was ₹1,800. The outcome is attached to the decision, not lost in a chat.", event: "Outcome · no unplanned stop · ₹1,800 · WO-0318 on time", owner: "Timeline → decision record", scene: "Outcome tracked", durationMs: 6500,
      record: { doc: "Outcome", code: "DEC-0412 / OUTCOME", status: "Achieved", fields: [["Unplanned stop", "None"], ["Replaced", "14:36 · V. Naik"], ["Vibration after", "1.9 mm/s"], ["Spend", "₹1,800 (option C)"], ["WO-0318", "Shipped 27 Sep · on time"], ["Avoided", "₹40,200 vs option A"]], link: "Outcome → DEC-0412 → CMP-0412", note: "Outcomes close the loop between what was decided and what happened." } },
    { label: "Rule updated", title: "Next time, it is automatic.", detail: "With the outcome recorded, S. Rao updates rule R-23: a tool-wear warning with a changeover inside four hours schedules the replacement automatically. Approval is still required when spend is involved.", event: "Rule R-23 updated · auto-schedule at changeover · S. Rao", owner: "S. Rao (plant head) → rule set v8", scene: "Rule updated", durationMs: 7000,
      record: { doc: "Rule change", code: "R-23 / v8", status: "Active from tomorrow", fields: [["Condition", "Wear ≥ 90 % and changeover ≤ 4 h"], ["Action", "Schedule replacement at changeover"], ["Still needs approval", "Purchases (PR)"], ["Changed by", "S. Rao · Plant head"], ["Based on", "DEC-0412 outcome"], ["Effect", "Decision time 14 min → 0"]], link: "R-23 → WF-14 → next tool-wear event", note: "The loop closes: a machine signal has become a rule the business runs on." } },
  ],
};

export const EXPERIENCES: Record<ExperienceKey, Experience> = {
  machine: MACHINE_EXPERIENCE,
  iot: IOT_EXPERIENCE,
  data: DATA_EXPERIENCE,
  ai: AI_EXPERIENCE,
  automation: AUTOMATION_EXPERIENCE,
  dashboard: DASHBOARD_EXPERIENCE,
  decision: DECISION_EXPERIENCE,
};
