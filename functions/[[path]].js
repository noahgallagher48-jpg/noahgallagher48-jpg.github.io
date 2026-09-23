// Safety net for the move from GitHub Pages to Cloudflare Pages.
// Cloudflare serves everything it has. Anything it does not have (a path from a repo not yet
// folded into _cf/assemble.sh, or a file over Cloudflare's 25 MiB limit) is fetched from the old
// GitHub Pages site and returned as if it lived here, so no link anyone holds breaks.
// Remove this file once GitHub Pages is switched off.
export async function onRequest(context) {
  const { request, env } = context;
  const own = await env.ASSETS.fetch(request);
  if (own.status !== 404) return own;
  if (request.method !== "GET" && request.method !== "HEAD") return own;
  const u = new URL(request.url);
  const gh = await fetch("https://noahgallagher48-jpg.github.io" + u.pathname + u.search, {
    method: request.method,
    headers: { "user-agent": request.headers.get("user-agent") || "abba-photo-fallback", "accept": request.headers.get("accept") || "*/*" },
    redirect: "follow",
    cf: { cacheTtl: 3600, cacheEverything: true }
  });
  if (gh.status === 404) return own;
  const h = new Headers(gh.headers);
  h.delete("set-cookie");
  h.set("x-abba-source", "github-pages-fallback");
  return new Response(gh.body, { status: gh.status, headers: h });
}
