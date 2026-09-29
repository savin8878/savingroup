// Derive the Operator's PAGE_TOPIC from a pathname.
//
// Shared by the panel (to pick an opening line and starter prompts) and the
// route handler (to tell Claude where the visitor is). Pure and dependency
// free on purpose: it ships in the client bundle, so it must not import the
// industry or city data modules. Slugs are shape-checked here; the server
// verifies them against the real lists before quoting them to the model.

export type PageTopic =
  | "home"
  | "services"
  | "industries"
  | "industry"
  | "case-studies"
  | "pricing"
  | "about"
  | "contact"
  | "cities"
  | "city"
  | "blog"
  | "newsroom"
  | "legal"
  | "other";

export interface PageContext {
  topic: PageTopic;
  /** Industry slug for `industry`, city slug for `city`, post slug for blog. */
  slug?: string;
  /** City sub-page (`services`, `process`, …) for `city`. */
  subPage?: string;
  /** The path after `/{country}/{locale}`, without leading slash. */
  rest: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugOrUndefined(value: string | undefined): string | undefined {
  return value && value.length <= 80 && SLUG.test(value) ? value : undefined;
}

/** `/in/en/industries/manufacturing?x=1#y` → `{ topic: "industry", slug: "manufacturing", … }` */
export function describePage(pathname: string): PageContext {
  const clean = pathname.split(/[?#]/)[0] ?? "";
  const segments = clean.split("/").filter(Boolean).slice(2);
  const rest = segments.join("/");
  const [first, second, third] = segments;

  switch (first) {
    case undefined:
      return { topic: "home", rest };
    case "services":
      return { topic: "services", rest };
    case "industries": {
      const slug = slugOrUndefined(second);
      return slug ? { topic: "industry", slug, rest } : { topic: "industries", rest };
    }
    case "case-studies":
      return { topic: "case-studies", rest };
    case "pricing":
      return { topic: "pricing", rest };
    case "about":
      return { topic: "about", rest };
    case "contact":
      return { topic: "contact", rest };
    case "cities": {
      const slug = slugOrUndefined(second);
      if (!slug) return { topic: "cities", rest };
      const subPage = slugOrUndefined(third);
      return subPage ? { topic: "city", slug, subPage, rest } : { topic: "city", slug, rest };
    }
    case "blogs": {
      // /blogs/category/{c} is a listing, not a post.
      const slug = second === "category" ? undefined : slugOrUndefined(second);
      return slug ? { topic: "blog", slug, rest } : { topic: "blog", rest };
    }
    case "newsroom":
      return { topic: "newsroom", rest };
    case "privacy":
    case "terms":
      return { topic: "legal", rest };
    default:
      return { topic: "other", rest };
  }
}
