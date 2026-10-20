import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BarChart3, 
  Bot, 
  Store, 
  PlusCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenAddModal: () => void;
  onResetData: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenAddModal,
  onResetData,
  isOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'assistant', label: 'Asisten AI', icon: Bot, isNew: true },
    { id: 'profile', label: 'Profil Usaha', icon: Store }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brandmark">RU</div>
          <div className="brandname">
            RapiUsaha
            <small>ASISTEN KEUANGAN UMKM</small>
          </div>
        </div>

        <button 
          className="btn btn-primary side-btn-add" 
          onClick={() => { onOpenAddModal(); onCloseMobile(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#147d72',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(20,125,114,0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <PlusCircle size={18} />
          <span>Catat Transaksi</span>
        </button>

        <div className="nav-group">
          <div className="navlabel">Menu Utama</div>
          <nav className="nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  className={isActive ? 'active' : ''}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span 
                      style={{
                        marginLeft: 'auto',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        background: '#147d72',
                        color: '#c9efe4',
                        borderRadius: '20px',
                        letterSpacing: '0.5px'
                      }}
                    >
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="helpbox">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Sparkles size={14} color="#81d8c6" />
              <strong>Status Mode Demo</strong>
            </div>
            <p>Data tersimpan di browser Anda. Klik tombol di bawah untuk mengembalikan transaksi ke setelan awal.</p>
            <button 
              onClick={onResetData}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset Data Demo</span>
            </button>
          </div>

          <div className="sidebar-foot">
            RapiUsaha Frontend Demo v0.1<br />
            Khusus Pratinjau & Presentasi
          </div>
        </div>
      </aside>
    </>
  );
};
