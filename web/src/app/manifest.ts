import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarketShield",
    short_name: "MarketShield",
    description: "Peringatan dini erupsi berbasis satelit untuk warga, pasar dan posko.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0507",
    theme_color: "#0d0507",
    icons: [
      { src: "/brand/marketshield-mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/marketshield-mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
