import type { BusinessProfile, Transaction } from '../types';

export const BUSINESS_PROFILES: Record<string, BusinessProfile> = {
  warung_siti: {
    id: 'warung_siti',
    name: 'Warung Makan Bu Siti',
    ownerName: 'Siti Rahmawati',
    category: 'Kuliner & Warung Makan',
    initialOperatingCash: 2500000, // Rp 2.500.000
    savingsCash: 5000000,          // Rp 5.000.000
    dailyBurnRateTarget: 180000,   // Rata-rata pengeluaran operasional per hari
  },
  kopi_budi: {
    id: 'kopi_budi',
    name: 'Kopi & Toast Mas Budi',
    ownerName: 'Budi Santoso',
    category: 'Coffee Shop & Jajanan',
    initialOperatingCash: 3800000,
    savingsCash: 7500000,
    dailyBurnRateTarget: 250000,
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    name: 'Penjualan makan siang tunai',
    category: 'Penjualan',
    type: 'income',
    amount: 850000,
    date: '2026-10-21',
    status: 'confirmed',
    note: 'Ramai pesanan ayam bakar jam 12-14'
  },
  {
    id: 2,
    name: 'Penerimaan QRIS harian',
    category: 'Penjualan',
    type: 'income',
    amount: 1200000,
    date: '2026-10-20',
    status: 'confirmed',
    note: 'Settlement QRIS masuk ke rekening usaha'
  },
  {
    id: 3,
    name: 'Belanja sayur & bumbu pasar',
    category: 'Bahan baku',
    type: 'expense',
    amount: 320000,
    date: '2026-10-20',
    status: 'confirmed',
    note: 'Ayam 5kg, cabai, bawang merah, tempe'
  },
  {
    id: 4,
    name: 'Token listrik dapur warung',
    category: 'Operasional',
    type: 'expense',
    amount: 100000,
    date: '2026-10-19',
    status: 'confirmed',
    note: 'Beli token 100rb PLN'
  },
  {
    id: 5,
    name: 'Ambil pribadi (Uang SPP anak)',
    category: 'Pribadi / Prive',
    type: 'prive',
    amount: 250000,
    date: '2026-10-19',
    status: 'confirmed',
    note: 'Pemisahan kas: dicatat sebagai prive bukan biaya usaha'
  },
  {
    id: 6,
    name: 'Kemasan kotak & plastik mika',
    category: 'Kemasan',
    type: 'expense',
    amount: 120000,
    date: '2026-10-18',
    status: 'pending',
    note: 'Nota toko plastik belum dicap'
  },
  {
    id: 7,
    name: 'Bensin & parkir belanja',
    category: 'Transportasi',
    type: 'expense',
    amount: 50000,
    date: '2026-10-17',
    status: 'confirmed',
    note: 'Bensin motor operasional'
  },
  {
    id: 8,
    name: 'Pak RT Bambang (Katering Arisan)',
    category: 'Bon Pelanggan',
    type: 'bon',
    amount: 350000,
    date: '2026-10-18',
    status: 'pending',
    note: 'Janji bayar akhir pekan ini',
    customerName: 'Pak RT Bambang',
    isPaid: false
  },
  {
    id: 9,
    name: 'Mbak Dewi Laundry (Makan Karyawan)',
    category: 'Bon Pelanggan',
    type: 'bon',
    amount: 180000,
    date: '2026-10-16',
    status: 'pending',
    note: 'Total 6 porsi makan siang',
    customerName: 'Mbak Dewi',
    isPaid: false
  }
];

export const CATEGORIES_BY_TYPE = {
  income: ['Penjualan', 'Pendapatan Jasa', 'Pendapatan Lain'],
  expense: ['Bahan baku', 'Operasional', 'Kemasan', 'Transportasi', 'Peralatan', 'Lainnya'],
  prive: ['Pribadi / Prive', 'Kebutuhan Rumah Tangga', 'Sekolah / Anak'],
  bon: ['Bon Pelanggan', 'Piutang Konsinyasi']
};

export const PRESET_RECEIPTS = [
  {
    id: 'receipt-1',
    title: 'Nota Pasar Tradisional',
    store: 'Pasar Anyar - Kios Sayur Berkah',
    date: '2026-10-21',
    amount: 185000,
    category: 'Bahan baku',
    type: 'expense' as const,
    note: 'Beli cabai rawit, wortel, daun bawang, dan bumbu halus',
    items: ['Cabai Rawit 1kg - Rp 45.000', 'Bawang Merah 2kg - Rp 60.000', 'Sayur Mayur - Rp 80.000']
  },
  {
    id: 'receipt-2',
    title: 'Struk Toko Grosir Sembako',
    store: 'Toko Sumber Rejeki',
    date: '2026-10-20',
    amount: 420000,
    category: 'Bahan baku',
    type: 'expense' as const,
    note: 'Beras 25kg, minyak goreng 4L, gula pasir 5kg',
    items: ['Beras Ramos 25kg - Rp 310.000', 'Minyak Goreng 4L - Rp 70.000', 'Gula Pasir 5kg - Rp 40.000']
  },
  {
    id: 'receipt-3',
    title: 'Struk Toko Plastik & Kemasan',
    store: 'Plastik Maju Jaya',
    date: '2026-10-19',
    amount: 95000,
    category: 'Kemasan',
    type: 'expense' as const,
    note: 'Kotak bento 100 pcs dan kantong kresek ramah lingkungan',
    items: ['Kotak Bento 100pcs - Rp 65.000', 'Plastik Kresek 3 pack - Rp 30.000']
  }
];

export const PRESET_VOICES = [
  {
    id: 'voice-1',
    transcript: 'Masuk lima ratus ribu rupiah dari pesanan katering arisan ibu PKK tadi siang tunai.',
    name: 'Pesanan katering arisan PKK',
    amount: 500000,
    category: 'Penjualan',
    type: 'income' as const,
    note: 'Input via simulasi suara'
  },
  {
    id: 'voice-2',
    transcript: 'Keluar tujuh puluh lima ribu buat beli bumbu dapur tambahan di warung sebelah.',
    name: 'Beli bumbu dapur tambahan',
    amount: 75000,
    category: 'Bahan baku',
    type: 'expense' as const,
    note: 'Input via simulasi suara'
  },
  {
    id: 'voice-3',
    transcript: 'Ambil uang kas warung tiga ratus ribu buat beli buku sekolah adek.',
    name: 'Ambil pribadi (Buku sekolah adek)',
    amount: 300000,
    category: 'Pribadi / Prive',
    type: 'prive' as const,
    note: 'Prive tercatat via suara'
  }
];
