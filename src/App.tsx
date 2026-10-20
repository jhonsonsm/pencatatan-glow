import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './components/DashboardScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { AssistantScreen } from './components/AssistantScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Toast } from './components/Toast';
import { BUSINESS_PROFILES, INITIAL_TRANSACTIONS } from './data/demoData';
import { calculateSummary, exportTransactionsToCsv, formatCurrency } from './utils/finance';
import type { Transaction, BusinessProfile } from './types';
import { 
  fetchProfileApi, 
  fetchTransactionsApi, 
  createTransactionApi, 
  deleteTransactionApi, 
  markBonPaidApi, 
  resetTransactionsApi 
} from './api';

export const App: React.FC = () => {
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('rapiusaha_profile_id') || 'warung_siti';
  });

  const [activeProfile, setActiveProfile] = useState<BusinessProfile>(() => {
    return BUSINESS_PROFILES[activeProfileId] || BUSINESS_PROFILES.warung_siti;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'manual' | 'scan' | 'voice'>('manual');

  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'info' | 'warning' }>({
    message: null,
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: null, type: 'success' });
    }, 3800);
  };

  // Load from SQLite backend on mount and on profile switch
  const loadData = async (profileId: string) => {
    try {
      const [p, txs] = await Promise.all([
        fetchProfileApi(profileId),
        fetchTransactionsApi(profileId)
      ]);
      setActiveProfile(p);
      setTransactions(txs);
    } catch (err) {
      console.warn('Backend not ready, falling back to local dataset', err);
      setActiveProfile(BUSINESS_PROFILES[profileId] || BUSINESS_PROFILES.warung_siti);
    }
  };

  useEffect(() => {
    loadData(activeProfileId);
  }, [activeProfileId]);

  const summary = calculateSummary(transactions, activeProfile);
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const unpaidBons = transactions.filter((t) => t.type === 'bon' && !t.isPaid);

  const handleOpenModal = (tab: 'manual' | 'scan' | 'voice' = 'manual') => {
    setModalInitialTab(tab);
    setIsAddModalOpen(true);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const saved = await createTransactionApi(activeProfileId, newTx);
      setTransactions((prev) => [saved, ...prev]);
      showToast('Transaksi "' + saved.name + '" (' + formatCurrency(saved.amount) + ') tersimpan di SQLite!');
    } catch (err: any) {
      const fallbackId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
      const localTx = { ...newTx, id: fallbackId };
      setTransactions((prev) => [localTx, ...prev]);
      showToast('Tersimpan di lokal: ' + localTx.name, 'info');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransactionApi(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaksi berhasil dihapus dari database.', 'info');
    } catch (err) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaksi dihapus secara lokal.', 'info');
    }
  };

  const handleMarkBonPaid = async (id: number) => {
    try {
      await markBonPaidApi(id);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isPaid: true, status: 'confirmed' } : t))
      );
      showToast('Bon pelanggan berhasil ditandai LUNAS di database!', 'success');
    } catch (err) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isPaid: true, status: 'confirmed' } : t))
      );
      showToast('Bon ditandai lunas.', 'success');
    }
  };

  const handleSendWaReminder = (customerName: string, amount: number) => {
    showToast(
      '💬 Pengingat WA ke ' + customerName + ': "Halo Kak, konfirmasi catatan belanja ' + formatCurrency(amount) + '. Terima kasih 🙏"',
      'info'
    );
  };

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    localStorage.setItem('rapiusaha_profile_id', profileId);
    showToast('Beralih ke profil usaha: ' + (BUSINESS_PROFILES[profileId]?.name || profileId), 'info');
  };

  const handleResetData = async () => {
    try {
      const refreshed = await resetTransactionsApi(activeProfileId);
      setTransactions(refreshed);
      showToast('Database SQLite berhasil di-reset ke data awal!', 'warning');
    } catch (err) {
      setTransactions(INITIAL_TRANSACTIONS);
      showToast('Data dikembalikan ke setelan awal.', 'warning');
    }
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(transactions);
    showToast('File CSV berhasil diunduh.', 'success');
  };

  return (
    <div className="app">
      <Toast message={toast.message} type={toast.type} />

      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenAddModal={() => handleOpenModal('manual')}
        onResetData={handleResetData}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="main">
        <Header
          currentScreen={currentScreen}
          activeProfile={activeProfile}
          availableProfiles={BUSINESS_PROFILES}
          onSelectProfile={handleSelectProfile}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main className="main-viewport">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              profile={activeProfile}
              summary={summary}
              recentTransactions={recentTransactions}
              unpaidBons={unpaidBons}
              onOpenModal={handleOpenModal}
              onNavigateToTransactions={() => setCurrentScreen('transactions')}
              onNavigateToReports={() => setCurrentScreen('reports')}
              onExportCsv={handleExportCsv}
              onMarkBonPaid={handleMarkBonPaid}
              onSendWaReminder={handleSendWaReminder}
            />
          )}

          {currentScreen === 'transactions' && (
            <TransactionsScreen
              transactions={transactions}
              onOpenModal={() => handleOpenModal('manual')}
              onExportCsv={handleExportCsv}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsScreen
              summary={summary}
              transactions={transactions}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentScreen === 'assistant' && (
            <AssistantScreen
              profile={activeProfile}
              summary={summary}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              activeProfile={activeProfile}
              availableProfiles={BUSINESS_PROFILES}
              onSelectProfile={handleSelectProfile}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        initialTab={modalInitialTab}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};

export default App;
