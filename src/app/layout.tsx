import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Wordmark } from "@/components/Wordmark";
import { PLUGIN, SITE_URL } from "@/lib/facts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* The homepage's own canonical, and ONLY the homepage's.
     Next inherits this literal string into every route that does not override it, so
     for months /journey/ and /commands/ both shipped canonical="/" and told crawlers to
     index the homepage instead of themselves — while their own og:url and BreadcrumbList
     said the opposite, on the same page. It looked correct here because the homepage's
     path happens to BE "/". Every new route must set its own `alternates.canonical`,
     with the trailing slash that `trailingSlash: true` and the sitemap already use. */
  alternates: { canonical: "/" },
  title: {
    default: "NullToHero: the Claude plugin that corrects your website",
    template: "%s — NullToHero",
  },
  // 131 chars of a 160 budget, and no verb: unused space on the site's most valuable
  // snippet. The tail lands it at ~152. Check the count before extending it again,
  // /journey's went to 175 the last time a call to action was added by eye.
  description:
    `NullToHero gives Claude a complete design, SEO and quality vocabulary: ${PLUGIN.skills} skills, ${PLUGIN.commands} commands, ${PLUGIN.referenceDocs} reference docs. Free, ${PLUGIN.licence}. Install in two lines.`,
  applicationName: "NullToHero",
  authors: [{ name: "Marius Yvard", url: "https://mariusweb.fr/cv" }],
  openGraph: {
    type: "website",
    title: "NullToHero: every page is born null",
    description:
      `A Claude plugin that teaches design, SEO and front-end judgment. ${PLUGIN.skills} skills, ${PLUGIN.commands} commands, ${PLUGIN.referenceDocs} reference docs. Free, ${PLUGIN.licence}.`,
    url: "https://nulltohero.netlify.app/",
    siteName: "NullToHero",
  },
  twitter: { card: "summary_large_image" },
};

function Nav() {
  return (
    // fixed, not sticky: a sticky header eats the first 68px of flow, so the hero
    // would start below it and the blur would composite over the body instead of
    // over act 0's sheet. Fixed lets the hero own the viewport from scroll 0.
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3" aria-label="Main">
        {/* text-ink is explicit, not inherited: the light-act override rebinds --ink on the header.
            The mark is aria-hidden, so the label carries the name for a screen reader. */}
        <Link href="/" className="text-lg text-ink" aria-label="NullToHero home">
          <Wordmark />
        </Link>
        <div className="ml-auto hidden gap-6 text-sm text-ink-soft sm:flex">
          <Link href="/journey" className="hover:text-ink">The journey</Link>
          <Link href="/commands" className="hover:text-ink">Commands</Link>
          <a href="https://github.com/MariusYvard/NullToHero" rel="noopener" className="hover:text-ink">GitHub</a>
        </div>
        <a
          href="/#install"
          className="ml-auto inline-flex min-h-12 items-center rounded-md bg-red-solid px-4 text-sm font-bold text-white hover:bg-red-deep sm:ml-0"
        >
          Install
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-paper-high">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm sm:grid-cols-3">
        <div>
          <Wordmark className="text-lg" />
          {/* Names the category out loud. An answer engine asked "what is NullToHero"
              had to infer the noun from the pitch; a site that sells GEO can afford to
              say what it is. No comparison claims: naming a rival's shortcomings on your
              own domain is a claim you then have to keep true, and there is no honest
              feature matrix to build without testing them. */}
          <p className="mt-2 max-w-xs text-ink-soft">
            A Claude Code plugin for design, SEO and front-end quality review. Free, and it
            takes a website from zero knowledge to hero.
          </p>
        </div>
        <nav className="grid content-start gap-2" aria-label="Footer">
          <Link href="/journey" className="py-1 hover:text-ink">The journey</Link>
          <Link href="/commands" className="py-1 hover:text-ink">All {PLUGIN.commands} commands</Link>
          <a href="https://github.com/MariusYvard/NullToHero" rel="noopener" className="py-1 hover:text-ink">GitHub</a>
          <a href="/llms.txt" className="py-1 hover:text-ink">llms.txt</a>
          {/* GitHub Issues was already the support channel. Nothing said so, which made it
              a channel only people who assumed it existed could use. */}
          <a href="https://github.com/MariusYvard/NullToHero/issues" rel="noopener" className="py-1 hover:text-ink">
            Questions or bugs: open an issue
          </a>
        </nav>
        <div className="grid content-start gap-2 font-mono text-xs text-ink-faint">
          <span>
            v{PLUGIN.version} ·{" "}
            {/* The licence was plain text, and its real URL existed only inside the JSON-LD,
                where no reader ever goes. */}
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              rel="noopener license"
              className="underline decoration-line underline-offset-2 hover:text-ink"
            >
              {PLUGIN.licence}
            </a>
          </span>
          <span>Updated {PLUGIN.updated}</span>
          {/* One sentence of who, on the site itself. It was consistent everywhere and
              stated nowhere: a visitor had to leave to find out whose judgment this is. */}
          <span className="not-italic">
            By{" "}
            <a href="https://mariusweb.fr/cv" rel="noopener author" className="underline decoration-red underline-offset-2">
              Marius Yvard
            </a>
            , who builds and audits the sites this plugin was written for.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* No preconnect and no third-party stylesheet: every face is same-origin now
            (see the @font-face block in globals.css). Four preconnects and two blocking
            external stylesheets bought a dependency on api.fontshare.com and
            fonts.googleapis.com being reachable, and the second one is blocked on the
            author's own machine.

            Preloaded, not discovered in CSS: these three are the first paint. The rest
            of the Satoshi weights are left to CSS discovery — preloading a face that the
            first screen never uses only competes with the ones it does. */}
        <link rel="preload" href="/fonts/black-monster.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/satoshi-900.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/jetbrains-mono-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <SmoothScroll />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[99] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
