import express from 'express';
import cors from 'cors';
import { 
  initDb, 
  getAllProfiles, 
  getProfile, 
  updateProfile, 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  markBonPaid, 
  resetTransactions 
} from './db.mjs';
import { scanReceiptWithAi, parseVoiceTranscriptAi, chatFinancialAi } from './ai.mjs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Initialize SQLite database
initDb();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'sqlite-synced', ai: 'ready', time: new Date() });
});

// Profiles
app.get('/api/profiles', (req, res) => {
  try {
    const list = getAllProfiles();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profiles/:id', (req, res) => {
  try {
    const profile = getProfile(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profiles/:id', (req, res) => {
  try {
    updateProfile(req.params.id, req.body);
    const updated = getProfile(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions
app.get('/api/transactions', (req, res) => {
  try {
    const profileId = req.query.profileId || 'warung_siti';
    const list = getTransactions(profileId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const profileId = req.body.profileId || 'warung_siti';
    const newTx = addTransaction(profileId, req.body);
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    deleteTransaction(Number(req.params.id));
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/transactions/:id/pay-bon', (req, res) => {
  try {
    markBonPaid(Number(req.params.id));
    res.json({ success: true, paidId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset-data', (req, res) => {
  try {
    const profileId = req.body.profileId || 'warung_siti';
    resetTransactions(profileId);
    const refreshed = getTransactions(profileId);
    res.json({ success: true, transactions: refreshed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Routes
app.post('/api/ai/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }
    const result = await scanReceiptWithAi(imageBase64, mimeType);
    res.json(result);
  } catch (err) {
    console.error('AI Scan Error:', err);
    res.status(500).json({ error: 'Gagal memindai nota dengan AI: ' + err.message });
  }
});

app.post('/api/ai/parse-voice', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }
    const result = await parseVoiceTranscriptAi(transcript);
    res.json(result);
  } catch (err) {
    console.error('AI Voice Parse Error:', err);
    res.status(500).json({ error: 'Gagal menganalisis suara dengan AI: ' + err.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    const reply = await chatFinancialAi(message, history, context);
    res.json({ reply });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Gagal memproses asisten AI: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[RapiUsaha Server] Running on http://localhost:${PORT}`);
});
