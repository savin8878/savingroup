// lib/operator/log.ts
//
// The Operator's one rule for server logs: say what failed, never log the
// payload. Error messages can embed what a visitor typed. The SDK's
// tool-input parse error, for one, ends with the model's whole streamed
// input ("… Error: <parser message>. JSON: <input>"), and for an audit brief
// that input holds the visitor's name, email and phone. Logs go to a drain
// whose retention and access the panel's privacy note does not cover.
//
// Pure: no imports.

/** Where an SDK message starts quoting input: its parser error, then the raw JSON. */
const PAYLOAD_MARKER = /\.\s+(?:Error|JSON):/;
const MAX_MESSAGE = 300;

/** `Name: first part of the message`, cut before any quoted payload and capped. */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return typeof err;
  const message = err.message.split(PAYLOAD_MARKER)[0] ?? "";
  return `${err.name}: ${message.length > MAX_MESSAGE ? `${message.slice(0, MAX_MESSAGE)}…` : message}`;
}

/** `console.error` with the shared prefix, and only a redacted description of `err`. */
export function logOperatorError(context: string, err?: unknown, ...details: Array<string | number | undefined>): void {
  const parts: Array<string | number> = [`Operator endpoint error: ${context}`];
  for (const detail of details) if (detail !== undefined) parts.push(detail);
  if (err !== undefined) parts.push(describeError(err));
  console.error(...parts);
}
