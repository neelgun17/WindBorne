// proxy.js — local CORS proxy for WindBorne snapshots
// Requires Node 18+ (global fetch)
const express = require('express');

if (typeof fetch !== 'function') {
  throw new Error('Global fetch is unavailable. Please run with Node 18 or newer.');
}

const app = express();
const BASE = 'https://a.windbornesystems.com/treasure';

async function handleTreasure(req, res) {
  let hh = req.params.hh || '';
  hh = hh.replace(/\.json$/i, '');
  hh = hh.padStart(2, '0').slice(-2);
  const upstream = `${BASE}/${hh}.json`;
  try {
    const upstreamRes = await fetch(upstream, { cache: 'no-store' });
    const text = await upstreamRes.text();
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.status(upstreamRes.status).send(text);
  } catch (err) {
    res.set('Access-Control-Allow-Origin', '*');
    res.status(502).json({ error: 'proxy_fetch_failed', detail: String(err) });
  }
}

app.get('/treasure/:hh.json', handleTreasure);
app.get('/treasure/:hh', handleTreasure);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Local proxy on http://127.0.0.1:${PORT}`);
});
