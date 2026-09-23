import { Linkedin, Mail } from "lucide-react";
import { Section, SectionHeader } from "../primitives/section";
import { TEAM } from "@/lib/team";

/**
 * Named people on the About page.
 *
 * WHY. The site asks for a serious commercial commitment — engagements up to
 * ₹15L — from behind a wall of "we" and "our team is small, senior and
 * embedded", with no human being named anywhere and social links that led to
 * platform homepages. A buyer checking whether a stranger is real found
 * nothing to check. A single named founder with a reachable profile is the
 * cheapest trust signal on the internet.
 *
 * WHY IT MAY RENDER NOTHING. `TEAM` ships empty. Inventing a founder's name
 * would be worse than the silence it replaces, so the slot is built and the
 * real people go in `lib/team.ts`. The moment one entry exists, this block
 * appears on /about. Until then nothing renders and the page is unchanged.
 */
export function TeamBlock() {
  if (TEAM.length === 0) return null;

  return (
    <Section id="team" className="pt-0">
      <SectionHeader
        eyebrow="Who you actually work with"
        title="The people building your system."
        subtitle="No account managers relaying messages. These are the people in your project channel."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((person) => (
          <article
            key={person.name}
            className="flex flex-col rounded-2xl border border-border bg-surface/40 p-6"
          >
            <h3 className="font-display text-lg font-semibold text-foreground">
              {person.name}
            </h3>
            <div className="mt-1 text-sm text-accent-strong">{person.role}</div>
            <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {person.bio}
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              {person.linkedin && (
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
              )}
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail size={14} />
                  Email
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
