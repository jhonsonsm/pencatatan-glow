import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Hourglass, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Camera, 
  Mic, 
  Download, 
  MessageSquareShare,
  CheckCircle2
} from 'lucide-react';
import type { BusinessProfile, FinancialSummary, Transaction } from '../types';
import { formatCurrency, formatDate, get7DaysCashflow } from '../utils/finance';

interface DashboardScreenProps {
  profile: BusinessProfile;
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  unpaidBons: Transaction[];
  onOpenModal: (initialTab?: 'manual' | 'scan' | 'voice') => void;
  onNavigateToTransactions: () => void;
  onNavigateToReports: () => void;
  onExportCsv: () => void;
  onMarkBonPaid: (txId: number) => void;
  onSendWaReminder: (customerName: string, amount: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  summary,
  recentTransactions,
  unpaidBons,
  onOpenModal,
  onNavigateToTransactions,
  onNavigateToReports,
  onExportCsv,
  onMarkBonPaid,
  onSendWaReminder
}) => {
  const chartData = get7DaysCashflow(recentTransactions);

  const runwayColors = {
    aman: { bg: '#e5f5f1', text: '#15785e', border: '#a5decb', label: 'Kas Aman (> 14 Hari)' },
    waspada: { bg: '#fff8eb', text: '#a66b19', border: '#f0d099', label: 'Waspada (7 - 14 Hari)' },
    kritis: { bg: '#fdf2f2', text: '#c65353', border: '#f7baba', label: 'Kritis (< 7 Hari)' },
  };

  const currentRunway = runwayColors[summary.runwayStatus];

  return (
    <div className="screen-content">
      {/* Page Title & Quick CTA */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">{profile.name} • {profile.category}</div>
          <h1>Selamat Beraktivitas, {profile.ownerName.split(' ')[0]} 👋</h1>
          <p>Kondisi kas siap pakai dan batas aman keuangan usaha Anda hari ini.</p>
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
            onClick={() => onOpenModal('manual')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Quick Launchpad Strip */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <button 
          onClick={() => onOpenModal('scan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#e5f5f1', color: '#147d72' }}>
            <Camera size={18} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>Simulasi Scan Nota</strong>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Deteksi nota belanja pasar</span>
          </div>
        </button>

        <button 
          onClick={() => onOpenModal('voice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f0f5ff', color: '#2563eb' }}>
            <Mic size={18} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>Simulasi Rekam Suara</strong>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>"Masuk 500rb pesanan..."</span>
          </div>
        </button>

        <button 
          onClick={onNavigateToReports}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#fdf4ff', color: '#9333ea' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>Evaluasi Laporan</strong>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Analisis pengeluaran terbesar</span>
          </div>
        </button>
      </div>

      {/* Main Hero Financial Section: Kas Operasional vs Kas Dingin vs Runway */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Kas Siap Pakai (Operasional) */}
        <div 
          className="panel"
          style={{
            background: 'linear-gradient(135deg, #152e39 0%, #1e424c 100%)',
            color: '#fff',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#a9c2c5', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              KAS SIAP PAKAI (OPERASIONAL)
            </span>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px' }}>
              <Wallet size={18} color="#81d8c6" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px', color: '#fff' }}>
            {formatCurrency(summary.operatingBalance)}
          </div>
          <p style={{ fontSize: '12px', color: '#c4d7d9', lineHeight: 1.4 }}>
            Uang tunai & rekening kas warung. Siap digunakan untuk kulakan bahan baku esok hari.
          </p>
        </div>

        {/* Barometer Ketahanan Kas (Runway) */}
        <div 
          className="panel"
          style={{
            backgroundColor: '#fff',
            border: `2px solid ${currentRunway.border}`,
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              KETAHANAN KAS (RUNWAY)
            </span>
            <div style={{ backgroundColor: currentRunway.bg, color: currentRunway.text, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
              {currentRunway.label}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 900, color: currentRunway.text }}>
              {summary.runwayDays}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Hari Operasional</span>
          </div>
          {/* Progress bar visual */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#f0f3f4', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div 
              style={{
                width: `${Math.min(100, Math.max(8, (summary.runwayDays / 30) * 100))}%`,
                height: '100%',
                backgroundColor: currentRunway.text,
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Dihitung dari sisa kas operasional dibagi estimasi pengeluaran harian ({formatCurrency(profile.dailyBurnRateTarget)}/hari).
          </p>
        </div>

        {/* Kas Dingin / Tabungan Darurat */}
        <div 
          className="panel"
          style={{
            backgroundColor: '#fff',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              KAS DINGIN (TABUNGAN USAHA)
            </span>
            <div style={{ backgroundColor: '#e5f5f1', padding: '6px', borderRadius: '8px', color: '#147d72' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px', color: 'var(--ink)' }}>
            {formatCurrency(summary.savingsBalance)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
            Dana simpanan darurat & pengembangan usaha. Terkunci aman dan tidak tercampur belanja dapur.
          </p>
        </div>
      </div>

      {/* Mini Stat Cards Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ color: '#15785e', background: '#e5f5f1', padding: '5px', borderRadius: '6px' }}>
              <ArrowDownLeft size={16} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Total Pemasukan</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#15785e' }}>
            +{formatCurrency(summary.income)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ color: '#c65353', background: '#fdf2f2', padding: '5px', borderRadius: '6px' }}>
              <ArrowUpRight size={16} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Total Pengeluaran</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#c65353' }}>
            −{formatCurrency(summary.expense)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ color: '#a66b19', background: '#fff8eb', padding: '5px', borderRadius: '6px' }}>
              <Hourglass size={16} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Ambil Pribadi (Prive)</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#a66b19' }}>
            −{formatCurrency(summary.prive)}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ color: '#2563eb', background: '#eff6ff', padding: '5px', borderRadius: '6px' }}>
              <TrendingUp size={16} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Selisih Bersih Tercatat</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: summary.netOperating >= 0 ? '#15785e' : '#c65353' }}>
            {summary.netOperating >= 0 ? '+' : ''}{formatCurrency(summary.netOperating)}
          </div>
        </div>
      </div>

      {/* Row: 7-Days Chart & Piutang Bon Widget */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        {/* Interactive 7-Day Mini Chart */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Arus Kas 7 Hari Terakhir</h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Perbandingan uang masuk (hijau) vs uang keluar (merah)</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15785e' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#15785e', borderRadius: '2px' }} /> Masuk
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c65353' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#c65353', borderRadius: '2px' }} /> Keluar
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '10px', borderBottom: '1px solid var(--line)', gap: '8px' }}>
            {chartData.map((day, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center', height: '100px' }}>
                  {/* Bar Masuk */}
                  <div 
                    title={`Pemasukan: ${formatCurrency(day.income)}`}
                    style={{
                      width: '40%',
                      maxWidth: '18px',
                      height: `${day.incomeHeight}%`,
                      backgroundColor: '#15785e',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  {/* Bar Keluar */}
                  <div 
                    title={`Pengeluaran: ${formatCurrency(day.expense)}`}
                    style={{
                      width: '40%',
                      maxWidth: '18px',
                      height: `${day.expenseHeight}%`,
                      backgroundColor: '#c65353',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Piutang / Bon Pelanggan */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Catatan Bon Pelanggan</h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Total {unpaidBons.length} piutang belum tertagih</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#a66b19' }}>
              {formatCurrency(summary.unpaidBon)}
            </span>
          </div>

          {unpaidBons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '13px' }}>
              🎉 Semua catatan bon pelanggan sudah lunas!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unpaidBons.map((bon) => (
                <div 
                  key={bon.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#fafbfc',
                    border: '1px solid var(--line)'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>
                      {bon.customerName || bon.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {bon.note} • {formatDate(bon.date)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#a66b19' }}>
                      {formatCurrency(bon.amount)}
                    </span>
                    <button
                      onClick={() => onSendWaReminder(bon.customerName || bon.name, bon.amount)}
                      title="Simulasi Kirim Pengingat WhatsApp"
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#e5f5f1',
                        color: '#147d72',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MessageSquareShare size={13} />
                      <span>Colek WA</span>
                    </button>
                    <button
                      onClick={() => onMarkBonPaid(bon.id)}
                      title="Tandai Lunas"
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#f0f3f4',
                        color: 'var(--ink)',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Lunas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Transaksi Terbaru</h2>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Menampilkan mutasi kas operasional terkini</span>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onNavigateToTransactions}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Lihat Semua Transaksi →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>Transaksi</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.slice(0, 5).map((tx) => {
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
                    <td><span className="cat-pill">{tx.category}</span></td>
                    <td>
                      <span className={`status ${tx.status === 'pending' ? 'pending' : ''}`}>
                        {tx.status === 'pending' ? 'Perlu Diperiksa' : 'Tercatat'}
                      </span>
                    </td>
                    <td className={`amount ${isInc ? 'income' : 'expense'}`} style={{ textAlign: 'right' }}>
                      {isInc ? '+ ' : '− '}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
