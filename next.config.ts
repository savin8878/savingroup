import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer (used by the /pricing/download PDF route) must stay
  // external. Bundling it compiles its React reconciler against Next's
  // server-only React build and every render fails with "Cannot read
  // properties of undefined (reading 'S')". Next.js already has it on its
  // default server-externals list; keeping it here makes that explicit.
  // Turbopack links external packages into .next/node_modules at build time.
  // Next.js 16.1.0 used symlinks for that, which fail on Windows without
  // Developer Mode (os error 1314); 16.1.1+ falls back to junctions, so keep
  // next at >= 16.1.1.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "sanat-rewa.vercel.app" },
    ],
  },
  // Permanent redirects for slug aliases users naturally type but the
  // canonical slug differs. Without these, the URL 404s and Next.js renders
  // a noindex page — which Lighthouse / Search Console then flags. Keep
  // the canonical `delhi` slug (already indexed) and 308 the brand-name
  // variant so PageRank consolidates instead of stranding on a 404.
  redirects: async () => [
    // Crawlers and SEO tools probe /sitemap.xml by convention. The real entry
    // point is the sitemap index (see robots.ts); one hop, no chain.
    {
      source: "/sitemap.xml",
      destination: "/sitemap-index.xml",
      permanent: true,
    },
    {
      source: "/:country/:locale/cities/delhi-ncr",
      destination: "/:country/:locale/cities/delhi",
      permanent: true,
    },
    {
      source: "/:country/:locale/cities/delhi-ncr/:rest*",
      destination: "/:country/:locale/cities/delhi/:rest*",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self)",
        },
        // India geo-targeting headers
        {
          key: "geo.region",
          value: "IN",
        },
        {
          key: "geo.country",
          value: "India",
        },
      ],
    },
    {
      source: "/(.*)\\.(js|css|woff2|png|jpg|svg|ico)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    // Sitemap headers for search console crawl optimization
    {
      source: "/sitemap-index.xml",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400",
        },
        {
          key: "Content-Type",
          value: "application/xml; charset=utf-8",
        },
      ],
    },
    {
      source: "/sitemap-:slug.xml",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400",
        },
        {
          key: "Content-Type",
          value: "application/xml; charset=utf-8",
        },
      ],
    },
  ],
  // Compress responses for faster India mobile networks
  compress: true,
};

export default nextConfig;
