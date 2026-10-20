import React from 'react';
import { Store, RotateCcw, ShieldCheck, UserCheck } from 'lucide-react';
import type { BusinessProfile } from '../types';
import { formatCurrency } from '../utils/finance';

interface ProfileScreenProps {
  activeProfile: BusinessProfile;
  availableProfiles: Record<string, BusinessProfile>;
  onSelectProfile: (id: string) => void;
  onResetData: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  activeProfile,
  availableProfiles,
  onSelectProfile,
  onResetData
}) => {
  return (
    <div className="screen-content">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Konfigurasi Usaha</div>
          <h1>Profil Usaha & Pengaturan Demo</h1>
          <p>Kelola data pemilik usaha, konfigurasi modal kas awal, dan manajemen sesi demo.</p>
        </div>
      </div>

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        {/* Active Profile Info */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--teal2)', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
              <Store size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{activeProfile.name}</h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pemilik: {activeProfile.ownerName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>Bidang Usaha</span>
              <strong>{activeProfile.category}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>Kas Awal Siap Pakai</span>
              <strong style={{ color: 'var(--teal)' }}>{formatCurrency(activeProfile.initialOperatingCash)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>Kas Dingin (Tabungan Terkunci)</span>
              <strong>{formatCurrency(activeProfile.savingsCash)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--muted)' }}>Estimasi Biaya Operasional / Hari</span>
              <strong>{formatCurrency(activeProfile.dailyBurnRateTarget)} / hari</strong>
            </div>
          </div>
        </div>

        {/* Persona Switcher & Reset Manager */}
        <div className="panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Ganti Profil Persona Demo</h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
            Pilih persona untuk mendemonstrasikan fleksibilitas aplikasi di depan calon pengguna atau investor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {Object.values(availableProfiles).map((p) => {
              const isSelected = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--teal)' : '1px solid var(--line)',
                    backgroundColor: isSelected ? 'var(--teal2)' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: isSelected ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {p.category} • Modal Operasional {formatCurrency(p.initialOperatingCash)}
                    </span>
                  </div>
                  {isSelected && <UserCheck size={18} color="var(--teal)" />}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '18px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Reset Dataset Demo</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Mengembalikan semua transaksi yang ditambahkan atau diubah kembali ke sampel awal.
            </p>
            <button
              onClick={onResetData}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#c65353',
                borderColor: '#f7baba'
              }}
            >
              <RotateCcw size={15} />
              <span>Kembalikan ke Data Demo Awal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tech & Data Scope Transparency Card */}
      <div className="panel" style={{ padding: '20px', backgroundColor: '#f9fbfb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--ink)' }}>
          <ShieldCheck size={20} color="var(--teal)" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Transparansi Lingkup Prototipe Frontend</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          Sesuai spesifikasi dokumen handoff, prototipe ini berjalan mandiri di browser tanpa basis data eksternal (Supabase/PostgreSQL) dan tanpa API pihak ketiga. Penyimpanan data memanfaatkan <code>localStorage</code> browser agar interaksi tetap tersimpan saat berpindah halaman atau merefresh jendela presentasi.
        </p>
      </div>
    </div>
  );
};
