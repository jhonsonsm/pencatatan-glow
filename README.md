# RapiUsaha — Asisten Keuangan UMKM (Frontend Demo v0.1)

Aplikasi prototipe frontend interaktif untuk **RapiUsaha**, solusi asisten pembukuan dan pemantauan kesehatan kas untuk pelaku UMKM di Indonesia.

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js (v18 ke atas) & npm

### Menjalankan Server Preview (Disarankan untuk Demo)
Aplikasi sudah ter-build di folder `dist/`. Jalankan perintah berikut:
```bash
npm run preview
```
Buka browser di: **http://localhost:4173** (atau port yang tertera di terminal).

### Menjalankan Mode Development
```bash
npm run dev
```
Buka browser di: **http://localhost:5173**

---

## 🎯 Fitur yang Didemokan

1. **Dashboard Kesehatan Kas**:
   - Pemisahan **Kas Siap Pakai (Operasional)** vs **Kas Dingin (Tabungan)**.
   - **Barometer Ketahanan Kas (Runway Hari)** dinamis: Mengetahui berapa hari operasional warung bertahan.
   - Grafik tren arus kas 7 hari terakhir (Pemasukan hijau vs Pengeluaran merah).
   - Widget **Bon Pelanggan** dengan simulasi pengingat via WhatsApp dan penandaan lunas.

2. **Smart Input Transaksi**:
   - **Input Manual**: Form cepat untuk Uang Masuk, Uang Keluar, Prive, dan Bon.
   - **Simulasi Scan Nota (OCR)**: 3 contoh preset nota UMKM dengan animasi visual laser scanning yang langsung mengisi form.
   - **Simulasi Rekam Suara**: 3 contoh suara pemilik warung dengan animasi visual gelombang suara.

3. **Reaktivitas Finansial**:
   - Setiap transaksi yang ditambah atau dihapus **langsung memperbarui seluruh angka dashboard, runway hari, laporan breakdown, dan konteks bot asisten** secara konsisten.
   - Hapus transaksi dan ekspor data ke CSV.

4. **Asisten Keuangan Pintar (Deterministik)**:
   - Evaluasi kelayakan penarikan prive (ambil uang pribadi) secara live berdasarkan saldo kas aktif.
   - Menjawab pertanyaan seputar pemasukan, pengeluaran, runway, dan kategori belanja terbesar.

5. **Manajemen Sesi Demo**:
   - **Persona Switcher**: Beralih profil usaha antara **Warung Makan Bu Siti** dan **Kopi & Toast Mas Budi**.
   - **Reset Data Demo**: 1 tombol di sidebar atau halaman profil untuk mengembalikan seluruh data ke kondisi awal.

---

## ⚠️ Batasan Demo (Scope Guard)
- **Tanpa Backend/Database**: Berjalan mandiri di browser menggunakan `localStorage` untuk persistensi sesi presentasi.
- **Bukan Akuntansi Resmi**: Angka dan kalkulasi difokuskan pada pemisahan kas harian UMKM, bukan jurnal buku besar double-entry.
- **Pajak Belum Dihitung**: Fitur pajak berstatus terencana karena memerlukan izin dan data resmi wajib pajak.
