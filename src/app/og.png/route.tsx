import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #D9A032, #B87A1E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#0D1117",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#F5F5F5",
                letterSpacing: "-0.02em",
              }}
            >
              Savin<span style={{ color: "#D9A032" }}>Group</span>
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
