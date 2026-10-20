import React from 'react';
import { Menu, ShieldAlert, Store, Calendar } from 'lucide-react';
import type { BusinessProfile } from '../types';

interface HeaderProps {
  currentScreen: string;
  activeProfile: BusinessProfile;
  availableProfiles: Record<string, BusinessProfile>;
  onSelectProfile: (profileId: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  activeProfile,
  availableProfiles,
  onSelectProfile,
  onToggleMobileMenu
}) => {
  const screenLabels: Record<string, string> = {
    dashboard: 'Ringkasan Usaha',
    transactions: 'Catatan Transaksi',
    reports: 'Laporan Keuangan',
    assistant: 'Asisten Keuangan Pintar',
    profile: 'Profil & Konfigurasi'
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="mobile-toggle" 
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Menu size={22} />
        </button>

        <div className="crumbs">
          <span style={{ color: 'var(--muted)' }}>Pencatatan Glow</span>
          <span className="crumb-sep">/</span>
          <strong style={{ color: 'var(--ink)' }}>{screenLabels[currentScreen] || 'Ringkasan'}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Mode Demo Banner Tag */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#fff8eb',
            border: '1px solid #f0d099',
            color: '#a66b19',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.3px'
          }}
        >
          <ShieldAlert size={14} />
          <span>DATA SIMULASI DEMO</span>
        </div>

        {/* Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Store size={15} color="var(--teal)" />
          <select 
            value={activeProfile.id}
            onChange={(e) => onSelectProfile(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              backgroundColor: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer'
            }}
          >
            {Object.values(availableProfiles).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date badge */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: 'var(--muted)',
            fontWeight: 500
          }}
        >
          <Calendar size={14} />
          <span>21 Okt 2026</span>
        </div>
      </div>
    </header>
  );
};
