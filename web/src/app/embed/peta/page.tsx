import type { Metadata, Viewport } from "next";
import { EmbedMap } from "./embed-map";

export const metadata: Metadata = {
  title: "Peta 3D",
  description: "Peta 3D Semeru dengan simulasi erupsi, untuk ditanam di aplikasi warga.",
  robots: { index: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#120a0c" };

/** Full-screen 3D map without site chrome; opened from the resident app's "3D" button. */
export default function Page() {
  return <EmbedMap />;
}
