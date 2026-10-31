import type { Metadata } from "next";
import { PageHero, PageShell } from "@/components/site/page";
import { DocsNav } from "@/components/pages/docs-nav";
import { DATASETS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dokumentasi",
  description: "Konsep, sumber data, model, dan referensi API MarketShield.",
};

const BASE = "https://marketshield-inception.vercel.app/api/v1";

const groups = [
  { title: "Mulai", items: [{ id: "pengantar", label: "Pengantar" }, { id: "mulai-cepat", label: "Mulai cepat" }, { id: "peran", label: "Peran & akses" }] },
  { title: "Konsep", items: [{ id: "level", label: "Level PVMBG" }, { id: "jendela-aksi", label: "Jendela aksi" }, { id: "mesin-risiko", label: "Mesin risiko" }, { id: "filter-sinyal", label: "Filter sinyal" }, { id: "harga", label: "Anomali harga" }, { id: "prioritas", label: "Prioritas bantuan" }] },
  { title: "Data", items: [{ id: "sumber-data", label: "Sumber data satelit" }, { id: "kesegaran", label: "Kesegaran & kualitas" }] },
  { title: "API", items: [{ id: "api", label: "Ikhtisar" }, { id: "autentikasi", label: "Autentikasi" }, { id: "endpoint", label: "Endpoint" }, { id: "webhook", label: "Webhook" }, { id: "error", label: "Error & batas" }] },
  { title: "Lainnya", items: [{ id: "changelog", label: "Catatan rilis" }] },
];

export default function DocsPage() {
  return (
    <PageShell>
      <PageHero kicker="Dokumentasi" title="Dokumentasi MarketShield" sub="Cara kerja model, asal setiap angka, dan cara menghubungkan sistem Anda ke data satelit kami." crumbs={[{ label: "Docs" }]} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
        <DocsNav groups={groups} />
        <article className="prose-ms max-w-3xl">
          <h2 id="pengantar">Pengantar</h2>
          <p>MarketShield mengubah data satelit publik menjadi langkah yang jelas bagi warga, posko dan pemerintah daerah di sekitar gunung api aktif. Semua data masuk lewat Google Earth Engine, sehingga tidak ada sensor lapangan yang perlu dipasang atau dirawat.</p>
          <blockquote>Status level resmi selalu mengikuti PVMBG. Prakiraan MarketShield adalah informasi pelengkap untuk persiapan, bukan pengganti perintah resmi.</blockquote>

          <h2 id="mulai-cepat">Mulai cepat</h2>
          <ol>
            <li><strong>Warga:</strong> unduh APK di <a href="/download">/download</a>, pilih bahasa, peran dan lokasi. Beranda langsung menyesuaikan level gunung terdekat.</li>
            <li><strong>BPBD dan posko:</strong> buka <a href="/app">web console</a>. Menu Ringkasan menampilkan peluang eskalasi, indikator satelit dan peringatan terbaru.</li>
            <li><strong>Developer:</strong> panggil <code>GET {BASE}/volcanoes</code> untuk daftar gunung, lalu <code>/volcanoes/semeru/risk</code> untuk prakiraan.</li>
          </ol>

          <h2 id="peran">Peran &amp; akses</h2>
          <table>
            <thead><tr><th>Peran</th><th>Akses</th></tr></thead>
            <tbody>
              <tr><td>Warga</td><td>Aplikasi: beranda, peta, evakuasi, SOS, cek pesan, Kit Siaga, posko terdekat</td></tr>
              <tr><td>Operator posko</td><td>Ubah status & stok posko, siaran tingkat desa</td></tr>
              <tr><td>Operator BPBD</td><td>Seluruh console, siaran wilayah, catat distribusi bantuan, ekspor laporan</td></tr>
              <tr><td>Admin instansi</td><td>Kelola akun, SSO, kunci API, log audit</td></tr>
            </tbody>
          </table>

          <h2 id="level">Level PVMBG</h2>
          <p>Aplikasi berubah bentuk mengikuti empat level resmi:</p>
          <table>
            <thead><tr><th>Level</th><th>Pesan utama</th><th>Tombol utama</th></tr></thead>
            <tbody>
              <tr><td>I Normal</td><td>Aman. Siapkan rencana keluarga.</td><td>Lengkapi Kit Siaga</td></tr>
              <tr><td>II Waspada</td><td>Aktivitas meningkat. Siapkan perlengkapan di harga wajar.</td><td>Lihat rekomendasi belanja</td></tr>
              <tr><td>III Siaga</td><td>Kenali rute evakuasimu.</td><td>Pratinjau rute evakuasi</td></tr>
              <tr><td>IV Awas</td><td>Evakuasi sekarang.</td><td>Mulai panduan evakuasi + SOS</td></tr>
            </tbody>
          </table>

          <h2 id="jendela-aksi">Jendela aksi</h2>
          <p>Jendela aksi adalah perkiraan waktu antara &quot;satelit menunjukkan risiko naik&quot; dan &quot;sudah terlambat untuk bertindak dengan murah dan tenang&quot;. Nilainya diturunkan dari kurva peluang eskalasi: jumlah hari sampai peluang melewati ambang Siaga (60%).</p>

          <h2 id="mesin-risiko">Mesin risiko</h2>
          <p>Model gradient boosting (XGBoost) memprediksi peluang kenaikan level dalam 7 hari. Fitur dihitung per gunung setiap 6 jam:</p>
          <ul>
            <li>Perubahan backscatter radar Sentinel-1 di kawah dan alur sungai</li>
            <li>Jumlah titik panas FIRMS dan FRP maksimum 48 jam</li>
            <li>Anomali suhu permukaan MODIS terhadap baseline 90 hari</li>
            <li>Kolom SO₂ dan indeks aerosol Sentinel-5P, termasuk tren 3 hari</li>
            <li>Curah hujan GPM IMERG 24 jam di alur lahar</li>
          </ul>
          <p>Label berasal dari riwayat perubahan level PVMBG. Setiap prakiraan disertai tiga faktor utama dari nilai SHAP agar petugas dapat memeriksa alasannya.</p>

          <h2 id="filter-sinyal">Filter sinyal</h2>
          <p>Pesan diklasifikasi menjadi <code>HOAX</code>, <code>PANIC</code>, <code>VERIFIED</code>, <code>OFFICIAL</code> atau <code>UNVERIFIED</code>. Aturan penting: label <strong>terverifikasi tidak pernah diberikan oleh model saja</strong>. Diperlukan sumber resmi, minimal tiga laporan yang konsisten, atau kecocokan dengan lapisan satelit. Klaim lokasi lahar dicek ke radar Sentinel-1, klaim abu dicek ke arah angin GFS dan aerosol Sentinel-5P.</p>

          <h2 id="harga">Anomali harga</h2>
          <p>Untuk setiap barang darurat: <code>deviasi = (harga pasar − HET) ÷ HET</code>. Barang ditandai jika deviasi di atas 30% di tiga outlet atau lebih dalam 24 jam. Laporan warga memerlukan foto dan lokasi outlet.</p>

          <h2 id="prioritas">Prioritas bantuan</h2>
          <pre><code>Priority = Σ(pop_exposed × w_hazard) × vulnerability ÷ (aid_received + 1)</code></pre>
          <p><code>pop_exposed</code> dihitung dari WorldPop 100 m di dalam zona KRB, sebaran abu dan aliran lahar. <code>vulnerability</code> menggabungkan tutupan lahan dan jarak ke posko terdekat. Setiap kiriman yang dicatat di console menurunkan skor desa tersebut sehingga bantuan berikutnya bergeser ke desa lain.</p>

          <h2 id="sumber-data">Sumber data satelit</h2>
          <table>
            <thead><tr><th>Dataset Earth Engine</th><th>Dipakai untuk</th></tr></thead>
            <tbody>
              {DATASETS.map((d) => (
                <tr key={d.id}><td><code>{d.id}</code></td><td>{d.what.id}</td></tr>
              ))}
            </tbody>
          </table>

          <h2 id="kesegaran">Kesegaran &amp; kualitas</h2>
          <p>Setiap angka di aplikasi dan console menyebut dataset dan waktu akuisisinya. Jika data lebih tua dari ambang (misalnya radar lebih dari 12 hari), tampilan diberi tanda abu-abu dan tidak dipakai untuk menaikkan peringatan.</p>

          <h2 id="api">API: ikhtisar</h2>
          <p>API REST mengembalikan JSON. URL dasar:</p>
          <pre><code>{BASE}</code></pre>
          <p>Endpoint baca bersifat publik dan di-cache 5 menit. Paket Pemda dan Sektor mendapat kuota lebih besar, endpoint tulis dan webhook.</p>

          <h3 id="autentikasi">Autentikasi</h3>
          <p>Endpoint berbayar memakai kunci API di header. Kunci dibuat oleh admin instansi di console.</p>
          <pre><code>{`Authorization: Bearer ms_live_xxxxxxxxxxxxxxxx`}</code></pre>

          <h3 id="endpoint">Endpoint</h3>
          <table>
            <thead><tr><th>Metode</th><th>Path</th><th>Keterangan</th></tr></thead>
            <tbody>
              <tr><td>GET</td><td><code>/volcanoes</code></td><td>Daftar gunung api yang dipantau</td></tr>
              <tr><td>GET</td><td><code>/volcanoes/{"{id}"}/risk?level=3</code></td><td>Level resmi, peluang eskalasi, jendela aksi, indikator, riwayat</td></tr>
              <tr><td>GET</td><td><code>/villages/priority?level=3</code></td><td>Peringkat desa untuk distribusi bantuan</td></tr>
              <tr><td>GET</td><td><code>/prices</code></td><td>HET, rata-rata pasar dan deviasi barang darurat</td></tr>
              <tr><td>GET</td><td><code>/posko?volcano=semeru</code></td><td>Status, kapasitas, stok dan kebutuhan posko</td></tr>
              <tr><td>GET</td><td><code>/alerts</code></td><td>Peringatan terbaru dari BPBD dan satelit</td></tr>
              <tr><td>GET</td><td><code>/intel</code></td><td>Klaim yang sudah diverifikasi: hoaks, panik, terverifikasi, resmi</td></tr>
              <tr><td>POST</td><td><code>/signals/check</code></td><td>Klasifikasi pesan dan cek silang satelit</td></tr>
            </tbody>
          </table>
          <p>Setiap respons punya kolom <code>source</code>: <code>firestore</code> untuk data langsung dari basis data, <code>static</code> bila basis data sedang tidak terjangkau. Endpoint risiko juga menyertakan <code>model</code> berisi prakiraan XGBoost terbaru bila tersedia. Isi pesan yang dicek tidak pernah disimpan.</p>
          <p>Contoh: cek sebuah pesan berantai.</p>
          <pre><code>{`curl -X POST ${BASE}/signals/check \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Katanya lahar sudah masuk Pronojiwo, sebarkan!","lang":"id"}'`}</code></pre>
          <pre><code>{`{
  "label": "HOAX",
  "confidence": 0.97,
  "triggers": ["sudah masuk", "sebarkan", "katanya"],
  "satellite_check": "Radar Sentinel-1 tidak mendeteksi aliran baru ke Pronojiwo dalam 48 jam terakhir.",
  "nearest_fact": "PVMBG 08.20: Semeru tetap Level III. Tidak ada perintah evakuasi untuk wilayah ini."
}`}</code></pre>

          <h3 id="webhook">Webhook</h3>
          <p>Daftarkan URL HTTPS untuk menerima peristiwa berikut. Setiap kiriman ditandatangani dengan header <code>X-MS-Signature</code> (HMAC-SHA256).</p>
          <table>
            <thead><tr><th>Peristiwa</th><th>Kapan</th></tr></thead>
            <tbody>
              <tr><td><code>level.changed</code></td><td>PVMBG mengubah level gunung</td></tr>
              <tr><td><code>risk.threshold_crossed</code></td><td>Peluang eskalasi melewati 40% atau 60%</td></tr>
              <tr><td><code>corridor.status_changed</code></td><td>Koridor logistik berubah status (buka, abu, risiko lahar)</td></tr>
              <tr><td><code>price.anomaly</code></td><td>Barang ditandai di atas HET</td></tr>
            </tbody>
          </table>

          <h3 id="error">Error &amp; batas</h3>
          <table>
            <thead><tr><th>Kode</th><th>Arti</th></tr></thead>
            <tbody>
              <tr><td>400 <code>invalid_json</code></td><td>Body bukan JSON yang valid</td></tr>
              <tr><td>404 <code>not_found</code></td><td>Sumber daya tidak tersedia</td></tr>
              <tr><td>422 <code>invalid_text</code></td><td>Teks kosong atau lebih dari 2.000 karakter</td></tr>
              <tr><td>429 <code>rate_limited</code></td><td>Melewati batas: 60 permintaan/menit (publik), 600 (berbayar)</td></tr>
            </tbody>
          </table>

          <h2 id="changelog">Catatan rilis</h2>
          <ul>
            <li><strong>v1.0.0</strong>: rilis Android pertama (arm64 & armv7), web console dengan peta 3D, API publik v1.</li>
            <li><strong>v0.9</strong>: Indeks Prioritas Bantuan, pantau harga HET, siaran bertahap per kohort.</li>
            <li><strong>v0.8</strong>: filter sinyal dengan cek silang Sentinel-1 dan GFS.</li>
          </ul>
        </article>
      </div>
    </PageShell>
  );
}
