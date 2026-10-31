import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { StoreHydrator } from "@/lib/store";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://marketshield-inception.vercel.app"),
  title: {
    default: "MarketShield · Peringatan dini erupsi dari satelit",
    template: "%s · MarketShield",
  },
  description:
    "MarketShield membaca data satelit Google Earth Engine untuk memperkirakan eskalasi gunung api, menyaring hoaks, menjaga harga kebutuhan darurat tetap wajar, dan mengarahkan bantuan ke desa paling terpapar.",
  applicationName: "MarketShield",
  openGraph: {
    title: "MarketShield",
    description: "Peringatan dini erupsi berbasis satelit untuk warga, pasar dan posko.",
    url: "https://marketshield-inception.vercel.app",
    siteName: "MarketShield",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0507",
};

// Restores the saved theme (or the system preference) before first paint to avoid a flash
const themeScript = `(function(){try{var t=localStorage.getItem('ms-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
