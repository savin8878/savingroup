"use client";

// components/operator/views/BusinessXRay.tsx
//
// The Operator's structured diagnosis of one operation, in eight numbered
// sections. Honesty is in the markup: each friction point says whether the
// visitor STATED it or the Operator INFERRED it (inferred reads quieter, and
// a key under the list says what the difference means); company facts show
// only the fields the conversation actually produced — an unknown size is
// omitted, never written as "unknown"; automation points carry their level
// (L0 "leave manual" is a legitimate answer, drawn dashed, not hidden).
// Copy and Markdown download let the visitor take it away.

import { useCallback, useId, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import type { BusinessXRay as BusinessXRayData } from "@/lib/operator/protocol";
import { ExportActions } from "./AuditBrief";
import { fileSlug, levelLabel, xrayToMarkdown } from "./brief-format";
import { proseBlocks, textAttrs } from "./text-attrs";
import { getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

const two = (n: number) => String(n).padStart(2, "0");
const present = (text: string | undefined): text is string => typeof text === "string" && text.trim() !== "";

export interface BusinessXRayProps {
  xray: BusinessXRayData;
  locale: Locale;
}

export function BusinessXRay({ xray, locale }: BusinessXRayProps) {
  const copy = getViewsCopy(locale);
  const x = copy.xray;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `op-${uid}-title`;
  const sectionId = (n: number) => `op-${uid}-s${n}`;

  const markdown = useCallback(() => xrayToMarkdown(xray, x), [xray, x]);
  const facts = (["industry", "size", "locations", "offering"] as const).filter((key) => present(xray.company[key]));
  const workflow = xray.currentWorkflow.filter(present);
  const systems = xray.systems.filter((system) => present(system.name));
  const handoffs = xray.handoffs.filter(present);
  const friction = xray.friction.filter((item) => present(item.issue));
  const points = xray.automationPoints.filter((item) => present(item.point));
  const questions = xray.verificationQuestions.filter(present);
  const experiment = xray.firstExperiment;
  // Every line below is the model's, in whatever language and script the visitor used.
  const attrs = (text: string) => textAttrs(text, locale);

  const section = (n: number, body: ReactNode, empty: boolean) => (
    <div className={s.xsection} key={n}>
      <h4 className={s.xhead} id={sectionId(n)}>
        <span aria-hidden="true">{two(n)}</span>
        <span>{x.sections[n - 1]}</span>
      </h4>
      {empty ? <p className={s.none}>{x.none}</p> : body}
    </div>
  );

  return (
    <article className={s.view} aria-labelledby={titleId}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.eyebrow}>{copy.eyebrows.xray}</span>
        </div>
        <h3 id={titleId} className={s.title} {...attrs(xray.title)}>{xray.title}</h3>
        {facts.length > 0 && (
          <dl className={s.facts} aria-label={x.company}>
            {facts.map((key) => (
              <div key={key}>
                <dt className={s.micro}>{x.companyFields[key]}</dt>
                <dd {...attrs(xray.company[key] as string)}>{xray.company[key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {section(1, (
        <ol className={s.xlist} aria-labelledby={sectionId(1)}>
          {workflow.map((item, i) => <li key={i}><span className={s.xnum} aria-hidden="true">{i + 1}.</span><span {...attrs(item)}>{item}</span></li>)}
        </ol>
      ), workflow.length === 0)}

      {section(2, (
        <ul className={s.xlist} aria-labelledby={sectionId(2)}>
          {systems.map((system, i) => {
            const role = present(system.role) ? ` — ${system.role}` : "";
            return (
              <li key={i}>
                <span className={s.xnum} aria-hidden="true">—</span>
                <span {...attrs(system.name + role)}><strong>{system.name}</strong>{role}</span>
              </li>
            );
          })}
        </ul>
      ), systems.length === 0)}

      {section(3, (
        <ul className={s.xlist} aria-labelledby={sectionId(3)}>
          {handoffs.map((item, i) => <li key={i}><span className={s.xnum} aria-hidden="true">—</span><span {...attrs(item)}>{item}</span></li>)}
        </ul>
      ), handoffs.length === 0)}

      {section(4, (
        <>
          <ul className={s.xlist} aria-labelledby={sectionId(4)}>
            {friction.map((item, i) => (
              <li key={i} data-evidence={item.evidence}>
                <span className={`${s.tag} ${s.evidence}`} data-evidence={item.evidence}>{item.evidence === "stated" ? x.stated : x.inferred}</span>
                <span {...attrs(item.issue)}>{item.issue}</span>
              </li>
            ))}
          </ul>
          <ul className={s.evidenceKey}>
            <li><span className={`${s.tag} ${s.evidence}`} data-evidence="stated">{x.stated}</span>{x.statedNote}</li>
            <li><span className={`${s.tag} ${s.evidence}`} data-evidence="inferred">{x.inferred}</span>{x.inferredNote}</li>
          </ul>
        </>
      ), friction.length === 0)}

      {section(5, (
        <ul className={s.points} aria-labelledby={sectionId(5)}>
          {points.map((item, i) => (
            <li key={i}>
              <span {...attrs(item.point)}>{item.point}</span>
              <span className={s.level} data-level={item.level}>{levelLabel(item.level, x)}</span>
              {present(item.approach) && <p {...attrs(item.approach)}>{item.approach}</p>}
            </li>
          ))}
        </ul>
      ), points.length === 0)}

      {/* Line by line: the model may put an English line (a system name, a flow) inside an Arabic answer. */}
      {section(6, (
        <div className={s.prose}>
          {proseBlocks(xray.connectedArchitecture).map((lines, i) => (
            <p key={i}>{lines.map((line, j) => <span key={j} {...attrs(line)}>{line}</span>)}</p>
          ))}
        </div>
      ), !present(xray.connectedArchitecture))}

      {section(7, (
        <ol className={s.xlist} aria-labelledby={sectionId(7)}>
          {questions.map((item, i) => <li key={i}><span className={s.xnum} aria-hidden="true">{i + 1}.</span><span {...attrs(item)}>{item}</span></li>)}
        </ol>
      ), questions.length === 0)}

      {section(8, (
        <div className={s.experiment}>
          <strong {...attrs(experiment.name)}>{experiment.name}</strong>
          <dl>
            {present(experiment.scope) && <div><dt className={s.micro}>{x.scope}</dt><dd {...attrs(experiment.scope)}>{experiment.scope}</dd></div>}
            {present(experiment.successMeasure) && <div><dt className={s.micro}>{x.successMeasure}</dt><dd {...attrs(experiment.successMeasure)}>{experiment.successMeasure}</dd></div>}
          </dl>
        </div>
      ), !present(experiment.name))}

      <ExportActions
        locale={locale}
        getText={markdown}
        getMarkdown={markdown}
        filename={`${fileSlug(xray.title, "business-x-ray")}.md`}
        copyLabel="copyText"
      />
    </article>
  );
}

export default BusinessXRay;
