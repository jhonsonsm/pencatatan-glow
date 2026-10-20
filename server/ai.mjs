import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function getApiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const dotEnvPath = path.join(os.homedir(), '.hermes', '.env');
    if (fs.existsSync(dotEnvPath)) {
      const content = fs.readFileSync(dotEnvPath, 'utf-8');
      for (const line of content.split('\n')) {
        if (line.startsWith('OPENAI_API_KEY=')) {
          return line.trim().split('=', 2)[1];
        }
      }
    }
  } catch (err) {
    console.error('Error reading hermes .env:', err);
  }
  return 'local';
}

const API_KEY = getApiKey();
const ROUTER_URL = 'http://localhost:20128/v1/chat/completions';
const MODEL = 'ag/gemini-3.8-flash-medium';

async function fetchLlm(payload) {
  const response = await fetch(ROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      ...payload
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM call failed (${response.status}): ${errText}`);
  }

  // Aggregate SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
          }
        } catch {
          // ignore chunk parse errors
        }
      }
    }
  }

  return fullText;
}

export async function scanReceiptWithAi(base64Image, mimeType = 'image/jpeg') {
  const prompt = `Anda adalah asisten OCR finansial cerdas untuk UMKM Indonesia.
Analisis foto struk, nota belanja, atau faktur ini secara teliti.
Ekstrak data transaksi dengan akurat ke dalam format JSON murni.

FORMAT JSON WAJIB:
{
  "name": "Belanja [Nama Toko / Barang Utama]",
  "storeName": "Nama Toko atau Kios",
  "amount": 0 (total rupiah angka bulat tanpa titik/koma),
  "category": "Bahan baku" (Pilih satu: "Bahan baku" | "Operasional" | "Kemasan" | "Transportasi" | "Peralatan" | "Lainnya"),
  "type": "expense",
  "date": "YYYY-MM-DD" (jika tidak terlihat gunakan tanggal hari ini: ${new Date().toISOString().split('T')[0]}),
  "note": "Rincian barang belanjaan utama",
  "items": [
    { "name": "Nama Item", "price": 0 }
  ]
}

JANGAN tambahkan markdown \`\`\`json atau teks pengantar apapun. Kembalikan HANYA objek JSON.`;

  const imageUrl = base64Image.startsWith('data:') ? base64Image : `data:${mimeType};base64,${base64Image}`;

  const raw = await fetchLlm({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: 0.1
  });

  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function parseVoiceTranscriptAi(transcript) {
  const prompt = `Analisis kalimat transaksi lisan UMKM berikut dan ubah menjadi format JSON transaksi:
Kalimat: "${transcript}"

ATURAN KATEGORI & TIPE:
- Jika uang masuk / pendapatan / penjualan: type="income", category="Penjualan" atau "Pendapatan Jasa"
- Jika uang keluar belanja dagangan / bahan: type="expense", category="Bahan baku" / "Operasional" / "Kemasan" / "Transportasi"
- Jika uang kas diambil untuk keperluan pribadi / keluarga / anak / rumah tangga: type="prive", category="Pribadi / Prive"
- Jika pelanggan makan/pesan belum bayar / ngutang: type="bon", category="Bon Pelanggan"

FORMAT JSON WAJIB:
{
  "name": "Ringkasan transaksi singkat",
  "amount": 0 (angka bulat nominal rupiah),
  "type": "income" | "expense" | "prive" | "bon",
  "category": "Nama Kategori",
  "note": "Catatan ringkas dari kalimat"
}

JANGAN tambahkan markdown atau teks lain. HANYA JSON murni.`;

  const raw = await fetchLlm({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  });

  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function chatFinancialAi(userMessage, conversationHistory = [], businessContext = {}) {
  const systemPrompt = `Anda adalah Asisten Keuangan Pribadi RapiUsaha yang ramah, solutif, dan cerdas mendampingi UMKM Indonesia.

DATA AKTIF USAHA PENGGUNA SAAT INI:
- Nama Usaha: ${businessContext.businessName || 'Warung Makan'}
- Pemilik: ${businessContext.ownerName || 'Pengusaha'}
- Kas Siap Pakai (Operasional): Rp ${Number(businessContext.operatingBalance || 0).toLocaleString('id-ID')}
- Kas Dingin (Tabungan Darurat): Rp ${Number(businessContext.savingsBalance || 0).toLocaleString('id-ID')}
- Ketahanan Kas (Runway): ${businessContext.runwayDays || 0} Hari (Status: ${businessContext.runwayStatus || 'Aman'})
- Pengeluaran Rata-rata: Rp ${Number(businessContext.dailyBurn || 0).toLocaleString('id-ID')} / hari
- Total Pemasukan Tercatat: Rp ${Number(businessContext.income || 0).toLocaleString('id-ID')}
- Total Beban Operasional: Rp ${Number(businessContext.expense || 0).toLocaleString('id-ID')}
- Total Prive (Ambil Pribadi): Rp ${Number(businessContext.prive || 0).toLocaleString('id-ID')}
- Piutang Bon Belum Lunas: Rp ${Number(businessContext.unpaidBon || 0).toLocaleString('id-ID')}

PANDUAN MENJAWAB:
1. Jawab dengan gaya bahasa ramah, empati, dan ringkas dalam Bahasa Indonesia.
2. Saat ditanya soal "Bisa ambil uang pribadi / prive?", gunakan angka Kas Siap Pakai di atas. Jika pengambilan membuat runway < 7 hari, beri peringatan tegas agar kas kulakan besok tidak terganggu!
3. Jika ditanya soal bon/piutang, sarankan untuk menagih sopan lewat WhatsApp.
4. Jika ditanya pajak, jelaskan secara santai aturan PP 55/2022 bahwa UMKM orang pribadi beromzet di bawah Rp 500 juta per tahun bebas PPh final 0.5%.
5. Hindari istilah akuntansi rumit seperti debit/kredit/neraca penyesuaian. Gunakan istilah kas masuk, kas keluar, kas operasional, dan prive.`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  return await fetchLlm({
    messages: formattedMessages,
    temperature: 0.6
  });
}
