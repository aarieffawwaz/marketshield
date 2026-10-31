import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/pages/legal";

export const metadata: Metadata = { title: "Kebijakan Privasi", description: "Bagaimana MarketShield mengumpulkan, memakai, menyimpan dan melindungi data pribadi sesuai UU No. 27 Tahun 2022." };

const toc = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "pengendali", label: "Pengendali data" },
  { id: "data", label: "Data yang kami kumpulkan" },
  { id: "tujuan", label: "Tujuan & dasar pemrosesan" },
  { id: "lokasi", label: "Data lokasi" },
  { id: "berbagi", label: "Berbagi data" },
  { id: "transfer", label: "Transfer ke luar negeri" },
  { id: "retensi", label: "Masa simpan" },
  { id: "keamanan", label: "Keamanan" },
  { id: "hak", label: "Hak Anda" },
  { id: "anak", label: "Data anak" },
  { id: "cookie", label: "Cookie & penyimpanan lokal" },
  { id: "perubahan", label: "Perubahan kebijakan" },
  { id: "kontak-privasi", label: "Kontak" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" kicker="Privasi" updated="31 Oktober 2026" toc={toc}>
      <h2 id="ringkasan">Ringkasan</h2>
      <ul>
        <li>Kami hanya mengumpulkan data yang diperlukan untuk memberi peringatan dan rekomendasi yang relevan.</li>
        <li>Kami tidak menjual data pribadi dan tidak menampilkan iklan.</li>
        <li>Petugas BPBD dan posko melihat data agregat per desa secara bawaan; data individu hanya terlihat saat Anda mengirim SOS atau laporan.</li>
        <li>Anda dapat mengakses, memperbaiki, mengekspor atau menghapus data Anda kapan saja.</li>
      </ul>

      <h2 id="pengendali">Pengendali data</h2>
      <p>Kebijakan ini berlaku untuk aplikasi Android MarketShield, situs <code>marketshield-inception.vercel.app</code>, web console, dan API (bersama-sama disebut &quot;Layanan&quot;). Pengendali data pribadi adalah MarketShield yang dikembangkan oleh Tim BRAIN – Ayam Jago (&quot;kami&quot;). Untuk paket instansi, pemerintah daerah atau organisasi pelanggan dapat bertindak sebagai pengendali atas data yang mereka masukkan, dan kami sebagai prosesor sesuai perjanjian kerja sama.</p>
      <p>Kebijakan ini disusun dengan mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (&quot;UU PDP&quot;) dan Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik.</p>

      <h2 id="data">Data yang kami kumpulkan</h2>
      <table>
        <thead><tr><th>Kategori</th><th>Contoh</th><th>Sumber</th></tr></thead>
        <tbody>
          <tr><td>Profil</td><td>Bahasa, peran (warga, petani, pariwisata, logistik, apotek), desa/kecamatan</td><td>Anda</td></tr>
          <tr><td>Rumah tangga</td><td>Jumlah anggota, anggota rentan (lansia, balita, disabilitas, penyakit kronis)</td><td>Anda, opsional</td></tr>
          <tr><td>Lokasi</td><td>Lokasi perangkat saat aplikasi dipakai, lokasi saat SOS</td><td>Perangkat, dengan izin</td></tr>
          <tr><td>Laporan</td><td>Pesan yang Anda cek, laporan harga, foto outlet, laporan lapangan</td><td>Anda</td></tr>
          <tr><td>Kontak darurat</td><td>Nama dan nomor yang Anda tambahkan</td><td>Anda</td></tr>
          <tr><td>Akun instansi</td><td>Nama, email kerja, jabatan, log aktivitas console</td><td>Instansi Anda</td></tr>
          <tr><td>Teknis</td><td>Model perangkat, versi aplikasi, log galat</td><td>Perangkat</td></tr>
        </tbody>
      </table>
      <p>Informasi tentang anggota rentan dan kondisi kesehatan dapat termasuk <strong>data pribadi yang bersifat spesifik</strong> menurut UU PDP. Kami hanya memprosesnya dengan persetujuan eksplisit Anda dan hanya untuk menyesuaikan kit serta prioritas evakuasi.</p>

      <h2 id="tujuan">Tujuan & dasar pemrosesan</h2>
      <table>
        <thead><tr><th>Tujuan</th><th>Dasar pemrosesan</th></tr></thead>
        <tbody>
          <tr><td>Mengirim peringatan sesuai lokasi dan level gunung</td><td>Persetujuan; kepentingan vital</td></tr>
          <tr><td>Rekomendasi Kit Siaga dan rute evakuasi</td><td>Persetujuan</td></tr>
          <tr><td>Meneruskan SOS ke kontak darurat dan BPBD</td><td>Kepentingan vital subjek data</td></tr>
          <tr><td>Menyusun Indeks Prioritas Bantuan (data agregat)</td><td>Pelaksanaan tugas pelayanan publik oleh instansi pelanggan</td></tr>
          <tr><td>Penagihan paket berbayar</td><td>Pelaksanaan perjanjian; kewajiban hukum perpajakan</td></tr>
          <tr><td>Keamanan dan pencegahan penyalahgunaan</td><td>Kepentingan yang sah</td></tr>
        </tbody>
      </table>

      <h2 id="lokasi">Data lokasi</h2>
      <p>Lokasi dipakai untuk memilih gunung terdekat, menghitung jarak ke zona bahaya dan shelter, dan menentukan wilayah siaran. Anda dapat mematikan izin lokasi dan memilih kecamatan secara manual. Riwayat lokasi rinci tidak disimpan di server; yang disimpan adalah desa/kecamatan terakhir, kecuali saat Anda mengirim SOS.</p>

      <h2 id="berbagi">Berbagi data</h2>
      <ul>
        <li><strong>BPBD dan posko:</strong> data agregat per desa; data individu hanya dari SOS dan laporan yang Anda kirim.</li>
        <li><strong>Kontak darurat:</strong> lokasi dan jumlah anggota rumah tangga saat SOS.</li>
        <li><strong>Penyedia infrastruktur:</strong> hosting, basis data dan pengiriman notifikasi, terikat perjanjian pemrosesan data.</li>
        <li><strong>Aparat berwenang:</strong> jika diwajibkan oleh peraturan perundang-undangan.</li>
      </ul>
      <p>Data satelit yang kami tampilkan berasal dari katalog publik (Copernicus, NASA, NOAA, WorldPop) dan tidak berisi data pribadi.</p>

      <h2 id="transfer">Transfer ke luar negeri</h2>
      <p>Sebagian penyedia infrastruktur kami dapat memproses data di luar wilayah Indonesia. Transfer dilakukan hanya ke penyedia dengan tingkat pelindungan data yang setara atau lebih tinggi, atau dengan perlindungan kontraktual yang memadai, sesuai Pasal 56 UU PDP.</p>

      <h2 id="retensi">Masa simpan</h2>
      <table>
        <thead><tr><th>Data</th><th>Masa simpan</th></tr></thead>
        <tbody>
          <tr><td>Profil dan rumah tangga</td><td>Selama akun aktif; dihapus 30 hari setelah permintaan penghapusan</td></tr>
          <tr><td>Data SOS</td><td>90 hari setelah status gunung kembali Normal, untuk evaluasi penanganan</td></tr>
          <tr><td>Pesan yang dicek</td><td>Teks dianonimkan setelah 30 hari</td></tr>
          <tr><td>Data tagihan</td><td>10 tahun, sesuai kewajiban perpajakan</td></tr>
          <tr><td>Log console instansi</td><td>1 tahun</td></tr>
        </tbody>
      </table>

      <h2 id="keamanan">Keamanan</h2>
      <p>Data dienkripsi saat dikirim (TLS) dan saat disimpan. Akses petugas dibatasi sesuai peran dan dicatat dalam log audit. Jika terjadi kegagalan pelindungan data pribadi, kami akan memberi tahu Anda dan lembaga yang berwenang paling lambat 3 × 24 jam sesuai Pasal 46 UU PDP.</p>

      <h2 id="hak">Hak Anda</h2>
      <p>Sesuai UU PDP, Anda berhak:</p>
      <ul>
        <li>mendapatkan informasi tentang tujuan dan dasar pemrosesan data Anda;</li>
        <li>mengakses dan memperoleh salinan data Anda;</li>
        <li>memperbaiki data yang tidak akurat;</li>
        <li>mengakhiri pemrosesan, menghapus, atau memusnahkan data Anda;</li>
        <li>menarik kembali persetujuan;</li>
        <li>mengajukan keberatan atas keputusan yang semata-mata didasarkan pada pemrosesan otomatis;</li>
        <li>menunda atau membatasi pemrosesan;</li>
        <li>mendapatkan dan menggunakan data Anda dalam format yang umum dipakai (portabilitas);</li>
        <li>menggugat dan menerima ganti rugi atas pelanggaran pemrosesan data Anda.</li>
      </ul>
      <p>Sebagian hak dapat dijalankan langsung dari menu Profil → Privasi. Permintaan lain dapat diajukan melalui <Link href="/bantuan#kontak">formulir kontak</Link> dengan topik &quot;Permintaan data pribadi&quot;. Kami menanggapi paling lambat 3 × 24 jam sejak permintaan diterima, sesuai jangka waktu dalam UU PDP.</p>

      <h2 id="anak">Data anak</h2>
      <p>Layanan ditujukan untuk pengguna berusia 18 tahun ke atas. Data anak, misalnya keberadaan balita dalam rumah tangga, hanya dicatat oleh orang tua atau wali dan dalam bentuk jumlah, bukan identitas.</p>

      <h2 id="cookie">Cookie & penyimpanan lokal</h2>
      <p>Situs dan console tidak memakai cookie iklan atau pelacak pihak ketiga. Kami menyimpan preferensi bahasa dan level tampilan di penyimpanan lokal browser (<code>localStorage</code>) agar pilihan Anda tetap sama saat kembali. Anda dapat menghapusnya kapan saja dari pengaturan browser.</p>

      <h2 id="perubahan">Perubahan kebijakan</h2>
      <p>Jika kami mengubah kebijakan ini secara material, kami akan memberi tahu melalui aplikasi atau email setidaknya 14 hari sebelum perubahan berlaku. Tanggal berlaku tercantum di bagian atas halaman.</p>

      <h2 id="kontak-privasi">Kontak</h2>
      <p>Pertanyaan tentang kebijakan ini dapat diajukan melalui <Link href="/bantuan#kontak">formulir kontak</Link>. Jika Anda merasa hak Anda tidak dipenuhi, Anda dapat menyampaikan pengaduan kepada lembaga penyelenggara pelindungan data pribadi sesuai UU PDP.</p>
    </LegalLayout>
  );
}
