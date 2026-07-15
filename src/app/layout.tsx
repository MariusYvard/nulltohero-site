import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Wordmark } from "@/components/Wordmark";
import { PLUGIN, SITE_URL } from "@/lib/facts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "NullToHero: the Claude plugin that corrects your website",
    template: "%s — NullToHero",
  },
  description:
    `NullToHero gives Claude a complete design, SEO and quality vocabulary: ${PLUGIN.skills} skills, ${PLUGIN.commands} commands, ${PLUGIN.referenceDocs} reference docs. Free, ${PLUGIN.licence}.`,
  applicationName: "NullToHero",
  authors: [{ name: "Marius Yvard", url: "https://lecvdemarius.netlify.app/" }],
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
          className="ml-auto inline-flex min-h-11 items-center rounded-md bg-red px-4 text-sm font-bold text-white hover:bg-red-deep sm:ml-0"
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
          <p className="mt-2 max-w-xs text-ink-soft">
            From zero knowledge to hero website. A free plugin for Claude Code and Claude Cowork.
          </p>
        </div>
        <nav className="grid content-start gap-2" aria-label="Footer">
          <Link href="/journey" className="hover:text-ink">The journey</Link>
          <Link href="/commands" className="hover:text-ink">All {PLUGIN.commands} commands</Link>
          <a href="https://github.com/MariusYvard/NullToHero" rel="noopener" className="hover:text-ink">GitHub</a>
          <a href="/llms.txt" className="hover:text-ink">llms.txt</a>
        </nav>
        <div className="grid content-start gap-2 font-mono text-xs text-ink-faint">
          <span>v{PLUGIN.version} · {PLUGIN.licence}</span>
          <span>
            By{" "}
            <a href="https://lecvdemarius.netlify.app/" rel="noopener" className="underline decoration-red underline-offset-2">
              Marius Yvard
            </a>
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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,800,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Act 0's hand is self-hosted (see @font-face in globals.css) and is the
            first paint of the page, so it is preloaded rather than discovered in CSS. */}
        <link
          rel="preload"
          href="/fonts/black-monster.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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
