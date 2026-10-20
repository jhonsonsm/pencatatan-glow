import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Mic, 
  MicOff, 
  Edit3, 
  Sparkles, 
  Check, 
  Upload, 
  Loader2 
} from 'lucide-react';
import type { Transaction, TransactionType } from '../types';
import { CATEGORIES_BY_TYPE, PRESET_RECEIPTS, PRESET_VOICES } from '../data/demoData';
import { formatCurrency } from '../utils/finance';
import { scanReceiptWithAiApi, parseVoiceTranscriptAiApi } from '../api';

interface AddTransactionModalProps {
  isOpen: boolean;
  initialTab?: 'manual' | 'scan' | 'voice';
  onClose: () => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  initialTab = 'manual',
  onClose,
  onAddTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'voice'>('manual');

  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('Bahan baku');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed');

  // Scanner Simulator / Real Upload State
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Speech Recognition & Voice State
  const [isListening, setIsListening] = useState(false);
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceSuccessMessage, setVoiceSuccessMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setIsScanning(false);
      setIsListening(false);
      setLiveTranscript('');
      setUploadedImagePreview(null);
      setUploadedBase64(null);
      setScanSuccessMessage(null);
      setVoiceSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const cats = CATEGORIES_BY_TYPE[type] || [];
    if (cats.length > 0 && !cats.includes(category)) {
      setCategory(cats[0]);
    }
  }, [type]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setUploadedImagePreview(b64);
      setUploadedBase64(b64);
      setScanSuccessMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessUploadedReceipt = async () => {
    if (!uploadedBase64) return;
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const data = await scanReceiptWithAiApi(uploadedBase64);
      setName(data.name || data.storeName || 'Belanja Nota');
      setAmount(String(data.amount || 0));
      if (data.category) setCategory(data.category);
      if (data.type) setType(data.type);
      if (data.date) setDate(data.date);
      setNote(data.note || ('Nota dari ' + (data.storeName || 'Toko')));
      setScanSuccessMessage('Nota berhasil dibaca AI: ' + (data.storeName || data.name) + ' (' + formatCurrency(data.amount) + ')');
    } catch (err: any) {
      setErrorMsg('Gagal memproses nota: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulateScanPreset = (receipt: typeof PRESET_RECEIPTS[0]) => {
    setIsScanning(true);
    setScanSuccessMessage(null);

    setTimeout(() => {
      setIsScanning(false);
      setType(receipt.type);
      setName(receipt.title);
      setAmount(receipt.amount.toString());
      setCategory(receipt.category);
      setDate(receipt.date);
      setNote(receipt.store + ' - ' + receipt.note);
      setStatus('confirmed');
      setScanSuccessMessage('Sampel "' + receipt.title + '" (' + formatCurrency(receipt.amount) + ') berhasil dimuat!');
    }, 600);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Browser Anda belum mendukung Web Speech API. Silakan ketik manual atau gunakan sampel preset suara.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setLiveTranscript('');
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setLiveTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setErrorMsg('Gagal mengakses mikrofon: ' + e.message);
      setIsListening(false);
    }
  };

  const handleProcessVoiceWithAi = async (textToProcess: string) => {
    const text = textToProcess.trim();
    if (!text) return;

    setIsParsingVoice(true);
    setErrorMsg(null);

    try {
      const data = await parseVoiceTranscriptAiApi(text);
      if (data.name) setName(data.name);
      if (data.amount) setAmount(String(data.amount));
      if (data.type) setType(data.type);
      if (data.category) setCategory(data.category);
      if (data.note) setNote(data.note);
      setVoiceSuccessMessage('AI mengenali: ' + data.name + ' (' + formatCurrency(data.amount) + ')');
    } catch (err: any) {
      setErrorMsg('Gagal memproses suara dengan AI: ' + err.message);
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);

    if (!name.trim()) {
      setErrorMsg('Deskripsi transaksi wajib diisi.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Nominal harus berupa angka bulat positif lebih dari Rp 0.');
      return;
    }

    onAddTransaction({
      name: name.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      status,
      note: note.trim() || undefined,
      customerName: type === 'bon' ? (customerName.trim() || name.trim()) : undefined,
      isPaid: false
    });

    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '640px', width: '94%' }}>
        <div className="modal-head">
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Tambah Transaksi Nyata</h2>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Input manual, upload foto nota asli via AI, atau bicara langsung</span>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--muted)" />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '0 20px', gap: '8px' }}>
          {[
            { id: 'manual', label: 'Input Manual', icon: Edit3 },
            { id: 'scan', label: 'Upload Nota (AI Vision)', icon: Camera },
            { id: 'voice', label: 'Bicara (Voice AI)', icon: Mic }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                  background: 'none',
                  color: isActive ? 'var(--teal)' : 'var(--muted)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'scan' && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fafbfc', borderBottom: '1px solid var(--line)', maxHeight: '280px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div 
                style={{
                  flex: '1 1 240px',
                  border: '2px dashed #93ded2',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {uploadedImagePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={uploadedImagePreview} 
                      alt="Preview Nota" 
                      style={{ maxHeight: '90px', borderRadius: '6px', objectFit: 'contain' }} 
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => { e.stopPropagation(); handleProcessUploadedReceipt(); }}
                      disabled={isScanning}
                      style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      {isScanning ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
                      <span>{isScanning ? 'Membaca Nota via AI...' : 'Ekstrak dengan AI Vision'}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} color="var(--teal)" style={{ margin: '0 auto 6px' }} />
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--ink)' }}>Pilih Foto Nota Asli</strong>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Format JPG, PNG dari kamera / laptop</span>
                  </div>
                )}
              </div>

              <div style={{ flex: '1 1 260px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  Atau Coba Contoh Nota Cepat:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PRESET_RECEIPTS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSimulateScanPreset(r)}
                      disabled={isScanning}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        backgroundColor: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '11px', color: 'var(--ink)' }}>{r.title}</strong>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>{r.store}</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--teal)' }}>
                        {formatCurrency(r.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {scanSuccessMessage && (
              <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#e5f5f1', borderRadius: '8px', color: '#15785e', fontSize: '12px', fontWeight: 600 }}>
                ✓ {scanSuccessMessage}
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fafbfc', borderBottom: '1px solid var(--line)', maxHeight: '280px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div 
                style={{
                  flex: '1 1 240px',
                  border: isListening ? '2px solid #ef4444' : '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  backgroundColor: isListening ? '#fef2f2' : '#fff'
                }}
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? '#ef4444' : 'var(--teal)',
                    color: '#fff',
                    border: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <strong style={{ display: 'block', fontSize: '12px', color: isListening ? '#ef4444' : 'var(--ink)' }}>
                  {isListening ? 'Mendengarkan... Bicara Sekarang' : 'Klik Mic untuk Bicara'}
                </strong>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Contoh: "Beli ayam lima puluh ribu tunai"
                </span>

                {liveTranscript && (
                  <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px', textAlign: 'left' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block' }}>Teks Terekam:</span>
                    <strong style={{ color: 'var(--ink)' }}>"{liveTranscript}"</strong>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleProcessVoiceWithAi(liveTranscript)}
                      disabled={isParsingVoice}
                      style={{ marginTop: '8px', width: '100%', fontSize: '11px', padding: '6px' }}
                    >
                      {isParsingVoice ? 'Memproses dengan AI...' : 'Proses Suara ke Form'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ flex: '1 1 260px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                  Atau Klik Contoh Kalimat Cepat:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PRESET_VOICES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleProcessVoiceWithAi(v.transcript)}
                      disabled={isParsingVoice}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        backgroundColor: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--ink)', fontStyle: 'italic', display: 'block' }}>
                        "{v.transcript}"
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 700 }}>
                        {formatCurrency(v.amount)} • {v.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {voiceSuccessMessage && (
              <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '12px', fontWeight: 600 }}>
                ✓ {voiceSuccessMessage}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {errorMsg && (
            <div style={{ backgroundColor: '#fdf2f2', border: '1px solid #f7baba', color: '#c65353', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
              Jenis Transaksi *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'income', label: 'Uang Masuk' },
                { id: 'expense', label: 'Uang Keluar' },
                { id: 'prive', label: 'Ambil Pribadi' },
                { id: 'bon', label: 'Bon Pelanggan' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as TransactionType)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: type === t.id ? '2px solid var(--teal)' : '1px solid var(--line)',
                    backgroundColor: type === t.id ? 'var(--teal2)' : '#fff',
                    color: type === t.id ? 'var(--teal)' : 'var(--ink)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Deskripsi Transaksi *
              </label>
              <input
                type="text"
                placeholder="Misal: Penjualan tunai, Belanja beras 25kg, Uang sekolah anak"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Nominal Rupiah (IDR) *
              </label>
              <input
                type="number"
                placeholder="Contoh: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }}
                required
                min="1"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', backgroundColor: '#fff' }}
              >
                {(CATEGORIES_BY_TYPE[type] || ['Umum']).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Status Verifikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', backgroundColor: '#fff' }}
              >
                <option value="confirmed">Tercatat Pasti</option>
                <option value="pending">Perlu Diperiksa Nanti</option>
              </select>
            </div>

            {type === 'bon' && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Nama Pelanggan (Untuk Colek WA) *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Pak RT Bambang / Bu RT Lilis"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }}
                />
              </div>
            )}

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Rincian nota atau info pelunasan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} />
              <span>Simpan ke Database SQLite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
