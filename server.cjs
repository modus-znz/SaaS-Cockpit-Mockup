const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 9898;
const HTML_FILE = path.join(__dirname, 'saas-pages', 'index.html');

// SMS Gateway config (runtime-mutable)
const SMS_GATEWAY = {
  ip: '192.168.0.67',
  port: 8080,
  username: 'sms',
  password: 'Vi2rqFl5',
  get url() { return `http://${this.ip}:${this.port}`; }
};

// Revenue data — source of truth for OpenClaw integration
const REVENUE_DATA = {
  meta: {
    brand: 'YIELDFLOW',
    tagline: 'Passive Income Command Center',
    totalMonthly: 46200,
    totalAnnual: 554400,
    lastUpdated: new Date().toISOString(),
  },
  streams: [
    { id: 1, code: 'REV-COURSES', name: 'Online Courses', monthly: 8500, share: 18, marketSize: '$325B global', keyMetric: '70% of top earners use courses', tier: 1, status: 'Growing', platform: 'Teachable', products: ['Passive Income Mastery ($49)', 'SEO for Creators ($39)', 'YouTube Automation Blueprint ($39)'] },
    { id: 2, code: 'REV-YT', name: 'YouTube Ad Revenue', monthly: 8400, share: 18, marketSize: '$12-22 CPM finance/tech', keyMetric: '287K total subscribers across 3 channels', tier: 1, status: 'Growing', platform: 'YouTube AdSense', products: ['Finance Explained (142K)', 'Tech Decoded (89K)', 'Money Moves (56K)'] },
    { id: 3, code: 'REV-DIGITAL', name: 'Digital Products (Etsy/Gumroad)', monthly: 6200, share: 13, marketSize: '$74B market', keyMetric: '90%+ margins', tier: 1, status: 'Steady', platform: 'Etsy + Gumroad', products: ['All-in-One Digital Planner ($24.99)', 'AI Prompt Pack Bundle ($29.99)', 'Finance Tracker Notion Template ($19.99)'] },
    { id: 4, code: 'REV-AFFILIATE', name: 'Affiliate Marketing', monthly: 5300, share: 11, marketSize: '$18B US market', keyMetric: '$12 ROI per $1 spent', tier: 2, status: 'Active', platform: 'WordPress blogs', products: ['Bluehost ($150/sale)', 'Cloudways ($125/sale)', 'Notion (50% recurring)'] },
    { id: 5, code: 'REV-SAAS', name: 'Micro-SaaS', monthly: 4200, share: 9, marketSize: '$5K-83K MRR range', keyMetric: '89 active users, 3.2% churn', tier: 2, status: 'Growing', platform: 'Vercel', products: ['SitePing Starter ($9/mo)', 'SitePing Pro ($29/mo)', 'SitePing Business ($79/mo)'] },
    { id: 6, code: 'REV-TEMPLATES', name: 'Notion Templates', monthly: 3400, share: 7, marketSize: 'Top creators $500K+', keyMetric: '28 templates on Gumroad', tier: 2, status: 'Steady', platform: 'Gumroad', products: ['Finance Tracker', 'Content Calendar', 'Business Dashboard'] },
    { id: 7, code: 'REV-NEWSLETTER', name: 'Paid Newsletter', monthly: 2800, share: 6, marketSize: '$500-$3,800/mo on Beehiiv', keyMetric: '4,800 subscribers, 42% open rate', tier: 3, status: 'Growing', platform: 'Beehiiv', products: ['The Yield Report - Paid tier ($15/mo)', 'Sponsorship slots', 'Affiliate links'] },
    { id: 8, code: 'REV-AI', name: 'Custom GPTs/AI Products', monthly: 2400, share: 5, marketSize: '$7-$49/pack', keyMetric: '12 custom GPTs + prompt packs', tier: 3, status: 'Growing', platform: 'GPT Store + Gumroad', products: ['Custom GPTs (12)', 'AI Prompt Packs ($7-$49)'] },
    { id: 9, code: 'REV-POD', name: 'Print on Demand', monthly: 1900, share: 4, marketSize: '$500-$10K/mo', keyMetric: '600+ designs via Printify', tier: 3, status: 'Passive', platform: 'Etsy + Printify', products: ['Motivational quotes', 'Niche humor', 'Seasonal designs'] },
    { id: 10, code: 'REV-STOCK', name: 'Stock Assets', monthly: 1800, share: 4, marketSize: '$2.5B sync licensing', keyMetric: '2,400 assets across platforms', tier: 3, status: 'Passive', platform: 'Adobe Stock + Artlist', products: ['Stock photos (Adobe Stock)', 'Ambient music (Artlist/Epidemic)'] },
    { id: 11, code: 'REV-DIVIDEND', name: 'Dividend Portfolio', monthly: 1200, share: 3, marketSize: '4% yield on $360K invested', keyMetric: 'VTI/SCHD, DRIP enabled', tier: 4, status: 'Passive', platform: 'Brokerage', products: ['VTI (Vanguard Total Market)', 'SCHD (Schwab US Dividend)'] },
    { id: 12, code: 'REV-DOMAINS', name: 'Domain Flipping', monthly: 1100, share: 2, marketSize: '$500-$50K per flip', keyMetric: '45 premium .com domains', tier: 4, status: 'Variable', platform: 'Various registrars', products: ['yieldflow.io', 'siteping.co', 'financeexplained.com'] },
  ],
  services: [
    { name: 'Teachable', cost: 119, purpose: 'Course hosting & payments' },
    { name: 'Beehiiv', cost: 42, purpose: 'Newsletter platform' },
    { name: 'WordPress/Cloudways', cost: 48, purpose: 'Affiliate blogs (x4)' },
    { name: 'Gumroad', cost: '10% rev share', purpose: 'Digital product sales' },
    { name: 'Vercel', cost: 20, purpose: 'Micro-SaaS hosting' },
    { name: 'Stripe', cost: '2.9% + $0.30', purpose: 'Payment processing' },
    { name: 'Cloudflare', cost: 0, purpose: 'CDN & DNS' },
    { name: 'Canva Pro', cost: 13, purpose: 'Design & thumbnails' },
    { name: 'ElevenLabs', cost: 22, purpose: 'AI voiceover for videos' },
    { name: 'Opus Clip', cost: 19, purpose: 'Short-form video clips' },
  ],
  finance: {
    ytd: 566000,
    mtd: 47200,
    costs: { total: 3200, hosting: 380, platformFees: 620, aiTools: 410, contractors: 1800, ads: 359 },
    netProfit: 44000,
    netMargin: 93.2,
  },
  synergies: [
    { from: 'REV-COURSES', to: 'REV-YT', type: 'funnel', description: 'YouTube drives course sales' },
    { from: 'REV-COURSES', to: 'REV-NEWSLETTER', type: 'nurture', description: 'Newsletter nurtures course buyers' },
    { from: 'REV-DIGITAL', to: 'REV-TEMPLATES', type: 'shared-platform', description: 'Shared Gumroad/Etsy storefront' },
    { from: 'REV-SAAS', to: 'REV-AI', type: 'bundle', description: 'SaaS can bundle GPT access' },
    { from: 'REV-YT', to: 'REV-AFFILIATE', type: 'funnel', description: 'Video descriptions drive affiliate clicks' },
    { from: 'REV-NEWSLETTER', to: 'REV-AFFILIATE', type: 'embed', description: 'Newsletter embeds affiliate offers' },
    { from: 'REV-STOCK', to: 'REV-YT', type: 'supply', description: 'Stock content supplements video production' },
  ],
};

function jsonReply(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch(e) { resolve({}); } });
    req.on('error', reject);
  });
}

async function smsFetch(urlPath, method = 'GET', body = null) {
  const url = `http://${SMS_GATEWAY.ip}:${SMS_GATEWAY.port}${urlPath}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${SMS_GATEWAY.username}:${SMS_GATEWAY.password}`).toString('base64'),
    },
    signal: AbortSignal.timeout(10000),
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  return r.json();
}

// ============================================================
// SMS RATE LIMITER — max 1 SMS per 4 seconds (15/min, safe for YAS)
// ============================================================
const SMS_QUEUE = [];
let SMS_SENDING = false;
const SMS_MIN_INTERVAL_MS = 4000; // 4 seconds between sends
const SMS_DAILY_LIMIT = 200;
let smsSentToday = 0;
let smsDayStart = new Date().toDateString();

function smsResetDayIfNew() {
  const today = new Date().toDateString();
  if (today !== smsDayStart) { smsSentToday = 0; smsDayStart = today; }
}

function smsEnqueue(to, message) {
  return new Promise((resolve, reject) => {
    SMS_QUEUE.push({ to, message, resolve, reject, queuedAt: Date.now() });
    smsProcessQueue();
  });
}

async function smsProcessQueue() {
  if (SMS_SENDING || SMS_QUEUE.length === 0) return;
  SMS_SENDING = true;
  while (SMS_QUEUE.length > 0) {
    smsResetDayIfNew();
    if (smsSentToday >= SMS_DAILY_LIMIT) {
      const item = SMS_QUEUE.shift();
      item.reject(new Error(`Daily limit reached (${SMS_DAILY_LIMIT}/day). Try again tomorrow.`));
      continue;
    }
    const item = SMS_QUEUE.shift();
    const waitMs = Math.max(0, SMS_MIN_INTERVAL_MS - (Date.now() - (smsLastSentAt || 0)));
    if (waitMs > 0) await new Promise(r => setTimeout(r, waitMs));
    try {
      const result = await smsFetch('/messages', 'POST', {
        phoneNumbers: [item.to],
        textMessage: { text: item.message }
      });
      smsLastSentAt = Date.now();
      smsSentToday++;
      console.log(`[SMS] Sent to ${item.to} (${smsSentToday}/${SMS_DAILY_LIMIT} today, ${SMS_QUEUE.length} queued)`);
      item.resolve(result);
    } catch(e) {
      console.error(`[SMS] Failed to ${item.to}: ${e.message}`);
      item.reject(e);
    }
  }
  SMS_SENDING = false;
}
let smsLastSentAt = 0;

// Product database from XLS export
let PRODUCT_DB = null;
try {
  PRODUCT_DB = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
  console.log(`[PRODUCTS] Loaded ${PRODUCT_DB.meta.total_products} products, ${PRODUCT_DB.meta.categories} categories`);
} catch(e) {
  console.warn('[PRODUCTS] products.json not found — product endpoints disabled');
}

const server = http.createServer(async (req, res) => {
  try {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // JSON API routes
  if (pathname === '/api/revenue') {
    return jsonReply(res, REVENUE_DATA);
  }
  if (pathname === '/api/revenue/summary') {
    return jsonReply(res, {
      total: REVENUE_DATA.meta.totalMonthly,
      annual: REVENUE_DATA.meta.totalAnnual,
      streamCount: REVENUE_DATA.streams.length,
      tiers: {
        tier1: REVENUE_DATA.streams.filter(s => s.tier === 1).reduce((a, s) => a + s.monthly, 0),
        tier2: REVENUE_DATA.streams.filter(s => s.tier === 2).reduce((a, s) => a + s.monthly, 0),
        tier3: REVENUE_DATA.streams.filter(s => s.tier === 3).reduce((a, s) => a + s.monthly, 0),
        tier4: REVENUE_DATA.streams.filter(s => s.tier === 4).reduce((a, s) => a + s.monthly, 0),
      },
      netProfit: REVENUE_DATA.finance.netProfit,
      netMargin: REVENUE_DATA.finance.netMargin,
    });
  }
  if (pathname.startsWith('/api/revenue/')) {
    const code = pathname.split('/api/revenue/')[1];
    const stream = REVENUE_DATA.streams.find(s => s.code === code || s.id === parseInt(code));
    if (!stream) return jsonReply(res, { error: 'Stream not found' }, 404);
    return jsonReply(res, stream);
  }
  if (pathname === '/api/synergies') {
    return jsonReply(res, REVENUE_DATA.synergies);
  }
  if (pathname === '/api/health') {
    return jsonReply(res, { status: 'ok', uptime: process.uptime(), brand: 'YIELDFLOW' });
  }

  // ============================================================
  // SECURITY STACK API — status collected by security-status-collect
  // (root collector runs every 5 min via systemd timer; JSON is read-only here)
  // ============================================================
  if (pathname === '/api/security') {
    try {
      const j = fs.readFileSync('/var/lib/security-status/status.json', 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
      return res.end(j);
    } catch (e) {
      return jsonReply(res, { error: 'security status not collected yet' }, 503);
    }
  }
  if (pathname === '/api/security/refresh' && req.method === 'POST') {
    const { execFile } = require('child_process');
    return execFile('/usr/local/sbin/security-status-collect', { timeout: 60000 }, (err) => {
      if (err) return jsonReply(res, { error: 'collector failed: ' + err.message }, 500);
      try {
        const j = fs.readFileSync('/var/lib/security-status/status.json', 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(j);
      } catch (e) { jsonReply(res, { error: e.message }, 500); }
    });
  }

  // ============================================================
  // SMS GATEWAY API — POST routes
  // ============================================================
  if (pathname === '/api/sms/gateway-status' && req.method === 'POST') {
    const body = await readBody(req);
    const ip = body.ip || SMS_GATEWAY.ip;
    const port = body.port || SMS_GATEWAY.port;
    try {
      const r = await fetch(`http://${ip}:${port}/`, { signal: AbortSignal.timeout(5000) });
      return jsonReply(res, { connected: true, phoneUrl: `http://${ip}:${port}`, message: `HTTP ${r.status}` });
    } catch(e) {
      return jsonReply(res, { connected: false, phoneUrl: `http://${ip}:${port}`, message: e.message });
    }
  }
  if (pathname === '/api/sms/gateway-config' && req.method === 'POST') {
    const body = await readBody(req);
    if (body.ip) SMS_GATEWAY.ip = body.ip;
    if (body.port) SMS_GATEWAY.port = parseInt(body.port);
    console.log(`[SMS] Config updated: ${SMS_GATEWAY.url}`);
    return jsonReply(res, { success: true, phoneUrl: SMS_GATEWAY.url });
  }
  if (pathname === '/api/sms/send-direct' && req.method === 'POST') {
    const body = await readBody(req);
    const { to, message } = body;
    if (!to || !message) return jsonReply(res, { success: false, error: 'Missing "to" or "message"' }, 400);
    smsResetDayIfNew();
    if (smsSentToday >= SMS_DAILY_LIMIT) return jsonReply(res, { success: false, error: `Daily limit reached (${SMS_DAILY_LIMIT}/day)` }, 429);
    const position = SMS_QUEUE.length + (SMS_SENDING ? 1 : 0);
    console.log(`[SMS] Queued → ${to}: ${message.substring(0, 60)}... (pos=${position}, today=${smsSentToday}/${SMS_DAILY_LIMIT})`);
    try {
      const result = await smsEnqueue(to, message);
      return jsonReply(res, { success: true, result, phoneUrl: SMS_GATEWAY.url, position, today: smsSentToday, limit: SMS_DAILY_LIMIT });
    } catch(e) {
      return jsonReply(res, { success: false, error: e.message, phoneUrl: SMS_GATEWAY.url });
    }
  }
  if (pathname === '/api/sms/bulk-send' && req.method === 'POST') {
    const body = await readBody(req);
    const { messages } = body; // [{to, message}, ...]
    if (!messages || !Array.isArray(messages) || !messages.length) return jsonReply(res, { error: 'Missing messages array' }, 400);
    smsResetDayIfNew();
    const remaining = SMS_DAILY_LIMIT - smsSentToday;
    if (remaining <= 0) return jsonReply(res, { error: `Daily limit reached (${SMS_DAILY_LIMIT}/day)` }, 429);
    const toSend = messages.slice(0, remaining);
    const skipped = messages.length - toSend.length;
    console.log(`[SMS-BULK] Queued ${toSend.length} messages (${skipped} would exceed daily limit)`);
    const promises = toSend.map(m => smsEnqueue(m.to, m.message).then(r => ({ to: m.to, success: true })).catch(e => ({ to: m.to, success: false, error: e.message })));
    // Don't await — let them flow through the queue, return immediately with queue info
    const estimatedTime = toSend.length * SMS_MIN_INTERVAL_MS / 1000;
    return jsonReply(res, {
      success: true,
      queued: toSend.length,
      skipped,
      dailyUsed: smsSentToday,
      dailyLimit: SMS_DAILY_LIMIT,
      estimatedSeconds: estimatedTime,
      message: `Queued ${toSend.length} messages. ~${estimatedTime}s to send at ${SMS_MIN_INTERVAL_MS/1000}s intervals.`
    });
  }
  if (pathname === '/api/sms/rate-status' && req.method === 'GET') {
    smsResetDayIfNew();
    return jsonReply(res, {
      queued: SMS_QUEUE.length,
      processing: SMS_SENDING,
      sentToday: smsSentToday,
      dailyLimit: SMS_DAILY_LIMIT,
      remaining: Math.max(0, SMS_DAILY_LIMIT - smsSentToday),
      intervalMs: SMS_MIN_INTERVAL_MS
    });
  }

  // ============================================================
  // PRODUCT DATABASE API
  // ============================================================
  if (pathname === '/api/sms/products/categories' && PRODUCT_DB) {
    return jsonReply(res, PRODUCT_DB.categories);
  }
  if (pathname === '/api/sms/products' && PRODUCT_DB) {
    const q = url.searchParams.get('q') || '';
    const cat = url.searchParams.get('category') || '';
    const inStock = url.searchParams.get('in_stock');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let filtered = PRODUCT_DB.products;
    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(ql) || p.code.includes(ql) || p.ean.includes(ql));
    }
    if (cat) filtered = filtered.filter(p => p.category === cat);
    if (inStock === '1') filtered = filtered.filter(p => p.in_stock);

    return jsonReply(res, {
      total: filtered.length,
      offset,
      limit,
      products: filtered.slice(offset, offset + limit)
    });
  }
  if (pathname === '/api/sms/promo-generate' && req.method === 'POST' && PRODUCT_DB) {
    const body = await readBody(req);
    const { product_ids, discount_type, discount_value, custom_message } = body;
    const store = 'The Town Supermarket';
    const loc = 'Migoz Plaza, Nyerere Rd, Zanzibar';
    const phone = '+255772202202';

    if (custom_message) {
      return jsonReply(res, { message: custom_message, char_count: custom_message.length, sms_count: Math.ceil(custom_message.length / 160) });
    }

    if (!product_ids || !product_ids.length) return jsonReply(res, { error: 'No products selected' }, 400);

    const items = product_ids.map(id => PRODUCT_DB.products.find(p => p.id === id)).filter(Boolean);
    if (!items.length) return jsonReply(res, { error: 'Products not found' }, 400);

    let promo = '';
    if (items.length === 1) {
      const p = items[0];
      const price = p.selling_price || p.mrp;
      if (discount_type === 'percent' && discount_value) {
        const off = Math.round(price * (1 - discount_value / 100));
        promo = `${p.name} now TZS ${off.toLocaleString()} (${discount_value}% OFF, was TZS ${price.toLocaleString()})! Only at ${store}, ${loc}. Open 24/7!`;
      } else if (discount_type === 'bogo') {
        promo = `BUY 1 GET 1 FREE on ${p.name}! Now TZS ${price.toLocaleString()} each. Only at ${store}, ${loc}. Today only!`;
      } else if (discount_type === 'fixed' && discount_value) {
        promo = `${p.name} now TZS ${discount_value.toLocaleString()} (was TZS ${price.toLocaleString()})! Save TZS ${(price - discount_value).toLocaleString()}! Only at ${store}, ${loc}.`;
      } else {
        promo = `${p.name} — TZS ${price.toLocaleString()} at ${store}, ${loc}. In stock now!`;
      }
    } else {
      const names = items.map(p => p.name).slice(0, 3).join(', ');
      const more = items.length > 3 ? ` +${items.length - 3} more` : '';
      if (discount_type === 'percent' && discount_value) {
        promo = `MEGA DEAL: ${names}${more} — ${discount_value}% OFF! Only at ${store}, ${loc}. Open 24/7!`;
      } else if (discount_type === 'bundle' && discount_value) {
        promo = `BUNDLE DEAL: ${names}${more} for just TZS ${discount_value.toLocaleString()}! Save big at ${store}, ${loc}. Today only!`;
      } else {
        promo = `GREAT VALUE: ${names}${more} — in stock now at ${store}, ${loc}. Open 24/7!`;
      }
    }

    return jsonReply(res, {
      message: promo,
      char_count: promo.length,
      sms_count: Math.ceil(promo.length / 160),
      products: items.map(p => ({ id: p.id, name: p.name, price: p.selling_price || p.mrp }))
    });
  }

  // Serve HTML dashboard (all other routes)
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(HTML_FILE).pipe(res);
  } catch(e) {
    console.error('[SERVER] Error:', e.message);
    if (!res.headersSent) {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error: e.message}));
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`YIELDFLOW SaaS Cockpit + API running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET /api/revenue          — Full revenue data`);
  console.log(`  GET /api/revenue/summary  — Summary stats`);
  console.log(`  GET /api/revenue/:code    — Individual stream (e.g. REV-COURSES)`);
  console.log(`  GET /api/synergies        — Cross-stream synergies`);
  console.log(`  GET /api/health           — Health check`);
  console.log(`  POST /api/sms/gateway-status — Check phone connection`);
  console.log(`  POST /api/sms/gateway-config — Update phone IP/port`);
  console.log(`  POST /api/sms/send-direct    — Send SMS via phone gateway`);
});
