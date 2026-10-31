import type { Metadata } from "next";
import { PageHero, PageShell } from "@/components/site/page";
import credits from "@/lib/photo-credits.json";

export const metadata: Metadata = { title: "Kredit foto & data", description: "Atribusi foto, logo, model 3D dan data yang dipakai di situs MarketShield." };

export default function CreditsPage() {
  return (
    <PageShell>
      <PageHero kicker="Kredit" title="Kredit foto, logo & data" crumbs={[{ label: "Kredit" }]} />
      <div className="prose-ms mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2>Foto</h2>
        <table>
          <thead><tr><th>Foto</th><th>Pembuat</th><th>Lisensi</th></tr></thead>
          <tbody>
            {credits.map((c) => (
              <tr key={c.file}><td><a href={c.source}>{c.title}</a></td><td>{c.author}</td><td>{c.license}</td></tr>
            ))}
          </tbody>
        </table>
        <p>Foto berlisensi CC BY / CC BY-SA dipakai sesuai ketentuan lisensinya; perubahan yang kami lakukan hanya pemotongan dan kompresi.</p>
        <h2>Logo instansi</h2>
        <p>Logo BNPB, PVMBG, BMKG, Kemendag dan Komdigi bersumber dari Wikimedia Commons dan merupakan milik masing-masing instansi. Logo ditampilkan sebagai calon mitra, bukan bukti kerja sama. Ikon brand teknologi dari Simple Icons (CC0).</p>
        <h2>Peta & data</h2>
        <ul>
          <li>Citra satelit: Sentinel-2 cloudless 2023 oleh EOX IT Services GmbH (berisi data Copernicus Sentinel yang dimodifikasi)</li>
          <li>Elevasi medan: Terrain Tiles di AWS Open Data</li>
          <li>Basemap gelap: Esri, HERE, Garmin, © kontributor OpenStreetMap</li>
          <li>Batas daratan: Natural Earth</li>
          <li>Model 3D: NVIDIA SimReady Assets (CC BY 4.0)</li>
        </ul>
      </div>
    </PageShell>
  );
}
