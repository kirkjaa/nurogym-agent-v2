#!/usr/bin/env node
/**
 * Query a SearXNG instance (JSON API) for Nurogym research / embedding prep.
 * Default base URL matches README / .env.example: https://xng.quest.ac
 *
 * Usage:
 *   node scripts/searxng-search.mjs "autism exercise systematic review"
 *   SEARXNG_URL=https://other.instance node scripts/searxng-search.mjs "query"
 *   node scripts/searxng-search.mjs --raw "query"   # stdout = raw JSON only
 */

const base =
  process.env.SEARXNG_URL?.replace(/\/$/, "") || "https://xng.quest.ac";

function parseArgs(argv) {
  const raw = argv.includes("--raw");
  const rest = argv.filter((a) => a !== "--raw");
  const q = rest.join(" ").trim();
  return { raw, q };
}

async function main() {
  const argv = process.argv.slice(2);
  const { raw, q } = parseArgs(argv);

  if (!q) {
    console.error(
      "Usage: node scripts/searxng-search.mjs [--raw] <search query>"
    );
    process.exit(1);
  }

  const url = new URL("/search", base + "/");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText} — ${url}`);
    process.exit(2);
  }

  const data = await res.json();

  if (raw) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const results = data.results || [];
  const unresp = data.unresponsive_engines || [];

  console.log(`SearXNG: ${base}`);
  console.log(`Query: ${data.query || q}`);
  console.log(`Results: ${results.length} (reported total: ${data.number_of_results ?? "n/a"})`);
  if (unresp.length) {
    console.log("\nUnresponsive / suspended engines:");
    for (const [name, reason] of unresp) {
      console.log(`  - ${name}: ${reason}`);
    }
  }
  console.log("");

  if (!results.length) {
    console.log(
      "No hits. Try a shorter query, different keywords, or PubMed/WHO directly (see curriculum/12-research-sources-and-web-search.md)."
    );
    return;
  }

  results.slice(0, 15).forEach((r, i) => {
    const title = r.title || "(no title)";
    const link = r.url || "";
    const snippet = (r.content || "").replace(/\s+/g, " ").trim();
    console.log(`--- ${i + 1}. ${title}`);
    console.log(link);
    if (snippet) console.log(snippet.slice(0, 500) + (snippet.length > 500 ? "…" : ""));
    console.log("");
  });
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(3);
});
