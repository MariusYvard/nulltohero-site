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
        /* Real operating systems. This said "Any (Claude Code, Claude Cowork)", which
           reads well and matches nothing: the property is defined to hold an OS, not a
           host application, so anyone filtering "runs on Windows" missed a plugin that
           runs on Windows. The host belongs in softwareRequirements, which exists for
           exactly this. */
        operatingSystem: "Windows, macOS, Linux",
        softwareRequirements: "Claude Code or Claude Cowork",
        url: `${SITE_URL}/`,
        downloadUrl: "https://github.com/MariusYvard/NullToHero",
        /* No codeRepository: its domainIncludes is SoftwareSourceCode, not
           SoftwareApplication, so on this node it does not validate. downloadUrl and
           sameAs already say where the source is. */
        sameAs: ["https://github.com/MariusYvard/NullToHero"],
        license: "https://www.apache.org/licenses/LICENSE-2.0",
        /* From facts.ts, stamped by sync-commands.mjs at the last plugin sync. Hand-typing
           a date here would rot the way the version numbers rotted to v1.2.0. */
        dateModified: PLUGIN.updated,
        description: `A plugin that gives Claude a working vocabulary for design, SEO and front-end quality: ${PLUGIN.skills} skills, ${PLUGIN.commands} commands, ${PLUGIN.referenceDocs} reference documents, ${PLUGIN.inspectRules} deterministic anti-pattern rules and ${PLUGIN.auditAgents} audit sub-agents.`,
        isAccessibleForFree: true,
        // Schema wants an Offer to state a price. 0 is the honest one.
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#author`,
          name: "Marius Yvard",
          url: "https://mariusweb.fr/cv",
          /* One URL is one thread to verify an identity against. The GitHub profile is
             already true and already public; it costs nothing and gives the entity a
             second, independent anchor. */
          sameAs: ["https://github.com/MariusYvard"],
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

/** Site identity. No SearchAction: there is no on-site search, and claiming one is a lie. */
export function WebSiteLd() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "NullToHero",
        url: `${SITE_URL}/`,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#author` },
      }}
    />
  );
}

/**
 * The install flow, as the four steps it already is.
 *
 * Sourced from the STEPS array on the home page: same words, no new claims. Google
 * curtailed the HowTo rich result on web Search in 2023, so this is not a snippet play;
 * it is machine comprehension, which is the GEO angle the plugin itself sells.
 *
 * Deliberately not applied to /journey's six phases: those are phases the plugin runs,
 * not steps the reader performs, and HowTo would misdescribe them.
 */
export function InstallHowToLd({
  steps,
}: {
  steps: { n: string; title: string; body: string; code: string }[];
}) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to install and use NullToHero",
        description: `Install the NullToHero plugin in Claude Code or Claude Cowork and run its ${PLUGIN.commands} commands.`,
        totalTime: "PT5M",
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.body,
          itemListElement: [{ "@type": "HowToDirection", text: s.code }],
        })),
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
