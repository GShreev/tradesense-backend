const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/',
  'Connection': 'keep-alive',
};

let nseClient = null;
async function getNSEClient() {
  if (nseClient) return nseClient;
  const instance = axios.create({ baseURL: 'https://www.nseindia.com', headers: NSE_HEADERS });
  await instance.get('/');
  nseClient = instance;
  setTimeout(() => { nseClient = null; }, 10 * 60 * 1000);
  return instance;
}

app.get('/', (req, res) => res.json({ status: 'TradeSense Backend Running ✅' }));

app.get('/api/indices', async (req, res) => {
  try {
    const client = await getNSEClient();
    const r = await client.get('/api/allIndices');
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/optionchain/:symbol', async (req, res) => {
  try {
    const client = await getNSEClient();
    const r = await client.get(`/api/option-chain-indices?symbol=${req.params.symbol}`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/chart/:ticker', async (req, res) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${req.params.ticker}?interval=5m&range=1d&includePrePost=false`;
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ TradeSense backend running on port ${PORT}`));