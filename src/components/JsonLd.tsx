import { PLUGIN, SITE_URL } from "@/lib/facts";

/**
 * Structured data. Server-rendered into the static HTML, never injected by a
 * client script: a crawler that does not run our JS still has to be able to read it.
 *
 * Deliberately not claiming aggregateRating or review — we have no ratings, and
 * inventing them is the exact "unattributed social proof" the claims agent flags.
 * Rich results are earned, not asserted.
 */

function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own literal, not user input. JSON.stringify escapes the
      // quotes; the </script> guard is for the one sequence that would break out.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** SoftwareApplication + the author, on the home page only. */
export function SoftwareLd() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "NullToHero",
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Claude Code plugin",
        softwareVersion: PLUGIN.version,
        operatingSystem: "Any (Claude Code, Claude Cowork)",
        url: `${SITE_URL}/`,
        downloadUrl: "https://github.com/MariusYvard/NullToHero",
        codeRepository: "https://github.com/MariusYvard/NullToHero",
        license: "https://www.apache.org/licenses/LICENSE-2.0",
        description: `A plugin that gives Claude a working vocabulary for design, SEO and front-end quality: ${PLUGIN.skills} skills, ${PLUGIN.commands} commands, ${PLUGIN.referenceDocs} reference documents, ${PLUGIN.inspectRules} deterministic anti-pattern rules and ${PLUGIN.auditAgents} audit sub-agents.`,
        isAccessibleForFree: true,
        // Schema wants an Offer to state a price. 0 is the honest one.
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: {
          "@type": "Person",
          name: "Marius Yvard",
          url: "https://lecvdemarius.netlify.app/",
        },
        featureList: [
          `${PLUGIN.perSkill.siteasy} design commands (/siteasy)`,
          `${PLUGIN.perSkill.seo} search and GEO commands (/seo)`,
          `${PLUGIN.perSkill.audit} scored-audit commands (/audit)`,
          `${PLUGIN.perSkill.inspect} quality commands (/inspect)`,
          `${PLUGIN.inspectRules} deterministic anti-pattern rules`,
          `${PLUGIN.laws} numeric laws with stable ids`,
        ],
      }}
    />
  );
}

/** BreadcrumbList for an inner page. */
export function BreadcrumbLd({ name, path }: { name: string; path: string }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "NullToHero", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
        ],
      }}
    />
  );
}
