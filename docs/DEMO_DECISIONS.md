# Keputusan Desain & Arsitektur Frontend Demo RapiUsaha v0.1

Dokumen ini mencatat asumsi, keputusan teknis, dan trade-off yang diambil saat membangun prototipe interaktif RapiUsaha sesuai panduan `AI_Coding_Handoff_RapiUsaha_DEMO_v0.1.md`.

---

## 1. Stack Teknologi
- **Framework**: React 19 + TypeScript + Vite.
  - *Alasan*: Menghasilkan bundle ringan (~300 kB), performa responsif, dan struktur kode modular yang mudah diadopsi oleh tim backend pada fase produksi berikutnya.
- **Ikonografi**: `lucide-react` (ringan, konsisten, dan memiliki visual modern).
- **Styling**: Custom CSS Design Tokens yang diturunkan langsung dari identitas visual wireframe RapiUsaha (`--nav: #152e39`, `--teal: #147d72`, `--mint: #c9efe4`, `--green: #15785e`, `--red: #c65353`, `--amber: #a66b19`).

---

## 2. Manajemen State & Reaktivitas Finansial
- **Single Source of Truth**: Seluruh ringkasan dashboard, barometer runway, breakdown laporan, dan jawaban bot asisten dihitung secara reaktif langsung dari satu array `transactions`.
- **Penyimpanan Lokal (`localStorage`)**:
  - Menggunakan browser `localStorage` agar data simulasi tidak hilang saat pengguna me-refresh halaman atau berpindah tab saat presentasi.
  - Disediakan tombol **"Reset Data Demo"** untuk mengembalikan dataset ke seed awal dalam 1 klik.
  - Sesuai batasan keamanan, `localStorage` hanya diperuntukkan bagi data simulasi prototipe.

---

## 3. Fitur Utama yang Diimplementasikan
1. **Pemisahan Kas Operasional vs Kas Dingin**:
   - *Kas Siap Pakai (Operasional)*: Modal belanja harian warung.
   - *Kas Dingin (Tabungan Usaha)*: Simpanan darurat yang tidak boleh terpakai untuk belanja harian.
2. **Barometer Ketahanan Kas (Runway)**:
   - Dihitung dari: `Sisa Kas Operasional / Estimasi Pengeluaran Harian`.
   - Menghasilkan status: **Aman (> 14 hari)**, **Waspada (7 - 14 hari)**, atau **Kritis (< 7 hari)**.
3. **Pencatatan Prive (Ambil Pribadi)**:
   - Pengambilan uang warung untuk belanja dapur/sekolah dicatat khusus sebagai *Prive* (bukan beban operasional usaha) agar margin keuntungan tidak terdistorsi.
4. **Catatan Bon / Piutang Pelanggan**:
   - Widget daftar pelanggan yang berhutang bon makan/katering dengan tombol simulasi **"Colek WA"** dan **"Tandai Lunas"**.
5. **Smart Input Transaksi**:
   - Input Manual cepat.
   - **Simulasi Scan Nota (OCR)** dengan 3 preset struk UMKM riil (Nota Pasar Sayur, Struk Toko Grosir, Struk Toko Kemasan) disertai animasi visual laser scan.
   - **Simulasi Rekam Suara** dengan 3 preset audio percakapan UMKM dan animasi visual gelombang suara.
6. **Asisten Keuangan Deterministik**:
   - Tidak memanggil API LLM eksternal berbayar/lambat. Respons dihitung live dari saldo kas operasional saat ini (misal: evaluasi apakah aman mengambil prive Rp 300.000).
7. **Persona Switcher**:
   - Toggle instan antara profil **Warung Makan Bu Siti** dan **Kopi & Toast Mas Budi** untuk fleksibilitas demo.
8. **Ekspor CSV**:
   - Fitur 1-klik untuk mengunduh seluruh transaksi aktif ke file format CSV spreadsheet.

---

## 4. Batasan Ruang Lingkup (Scope Guard)
- Tidak terhubung ke basis data eksternal (Supabase, PostgreSQL, Prisma, atau Firebase).
- Tidak menggunakan autentikasi login sungguhan.
- Simulasi pajak dinonaktifkan dengan edukasi transparan bahwa perhitungan pajak resmi membutuhkan NPWP, status PKP, dan klasifikasi PP 55/2022.
- Semua kalkulasi frontend dirancang untuk simulasi keputusan harian UMKM, bukan jurnal akuntansi double-entry audit resmi.
