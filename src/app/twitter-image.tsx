import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "AgentSurge | Recruiting Solutions";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 20px 60px rgba(56, 189, 248, 0.4)",
          }}
        >
          <svg
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          AgentSurge
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#38bdf8",
            fontWeight: 500,
          }}
        >
          Recruiting Solutions for Insurance Agents
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
