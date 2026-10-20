import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import type { FinancialSummary, BusinessProfile } from '../types';
import { formatCurrency } from '../utils/finance';
import { chatFinancialAiApi } from '../api';

interface AssistantScreenProps {
  profile: BusinessProfile;
  summary: FinancialSummary;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  profile,
  summary
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Halo ' + profile.ownerName + '! Saya Asisten Keuangan AI Pencatatan Glow. Saya terhubung langsung ke data database ' + profile.name + '. Tanyakan apa saja seputar batas aman ambil prive, sisa kas operasional, tagihan bon, atau strategi belanja bahan baku Anda!',
      time: '12:00'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Bisa ambil prive Rp 300.000 sekarang?',
    'Berapa sisa kas operasional dan ketahanannya?',
    'Kategori apa yang paling boros bulan ini?',
    'Bagaimana aturan pajak penghasilan warung saya?'
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    const timeNow = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date());

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      time: timeNow
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const context = {
        businessName: profile.name,
        ownerName: profile.ownerName,
        operatingBalance: summary.operatingBalance,
        savingsBalance: summary.savingsBalance,
        runwayDays: summary.runwayDays,
        runwayStatus: summary.runwayStatus,
        dailyBurn: profile.dailyBurnRateTarget,
        income: summary.income,
        expense: summary.expense,
        prive: summary.prive,
        unpaidBon: summary.unpaidBon
      };

      const reply = await chatFinancialAiApi(q, messages, context);

      const botMsg: Message = {
        id: 'bot-' + (Date.now() + 1),
        sender: 'bot',
        text: reply,
        time: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: 'Maaf, terjadi kendala saat menghubungi asisten AI: ' + err.message + '. Silakan coba lagi sebentar.',
        time: timeNow
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="screen-content">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Asisten Finansial AI Terpadu</div>
          <h1>Konsultasi Keuangan Nyata</h1>
          <p>Terhubung langsung ke model LLM lokal dan data mutasi kas SQLite usaha Anda.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e5f5f1', color: '#147d72', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
          <Sparkles size={14} />
          <span>TERHUBUNG KE MODEL AI AKTIF</span>
        </div>
      </div>

      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--line)', backgroundColor: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--teal)', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Bot size={20} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>Pencatatan Glow AI Advisor</strong>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Kas Operasional: {formatCurrency(summary.operatingBalance)} • Runway: {summary.runwayDays} Hari
              </span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#15785e', fontWeight: 700, backgroundColor: '#e5f5f1', padding: '3px 8px', borderRadius: '12px' }}>
            ● AI Online
          </span>
        </div>

        <div style={{ padding: '10px 16px', backgroundColor: '#f5f8f8', borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #d2e4e1',
                backgroundColor: '#fff',
                color: 'var(--ink)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>💬</span>
              <span>{p}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                {!isUser && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--teal)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                )}
                <div 
                  style={{
                    maxWidth: '78%',
                    padding: '12px 16px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isUser ? 'var(--nav)' : '#f0f4f5',
                    color: isUser ? '#fff' : 'var(--ink)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                  <span style={{ display: 'block', fontSize: '10px', color: isUser ? '#a9c2c5' : '#889da3', marginTop: '4px', textAlign: 'right' }}>
                    {m.time}
                  </span>
                </div>
                {isUser && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#e2e8f0', color: 'var(--ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '12px', padding: '6px 12px' }}>
              <Loader2 size={16} className="spin" color="var(--teal)" />
              <span>Asisten AI sedang menghitung dan menyusun rekomendasi...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', backgroundColor: '#fff', display: 'flex', gap: '10px' }}
        >
          <input 
            type="text"
            placeholder="Tanyakan hal seperti 'Berapa modal kas tersisa untuk belanja besok?'..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
              fontSize: '13px'
            }}
          />
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !inputQuestion.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
          >
            <span>Kirim</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
