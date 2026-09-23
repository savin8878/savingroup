"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import type { Messages } from "@/lib/i18n";

export function ContactForm({ t }: { t: Messages }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const f = t.contact.form;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-border-strong bg-background p-10 text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-strong text-accent-foreground"
        >
          <CheckCircle2 size={32} strokeWidth={2} />
        </motion.div>
        <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
          Message received.
        </h3>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
          We&apos;ll respond within one business day with a slot to walk through your business.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-2xl border border-border-strong bg-background shadow-xl"
    >
      {/* Header */}
      <div className="border-b border-border bg-surface-2 px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-strong">
            Revenue Audit Request
          </span>
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Let&apos;s talk about your business
        </h3>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-7 sm:px-8 sm:py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={f.name}>
            <input
              required
              name="name"
              type="text"
              placeholder="Jane Doe"
              className="form-input"
            />
          </FormField>
          <FormField label={f.email}>
            <input
              required
              name="email"
              type="email"
              placeholder="jane@company.com"
              className="form-input"
            />
          </FormField>
          <FormField label={f.company}>
            <input
              required
              name="company"
              type="text"
              placeholder="Acme Inc."
              className="form-input"
            />
          </FormField>
          <FormField label={f.industry}>
            <div className="relative">
              <select
                required
                name="industry"
                defaultValue=""
                className="form-input appearance-none pr-10"
              >
                <option value="" disabled>Select…</option>
                {f.industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </FormField>
        </div>

        <FormField label={f.challenge}>
          <textarea
            required
            name="challenge"
            rows={4}
            placeholder="Our website doesn't convert, we're burning money on ads, our team is buried in manual work…"
            className="form-input resize-none py-3"
            style={{ height: "auto" }}
          />
        </FormField>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-stretch gap-4 border-t border-border bg-surface-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="order-2 text-center text-xs text-muted-foreground sm:order-1 sm:text-left">
          Replies within 1 business day · Data never shared
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group order-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-strong px-8 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:rounded-full"
        >
          <AnimatePresence mode="wait" initial={false}>
            {submitting ? (
              <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {f.submitting}
              </motion.span>
            ) : (
              <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                {f.submit}
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
