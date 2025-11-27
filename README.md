# TradeGraph

**International Commerce Trading Platform**

A specialized trade intelligence and workflow platform for exporters, importers, freight forwarders, chambers of commerce, and government agencies.

## Overview

TradeGraph provides:
- **Shipment-based lead generation** - Discover buyers/suppliers using real customs data
- **Compliance screening** - One-click sanctions, PEP, and adverse media checks
- **Tariff intelligence** - Duty rates, FTA benefits, and trade measure alerts
- **Policy simulation** - Model the impact of proposed trade policies (government tier)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   Data Layer    │
│   (Next.js)     │     │   (NestJS)      │     │   (Postgres +   │
│                 │     │                 │     │    OpenSearch)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Project Structure

```
globaltrade-nexus/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── shipments/   # Search, export, analytics
│   │   │   ├── companies/   # Profiles, partners, look-alike
│   │   │   ├── compliance/  # Sanctions, PEP, adverse media
│   │   │   ├── tariffs/     # Duty rates, trade measures
│   │   │   ├── users/       # Auth, organizations
│   │   │   └── search/      # OpenSearch integration
│   │   └── common/          # Shared entities, guards, decorators
│   └── package.json
│
├── frontend/                # Next.js web app
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API client, utilities
│   │   ├── hooks/           # React Query hooks
│   │   └── types/           # TypeScript definitions
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:4000`.
Swagger docs at `http://localhost:4000/api/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Features by Tier

| Feature | Starter | Pro | Enterprise | Gov |
|---------|---------|-----|------------|-----|
| Shipment search | ✓ | ✓ | ✓ | ✓ |
| Company profiles | ✓ | ✓ | ✓ | ✓ |
| Basic sanctions check | 3/mo | 25/mo | Unlimited | Unlimited |
| Tariff lookup | ✓ | ✓ | ✓ | ✓ |
| Look-alike finder | - | ✓ | ✓ | ✓ |
| Price benchmarking | - | ✓ | ✓ | ✓ |
| PEP screening | - | ✓ | ✓ | ✓ |
| Adverse media | - | - | ✓ | ✓ |
| API access | - | - | ✓ | ✓ |
| Policy simulator | - | - | - | ✓ |
| Anomaly detection | - | - | - | ✓ |

## Tech Stack

- **Backend**: TypeScript, NestJS, Prisma, OpenSearch
- **Frontend**: TypeScript, React, Next.js 14, Tailwind CSS
- **Database**: PostgreSQL (OLTP), ClickHouse (OLAP)
- **Search**: OpenSearch/Elasticsearch
- **Auth**: Auth0/Clerk (to be integrated)

## License

Proprietary - All rights reserved.
