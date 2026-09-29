#!/usr/bin/env node
/**
 * Sitemap validator.
 *
 *   node scripts/validate-sitemaps.mjs                  every sitemap + a sample of page URLs
 *   node scripts/validate-sitemaps.mjs --full           every page URL in every sitemap
 *   node scripts/validate-sitemaps.mjs --base https://www.savingroup.in --full
 *
 * Options
 *   --base URL          where to fetch from (default http://localhost:3000). <loc>
 *                       values must still be production URLs; their paths are
 *                       requested from --base.
 *   --site URL          origin every <loc> must use (default https://www.savingroup.in)
 *   --country in,ae     limit page checks to these country sitemaps
 *   --sample N          page URLs to check in quick mode (default 36)
 *   --concurrency N     parallel page requests (default 8)
 *   --timeout MS        per-request timeout (default 60000)
 *
 * Every request is sent as Googlebot, without cookies, and without following
 * redirects, so a redirect is reported rather than silently followed.
 * Exits 1 when any error is found.
 */

import { pathToFileURL } from "node:url";

const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const MAX_URLS = 50_000;
const MAX_BYTES = 50 * 1024 * 1024;
const W3C_DATETIME =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d))?$/;

/* -------------------------------------------------------------------------- */
/*                         XML well-formedness checker                        */
/* -------------------------------------------------------------------------- */

const ENTITY = /&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/y;
const NAME = /^[A-Za-z_:][\w:.-]*$/;
const ATTR = /\s*([A-Za-z_:][\w:.-]*)\s*=\s*("([^"<]*)"|'([^'<]*)')/y;

function checkEntities(text, where, errors) {
  for (let i = text.indexOf("&"); i !== -1; i = text.indexOf("&", i + 1)) {
    ENTITY.lastIndex = i;
    if (!ENTITY.test(text)) {
      errors.push(`unescaped "&" in ${where}: ${JSON.stringify(text.slice(i, i + 20))}`);
      return;
    }
  }
}

/**
 * Strict enough for sitemap files: balanced tags, one root, quoted attributes,
 * valid entity references, no DOCTYPE, nothing but whitespace outside the root.
 * Returns a list of problems (empty when well-formed) and the root's name and
 * attributes.
 */
export function checkXml(text) {
  const errors = [];
  const stack = [];
  let root = null;
  let rootClosed = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  if (text.startsWith("<?xml", i)) {
    const end = text.indexOf("?>", i);
    if (end === -1) return { errors: ["unterminated XML declaration"], root };
    i = end + 2;
  } else if (text.slice(i).trimStart().startsWith("<?xml")) {
    errors.push("XML declaration is not at the very start of the document");
  }

  while (i < text.length) {
    const lt = text.indexOf("<", i);
    const chunk = lt === -1 ? text.slice(i) : text.slice(i, lt);
    if (chunk.trim()) {
      if (stack.length === 0) errors.push(`text outside the root element: ${JSON.stringify(chunk.trim().slice(0, 40))}`);
      else checkEntities(chunk, `<${stack.at(-1)}>`, errors);
    }
    if (lt === -1) break;

    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      if (end === -1) { errors.push("unterminated comment"); break; }
      i = end + 3;
      continue;
    }
    if (text.startsWith("<![CDATA[", lt)) {
      const end = text.indexOf("]]>", lt);
      if (end === -1) { errors.push("unterminated CDATA section"); break; }
      if (stack.length === 0) errors.push("CDATA outside the root element");
      i = end + 3;
      continue;
    }
    if (text.startsWith("<?", lt)) {
      const end = text.indexOf("?>", lt);
      if (end === -1) { errors.push("unterminated processing instruction"); break; }
      i = end + 2;
      continue;
    }
    if (text.startsWith("<!", lt)) {
      errors.push("DOCTYPE or markup declaration is not allowed in a sitemap");
      break;
    }

    let gt = lt + 1;
    let quote = null;
    for (; gt < text.length; gt++) {
      const ch = text[gt];
      if (quote) { if (ch === quote) quote = null; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === ">") break;
      else if (ch === "<") { gt = -1; break; }
    }
    if (gt === -1 || gt >= text.length) { errors.push(`unterminated tag near offset ${lt}`); break; }
    const raw = text.slice(lt + 1, gt);
    i = gt + 1;

    if (raw.startsWith("/")) {
      const name = raw.slice(1).trim();
      const open = stack.pop();
      if (open !== name) { errors.push(`mismatched closing tag </${name}> (open: ${open ? `<${open}>` : "none"})`); break; }
      if (stack.length === 0) rootClosed = true;
      continue;
    }

    const selfClosing = raw.endsWith("/");
    const body = selfClosing ? raw.slice(0, -1) : raw;
    const name = body.match(/^\S+/)?.[0] ?? "";
    if (!NAME.test(name)) { errors.push(`invalid tag name <${name}>`); break; }

    const attrs = {};
    let rest = body.slice(name.length);
    ATTR.lastIndex = 0;
    let pos = 0;
    while (pos < rest.length) {
      if (!rest.slice(pos).trim()) break;
      ATTR.lastIndex = pos;
      const m = ATTR.exec(rest);
      if (!m) { errors.push(`malformed attributes in <${name}>`); break; }
      if (m[1] in attrs) errors.push(`duplicate attribute ${m[1]} in <${name}>`);
      const value = m[3] ?? m[4];
      checkEntities(value, `attribute ${m[1]}`, errors);
      attrs[m[1]] = value;
      pos = ATTR.lastIndex;
    }

    if (stack.length === 0) {
      if (root) { errors.push(`second root element <${name}>`); break; }
      root = { name, attrs };
    }
    if (selfClosing) { if (stack.length === 0) rootClosed = true; }
    else stack.push(name);
  }

  if (stack.length) errors.push(`unclosed element <${stack.at(-1)}>`);
  if (!root) errors.push("no root element");
  else if (!rootClosed && !stack.length) errors.push("root element is not closed");
  return { errors, root };
}

export function decodeXml(text) {
  return text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, (_, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e];
  });
}

/** `<url>`/`<sitemap>` entries with their decoded `loc` and `lastmod`. */
export function extractEntries(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  for (const m of xml.matchAll(re)) {
    const loc = m[1].match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    const lastmod = m[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1];
    out.push({ loc: loc === undefined ? undefined : decodeXml(loc.trim()), lastmod: lastmod?.trim() });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*                               URL rules                                    */
/* -------------------------------------------------------------------------- */

const LOCAL_HOST = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|\[::1\])$/i;
const STAGING_HOST = /(^|[.-])(staging|stage|preview|dev|test|qa|uat)([.-]|$)|\.vercel\.app$|\.netlify\.app$/i;

/**
 * Problems with a single <loc>. `country` (optional) is the sitemap the URL
 * was found in; the URL's first path segment must match it.
 */
export function urlProblems(loc, site, country) {
  if (!loc) return ["empty <loc>"];
  if (loc !== loc.trim()) return ["whitespace around URL"];
  let u;
  try { u = new URL(loc); } catch { return ["malformed URL"]; }
  const problems = [];
  if (LOCAL_HOST.test(u.hostname)) problems.push("localhost URL");
  else if (STAGING_HOST.test(u.hostname)) problems.push("staging/preview URL");
  else if (u.host !== site.host) problems.push(`outside ${site.host}`);
  if (u.protocol !== "https:") problems.push("not HTTPS");
  if (u.search) problems.push("query string");
  if (u.hash || loc.includes("#")) problems.push("fragment");
  if (/\/\//.test(u.pathname)) problems.push("double slash");
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) problems.push("trailing slash");
  if (/[^\x21-\x7e]/.test(loc)) problems.push("unencoded character");
  const segs = u.pathname.split("/").filter(Boolean);
  if (country !== undefined) {
    if (segs[0] !== country) problems.push(`wrong country (expected /${country}/)`);
    if (!segs[1] || !/^[a-z]{2}$/.test(segs[1])) problems.push("missing or non-lowercase locale segment");
    if (segs.length >= 4 && /^[a-z]{2}$/.test(segs[2]) && /^[a-z]{2}$/.test(segs[3]) && segs[2] === segs[0] && segs[3] === segs[1]) {
      problems.push("duplicated country/locale prefix");
    }
  }
  return problems;
}

/* -------------------------------------------------------------------------- */
/*                              robots.txt                                    */
/* -------------------------------------------------------------------------- */

/** Groups that apply to `*` (Googlebot falls back to them when unnamed). */
export function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  const sitemaps = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === "sitemap") sitemaps.push(value);
    else if ((key === "allow" || key === "disallow") && current) current.rules.push({ allow: key === "allow", path: value });
  }
  return { groups, sitemaps };
}

function robotsPatternMatches(pattern, path) {
  if (!pattern) return false;
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path);
}

/** Googlebot's view: its own group if named, else `*`; longest match wins, allow wins ties. */
export function robotsAllows({ groups }, path, agent = "googlebot") {
  const own = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.startsWith(a)));
  const applicable = own.length ? own : groups.filter((g) => g.agents.includes("*"));
  let best = null;
  for (const rule of applicable.flatMap((g) => g.rules)) {
    if (!robotsPatternMatches(rule.path, path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) best = rule;
  }
  return !best || best.allow;
}

/* -------------------------------------------------------------------------- */
/*                                  Runner                                    */
/* -------------------------------------------------------------------------- */

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", site: "https://www.savingroup.in", full: false, sample: 36, concurrency: 8, timeout: 60_000, countries: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--full") opts.full = true;
    else if (a === "--base") opts.base = next();
    else if (a === "--site") opts.site = next();
    else if (a === "--sample") opts.sample = Number(next());
    else if (a === "--concurrency") opts.concurrency = Number(next());
    else if (a === "--timeout") opts.timeout = Number(next());
    else if (a === "--country") opts.countries = next().split(",").map((s) => s.trim().toLowerCase());
    else if (a === "--help" || a === "-h") { console.log("See the header of scripts/validate-sitemaps.mjs"); process.exit(0); }
    else throw new Error(`Unknown option ${a}`);
  }
  opts.base = new URL(opts.base);
  opts.site = new URL(opts.site);
  return opts;
}

async function request(url, opts, extraHeaders = {}) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": GOOGLEBOT_UA, Accept: "*/*", ...extraHeaders },
      signal: AbortSignal.timeout(opts.timeout),
    });
    const body = await res.text();
    return { status: res.status, type: res.headers.get("content-type") ?? "", location: res.headers.get("location"), robotsHeader: res.headers.get("x-robots-tag") ?? "", body, ms: Date.now() - started };
  } catch (err) {
    return { status: 0, type: "", location: null, robotsHeader: "", body: "", error: err?.name === "TimeoutError" ? "timeout" : String(err?.message ?? err), ms: Date.now() - started };
  }
}

const onBase = (loc, opts) => {
  const u = new URL(loc);
  return new URL(u.pathname + u.search, opts.base).href;
};

/** Fetch + validate one sitemap document. */
async function checkSitemapDocument(url, expectedRoot, opts, extraHeaders) {
  const res = await request(url, opts, extraHeaders);
  const errors = [];
  if (res.error) errors.push(`request failed: ${res.error}`);
  else if (res.status >= 300 && res.status < 400) errors.push(`redirects (${res.status}) to ${res.location}`);
  else if (res.status !== 200) errors.push(`HTTP ${res.status}`);
  if (res.status === 200) {
    if (!/^(application|text)\/xml\b/i.test(res.type)) errors.push(`Content-Type is "${res.type || "missing"}", expected application/xml`);
    if (/^\s*<(!doctype html|html)\b/i.test(res.body)) errors.push("returns HTML instead of XML");
    const bytes = Buffer.byteLength(res.body);
    if (bytes > MAX_BYTES) errors.push(`${bytes} bytes exceeds the 50 MB limit`);
    const { errors: xmlErrors, root } = checkXml(res.body);
    errors.push(...xmlErrors.map((e) => `invalid XML: ${e}`));
    if (root && root.name !== expectedRoot) errors.push(`root element is <${root.name}>, expected <${expectedRoot}>`);
    if (root && root.attrs.xmlns !== SITEMAP_NS) errors.push(`missing sitemap namespace (xmlns="${SITEMAP_NS}")`);
  }
  return { res, errors };
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}

/** Evenly spaced, deterministic sample that always includes the first entry. */
function sampleOf(list, n) {
  if (n >= list.length) return list;
  const step = list.length / n;
  return Array.from({ length: n }, (_, k) => list[Math.floor(k * step)]);
}

async function checkPage(loc, opts) {
  const res = await request(onBase(loc, opts), opts);
  const problems = [];
  let kind = null;
  if (res.error) { problems.push(`request failed: ${res.error}`); kind = "failed"; }
  else if (res.status >= 300 && res.status < 400) { problems.push(`redirects (${res.status}) to ${res.location}`); kind = "redirect"; }
  else if (res.status === 404 || res.status === 410) { problems.push(`HTTP ${res.status}`); kind = "404"; }
  else if (res.status >= 500) { problems.push(`HTTP ${res.status}`); kind = "5xx"; }
  else if (res.status !== 200) { problems.push(`HTTP ${res.status}`); kind = "other"; }
  if (res.status === 200) {
    if (!/text\/html/i.test(res.type)) problems.push(`Content-Type ${res.type}`);
    const head = res.body.slice(0, 200_000);
    const canonical = head.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0]?.match(/href="([^"]*)"/i)?.[1];
    if (!canonical) problems.push("no canonical");
    else if (decodeXml(canonical) !== loc) problems.push(`canonical is ${decodeXml(canonical)}`);
    const robots = [...head.matchAll(/<meta[^>]+name="(robots|googlebot)"[^>]*>/gi)].map((m) => m[0].match(/content="([^"]*)"/i)?.[1] ?? "").join(",") + "," + res.robotsHeader;
    if (/noindex/i.test(robots)) problems.push("noindex");
    if (problems.length) kind ??= "invalid";
  }
  return { loc, problems, kind, ms: res.ms };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const errors = [];
  const warnings = [];
  const ok = (msg) => console.log(`  ✓ ${msg}`);
  const bad = (msg) => { console.log(`  ✗ ${msg}`); errors.push(msg); };
  const regionName = (() => { try { const d = new Intl.DisplayNames(["en"], { type: "region" }); return (cc) => d.of(cc.toUpperCase()) ?? cc; } catch { return (cc) => cc; } })();

  console.log(`SITEMAP VALIDATION  ${opts.full ? "(full)" : "(quick)"}`);
  console.log(`fetching from ${opts.base.origin}, expecting URLs on ${opts.site.origin}\n`);

  // robots.txt
  console.log("robots.txt");
  const robotsRes = await request(new URL("/robots.txt", opts.base).href, opts);
  let robots = { groups: [], sitemaps: [] };
  if (robotsRes.status !== 200) bad(`robots.txt HTTP ${robotsRes.status || robotsRes.error}`);
  else {
    ok("200");
    robots = parseRobots(robotsRes.body);
    const indexUrl = `${opts.site.origin}/sitemap-index.xml`;
    if (robots.sitemaps.includes(indexUrl)) ok(`references ${indexUrl}`);
    else bad(`robots.txt does not reference ${indexUrl} (found: ${robots.sitemaps.join(", ") || "none"})`);
    if (robotsAllows(robots, "/sitemap-index.xml")) ok("allows /sitemap-index.xml");
    else bad("robots.txt blocks /sitemap-index.xml");
  }

  // Root index
  console.log("\nRoot sitemap index");
  const indexUrl = new URL("/sitemap-index.xml", opts.base).href;
  const index = await checkSitemapDocument(indexUrl, "sitemapindex", opts);
  if (index.errors.length) index.errors.forEach(bad);
  else { ok("200"); ok(index.res.type); ok("valid XML"); }
  const children = index.res.status === 200 ? extractEntries(index.res.body, "sitemap") : [];
  if (index.res.status === 200 && children.length === 0) bad("sitemap index lists no sitemaps");

  const childCountries = [];
  const seenChildren = new Set();
  for (const { loc, lastmod } of children) {
    const problems = urlProblems(loc, opts.site);
    const m = loc && new URL(loc).pathname.match(/^\/([a-z]{2})\/sitemap\.xml$/);
    if (!m) problems.push("not of the form /{country}/sitemap.xml");
    if (seenChildren.has(loc)) problems.push("listed twice");
    if (lastmod && !W3C_DATETIME.test(lastmod)) problems.push(`invalid lastmod ${lastmod}`);
    seenChildren.add(loc);
    if (problems.length) bad(`index entry ${loc}: ${problems.join(", ")}`);
    else childCountries.push(m[1]);
  }

  // Convenience redirect
  const legacy = await request(new URL("/sitemap.xml", opts.base).href, opts);
  const legacyTarget = legacy.location ? new URL(legacy.location, opts.base).pathname : null;
  if ([301, 308].includes(legacy.status) && legacyTarget === "/sitemap-index.xml") ok(`/sitemap.xml ${legacy.status} -> /sitemap-index.xml`);
  else warnings.push(`/sitemap.xml returns ${legacy.status}${legacy.location ? ` -> ${legacy.location}` : ""} (expected a permanent redirect to /sitemap-index.xml)`);

  // A country that is not in the index must not get a sitemap. `cn` and `jp`
  // are valid ISO codes that were listed by the pre-May-2026 index (it
  // listed every ISO code), so Search Console may still request them; `zz` is
  // not a country at all. Neither may fall through to /[country]/[locale] and
  // render the homepage as a 200, or be geo-redirected.
  for (const cc of ["cn", "jp", "zz"].filter((c) => !childCountries.includes(c))) {
    const res = await request(new URL(`/${cc}/sitemap.xml`, opts.base).href, opts);
    if (res.status === 404 || res.status === 410) ok(`/${cc}/sitemap.xml ${res.status} (not a market)`);
    else bad(`/${cc}/sitemap.xml returns ${res.status || res.error}${res.location ? ` -> ${res.location}` : ""}; expected 404 for a country outside the index`);
  }

  console.log(`\nCountries discovered: ${childCountries.length}${childCountries.length ? ` (${childCountries.join(", ")})` : ""}`);

  // Child sitemaps
  const allLocs = new Map();
  const perCountry = [];
  for (const cc of childCountries) {
    console.log(`\n${regionName(cc)}`);
    const path = `/${cc}/sitemap.xml`;
    const doc = await checkSitemapDocument(new URL(path, opts.base).href, "urlset", opts);
    // The same sitemap as a visitor from India with a Hindi browser would request it:
    // geo/locale middleware must not redirect it.
    const geo = await request(new URL(path, opts.base).href, opts, { "x-vercel-ip-country": "IN", "Accept-Language": "hi-IN,hi;q=0.9" });
    const row = { cc, urls: 0, duplicates: 0, invalid: 0, lastmodMissing: 0, checked: 0, redirects: 0, notFound: 0, serverErrors: 0, otherPageErrors: 0 };
    perCountry.push(row);
    if (doc.errors.length) { doc.errors.forEach((e) => bad(`${path}: ${e}`)); continue; }
    ok(path);
    if (geo.status !== 200) bad(`${path} with India geo headers: HTTP ${geo.status}${geo.location ? ` -> ${geo.location}` : ""}`);
    else if (geo.body !== doc.res.body) bad(`${path} differs when requested with India geo headers`);

    const entries = extractEntries(doc.res.body, "url");
    row.urls = entries.length;
    if (entries.length === 0) bad(`${path} lists no URLs`);
    if (entries.length > MAX_URLS) bad(`${path} lists ${entries.length} URLs (limit ${MAX_URLS})`);
    else if (entries.length > MAX_URLS * 0.8) warnings.push(`${path} lists ${entries.length} URLs, over 80% of the ${MAX_URLS} limit: split it by section (see src/lib/sitemap.ts)`);
    const local = new Set();
    for (const { loc, lastmod } of entries) {
      const problems = urlProblems(loc, opts.site, cc);
      if (lastmod === undefined) row.lastmodMissing++;
      else if (!W3C_DATETIME.test(lastmod)) problems.push(`invalid lastmod ${lastmod}`);
      if (local.has(loc)) { row.duplicates++; problems.push("duplicate in this sitemap"); }
      else if (allLocs.has(loc)) { row.duplicates++; problems.push(`also listed in /${allLocs.get(loc)}/sitemap.xml`); }
      local.add(loc);
      allLocs.set(loc, cc);
      if (problems.length) { row.invalid++; if (row.invalid <= 5) bad(`${loc}: ${problems.join(", ")}`); }
    }
    if (row.invalid > 5) bad(`${path}: ${row.invalid - 5} more invalid URLs`);
    const blocked = entries.filter((e) => e.loc && !robotsAllows(robots, new URL(e.loc).pathname));
    if (blocked.length) bad(`${path}: ${blocked.length} URLs blocked by robots.txt (e.g. ${blocked[0].loc})`);
    if (!robotsAllows(robots, path)) bad(`robots.txt blocks ${path}`);

    ok(`${row.urls} URLs`);
    ok(`${row.duplicates} duplicates`);
    if (row.invalid === 0) ok("0 invalid URLs");
    if (row.lastmodMissing) warnings.push(`${path}: ${row.lastmodMissing} URLs have no lastmod`);
  }

  // Page checks
  const byCountry = new Map();
  for (const [loc, cc] of allLocs) {
    if (opts.countries && !opts.countries.includes(cc)) continue;
    if (!byCountry.has(cc)) byCountry.set(cc, []);
    byCountry.get(cc).push(loc);
  }
  let toCheck = [];
  if (opts.full) toCheck = [...byCountry.values()].flat();
  else {
    const per = Math.max(2, Math.ceil(opts.sample / Math.max(1, byCountry.size)));
    for (const list of byCountry.values()) toCheck.push(...sampleOf(list, per));
  }
  if (toCheck.length) {
    console.log(`\nChecking ${toCheck.length} page URL${toCheck.length === 1 ? "" : "s"} ${opts.full ? "(all)" : "(sample; use --full for every URL)"} ...`);
    let done = 0;
    const results = await pool(toCheck, opts.concurrency, async (loc) => {
      const r = await checkPage(loc, opts);
      done++;
      if (process.stdout.isTTY && done % 25 === 0) process.stdout.write(`  ${done}/${toCheck.length}\r`);
      return r;
    });
    const failed = results.filter((r) => r.problems.length);
    for (const r of results) {
      const row = perCountry.find((p) => p.cc === allLocs.get(r.loc));
      if (!row) continue;
      row.checked++;
      if (r.kind === "redirect") row.redirects++;
      else if (r.kind === "404") row.notFound++;
      else if (r.kind === "5xx" || r.kind === "failed") row.serverErrors++;
      else if (r.kind) row.otherPageErrors++;
    }
    failed.slice(0, 25).forEach((r) => bad(`${r.loc}: ${r.problems.join(", ")}`));
    if (failed.length > 25) bad(`${failed.length - 25} more failing page URLs`);
    const slowest = results.reduce((a, b) => (b.ms > a.ms ? b : a), results[0]);
    if (!failed.length) ok(`${results.length} pages: 200, text/html, self-canonical, indexable (slowest ${slowest.ms} ms)`);
  }

  // Totals
  const sum = (k) => perCountry.reduce((n, r) => n + r[k], 0);
  console.log("\nTOTAL");
  console.log(`  ${sum("urls")} canonical URLs across ${perCountry.length} country sitemaps`);
  console.log(`  ${sum("duplicates")} duplicates`);
  console.log(`  ${sum("invalid")} invalid URLs`);
  console.log(`  ${sum("checked")} page URLs fetched: ${sum("redirects")} redirects, ${sum("notFound")} 404, ${sum("serverErrors")} 5xx/failed, ${sum("otherPageErrors")} other`);
  console.log(`  ${perCountry.filter((r) => r.urls === 0).length + (index.errors.length ? 1 : 0)} broken sitemap endpoints`);
  if (warnings.length) {
    console.log("\nWARNINGS");
    warnings.forEach((w) => console.log(`  ! ${w}`));
  }
  console.log(errors.length ? `\nFAILED with ${errors.length} error${errors.length === 1 ? "" : "s"}` : "\nPASSED");
  process.exitCode = errors.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => { console.error(err); process.exitCode = 1; });
}
