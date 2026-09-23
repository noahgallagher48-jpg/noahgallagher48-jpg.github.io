// Safety net for the move from GitHub Pages to Cloudflare Pages.
// Cloudflare serves everything it has. Anything it does not have (a path from a repo not yet
// folded into _cf/assemble.sh, or a file over Cloudflare's 25 MiB limit) is fetched from the old
// GitHub Pages site and returned as if it lived here, so no link anyone holds breaks.
// Remove this file once GitHub Pages is switched off.
const GH = "https://noahgallagher48-jpg.github.io";
const OURS = new Set(["abba-photo.com", "www.abba-photo.com"]);

export async function onRequest(context) {
  const { request, env } = context;
  const own = await env.ASSETS.fetch(request);
  if (own.status !== 404) return own;
  if (request.method !== "GET" && request.method !== "HEAD") return own;
  const u = new URL(request.url);
  let target = GH + u.pathname + u.search;
  const headers = { "user-agent": request.headers.get("user-agent") || "abba-photo-fallback", "accept": request.headers.get("accept") || "*/*" };
  // GitHub Pages answers a user site with a custom domain by redirecting to that domain.
  // Once that domain points here, following it blindly would loop. Redirects are followed by
  // hand, and any that point back at our own domain are sent to github.io instead.
  for (let hop = 0; hop < 4; hop++) {
    const gh = await fetch(target, { method: request.method, headers, redirect: "manual", cf: { cacheTtl: 3600, cacheEverything: true } });
    if (gh.status >= 300 && gh.status < 400 && gh.headers.get("location")) {
      const loc = new URL(gh.headers.get("location"), target);
      if (OURS.has(loc.hostname) || loc.hostname === "noahgallagher48-jpg.github.io") { loc.hostname = "noahgallagher48-jpg.github.io"; loc.protocol = "https:"; target = loc.toString(); continue; }
      return own;
    }
    if (gh.status === 404) return own;
    const h = new Headers(gh.headers);
    h.delete("set-cookie");
    h.set("x-abba-source", "github-pages-fallback");
    return new Response(gh.body, { status: gh.status, headers: h });
  }
  return own;
}
