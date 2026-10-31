import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/pages/legal";

export const metadata: Metadata = { title: "Syarat & Ketentuan", description: "Syarat dan ketentuan penggunaan aplikasi, web console dan API MarketShield." };

const toc = [
  { id: "penerimaan", label: "Penerimaan" },
  { id: "definisi", label: "Definisi" },
  { id: "sifat", label: "Sifat layanan" },
  { id: "akun", label: "Akun & keamanan" },
  { id: "kewajiban", label: "Kewajiban pengguna" },
  { id: "konten", label: "Laporan & konten" },
  { id: "berbayar", label: "Paket berbayar" },
  { id: "api-ketentuan", label: "Penggunaan API" },
  { id: "hki", label: "Hak kekayaan intelektual" },
  { id: "pihak-ketiga", label: "Data pihak ketiga" },
  { id: "tanggung-jawab", label: "Batasan tanggung jawab" },
  { id: "keadaan-kahar", label: "Keadaan kahar" },
  { id: "pengakhiran", label: "Pengakhiran" },
  { id: "hukum", label: "Hukum & sengketa" },
  { id: "perubahan-syarat", label: "Perubahan" },
];

export default function TermsPage() {
  return (
    <LegalLayout title="Syarat & Ketentuan" kicker="Syarat" updated="31 Oktober 2026" toc={toc}>
      <h2 id="penerimaan">1. Penerimaan</h2>
      <p>Dengan mengunduh aplikasi, membuka situs, memakai web console, atau memanggil API MarketShield (&quot;Layanan&quot;), Anda menyetujui Syarat & Ketentuan ini dan <Link href="/privasi">Kebijakan Privasi</Link>. Jika Anda mewakili instansi atau perusahaan, Anda menyatakan berwenang mengikat instansi tersebut.</p>

      <h2 id="definisi">2. Definisi</h2>
      <ul>
        <li><strong>Level resmi</strong>: status aktivitas gunung api yang ditetapkan oleh PVMBG.</li>
        <li><strong>Prakiraan</strong>: peluang kenaikan level dan jendela aksi yang dihitung MarketShield dari data satelit.</li>
        <li><strong>Pengguna warga</strong>: individu yang memakai aplikasi tanpa biaya.</li>
        <li><strong>Pelanggan</strong>: instansi atau badan usaha dengan paket berbayar.</li>
      </ul>

      <h2 id="sifat">3. Sifat layanan</h2>
      <blockquote>MarketShield adalah alat bantu kesiapsiagaan. Layanan ini <strong>tidak menggantikan</strong> informasi resmi PVMBG, BMKG, BNPB, BPBD, atau perintah pemerintah setempat. Dalam keadaan darurat, selalu ikuti instruksi resmi dan hubungi 112.</blockquote>
      <p>Prakiraan bersifat probabilistik dan bergantung pada ketersediaan serta kualitas data satelit. Data dapat terlambat, tidak lengkap, atau tidak tersedia akibat cuaca, jadwal lintasan satelit, gangguan jaringan, atau sebab lain di luar kendali kami.</p>

      <h2 id="akun">4. Akun & keamanan</h2>
      <p>Pelanggan bertanggung jawab atas akun operator, kerahasiaan kata sandi dan kunci API, serta seluruh aktivitas yang terjadi melalui akun tersebut. Beri tahu kami segera jika terjadi akses tanpa izin.</p>

      <h2 id="kewajiban">5. Kewajiban pengguna</h2>
      <p>Anda setuju untuk tidak:</p>
      <ul>
        <li>mengirim laporan, foto, atau harga yang diketahui palsu atau menyesatkan;</li>
        <li>menyalahgunakan tombol SOS atau fitur siaran;</li>
        <li>menyebarkan informasi dari Layanan dengan mengubah isinya sehingga menimbulkan kepanikan;</li>
        <li>mengakses Layanan dengan cara otomatis di luar API resmi, atau mencoba menembus keamanan sistem;</li>
        <li>memakai Layanan untuk penimbunan barang atau praktik yang merugikan warga terdampak.</li>
      </ul>

      <h2 id="konten">6. Laporan & konten</h2>
      <p>Anda tetap memiliki laporan dan foto yang Anda kirim. Anda memberi kami lisensi non-eksklusif dan bebas royalti untuk memakai, menganonimkan, dan menampilkan konten tersebut sejauh diperlukan untuk menjalankan Layanan, termasuk verifikasi informasi dan pemantauan harga.</p>

      <h2 id="berbayar">7. Paket berbayar</h2>
      <ul>
        <li>Harga tercantum di halaman <Link href="/harga">Harga</Link>, dalam Rupiah dan belum termasuk PPN.</li>
        <li>Paket bulanan ditagih di muka dan diperpanjang otomatis hingga dihentikan. Paket tahunan berlaku sesuai masa kontrak.</li>
        <li>Untuk instansi pemerintah, ketentuan pengadaan, termin pembayaran, dan SLA mengikuti kontrak atau perjanjian kerja sama yang ditandatangani.</li>
        <li>Keterlambatan pembayaran lebih dari 30 hari dapat menyebabkan penangguhan fitur berbayar. Fitur keselamatan untuk warga tidak pernah ditangguhkan.</li>
      </ul>

      <h2 id="api-ketentuan">8. Penggunaan API</h2>
      <p>API tunduk pada batas permintaan yang dijelaskan di <Link href="/docs#error">dokumentasi</Link>. Data yang ditampilkan ulang dari API harus menyebut MarketShield dan sumber satelit asli, serta tidak boleh disajikan seolah-olah sebagai level resmi PVMBG.</p>

      <h2 id="hki">9. Hak kekayaan intelektual</h2>
      <p>Perangkat lunak, model, desain, merek, dan dokumentasi MarketShield adalah milik kami atau pemberi lisensi kami. Anda tidak boleh menyalin, merekayasa balik, atau menjual kembali Layanan kecuali diizinkan secara tertulis.</p>

      <h2 id="pihak-ketiga">10. Data & aset pihak ketiga</h2>
      <p>Layanan memakai data Copernicus Sentinel (Uni Eropa/ESA), NASA (FIRMS, MODIS, GPM), NOAA (GFS), WorldPop, dan Natural Earth melalui Google Earth Engine, masing-masing tunduk pada lisensinya. Model 3D di situs berasal dari NVIDIA SimReady Assets dengan lisensi CC BY 4.0.</p>

      <h2 id="tanggung-jawab">11. Batasan tanggung jawab</h2>
      <p>Sejauh diizinkan oleh hukum yang berlaku, Layanan disediakan &quot;sebagaimana adanya&quot;. Kami tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial yang timbul dari keputusan yang diambil semata-mata berdasarkan prakiraan. Untuk pelanggan, total tanggung jawab kami dibatasi pada biaya yang dibayarkan dalam 12 bulan terakhir. Batasan ini tidak berlaku untuk kerugian yang timbul dari kesengajaan atau kelalaian berat kami.</p>

      <h2 id="keadaan-kahar">12. Keadaan kahar</h2>
      <p>Kami tidak bertanggung jawab atas kegagalan atau keterlambatan yang disebabkan oleh keadaan di luar kendali wajar, termasuk bencana alam, gangguan jaringan atau listrik berskala luas, kegagalan penyedia data satelit, atau tindakan pemerintah.</p>

      <h2 id="pengakhiran">13. Pengakhiran</h2>
      <p>Anda dapat berhenti memakai Layanan kapan saja. Kami dapat menangguhkan akun yang melanggar ketentuan ini, terutama penyalahgunaan SOS, siaran, atau laporan palsu. Setelah pengakhiran, pelanggan dapat mengekspor data selama 30 hari.</p>

      <h2 id="hukum">14. Hukum & sengketa</h2>
      <p>Ketentuan ini diatur oleh hukum Negara Republik Indonesia dan dibuat dalam Bahasa Indonesia. Sengketa diselesaikan terlebih dahulu secara musyawarah dalam 30 hari. Jika tidak tercapai kesepakatan, sengketa diselesaikan melalui pengadilan negeri yang berwenang di Indonesia.</p>

      <h2 id="perubahan-syarat">15. Perubahan</h2>
      <p>Kami dapat memperbarui ketentuan ini. Perubahan material diumumkan minimal 14 hari sebelum berlaku. Pertanyaan dapat diajukan melalui <Link href="/bantuan#kontak">formulir kontak</Link>.</p>
    </LegalLayout>
  );
}
