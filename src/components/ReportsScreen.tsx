import React from 'react';
import { Download, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';
import type { FinancialSummary, Transaction } from '../types';
import { formatCurrency, getCategoryBreakdown } from '../utils/finance';

interface ReportsScreenProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onExportCsv: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  summary,
  transactions,
  onExportCsv
}) => {
  const categoryBreakdown = getCategoryBreakdown(transactions);

  return (
    <div className="screen-content">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Analisis Kinerja</div>
          <h1>Ringkasan Laporan Keuangan</h1>
          <p>Pemantauan alokasi pengeluaran dan evaluasi arus kas operasional usaha.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={onExportCsv}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={15} />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Mode Demo Notice */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#fff8eb',
          border: '1px solid #f0d099',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#a66b19'
        }}
      >
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Informasi Simulasi: </strong>
          Laporan ini menghitung mutasi kas masuk dan keluar secara sederhana untuk simulasi pengambilan keputusan harian pemilik UMKM. Belum mencakup jurnal penyusutan aset atau pembukuan akuntansi ganda.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            TOTAL UANG MASUK
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15785e', marginTop: '6px' }}>
            +{formatCurrency(summary.income)}
          </div>
        </div>

        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            BEBAN OPERASIONAL USAHA
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#c65353', marginTop: '6px' }}>
            −{formatCurrency(summary.expense)}
          </div>
        </div>

        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            AMBIL PRIBADI (PRIVE)
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#a66b19', marginTop: '6px' }}>
            −{formatCurrency(summary.prive)}
          </div>
        </div>

        <div className="panel" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            SELISIH ARUS KAS BERSIH
          </span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: summary.netOperating >= 0 ? '#15785e' : '#c65353', marginTop: '6px' }}>
            {summary.netOperating >= 0 ? '+' : ''}{formatCurrency(summary.netOperating)}
          </div>
        </div>
      </div>

      {/* Category Breakdown Panel */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Rincian Alokasi Pengeluaran & Prive</h2>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Kategori yang paling banyak menyerap kas operasional bulan ini
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
            Total: {formatCurrency(summary.expense + summary.prive)}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
            Belum ada data pengeluaran tercatat.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryBreakdown.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.percentage}%</span>
                    <strong style={{ color: 'var(--ink)' }}>{formatCurrency(item.amount)}</strong>
                  </div>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#f0f3f4', borderRadius: '5px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      width: `${item.barWidth}%`,
                      height: '100%',
                      backgroundColor: item.name.includes('Prive') ? '#a66b19' : 'var(--teal)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Health Guide for MSMEs */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#147d72' }}>
            <BookOpen size={18} />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Kenapa Prive Harus Dipisahkan?</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Banyak UMKM merasa untung tapi kehabisan kas kulakan karena uang kas warung sering terpakai untuk belanja rumah tangga secara mendadak. Dengan mencatat Prive secara terpisah, Anda tahu persis berapa yang diambil tanpa merusak kas operasional esok hari.
          </p>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#15785e' }}>
            <CheckCircle size={18} />
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Target Ketahanan Kas Minimal 14 Hari</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Usaha yang sehat idealnya memiliki Kas Siap Pakai setara 14 hari rata-rata pengeluaran. Jika barometer ketahanan kas Anda turun ke bawah 7 hari, segera tahan pengambilan uang pribadi dan utamakan penagihan bon pelanggan.
          </p>
        </div>
      </div>
    </div>
  );
};
