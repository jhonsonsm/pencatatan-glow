# RapiUsaha — Asisten Keuangan UMKM (Full App)

Aplikasi asisten keuangan, pembukuan kas harian, dan kesehatan finansial cerdas yang dirancang khusus untuk pelaku UMKM di Indonesia.

---

## 🚀 Fitur Utama

1. **Manajemen Kas & Pemisahan Prive**:
   - Pemisahan **Kas Siap Pakai (Operasional)** vs **Kas Dingin (Tabungan Terkunci)**.
   - **Pencatatan Prive (Ambil Pribadi)** terpisah dari biaya operasional agar keuntungan bersih warung tidak bias.
   - **Barometer Ketahanan Kas (Runway)** dinamis: Mengetahui berapa hari operasional bertahan berdasarkan rata-rata pengeluaran.
   - **Catatan Bon Pelanggan**: Daftar piutang dengan simulasi pesan penagihan sopan via WhatsApp.

2. **Smart Input dengan AI Vision & Suara**:
   - **Scan Nota (AI Vision OCR)**: Upload foto struk/nota belanja warung, AI otomatis mengekstrak nama toko, barang, nominal rupiah, dan kategori.
   - **Input Suara (Voice AI)**: Rekam ucapan kasir/pemilik lewat mikrofon (Web Speech API bahasa Indonesia), AI otomatis mengubahnya menjadi transaksi terstruktur.
   - **Input Manual Cepat**: Lengkap dengan validasi nominal dan kategori.

3. **Database Nyata & Asisten Finansial**:
   - **SQLite Database**: Seluruh mutasi tersimpan permanen di laptop secara lokal (`rapiusaha.db`).
   - **Asisten AI Terintegrasi**: Chatbot cerdas yang terhubung langsung ke saldo kas dan riwayat transaksi untuk memberikan rekomendasi finansial.

---

## 🛠️ Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js (v18 ke atas)

### 1. Cara Cepat (1-Klik di Windows)
Cukup double-click file:
```bash
1-KLIK_BUKA_APLIKASI.bat
```
Server backend (port 3001) dan frontend (port 4173) akan otomatis menyala dan membuka browser di `http://localhost:4173`.

### 2. Cara Manual
**Nyalakan Backend (Database & AI):**
```bash
node server/index.mjs
```

**Nyalakan Frontend:**
```bash
npm run preview
# atau untuk mode development:
npm run dev
```
Buka browser di: `http://localhost:4173`

---

## 📂 Struktur Repositori

```
rapiusaha/
├── server/             # Backend API Express, SQLite (db.mjs) & AI integration (ai.mjs)
├── src/                # Frontend React, TypeScript & CSS design system
│   ├── components/     # UI screens (Dashboard, Transactions, Reports, Assistant, Modal)
│   ├── api.ts          # Integrasi API client ke backend
│   └── utils/          # Perhitungan keuangan & ekspor CSV
├── docs/               # Dokumentasi keputusan arsitektur (DEMO_DECISIONS.md)
├── 1-KLIK_BUKA_APLIKASI.bat # Script launcher 1-klik Windows
└── rapiusaha.db        # Database SQLite lokal (dibuat otomatis saat server start)
```

Dibuat oleh [Jhonson](https://github.com/jhonsonsm).
