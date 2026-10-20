import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onOpenModal: () => void;
  onExportCsv: () => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onOpenModal,
  onExportCsv,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="screen-content">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Buku Kas Harian</div>
          <h1>Daftar Transaksi</h1>
          <p>Kelola catatan uang masuk, uang keluar operasional, prive, dan bon pelanggan.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onOpenModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} 
            />
            <input 
              type="text"
              placeholder="Cari transaksi, toko, pelanggan, atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                fontSize: '13px',
                backgroundColor: 'var(--canvas)'
              }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'income', label: 'Uang Masuk' },
              { id: 'expense', label: 'Uang Keluar' },
              { id: 'prive', label: 'Prive' },
              { id: 'bon', label: 'Bon' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: selectedType === tab.id ? '1px solid var(--teal)' : '1px solid var(--line)',
                  backgroundColor: selectedType === tab.id ? 'var(--teal2)' : '#fff',
                  color: selectedType === tab.id ? 'var(--teal)' : 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: selectedType === tab.id ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--muted)" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontSize: '12px',
                color: 'var(--ink)'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Tercatat</option>
              <option value="pending">Perlu Diperiksa</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Menampilkan <strong>{filtered.length}</strong> dari total {transactions.length} transaksi</span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              Hapus pencarian
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="panel">
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>Deskripsi Transaksi</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ width: '50px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                    <Receipt size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Tidak ada transaksi yang sesuai.</p>
                    <span style={{ fontSize: '12px' }}>Coba ubah kata kunci pencarian atau ganti filter.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isPrive = tx.type === 'prive';
                  const isBon = tx.type === 'bon';

                  return (
                    <tr key={tx.id}>
                      <td>
                        <div className="transaction-name">
                          <div className={`tx-icon ${isInc ? '' : (isPrive ? 'prive' : (isBon ? 'bon' : 'expense'))}`}>
                            {isInc ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <div className="tx-name">{tx.name}</div>
                            <div className="tx-cat">{tx.note || tx.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="tx-date">{formatDate(tx.date)}</td>
                      <td>
                        <span className="cat-pill">{tx.category}</span>
                      </td>
                      <td>
                        <span className={`status ${tx.status === 'pending' ? 'pending' : ''}`}>
                          {tx.status === 'pending' ? 'Perlu Diperiksa' : 'Tercatat'}
                        </span>
                      </td>
                      <td className={`amount ${isInc ? 'income' : 'expense'}`} style={{ textAlign: 'right' }}>
                        {isInc ? '+ ' : '− '}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Hapus transaksi ini"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#c65353')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
