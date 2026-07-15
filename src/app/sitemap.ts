import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/facts";

// Required under output: "export" — see the note in robots.ts.
export const dynamic = "force-static";

/* Next generates this at build time, so it works under output: "export".
   Three pages, hand-declared: a generated crawl of the route tree would be
   over-engineering for a site this size, and would happily list a page we never
   meant to index. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/journey/`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/commands/`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
