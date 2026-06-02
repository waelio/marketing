# Waelio Marketing

Production-ready advertising network for independent publishers and advertisers — similar to Google Ad Manager.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **API:** Express.js ad server + REST API
- **Data:** PostgreSQL, Prisma ORM, Redis
- **Auth:** JWT with role-based access (Admin, Advertiser, Publisher)
- **Docs:** OpenAPI at `/api/docs`

## Monorepo structure

```
marketing/
├── apps/
│   ├── web/          # Advertiser & publisher portal (port 3000)
│   ├── api/          # Express API & ad server (port 4000)
│   └── admin/        # Admin panel (port 3001)
├── packages/
│   ├── sdk/          # Publisher embed SDK
│   ├── analytics/    # Metrics & aggregation
│   └── shared/       # Types, RBAC, validation
├── prisma/           # Schema & migrations
├── docker/           # Dockerfiles
├── docs/             # OpenAPI spec
└── scripts/          # Seed scripts
```

## Quick start

### Prerequisites

- Node.js 20+
- Docker (optional, for Postgres & Redis)

### Setup

```bash
cp .env.example .env
make install
docker compose up -d postgres redis
npx prisma migrate dev
npm run db:seed
make dev
```

| Service         | URL                            |
| --------------- | ------------------------------ |
| Web portal      | http://localhost:3000          |
| Admin panel     | http://localhost:3001          |
| API / Ad server | http://localhost:4000          |
| API docs        | http://localhost:4000/api/docs |

### Seed accounts

| Role       | Email               | Password       |
| ---------- | ------------------- | -------------- |
| Admin      | admin@waelio.com    | Admin123!      |
| Advertiser | advertiser@demo.com | Advertiser123! |
| Publisher  | publisher@demo.com  | Publisher123!  |

## Publisher SDK

Embed on any approved site:

```html
<script src="https://ads.waelio.com/sdk.js" data-placement-id="PLACEMENT_ID"></script>
```

Build SDK: `npm run build --workspace=@waelio/sdk`

## Ad server endpoints

- `GET /api/ads?placementId=` — fetch ad (geo, device, browser targeting)
- `POST /api/impression` — confirm impression
- `POST /api/click` — record click

## Docker (full stack)

```bash
make up
```

Runs postgres, redis, api, web, and admin.

## Commands

| Command        | Description            |
| -------------- | ---------------------- |
| `make dev`     | Start infra + all apps |
| `make migrate` | Deploy migrations      |
| `make seed`    | Seed sample data       |
| `make lint`    | Lint all workspaces    |
| `make test`    | Run tests              |

## License

See [LICENSE](LICENSE).
