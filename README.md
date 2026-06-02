# Waelio Marketing

Local monorepo scaffold for a marketing/ad platform demo.

## What is included

- `apps/web` — Next.js publisher/advertiser demo site
- `apps/api` — Express ad server with `/api/ads`, `/api/impression`, and `/api/click`
- `apps/admin` — simple admin placeholder panel
- `packages/shared` — shared TypeScript types
- `packages/sdk` — simple publisher SDK loader
- `packages/analytics` — analytics event stub

## Quick start

```bash
npm install
npm run dev:api
npm run dev:web
```

Then open:

- Web portal: http://localhost:3000
- Admin panel: http://localhost:3001
- API / Ad server: http://localhost:4000

## Local test flow

1. Start the API with `npm run dev:api`.
2. Start the web front-end with `npm run dev:web`.
3. Open `http://localhost:3000` and use the buttons to load an ad and record impressions/clicks.

## API endpoints

- `GET /api/ads?placementId=` — fetch a sample ad creative
- `POST /api/impression` — record an impression event
- `POST /api/click` — record a click event

## Notes

- This project is a fresh scaffold and does not include database migrations or production deployment configuration.
- The web app talks to `http://localhost:4000` for the API.

## License

See [LICENSE](LICENSE).
