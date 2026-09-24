import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Savin Group mark (same drawing as src/app/icon.svg and <SavinMark />). */
const MARK_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none"> <defs> <linearGradient id="sgTop" x1="10" y1="4" x2="84" y2="60" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#0AA2FF"/> <stop offset=".45" stop-color="#0B63F0"/> <stop offset="1" stop-color="#0A4FD6"/> </linearGradient> <linearGradient id="sgBand" x1="10" y1="40" x2="84" y2="70" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#0A3FC4"/> <stop offset=".45" stop-color="#0B74F2"/> <stop offset=".75" stop-color="#08B3E6"/> <stop offset="1" stop-color="#0A9E8C"/> </linearGradient> <linearGradient id="sgBottom" x1="80" y1="66" x2="6" y2="96" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#0BA878"/> <stop offset=".5" stop-color="#0FB673"/> <stop offset="1" stop-color="#16D06F"/> </linearGradient> <linearGradient id="sgArrow" x1="74" y1="68" x2="98" y2="30" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#0A9E5E"/> <stop offset="1" stop-color="#17D66E"/> </linearGradient> <linearGradient id="sgPeople" x1="30" y1="22" x2="70" y2="52" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#1A5FD0"/> <stop offset="1" stop-color="#0E3E9E"/> </linearGradient> </defs> <path d="M89 7 C 74 1, 42 -3, 20 9 C 3 18, -2 36, 8 48 L 13.5 35.5 C 13 24, 26 17, 44 17 C 58 17, 70 21, 78 27 Z" fill="url(#sgTop)"/> <path d="M13.5 35 C 18 42, 32 45, 48 47.6 C 63 50, 76 53, 84.5 60.5 L 83 72.5 C 74 67, 62 64.5, 46 61.5 C 30 58.5, 15 56, 8 48 Z" fill="url(#sgBand)"/> <path d="M84 60 C 95 68, 94 84, 82 92 C 70 100, 45 101, 25 97 C 14 95, 5 92, 1 91 L 15 69 C 22 75, 32 79, 44 79.5 C 56 80, 66 75, 71 66 Z" fill="url(#sgBottom)"/> <path d="M82.5 69 C 85.5 61, 86.5 54, 85.8 46.5 L 92 46 C 92.3 54.5, 90.2 62.5, 86 70.5 Z" fill="url(#sgArrow)"/> <path d="M97 29.5 L 72 41.5 L 99 57 Z" fill="url(#sgArrow)"/> <g fill="url(#sgPeople)"> <circle cx="48" cy="29" r="5.6"/> <path d="M37.5 47.5 C 37.5 40, 42 36, 48 36 C 54 36, 58.5 40, 58.5 48.5 Z"/> <circle cx="35" cy="34" r="4.1"/> <path d="M28 44 C 29 41, 31.5 39.8, 35 39.8 C 36.5 39.8, 37.6 40.2, 38.4 40.8 C 37 42, 36.4 43.6, 36.2 45.6 Z"/> <circle cx="61" cy="34" r="4.1"/> <path d="M60 40.2 C 66 40, 70 43.5, 71.5 51 C 67.5 49.6, 64 48.8, 60.6 48.3 C 60.8 45, 60.6 42.4, 60 40.2 Z"/> </g> </svg>`;
const MARK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(MARK_SVG)}`;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 100px",
          background: "linear-gradient(135deg, #0D1117 0%, #121A2B 50%, #0D1117 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Amber glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: 200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217, 160, 50, 0.15), transparent 70%)",
          }}
        />

        {/* Violet glow */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: 100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(140, 80, 220, 0.1), transparent 70%)",
          }}
        />

        {/* Brand logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK_URI} width={64} height={64} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#F5F5F5",
                letterSpacing: "-0.02em",
              }}
            >
              savin<span style={{ color: "#22C27E" }}>group</span>
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#888",
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
              }}
            >
              Revenue Systems
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#F5F5F5",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 800,
          }}
        >
          We Build Revenue Systems.
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #E8B84D, #D9A032, #B87A1E)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Not Just Websites.
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 32,
          }}
        >
          {[
            { value: "50+", label: "Businesses" },
            { value: "₹40Cr+", label: "Revenue Impact" },
            { value: "200%", label: "Avg ROI" },
            { value: "5", label: "Industries" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#F5F5F5",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#888",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  marginTop: 4,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 100,
            fontSize: 16,
            color: "#555",
            letterSpacing: "0.05em",
          }}
        >
          savingroup.in
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
