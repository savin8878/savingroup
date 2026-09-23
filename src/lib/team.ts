/**
 * The named humans behind the work.
 *
 * DELIBERATELY EMPTY. The About page says "our team is small, senior and
 * embedded" and names nobody; the footer's social icons pointed at LinkedIn's
 * and GitHub's own homepages. For a buyer weighing a six-figure engagement
 * with a company they found through search, that is the weakest link in the
 * whole site — and it is not something code can fix, because the only correct
 * value is a real person's real name.
 *
 * Adding even ONE entry here (the founder, with a working LinkedIn URL) turns
 * on the team block on /about. Nothing else needs to change.
 *
 * Example:
 *   {
 *     name: "…",
 *     role: "Founder & Principal Engineer",
 *     bio: "Twelve years building revenue systems for Indian SMEs. Writes most of the ERP work himself.",
 *     linkedin: "https://www.linkedin.com/in/…",
 *     email: "…@savingroup.in",
 *   }
 */
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Full profile URL. A bare platform URL is worse than omitting this. */
  linkedin?: string;
  email?: string;
}

export const TEAM: readonly TeamMember[] = [];
