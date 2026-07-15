import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/facts";

// Required under output: "export" — a metadata route is dynamic by default, and
// there is no server here to be dynamic on.
export const dynamic = "force-static";

/* AI crawlers are allowed explicitly, not just by omission.
   A site whose argument is "machines read your site first" cannot then slam the
   door on the machines. NullToHero is free and Apache 2.0: being quoted by an
   answer engine IS the distribution. Naming them beats relying on the wildcard,
   because several read a named block and ignore a broad one. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Answer engines and their training/search crawlers, named.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
