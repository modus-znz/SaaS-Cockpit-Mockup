const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9898;
const HTML_FILE = path.join(__dirname, 'saas-pages', 'index.html');

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
    { id: 'REV-NEWSLETTER', to: 'REV-AFFILIATE', type: 'embed', description: 'Newsletter embeds affiliate offers' },
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

const server = http.createServer((req, res) => {
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

  // Serve HTML dashboard
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(HTML_FILE).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`YIELDFLOW SaaS Cockpit + API running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET /api/revenue          — Full revenue data`);
  console.log(`  GET /api/revenue/summary  — Summary stats`);
  console.log(`  GET /api/revenue/:code    — Individual stream (e.g. REV-COURSES)`);
  console.log(`  GET /api/synergies        — Cross-stream synergies`);
  console.log(`  GET /api/health           — Health check`);
});
