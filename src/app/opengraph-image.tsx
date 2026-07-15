import { ImageResponse } from "next/og";
import { PLUGIN } from "@/lib/facts";

export const dynamic = "force-static";

export const alt = "NullToHero: every page is born null. This one corrects itself.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time from the same constants the pages render, so the card
 * cannot claim v1.2.0 while the site says v1.33.0 — which is exactly what a
 * hand-exported PNG would eventually do.
 *
 * Satori (behind ImageResponse) does not run our CSS, so the tokens are inlined as
 * literals here. They are the resolved sRGB values of the OKLCH tokens in
 * globals.css: --paper oklch(17% 0.007 265) and --red oklch(64% 0.2 29).
 * System sans only: fetching Satoshi at build for one image is not worth the
 * failure mode of a build that dies when a font CDN blinks.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14161a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#f4f4f5", letterSpacing: -1 }}>
            Null
          </span>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#e94534", letterSpacing: -1, marginLeft: -14 }}>
            To
          </span>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#f4f4f5", letterSpacing: -1, marginLeft: -14 }}>
            Hero
          </span>
        </div>

        {/* Satori has no block layout: every div with more than one child needs an
            explicit display, and a text node counts. Hence display:flex everywhere. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, color: "#f4f4f5", letterSpacing: -3, lineHeight: 1.05 }}>
            Every page is born null.
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 900, color: "#e94534", letterSpacing: -3, lineHeight: 1.05 }}>
            This one corrects itself.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginTop: 28, maxWidth: 900 }}>
            A Claude plugin that gives design, SEO and front-end judgment.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 24, color: "#71717a" }}>
            {`${PLUGIN.skills} skills · ${PLUGIN.commands} commands · ${PLUGIN.referenceDocs} docs · ${PLUGIN.licence}`}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#e94534" }}>{`v${PLUGIN.version}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
