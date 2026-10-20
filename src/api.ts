import type { BusinessProfile, Transaction } from './types';

const API_BASE = '/api';

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchProfileApi(profileId: string = 'warung_siti'): Promise<BusinessProfile> {
  const res = await fetch(`${API_BASE}/profiles/${profileId}`);
  if (!res.ok) throw new Error('Gagal mengambil profil usaha');
  const raw = await res.json();
  return {
    id: raw.id,
    name: raw.name,
    ownerName: raw.owner_name,
    category: raw.category,
    initialOperatingCash: raw.initial_operating_cash,
    savingsCash: raw.savings_cash,
    dailyBurnRateTarget: raw.daily_burn_rate_target
  };
}

export async function fetchTransactionsApi(profileId: string = 'warung_siti'): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions?profileId=${profileId}`);
  if (!res.ok) throw new Error('Gagal mengambil transaksi dari server');
  const list = await res.json();
  return list.map((t: any) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    type: t.type,
    amount: t.amount,
    date: t.date,
    status: t.status,
    note: t.note || undefined,
    customerName: t.customer_name || undefined,
    isPaid: Boolean(t.is_paid)
  }));
}

export async function createTransactionApi(profileId: string, tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const payload = {
    profileId,
    name: tx.name,
    category: tx.category,
    type: tx.type,
    amount: tx.amount,
    date: tx.date,
    status: tx.status,
    note: tx.note,
    customer_name: tx.customerName,
    is_paid: tx.isPaid ? 1 : 0
  };

  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Gagal menyimpan transaksi ke database');
  const t = await res.json();
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    type: t.type,
    amount: t.amount,
    date: t.date,
    status: t.status,
    note: t.note || undefined,
    customerName: t.customer_name || undefined,
    isPaid: Boolean(t.is_paid)
  };
}

export async function deleteTransactionApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus transaksi dari database');
}

export async function markBonPaidApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/transactions/${id}/pay-bon`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Gagal menandai lunas bon');
}

export async function resetTransactionsApi(profileId: string = 'warung_siti'): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/reset-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId })
  });

  if (!res.ok) throw new Error('Gagal me-reset data');
  const data = await res.json();
  return data.transactions.map((t: any) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    type: t.type,
    amount: t.amount,
    date: t.date,
    status: t.status,
    note: t.note || undefined,
    customerName: t.customer_name || undefined,
    isPaid: Boolean(t.is_paid)
  }));
}

export async function scanReceiptWithAiApi(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/scan-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal memindai nota');
  }
  return await res.json();
}

export async function parseVoiceTranscriptAiApi(transcript: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/parse-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menganalisis suara');
  }
  return await res.json();
}

export async function chatFinancialAiApi(message: string, history: any[], context: any): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal mendapatkan respon AI');
  }
  const data = await res.json();
  return data.reply;
}
