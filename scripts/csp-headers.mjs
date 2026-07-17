#!/usr/bin/env node
/**
 * Writes out/_headers with a Content-Security-Policy whose script-src carries the
 * SHA-256 of every inline script this build emitted, instead of 'unsafe-inline'.
 *
 * Why not just keep 'unsafe-inline': it means any inline <script> an attacker gets
 * into the page executes, which is the whole hole CSP exists to close. Why not a
 * nonce: nonces must be unique per response, and a static export has no server to mint
 * one. Hashes are the static-site answer, and they are exact rather than approximate.
 *
 * Why generated rather than hand-written: Next emits ~16 inline flight-data scripts per
 * page and their content changes with the content. A hand-maintained list would be
 * wrong on the next build, and wrong here does not mean "weaker policy", it means the
 * page does not boot. So the hashes are read from the artifact that ships.
 *
 * style-src keeps 'unsafe-inline' via style-src-attr ONLY: motion writes style=""
 * attributes on every frame, which no hash can cover (attribute styles are re-written
 * continuously at runtime). Splitting the directive keeps <style> blocks strict while
 * allowing the attributes that a scroll-linked hero cannot exist without.
 *
 * The CSP lives here and NOT in netlify.toml: netlify.toml is read before the build
 * runs, so it can never carry a hash of the build's own output. Netlify merges _headers
 * with netlify.toml, and netlify.toml wins on conflict, so netlify.toml must not
 * declare a CSP at all or it would silently override this one.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

const OUT = "out";
/* No font origins. Satoshi and JetBrains Mono are served from /fonts now, so the two
   stylesheet origins and the two CDN origins that used to be punched through here have
   nothing left to allow. A policy that permits an origin the site no longer contacts is
   not a smaller policy, it is an unused hole. */

function htmlFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) found.push(...htmlFiles(p));
    else if (name.endsWith(".html")) found.push(p);
  }
  return found;
}

/** The URL path Netlify will match, derived from where the file actually sits. */
function routeOf(file) {
  const rel = relative(OUT, file).split(sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"/index.html".length) + "/";
  return "/" + rel;
}

const files = htmlFiles(OUT);
if (!files.length) {
  console.error("[csp] no HTML in out/: refusing to write a _headers that would ship no CSP at all.");
  process.exit(1);
}

const rules = [];
let totalScripts = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  // Inline scripts only: anything with src= is covered by 'self'.
  const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const hashes = [...new Set(inline.map(m => "sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64")))];
  totalScripts += inline.length;
  const scriptSrc = ["'self'", ...hashes.map(h => `'${h}'`)].join(" ");
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  rules.push(`${routeOf(file)}\n  Content-Security-Policy: ${csp}`);
}

writeFileSync(join(OUT, "_headers"), rules.join("\n\n") + "\n");
console.log(`[csp] out/_headers: ${rules.length} route(s), ${totalScripts} inline script(s) hashed; script-src no longer needs 'unsafe-inline'.`);
