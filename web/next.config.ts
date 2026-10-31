import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/downloads/:file*",
        headers: [{ key: "Content-Disposition", value: "attachment" }],
      },
      ...["/models/:file*", "/screens/:file*", "/img/:file*", "/brand/:file*", "/mobile-app/assets/:file*", "/mobile-app/canvaskit/:file*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      })),
    ];
  },
  async rewrites() {
    return [{ source: "/mobile-app", destination: "/mobile-app/index.html" }];
  },
};

export default nextConfig;
