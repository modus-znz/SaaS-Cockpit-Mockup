# SaaS Cockpit — Multi-Tenant Dashboard Mockup

A production-quality SaaS dashboard mockup built with **React 18 + Vite**, demonstrating multi-tenant product catalogue management, analytics widgets, and a responsive admin interface.

## Features

- 📊 **Dashboard Analytics** — real-time stats widgets, charts, and KPI cards
- 🏪 **Product Catalogue Management** — searchable, filterable product grid with stock tracking
- 🔐 **Multi-Tenant Architecture** — tenant isolation patterns with role-based access mockup
- 📱 **Responsive Design** — mobile-first layout, adapts across viewports
- ⚡ **Vite + React 18** — instant HMR, optimized builds

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: CSS Modules, custom design tokens
- **Tooling**: Oxlint, ESLint
- **Deployment**: systemd service files included for self-hosted deployment

## Getting Started

```bash
npm install
npm run dev
```

## Structure

```
├── saas-pages/     # Static multi-page SaaS mockup (HTML/CSS)
├── src/            # React SPA dashboard
├── public/         # Static assets
├── server.cjs      # Express static server for production
└── *.service       # systemd unit files for deployment
```

## License

MIT
