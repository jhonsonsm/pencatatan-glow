export type TransactionType = 'income' | 'expense' | 'prive' | 'bon';

export interface Transaction {
  id: number;
  name: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: 'confirmed' | 'pending';
  note?: string;
  customerName?: string; // Khusus bon
  isPaid?: boolean;      // Status bon lunas
}

export interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  initialOperatingCash: number; // Kas Siap Pakai
  savingsCash: number;          // Kas Dingin / Tabungan
  dailyBurnRateTarget: number;  // Estimasi pengeluaran operasional per hari
}

export interface FinancialSummary {
  income: number;
  expense: number;
  prive: number;
  unpaidBon: number;
  netOperating: number;         // Pemasukan - Pengeluaran - Prive
  operatingBalance: number;     // Kas Siap Pakai Saat Ini
  savingsBalance: number;       // Kas Dingin
  runwayDays: number;           // Berapa hari kas operasional bertahan
  runwayStatus: 'aman' | 'waspada' | 'kritis';
  count: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  actionableHint?: string;
}
