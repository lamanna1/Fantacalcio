const FOOTBALL_API_KEY = 'e9eb9bdf5262e79ea2a3245e2936acd4';
const FOOTBALL_BASE = 'https://v3.football.api-sports.io';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');

    // ── PROXY ANTHROPIC ──
    if (path === 'anthropic') {
      const body = await request.text();
      const bodyJson = JSON.parse(body);
      const apiKey = request.headers.get('x-api-key') || '';

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(bodyJson),
      });

      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── PROXY FOOTBALL API ──
    const apiUrl = FOOTBALL_BASE + '/' + (path || 'status') + (url.search || '');
    try {
      const res = await fetch(apiUrl, {
        headers: { 'x-apisports-key': FOOTBALL_API_KEY },
      });
      const body2 = await res.text();
      return new Response(body2, {
        status: res.status,
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  },
};
