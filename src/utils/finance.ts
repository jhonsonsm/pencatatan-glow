import type { BusinessProfile, FinancialSummary, Transaction } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  })
    .format(amount)
    .replace('IDR', 'Rp')
    .replace(/\u00a0/g, ' ');
};

export const formatDate = (dateStr: string): string => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateStr + 'T12:00:00'));
  } catch {
    return dateStr;
  }
};

export const calculateSummary = (
  transactions: Transaction[],
  profile: BusinessProfile
): FinancialSummary => {
  let income = 0;
  let expense = 0;
  let prive = 0;
  let unpaidBon = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      income += tx.amount;
    } else if (tx.type === 'expense') {
      expense += tx.amount;
    } else if (tx.type === 'prive') {
      prive += tx.amount;
    } else if (tx.type === 'bon' && !tx.isPaid) {
      unpaidBon += tx.amount;
    }
  });

  const netOperating = income - expense - prive;
  const operatingBalance = Math.max(0, profile.initialOperatingCash + netOperating);
  const savingsBalance = profile.savingsCash;

  // Hitung burn rate harian rata-rata dari data atau target profile
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const avgExpense = expenseTransactions.length > 0 
    ? Math.round(expense / Math.max(1, new Set(transactions.map((t) => t.date)).size))
    : profile.dailyBurnRateTarget;
  
  const dailyBurn = Math.max(50000, avgExpense || profile.dailyBurnRateTarget);
  const runwayDays = Math.max(0, Math.round(operatingBalance / dailyBurn));

  let runwayStatus: 'aman' | 'waspada' | 'kritis' = 'aman';
  if (runwayDays < 7) {
    runwayStatus = 'kritis';
  } else if (runwayDays < 14) {
    runwayStatus = 'waspada';
  }

  return {
    income,
    expense,
    prive,
    unpaidBon,
    netOperating,
    operatingBalance,
    savingsBalance,
    runwayDays,
    runwayStatus,
    count: transactions.length
  };
};

export const getCategoryBreakdown = (transactions: Transaction[]) => {
  const categories: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' || t.type === 'prive')
    .forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, curr) => acc + curr[1], 0);
  const max = entries.length ? entries[0][1] : 1;

  return entries.map(([name, amount]) => ({
    name,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    barWidth: Math.max(6, Math.round((amount / max) * 100))
  }));
};

export const get7DaysCashflow = (transactions: Transaction[]) => {
  const days: { date: string; label: string; income: number; expense: number }[] = [];
  const today = new Date('2026-10-21T12:00:00');

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d);

    const dayTxs = transactions.filter((t) => t.date === dateStr);
    const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const dayExpense = dayTxs.filter((t) => t.type === 'expense' || t.type === 'prive').reduce((s, t) => s + t.amount, 0);

    days.push({
      date: dateStr,
      label,
      income: dayIncome,
      expense: dayExpense
    });
  }

  const maxVal = Math.max(100000, ...days.map((d) => Math.max(d.income, d.expense)));

  return days.map((d) => ({
    ...d,
    incomeHeight: Math.max(4, Math.round((d.income / maxVal) * 100)),
    expenseHeight: Math.max(4, Math.round((d.expense / maxVal) * 100))
  }));
};

export const exportTransactionsToCsv = (transactions: Transaction[]) => {
  const rows = [
    ['ID', 'Tanggal', 'Nama Transaksi', 'Jenis', 'Kategori', 'Nominal (IDR)', 'Status', 'Catatan', 'Keterangan Bon'],
    ...transactions.map((t) => [
      t.id,
      t.date,
      t.name,
      t.type === 'income' ? 'Pemasukan' : (t.type === 'expense' ? 'Pengeluaran' : (t.type === 'prive' ? 'Prive (Pribadi)' : 'Bon Piutang')),
      t.category,
      t.amount,
      t.status === 'confirmed' ? 'Tercatat' : 'Perlu Diperiksa',
      t.note || '',
      t.customerName ? `Pelanggan: ${t.customerName} (${t.isPaid ? 'LUNAS' : 'BELUM LUNAS'})` : ''
    ])
  ];

  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `RapiUsaha_Transaksi_Demo_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
