import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'rapiusaha.db');

export const db = new DatabaseSync(dbPath);

export function initDb() {
  // 1. Table Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      category TEXT NOT NULL,
      initial_operating_cash INTEGER NOT NULL,
      savings_cash INTEGER NOT NULL,
      daily_burn_rate_target INTEGER NOT NULL
    );
  `);

  // 2. Table Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      note TEXT,
      customer_name TEXT,
      is_paid INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default profile if empty
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
  if (!profileCount || profileCount.count === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, name, owner_name, category, initial_operating_cash, savings_cash, daily_burn_rate_target)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProfile.run('warung_siti', 'Warung Makan Bu Siti', 'Siti Rahmawati', 'Kuliner & Warung Makan', 2500000, 5000000, 180000);
    insertProfile.run('kopi_budi', 'Kopi & Toast Mas Budi', 'Budi Santoso', 'Coffee Shop & Jajanan', 3800000, 7500000, 250000);
  }

  // Seed default transactions if empty
  const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  if (!txCount || txCount.count === 0) {
    seedInitialTransactions('warung_siti');
  }
}

export function seedInitialTransactions(profileId = 'warung_siti') {
  const insert = db.prepare(`
    INSERT INTO transactions (profile_id, name, category, type, amount, date, status, note, customer_name, is_paid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialList = [
    [profileId, 'Penjualan makan siang tunai', 'Penjualan', 'income', 850000, '2026-10-21', 'confirmed', 'Ramai pesanan ayam bakar jam 12-14', null, 0],
    [profileId, 'Penerimaan QRIS harian', 'Penjualan', 'income', 1200000, '2026-10-20', 'confirmed', 'Settlement QRIS masuk ke rekening usaha', null, 0],
    [profileId, 'Belanja sayur & bumbu pasar', 'Bahan baku', 'expense', 320000, '2026-10-20', 'confirmed', 'Ayam 5kg, cabai, bawang merah, tempe', null, 0],
    [profileId, 'Token listrik dapur warung', 'Operasional', 'expense', 100000, '2026-10-19', 'confirmed', 'Beli token 100rb PLN', null, 0],
    [profileId, 'Ambil pribadi (Uang SPP anak)', 'Pribadi / Prive', 'prive', 250000, '2026-10-19', 'confirmed', 'Pemisahan kas: dicatat sebagai prive bukan beban usaha', null, 0],
    [profileId, 'Kemasan kotak & plastik mika', 'Kemasan', 'expense', 120000, '2026-10-18', 'pending', 'Nota toko plastik belum dicap', null, 0],
    [profileId, 'Bensin & parkir belanja', 'Transportasi', 'expense', 50000, '2026-10-17', 'confirmed', 'Bensin motor operasional', null, 0],
    [profileId, 'Pak RT Bambang (Katering Arisan)', 'Bon Pelanggan', 'bon', 350000, '2026-10-18', 'pending', 'Janji bayar akhir pekan ini', 'Pak RT Bambang', 0],
    [profileId, 'Mbak Dewi Laundry (Makan Karyawan)', 'Bon Pelanggan', 'bon', 180000, '2026-10-16', 'pending', 'Total 6 porsi makan siang', 'Mbak Dewi', 0]
  ];

  for (const item of initialList) {
    insert.run(...item);
  }
}

// Queries
export function getProfile(id = 'warung_siti') {
  return db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
}

export function getAllProfiles() {
  return db.prepare('SELECT * FROM profiles').all();
}

export function updateProfile(id, data) {
  const stmt = db.prepare(`
    UPDATE profiles
    SET name = ?, owner_name = ?, category = ?, initial_operating_cash = ?, savings_cash = ?, daily_burn_rate_target = ?
    WHERE id = ?
  `);
  return stmt.run(
    data.name,
    data.owner_name,
    data.category,
    data.initial_operating_cash,
    data.savings_cash,
    data.daily_burn_rate_target,
    id
  );
}

export function getTransactions(profileId = 'warung_siti') {
  return db.prepare('SELECT * FROM transactions WHERE profile_id = ? ORDER BY date DESC, id DESC').all(profileId);
}

export function addTransaction(profileId, tx) {
  const stmt = db.prepare(`
    INSERT INTO transactions (profile_id, name, category, type, amount, date, status, note, customer_name, is_paid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    profileId,
    tx.name,
    tx.category,
    tx.type,
    tx.amount,
    tx.date || new Date().toISOString().split('T')[0],
    tx.status || 'confirmed',
    tx.note || null,
    tx.customer_name || null,
    tx.is_paid ? 1 : 0
  );
  return { id: Number(result.lastInsertRowid), ...tx };
}

export function deleteTransaction(id) {
  return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

export function markBonPaid(id) {
  return db.prepare("UPDATE transactions SET is_paid = 1, status = 'confirmed' WHERE id = ?").run(id);
}

export function resetTransactions(profileId = 'warung_siti') {
  db.prepare('DELETE FROM transactions WHERE profile_id = ?').run(profileId);
  seedInitialTransactions(profileId);
}
